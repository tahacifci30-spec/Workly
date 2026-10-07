import "server-only";
import { DEFAULT_COMPANY, USE_SUPABASE, emptyCheck, newToken } from "./defaults";
import { estimatePrice } from "./pricing/engine";
import * as file from "./store-file";
import * as supabase from "./store-supabase";
import type { Customer, Lead } from "./types";

/**
 * Enige ingang voor opslag. Met SUPABASE_SERVICE_ROLE_KEY ingesteld gebruikt de app Supabase,
 * anders het lokale JSON-bestand. De rest van de app weet niet welke van de twee actief is.
 */
const impl = USE_SUPABASE ? supabase : file;

export { DEFAULT_COMPANY };
export const { listLeads, getLead, getLeadByToken, saveLead, getSettings, saveSettings } = impl;

export async function createLead(
  input: { customer: Customer; answers: Record<string, string>; photos: string[] },
  companyId = DEFAULT_COMPANY,
): Promise<Lead> {
  const settings = await impl.getSettings(companyId);
  const now = new Date().toISOString();
  const photoLog = input.photos.length
    ? [{ at: now, text: `${input.photos.length} foto(s) meegestuurd door klant` }]
    : [];
  const lead: Lead = {
    id: crypto.randomUUID(),
    company_id: companyId,
    created_at: now,
    customer: input.customer,
    answers: input.answers,
    estimate: estimatePrice(input.answers, settings.pricing),
    status: "new",
    check: emptyCheck(),
    token: newToken(),
    consent_at: now,
    customer_photos: input.photos,
    notes: [],
    log: [
      { at: now, text: "Klant heeft aanvraag ingevuld" },
      ...photoLog,
      { at: now, text: "Richtlijnprijs berekend" },
      { at: now, text: "Aanvraag ontvangen" },
    ],
  };
  await impl.saveLead(lead);
  return lead;
}
