import type { PricingRules } from "./rules";

/** Beschrijft welke velden in het instellingenscherm bewerkbaar zijn. */
export type PriceField = {
  path: string; // bv. "firstUnit" of "areaSurcharge.20_30"
  label: string;
  unit: "eur" | "pct";
  hint?: string;
};
export type PriceGroup = { title: string; description?: string; fields: PriceField[] };

export const PRICE_GROUPS: PriceGroup[] = [
  {
    title: "Basisprijs",
    description: "Prijs inclusief toestel en montage voor de eerste en elke volgende unit.",
    fields: [
      { path: "firstUnit", label: "Eerste unit", unit: "eur" },
      { path: "extraUnit", label: "Elke extra unit", unit: "eur" },
    ],
  },
  {
    title: "Toeslag per oppervlakte",
    fields: [
      { path: "areaSurcharge.lt20", label: "< 20 m²", unit: "eur" },
      { path: "areaSurcharge.20_30", label: "20 – 30 m²", unit: "eur" },
      { path: "areaSurcharge.30_40", label: "30 – 40 m²", unit: "eur" },
      { path: "areaSurcharge.gt40", label: "> 40 m²", unit: "eur" },
    ],
  },
  {
    title: "Toeslag per woningtype",
    fields: [
      { path: "propertySurcharge.apartment", label: "Appartement", unit: "eur" },
      { path: "propertySurcharge.terraced", label: "Rijtjeswoning", unit: "eur" },
      { path: "propertySurcharge.corner", label: "Hoekwoning / twee-onder-een-kap", unit: "eur" },
      { path: "propertySurcharge.detached", label: "Vrijstaand", unit: "eur" },
    ],
  },
  {
    title: "Gebruik en opstelling",
    fields: [
      { path: "purposeSurcharge.both", label: "Koelen en verwarmen", unit: "eur", hint: "Bovenop alleen koelen" },
      { path: "systemSurcharge.multisplit", label: "Multisplit (1 buitenunit)", unit: "eur" },
      { path: "existingAdjustment.replace", label: "Bestaande airco vervangen", unit: "eur", hint: "Negatief = korting" },
      { path: "existingAdjustment.piping", label: "Leidingwerk aanwezig", unit: "eur", hint: "Negatief = korting" },
    ],
  },
  {
    title: "Bandbreedte richtprijs",
    description: "Hoe breed de range rond het middenbedrag is. Elk onbekend antwoord maakt de range extra breed.",
    fields: [
      { path: "spreadLow", label: "Ondergrens", unit: "pct", hint: "92 = 8% onder het midden" },
      { path: "spreadHigh", label: "Bovengrens", unit: "pct", hint: "115 = 15% boven het midden" },
      { path: "unknownSpread", label: "Extra per onbekend antwoord", unit: "pct" },
    ],
  },
  {
    title: "Offerteregels na bezoek",
    fields: [
      { path: "quote.installation", label: "Montage per unit", unit: "eur" },
      { path: "quote.extraPipeMid", label: "Extra leiding 10–15 m", unit: "eur" },
      { path: "quote.extraPipeLong", label: "Extra leiding > 15 m", unit: "eur" },
      { path: "quote.hardWall", label: "Boorwerk harde wand", unit: "eur" },
      { path: "quote.meterBoxWork", label: "Aanpassing meterkast", unit: "eur" },
    ],
  },
];

export function getPath(rules: PricingRules, path: string): number {
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], rules) as number;
}

/** Zet een waarde in een kopie van de regels. Pct-velden worden als percentage ingevoerd. */
export function setPath(rules: PricingRules, path: string, value: number): PricingRules {
  const copy = structuredClone(rules) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let o = copy;
  for (const k of keys.slice(0, -1)) o = o[k] as Record<string, unknown>;
  o[keys[keys.length - 1]] = value;
  return copy as unknown as PricingRules;
}

export const toDisplay = (f: PriceField, v: number) =>
  f.unit === "pct" ? Math.round(v * 100) : v;
export const fromDisplay = (f: PriceField, v: number) => (f.unit === "pct" ? v / 100 : v);
