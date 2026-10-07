import { DEFAULT_RULES } from "./pricing/rules";
import { UNKNOWN, type Settings, type TechCheck } from "./types";

/** Supabase wordt gebruikt zodra de server-sleutel is ingesteld; anders het JSON-bestand. */
export const USE_SUPABASE = !!(
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL
);

/** Het (eerste) bedrijf waar de publieke intake aanvragen aan koppelt. Zie supabase/migrations. */
export const DEFAULT_COMPANY = USE_SUPABASE
  ? (process.env.DEFAULT_COMPANY_ID ?? "00000000-0000-0000-0000-000000000001")
  : "demo-installatie";

export const defaultSettings = (): Settings => ({
  company_name: "Demo Installatie",
  phone: "013 000 00 00",
  email: "info@demo-installatie.nl",
  pricing: DEFAULT_RULES,
});

export const emptyCheck = (): TechCheck => ({
  outdoor_unit: { value: UNKNOWN, source: "unknown" },
  pipe_distance: { value: UNKNOWN, source: "unknown" },
  meter_box: { value: UNKNOWN, source: "unknown" },
  wall_type: { value: UNKNOWN, source: "unknown" },
  mounting: { value: UNKNOWN, source: "unknown" },
  notes: "",
  photos: [],
});

export const newToken = () => crypto.randomUUID().replace(/-/g, "");
