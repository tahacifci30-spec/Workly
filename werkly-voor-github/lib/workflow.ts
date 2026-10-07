import type { Lead, LeadStatus } from "./types";

export const STATUS_ORDER: LeadStatus[] = [
  "new",
  "in_progress",
  "visit_to_plan",
  "visit_planned",
  "visit_done",
  "quote_preparing",
  "quote_review",
  "quote_sent",
  "accepted",
  "rejected",
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Nieuw",
  in_progress: "In behandeling",
  visit_to_plan: "Bezoek plannen",
  visit_planned: "Bezoek gepland",
  visit_done: "Bezoek afgerond",
  quote_preparing: "Offerte in voorbereiding",
  quote_review: "Offerte ter controle",
  quote_sent: "Offerte verstuurd",
  accepted: "Akkoord",
  rejected: "Afgewezen",
};

/** Tailwind-klassen per status (tekst + achtergrond, beide ≥ 4.5:1). */
export const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  in_progress: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  visit_to_plan: "bg-amber-50 text-amber-900 ring-amber-200",
  visit_planned: "bg-violet-50 text-violet-800 ring-violet-200",
  visit_done: "bg-teal-50 text-teal-800 ring-teal-200",
  quote_preparing: "bg-orange-50 text-orange-900 ring-orange-200",
  quote_review: "bg-rose-50 text-rose-800 ring-rose-200",
  quote_sent: "bg-blue-50 text-blue-800 ring-blue-200",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-slate-100 text-slate-700 ring-slate-300",
};

/** De volgende actie voor de installateur per status. */
export const NEXT_ACTION: Record<LeadStatus, string> = {
  new: "Aanvraag controleren",
  in_progress: "Dossier afronden voor bezoek",
  visit_to_plan: "Bezoek inplannen",
  visit_planned: "Wacht op technische controle",
  visit_done: "Conceptofferte genereren",
  quote_preparing: "Offerte ter controle aanbieden",
  quote_review: "Offerte controleren en versturen",
  quote_sent: "Opvolgen: akkoord of afgewezen?",
  accepted: "Geen actie nodig",
  rejected: "Geen actie nodig",
};

/** Groepering voor het blok "Acties voor vandaag". */
export type TodoKey =
  | "new"
  | "plan"
  | "finish_visit"
  | "generate_quote"
  | "review_quote"
  | "follow_up";

export const TODO_LABEL: Record<TodoKey, { one: string; many: string }> = {
  new: { one: "nieuwe aanvraag", many: "nieuwe aanvragen" },
  plan: { one: "bezoek plannen", many: "bezoeken plannen" },
  finish_visit: { one: "bezoek afronden", many: "bezoeken afronden" },
  generate_quote: { one: "offerte opstellen", many: "offertes opstellen" },
  review_quote: { one: "offerte controleren", many: "offertes controleren" },
  follow_up: { one: "offerte opvolgen", many: "offertes opvolgen" },
};

export function todoKey(status: LeadStatus): TodoKey | null {
  switch (status) {
    case "new":
      return "new";
    case "in_progress":
    case "visit_to_plan":
      return "plan";
    case "visit_planned":
      return "finish_visit";
    case "visit_done":
    case "quote_preparing":
      return "generate_quote";
    case "quote_review":
      return "review_quote";
    case "quote_sent":
      return "follow_up";
    default:
      return null;
  }
}

export function isOpen(lead: Lead) {
  return lead.status !== "accepted" && lead.status !== "rejected";
}
