"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endSession, requireSession, startSession, verifyLogin } from "@/lib/auth";
import { TECH_KEYS, TECH_OPTIONS } from "@/lib/dossier";
import { generateQuoteItems, quoteTotal } from "@/lib/pricing/engine";
import { PRICE_GROUPS, fromDisplay, setPath } from "@/lib/pricing/fields";
import { USE_SUPABASE } from "@/lib/defaults";
import { DEFAULT_RULES } from "@/lib/pricing/rules";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getLead,
  getLeadByToken,
  getSettings,
  saveLead,
  saveSettings,
} from "@/lib/store";
import { onlyFiles, saveImages, validateImages } from "@/lib/uploads";
import { UNKNOWN, type Lead, type LeadStatus, type QuoteItem } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean } | undefined;

const stamp = () => new Date().toISOString();

async function owned(id: string, role: "owner" | "technician" = "owner") {
  const session = await requireSession(role);
  const lead = await getLead(id, session.company_id);
  if (!lead) throw new Error("Aanvraag niet gevonden");
  return { lead, session };
}

function move(lead: Lead, status: LeadStatus, text: string) {
  lead.status = status;
  lead.log.push({ at: stamp(), text });
}

function refresh(id: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  revalidatePath("/technician");
}

/** Toont na een actie een korte bevestiging bovenaan de pagina (?notice=code). */
function done(id: string, notice: string, tab?: string): never {
  refresh(id);
  redirect(`/dashboard/${id}?${tab ? `tab=${tab}&` : ""}notice=${notice}`);
}

/* ---------- Authenticatie ---------- */

const attempts = new Map<string, number[]>();

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const key = `${ip}|${email}`;
  const recent = (attempts.get(key) ?? []).filter((t) => Date.now() - t < 10 * 60_000);
  if (recent.length >= 5) {
    return { error: "Te veel pogingen. Wacht 10 minuten en probeer het opnieuw." };
  }

  const user = verifyLogin(email, password);
  if (!user) {
    attempts.set(key, [...recent, Date.now()]);
    return { error: "E-mailadres of wachtwoord klopt niet. Probeer het opnieuw." };
  }
  attempts.delete(key);
  await startSession(email);
  redirect(user.role === "owner" ? "/dashboard" : "/technician");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

/* ---------- Workflow (installateur) ---------- */

export async function advance(id: string) {
  const { lead, session } = await owned(id);
  let notice = "";
  switch (lead.status) {
    case "new":
      move(lead, "in_progress", "Aanvraag in behandeling genomen");
      notice = "behandeling";
      break;
    case "in_progress":
      move(lead, "visit_to_plan", "Dossier gecontroleerd, klaar voor bezoek");
      notice = "klaar";
      break;
    case "visit_done": {
      const { pricing } = await getSettings(session.company_id);
      lead.quote = { items: generateQuoteItems(lead, pricing), generated_at: stamp() };
      move(lead, "quote_preparing", "Conceptofferte gegenereerd");
      notice = "concept";
      break;
    }
    case "quote_preparing":
      move(lead, "quote_review", "Offerte ter controle aangeboden");
      notice = "controle";
      break;
    default:
      return;
  }
  await saveLead(lead);
  done(id, notice, lead.status === "quote_preparing" ? "quote" : undefined);
}

export async function scheduleVisit(
  id: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { lead } = await owned(id);
  const date = String(form.get("date") ?? "");
  const time = String(form.get("time") ?? "");
  const technician = String(form.get("technician") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Kies een datum voor het bezoek." };
  if (!/^\d{2}:\d{2}$/.test(time)) return { error: "Kies een tijd voor het bezoek." };
  if (!technician) return { error: "Kies een technieker." };

  lead.appointment = { date, time, technician };
  move(lead, "visit_planned", `Bezoek ingepland (${date} ${time}, ${technician})`);
  await saveLead(lead);
  done(id, "ingepland", "visit");
}

export async function saveQuote(
  id: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { lead } = await owned(id);
  if (!lead.quote) return { error: "Er is nog geen conceptofferte." };
  if (lead.status === "quote_sent" || lead.status === "accepted")
    return { error: "Een verstuurde offerte kan niet meer worden aangepast." };

  const labels = form.getAll("label").map(String);
  const amounts = form.getAll("amount").map((v) => Number(String(v).replace(",", ".")));
  const items: QuoteItem[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i].trim();
    if (!label && !amounts[i]) continue;
    if (!label) return { error: `Regel ${i + 1} heeft geen omschrijving.` };
    if (!Number.isFinite(amounts[i])) return { error: `Regel ${i + 1} heeft geen geldig bedrag.` };
    items.push({ id: `i${i}${Date.now().toString(36)}`, label, amount: Math.round(amounts[i]) });
  }
  if (items.length === 0) return { error: "Een offerte heeft minimaal één regel nodig." };

  lead.quote.items = items;
  lead.log.push({ at: stamp(), text: "Offerte aangepast" });
  await saveLead(lead);
  refresh(id);
  return { ok: true };
}

export async function approveAndSend(id: string) {
  const { lead } = await owned(id);
  if (lead.status !== "quote_review" || !lead.quote) return;
  lead.quote.reviewed_at = stamp();
  lead.log.push({ at: lead.quote.reviewed_at, text: "Offerte gecontroleerd" });
  lead.quote.sent_at = stamp();
  move(
    lead,
    "quote_sent",
    `Offerte verstuurd naar ${lead.customer.email} (${quoteTotal(lead.quote.items)} euro)`,
  );
  await saveLead(lead);
  done(id, "verstuurd", "quote");
}

export async function setOutcome(id: string, outcome: "accepted" | "rejected") {
  const { lead } = await owned(id);
  if (lead.status !== "quote_sent") return;
  move(lead, outcome, outcome === "accepted" ? "Klant is akkoord" : "Klant heeft afgewezen");
  await saveLead(lead);
  done(id, outcome === "accepted" ? "akkoord" : "afgewezen");
}

export async function addNote(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { lead, session } = await owned(id);
  const text = String(form.get("text") ?? "").trim();
  if (!text) return { error: "Schrijf eerst een notitie." };
  if (text.length > 1000) return { error: "Een notitie mag maximaal 1000 tekens zijn." };
  lead.notes.push({ at: stamp(), by: session.name, text });
  lead.log.push({ at: stamp(), text: "Notitie toegevoegd" });
  await saveLead(lead);
  refresh(id);
  return { ok: true };
}

/* ---------- Klant: offertelink ---------- */

export async function decideQuote(token: string, decision: "accepted" | "rejected") {
  const lead = await getLeadByToken(token);
  if (!lead || lead.status !== "quote_sent" || !lead.quote) return;
  lead.quote.decided_at = stamp();
  move(
    lead,
    decision,
    decision === "accepted" ? "Klant is akkoord via offertelink" : "Klant heeft afgewezen via offertelink",
  );
  await saveLead(lead);
  refresh(lead.id);
  redirect(`/offerte/${token}`);
}

/* ---------- Instellingen ---------- */

export async function saveCompany(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireSession("owner");
  const company_name = String(form.get("company_name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  if (company_name.length < 2) return { error: "Vul de bedrijfsnaam in." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Vul een geldig e-mailadres in." };
  const current = await getSettings(session.company_id);
  await saveSettings(session.company_id, { ...current, company_name, phone, email });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function savePricing(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireSession("owner");
  const current = await getSettings(session.company_id);
  let rules = current.pricing;
  for (const group of PRICE_GROUPS) {
    for (const field of group.fields) {
      const raw = String(form.get(field.path) ?? "").replace(",", ".").trim();
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n)) {
        return { error: `“${field.label}” is geen geldig getal.` };
      }
      if (field.unit === "pct" && (n < 0 || n > 300)) {
        return { error: `“${field.label}” moet tussen 0 en 300 liggen.` };
      }
      rules = setPath(rules, field.path, fromDisplay(field, n));
    }
  }
  if (rules.spreadLow >= rules.spreadHigh) {
    return { error: "De ondergrens moet lager zijn dan de bovengrens." };
  }
  await saveSettings(session.company_id, { ...current, pricing: rules });
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function resetPricing(): Promise<void> {
  const session = await requireSession("owner");
  const current = await getSettings(session.company_id);
  await saveSettings(session.company_id, { ...current, pricing: DEFAULT_RULES });
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?notice=reset");
}

/* ---------- Demo-aanvraag (marketing) ---------- */

const demoHits = new Map<string, number[]>();

export async function requestDemo(_: FormState, form: FormData): Promise<FormState> {
  if (String(form.get("website") ?? "")) return { ok: true }; // honeypot
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const recent = (demoHits.get(ip) ?? []).filter((t) => Date.now() - t < 60 * 60_000);
  if (recent.length >= 5) return { error: "Te veel aanvragen vanaf dit netwerk. Probeer het later opnieuw." };
  demoHits.set(ip, [...recent, Date.now()]);

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const company = String(form.get("company") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 160);
  const size = String(form.get("size") ?? "").slice(0, 20);
  if (name.length < 2) return { error: "Vul uw naam in." };
  if (company.length < 2) return { error: "Vul de naam van uw bedrijf in." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Vul een geldig e-mailadres in." };
  if (form.get("consent") !== "on") return { error: "Geef toestemming om contact met u op te nemen." };

  if (USE_SUPABASE) {
    const { error } = await supabaseAdmin()
      .from("demo_requests")
      .insert({ name, company, email, size, consent_at: stamp() });
    if (error) {
      console.error("[demo_requests]", error.message);
      return { error: "Versturen is niet gelukt. Probeer het later opnieuw." };
    }
    return { ok: true };
  }

  const file = path.join(process.cwd(), "data", "demo-requests.json");
  let list: unknown[] = [];
  try {
    list = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {}
  list.push({ at: stamp(), name, company, email, size });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf8");
  return { ok: true };
}

/* ---------- Technieker ---------- */

export async function completeVisit(
  id: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { lead } = await owned(id, "technician");
  if (lead.status !== "visit_planned") return { error: "Dit bezoek staat niet meer open." };

  for (const key of TECH_KEYS) {
    const v = String(form.get(key) ?? UNKNOWN);
    const valid = TECH_OPTIONS[key].options.some((o) => o.id === v);
    lead.check[key] = valid
      ? { value: v, source: "verified" }
      : { value: UNKNOWN, source: "unknown" };
  }
  const missing = TECH_KEYS.filter((k) => lead.check[k].source !== "verified");
  if (missing.length > 0 && form.get("confirm_incomplete") !== "on") {
    return {
      error: `${missing.length} punt(en) nog niet ingevuld. Vul ze in, of vink aan dat u zonder afrondt.`,
    };
  }

  lead.check.notes = String(form.get("notes") ?? "").slice(0, 2000);

  const files = onlyFiles(form.getAll("photos"));
  const photoError = validateImages(files, lead.check.photos.length);
  if (photoError) return { error: photoError };
  lead.check.photos.push(...(await saveImages(files)));

  lead.check.completed_at = stamp();
  move(lead, "visit_done", "Technische gegevens aangevuld");
  await saveLead(lead);
  refresh(id);
  redirect("/technician?done=1");
}
