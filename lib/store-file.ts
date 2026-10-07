import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { estimatePrice } from "./pricing/engine";
import { DEFAULT_COMPANY, defaultSettings, emptyCheck, newToken } from "./defaults";
import type { Customer, Lead, Settings } from "./types";

/**
 * Datalaag. Nu een JSON-bestand zodat de app direct draait; de functies hieronder
 * zijn het enige contact met opslag. Vervang de body door Supabase-queries
 * (zie supabase/migrations/0001_init.sql) zonder de rest aan te raken.
 */
const FILE = path.join(process.cwd(), "data", "db.json");
type Db = { leads: Lead[]; settings: Record<string, Settings> };

const ago = (days: number, h = 10, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
function seedLead(
  id: string,
  customer: Customer,
  answers: Record<string, string>,
  daysAgo: number,
): Lead {
  const at = ago(daysAgo);
  return {
    id,
    company_id: DEFAULT_COMPANY,
    created_at: at,
    customer,
    answers,
    estimate: estimatePrice(answers),
    status: "new",
    check: emptyCheck(),
    token: newToken(),
    consent_at: at,
    customer_photos: [],
    notes: [],
    log: [
      { at, text: "Klant heeft aanvraag ingevuld" },
      { at, text: "Richtlijnprijs berekend" },
      { at, text: "Aanvraag ontvangen" },
    ],
  };
}

function seed(): Lead[] {
  const a = seedLead(
    "jan-de-vries",
    { name: "Jan de Vries", email: "jan@example.nl", phone: "06 12345678", postcode: "5141 AB", street: "Kerkstraat 12", city: "Waalwijk" },
    { spaces: "living_bedroom", area: "30_40", property: "terraced", purpose: "both", system: "multisplit" },
    5,
  );

  const b = seedLead(
    "pieter-jansen",
    { name: "Pieter Jansen", email: "pieter@example.nl", phone: "06 87654321", postcode: "5038 CD", street: "Heuvelstraat 48", city: "Tilburg" },
    { spaces: "living", area: "unknown", property: "detached", purpose: "cooling", existing: "none" },
    2,
  );
  b.status = "visit_planned";
  b.appointment = { date: inDays(0), time: "10:30", technician: "Sven Bakker" };
  b.log.push(
    { at: ago(1, 9, 15), text: "Aanvraag in behandeling genomen" },
    { at: ago(1, 9, 40), text: "Bezoek ingepland" },
  );
  b.notes.push({ at: ago(1, 9, 30), by: "Eigenaar", text: "Klant is overdag alleen na 17:00 bereikbaar. Hond in de tuin." });

  const c = seedLead(
    "fatima-el-amrani",
    { name: "Fatima El Amrani", email: "fatima@example.nl", phone: "06 11223344", postcode: "5611 EF", street: "Stationsweg 5, 2e verdieping", city: "Eindhoven" },
    { spaces: "bedroom", area: "20_30", property: "apartment", purpose: "both", existing: "replace" },
    4,
  );
  c.status = "visit_done";
  c.appointment = { date: inDays(-1), time: "14:00", technician: "Sven Bakker" };
  c.check = {
    outdoor_unit: { value: "yes", source: "verified" },
    pipe_distance: { value: "5_10", source: "verified" },
    meter_box: { value: "ok", source: "verified" },
    wall_type: { value: "hard", source: "verified" },
    mounting: { value: "yes", source: "verified" },
    notes: "Balkon geschikt voor buitenunit. Boren door betonnen wand.",
    photos: [],
    completed_at: ago(1, 15, 10),
  };
  c.log.push(
    { at: ago(3, 9, 0), text: "Aanvraag in behandeling genomen" },
    { at: ago(3, 9, 20), text: "Bezoek ingepland" },
    { at: ago(1, 15, 10), text: "Technische gegevens aangevuld" },
  );

  const d = seedLead(
    "mark-van-dijk",
    { name: "Mark van Dijk", email: "mark@example.nl", phone: "06 55667788", postcode: "5262 GH", street: "Molenweg 101", city: "Vught" },
    { spaces: "multiple", area: "gt40", property: "detached", purpose: "both", system: "separate" },
    7,
  );
  d.status = "quote_review";
  d.check = {
    outdoor_unit: { value: "yes", source: "verified" },
    pipe_distance: { value: "10_15", source: "verified" },
    meter_box: { value: "ok", source: "verified" },
    wall_type: { value: "soft", source: "verified" },
    mounting: { value: "yes", source: "verified" },
    notes: "",
    photos: [],
    completed_at: ago(2, 11, 0),
  };
  d.quote = {
    generated_at: ago(1, 14, 5),
    items: [
      { id: "q1", label: "Airco-installatie (3 units)", amount: 4750 },
      { id: "q2", label: "Montage", amount: 1950 },
      { id: "q3", label: "Extra leiding (10–15 m)", amount: 150 },
    ],
  };
  d.log.push(
    { at: ago(5, 9, 0), text: "Aanvraag in behandeling genomen" },
    { at: ago(2, 11, 0), text: "Technische gegevens aangevuld" },
    { at: ago(1, 14, 5), text: "Conceptofferte gegenereerd" },
  );

  const e = seedLead(
    "sanne-peters",
    { name: "Sanne Peters", email: "sanne@example.nl", phone: "06 99887766", postcode: "5071 JK", street: "Lindelaan 9", city: "Udenhout" },
    { spaces: "living", area: "20_30", property: "corner", purpose: "both", existing: "piping" },
    14,
  );
  e.status = "accepted";
  e.quote = {
    generated_at: ago(9),
    sent_at: ago(8),
    decided_at: ago(6),
    items: [
      { id: "s1", label: "Airco-installatie (1 unit)", amount: 1900 },
      { id: "s2", label: "Montage", amount: 650 },
    ],
  };
  e.log.push({ at: ago(8), text: "Offerte verstuurd" }, { at: ago(6), text: "Klant is akkoord" });

  return [a, b, c, d, e];
}

/** Vult ontbrekende velden aan, zodat oudere opgeslagen data blijft werken. */
function normalize(l: Lead): Lead {
  return {
    ...l,
    customer: { ...l.customer, street: l.customer.street ?? "", city: l.customer.city ?? "" },
    token: l.token ?? newToken(),
    consent_at: l.consent_at ?? l.created_at,
    customer_photos: l.customer_photos ?? [],
    notes: l.notes ?? [],
  };
}

async function read(): Promise<Db> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8"));
    const db: Db = Array.isArray(raw) ? { leads: raw, settings: {} } : raw;
    db.leads = db.leads.map(normalize);
    return db;
  } catch {
    const initial: Db = { leads: seed(), settings: { [DEFAULT_COMPANY]: defaultSettings() } };
    await write(initial);
    return initial;
  }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

/* ---------- Leads ---------- */

export async function listLeads(companyId: string): Promise<Lead[]> {
  return (await read()).leads
    .filter((l) => l.company_id === companyId)
    .sort((x, y) => y.created_at.localeCompare(x.created_at));
}

export async function getLead(id: string, companyId: string) {
  return (await read()).leads.find((l) => l.id === id && l.company_id === companyId) ?? null;
}

/** Publieke toegang via de geheime offertelink. */
export async function getLeadByToken(token: string) {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  return (await read()).leads.find((l) => l.token === token) ?? null;
}

export async function saveLead(lead: Lead) {
  const db = await read();
  const i = db.leads.findIndex((l) => l.id === lead.id);
  if (i === -1) db.leads.push(lead);
  else db.leads[i] = lead;
  await write(db);
}

/* ---------- Instellingen ---------- */

export async function getSettings(companyId: string): Promise<Settings> {
  const s = (await read()).settings[companyId];
  return s ? { ...defaultSettings(), ...s } : defaultSettings();
}

export async function saveSettings(companyId: string, settings: Settings) {
  const db = await read();
  db.settings[companyId] = settings;
  await write(db);
}

