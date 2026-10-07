import "server-only";
import { defaultSettings } from "./defaults";
import { supabaseAdmin } from "./supabase-admin";
import type { Lead, Settings } from "./types";

type Row = {
  id: string;
  company_id: string;
  created_at: string;
  customer: Lead["customer"];
  answers: Lead["answers"];
  estimate: Lead["estimate"];
  status: Lead["status"];
  appointment: Lead["appointment"] | null;
  tech_check: Lead["check"];
  quote: Lead["quote"] | null;
  token: string;
  consent_at: string;
  customer_photos: string[];
  notes: Lead["notes"];
  log: Lead["log"];
};

const fromRow = (r: Row): Lead => ({
  id: r.id,
  company_id: r.company_id,
  created_at: r.created_at,
  customer: r.customer,
  answers: r.answers,
  estimate: r.estimate,
  status: r.status,
  appointment: r.appointment ?? undefined,
  check: r.tech_check,
  quote: r.quote ?? undefined,
  token: r.token,
  consent_at: r.consent_at,
  customer_photos: r.customer_photos ?? [],
  notes: r.notes ?? [],
  log: r.log ?? [],
});

const toRow = (l: Lead): Row => ({
  id: l.id,
  company_id: l.company_id,
  created_at: l.created_at,
  customer: l.customer,
  answers: l.answers,
  estimate: l.estimate,
  status: l.status,
  appointment: l.appointment ?? null,
  tech_check: l.check,
  quote: l.quote ?? null,
  token: l.token,
  consent_at: l.consent_at,
  customer_photos: l.customer_photos,
  notes: l.notes,
  log: l.log,
});

function fail(action: string, error: { message: string }): never {
  console.error(`[supabase] ${action}:`, error.message);
  throw new Error(`Opslag mislukt (${action})`);
}

export async function listLeads(companyId: string): Promise<Lead[]> {
  const { data, error } = await supabaseAdmin()
    .from("requests")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) fail("listLeads", error);
  return (data as Row[]).map(fromRow);
}

export async function getLead(id: string, companyId: string): Promise<Lead | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabaseAdmin()
    .from("requests")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) fail("getLead", error);
  return data ? fromRow(data as Row) : null;
}

export async function getLeadByToken(token: string): Promise<Lead | null> {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const { data, error } = await supabaseAdmin()
    .from("requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) fail("getLeadByToken", error);
  return data ? fromRow(data as Row) : null;
}

export async function saveLead(lead: Lead): Promise<void> {
  const { error } = await supabaseAdmin().from("requests").upsert(toRow(lead));
  if (error) fail("saveLead", error);
}

export async function getSettings(companyId: string): Promise<Settings> {
  const { data, error } = await supabaseAdmin()
    .from("company_settings")
    .select("company_name, phone, email, pricing")
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) fail("getSettings", error);
  return data ? { ...defaultSettings(), ...(data as Settings) } : defaultSettings();
}

export async function saveSettings(companyId: string, s: Settings): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("company_settings")
    .upsert({ company_id: companyId, ...s, updated_at: new Date().toISOString() });
  if (error) fail("saveSettings", error);
}
