export const UNKNOWN = "unknown" as const;

export type LeadStatus =
  | "new"
  | "in_progress"
  | "visit_to_plan"
  | "visit_planned"
  | "visit_done"
  | "quote_preparing"
  | "quote_review"
  | "quote_sent"
  | "accepted"
  | "rejected";

/** Herkomst van een gegeven: wie weet dit, en hoe zeker is het? */
export type Source = "customer" | "unknown" | "estimated" | "verified";

export type Customer = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  /** Straat en huisnummer */
  street: string;
  city: string;
};

export type Estimate = {
  min: number;
  max: number;
  /** Menselijk leesbare redenen waarom de range breder is. */
  unknownFactors: string[];
};

export type TechField = { value: string; source: Source };

export type TechCheck = {
  outdoor_unit: TechField;
  pipe_distance: TechField;
  meter_box: TechField;
  wall_type: TechField;
  mounting: TechField;
  notes: string;
  photos: string[];
  completed_at?: string;
};

export type QuoteItem = { id: string; label: string; amount: number };

export type Quote = {
  items: QuoteItem[];
  generated_at: string;
  reviewed_at?: string;
  sent_at?: string;
  /** Beslissing van de klant via de offertelink */
  decided_at?: string;
};

export type Note = { at: string; by: string; text: string };

export type Appointment = { date: string; time: string; technician: string };

export type LogEntry = { at: string; text: string };

export type Lead = {
  id: string;
  company_id: string;
  created_at: string;
  customer: Customer;
  /** key = vraag-id, value = optie-id of "unknown" */
  answers: Record<string, string>;
  estimate: Estimate;
  status: LeadStatus;
  appointment?: Appointment;
  check: TechCheck;
  quote?: Quote;
  log: LogEntry[];
  /** Geheime sleutel voor de publieke offertelink */
  token: string;
  consent_at: string;
  /** Foto's die de klant bij de aanvraag meestuurde */
  customer_photos: string[];
  notes: Note[];
};

export type Settings = {
  company_name: string;
  phone: string;
  email: string;
  pricing: import("./pricing/rules").PricingRules;
};

export type Role = "owner" | "technician";
export type Session = { name: string; role: Role; company_id: string };
