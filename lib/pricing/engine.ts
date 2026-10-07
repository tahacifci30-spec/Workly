import { UNKNOWN, type Estimate, type Lead, type QuoteItem } from "../types";
import { DEFAULT_RULES, type PricingRules } from "./rules";

const FACTOR_LABELS: Record<string, string> = {
  spaces: "aantal ruimtes",
  area: "oppervlakte",
  property: "type woning",
  purpose: "gebruik (koelen/verwarmen)",
  system: "opstelling",
  existing: "bestaande installatie",
};

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function lookup(table: Record<string, number>, key: string | undefined) {
  if (!key || key === UNKNOWN) return 0;
  return table[key] ?? 0;
}

/** Berekent de richtprijs-range. Puur deterministisch; geen AI. */
export function estimatePrice(
  answers: Record<string, string>,
  rules: PricingRules = DEFAULT_RULES,
): Estimate {
  const units =
    answers.spaces && answers.spaces !== UNKNOWN
      ? (rules.unitsBySpaces[answers.spaces] ?? 1)
      : 1;

  let mid = rules.firstUnit + (units - 1) * rules.extraUnit;
  mid += lookup(rules.areaSurcharge, answers.area);
  mid += lookup(rules.propertySurcharge, answers.property);
  mid += lookup(rules.purposeSurcharge, answers.purpose);
  mid += lookup(rules.systemSurcharge, answers.system);
  mid += lookup(rules.existingAdjustment, answers.existing);

  const unknownFactors = Object.entries(answers)
    .filter(([, v]) => v === UNKNOWN)
    .map(([k]) => FACTOR_LABELS[k] ?? k);

  const extra = unknownFactors.length * rules.unknownSpread;
  return {
    min: roundTo(mid * (rules.spreadLow - extra), rules.rounding),
    max: roundTo(mid * (rules.spreadHigh + extra), rules.rounding),
    unknownFactors,
  };
}

export function unitsFor(answers: Record<string, string>, rules = DEFAULT_RULES) {
  return answers.spaces && answers.spaces !== UNKNOWN
    ? (rules.unitsBySpaces[answers.spaces] ?? 1)
    : 1;
}

let seq = 0;
const itemId = () => `i${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Maakt een conceptofferte op basis van de intake en de technische controle. */
export function generateQuoteItems(
  lead: Lead,
  rules: PricingRules = DEFAULT_RULES,
): QuoteItem[] {
  const est = estimatePrice(lead.answers, rules);
  const units = unitsFor(lead.answers, rules);
  const midTotal = (est.min + est.max) / 2;
  const installation = rules.quote.installation * units;
  const equipment = Math.max(0, roundTo(midTotal - installation, rules.rounding));

  const items: QuoteItem[] = [
    {
      id: itemId(),
      label: `Airco-installatie (${units} ${units === 1 ? "unit" : "units"})`,
      amount: equipment,
    },
    { id: itemId(), label: "Montage", amount: installation },
  ];

  const dist = lead.check.pipe_distance.value;
  if (dist === "10_15") {
    items.push({ id: itemId(), label: "Extra leiding (10–15 m)", amount: rules.quote.extraPipeMid });
  } else if (dist === "gt15") {
    items.push({ id: itemId(), label: "Extra leiding (> 15 m)", amount: rules.quote.extraPipeLong });
  }
  if (lead.check.wall_type.value === "hard") {
    items.push({ id: itemId(), label: "Boorwerk harde wand", amount: rules.quote.hardWall });
  }
  if (lead.check.meter_box.value === "work") {
    items.push({ id: itemId(), label: "Aanpassing meterkast", amount: rules.quote.meterBoxWork });
  }
  return items;
}

export const quoteTotal = (items: QuoteItem[]) =>
  items.reduce((sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0), 0);

const eur = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
export const formatEur = (n: number) => eur.format(n);
export const formatRange = (e: Estimate) =>
  `${formatEur(e.min)} – ${formatEur(e.max)}`;
