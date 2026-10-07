/**
 * Prijsregels. Alle bedragen in euro, excl. btw-weergave: richtprijzen.
 * Later per bedrijf op te slaan in de tabel `pricing_rules` (company_id + rules).
 * PLACEHOLDER-bedragen: pas deze aan naar de echte tarieven van het bedrijf.
 */
export type PricingRules = {
  firstUnit: number;
  extraUnit: number;
  /** Aantal units per antwoord op "spaces" ("unknown" telt als 1) */
  unitsBySpaces: Record<string, number>;
  areaSurcharge: Record<string, number>;
  propertySurcharge: Record<string, number>;
  purposeSurcharge: Record<string, number>;
  /** Alleen bij meerdere ruimtes */
  systemSurcharge: Record<string, number>;
  /** Alleen bij één ruimte */
  existingAdjustment: Record<string, number>;
  /** Marge rond het middenbedrag */
  spreadLow: number;
  spreadHigh: number;
  /** Extra spreiding per onbekende factor */
  unknownSpread: number;
  rounding: number;
  quote: {
    installation: number;
    extraPipeMid: number;
    extraPipeLong: number;
    hardWall: number;
    meterBoxWork: number;
  };
};

export const DEFAULT_RULES: PricingRules = {
  firstUnit: 1850,
  extraUnit: 1350,
  unitsBySpaces: { living: 1, bedroom: 1, living_bedroom: 2, multiple: 3 },
  areaSurcharge: { lt20: 0, "20_30": 250, "30_40": 500, gt40: 900 },
  propertySurcharge: { apartment: 0, terraced: 0, corner: 100, detached: 200 },
  purposeSurcharge: { cooling: 0, both: 300 },
  systemSurcharge: { multisplit: 350, separate: 0 },
  existingAdjustment: { none: 0, replace: -150, piping: -250 },
  spreadLow: 0.92,
  spreadHigh: 1.15,
  unknownSpread: 0.04,
  rounding: 50,
  quote: {
    installation: 650,
    extraPipeMid: 150,
    extraPipeLong: 300,
    hardWall: 120,
    meterBoxWork: 250,
  },
};
