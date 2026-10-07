import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { Flash } from "@/components/Flash";
import { CompanyForm, PricingForm } from "@/components/settings/SettingsForms";
import { Card, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { NOTICES } from "@/lib/notices";
import { estimatePrice, formatRange } from "@/lib/pricing/engine";
import { PRICE_GROUPS, getPath, toDisplay } from "@/lib/pricing/fields";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = { title: "Instellingen" };
export const dynamic = "force-dynamic";

const EXAMPLES: [string, Record<string, string>][] = [
  ["1 ruimte · 20–30 m² · rijtjeswoning · koelen", { spaces: "living", area: "20_30", property: "terraced", purpose: "cooling", existing: "none" }],
  ["Woonkamer + slaapkamer · 30–40 m² · vrijstaand · koelen en verwarmen · multisplit", { spaces: "living_bedroom", area: "30_40", property: "detached", purpose: "both", system: "multisplit" }],
  ["Alles onbekend", { spaces: "unknown", area: "unknown", property: "unknown", purpose: "unknown", existing: "unknown" }],
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await requireSession("owner");
  const { notice } = await searchParams;
  const s = await getSettings(session.company_id);

  const values: Record<string, number> = {};
  for (const g of PRICE_GROUPS) for (const f of g.fields) values[f.path] = toDisplay(f, getPath(s.pricing, f.path));

  const embed = `<iframe src="/intake" title="Richtlijnprijs" style="width:100%;min-height:720px;border:0" loading="lazy"></iframe>`;

  return (
    <AppShell session={session}>
      <h1 className="text-2xl font-semibold tracking-tight">Instellingen</h1>
      <div className="mt-4">
        <Flash key={notice} message={notice ? NOTICES[notice] : undefined} />
      </div>

      <div className="grid gap-4">
        <Card>
          <SectionTitle>Bedrijf</SectionTitle>
          <CompanyForm values={{ company_name: s.company_name, phone: s.phone, email: s.email }} />
        </Card>

        <Card>
          <SectionTitle>Intake delen</SectionTitle>
          <p className="text-sm text-muted">
            Zet de intake op uw website of deel de link. Aanvragen komen direct in uw dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value="/intake" label="Link kopiëren" />
          </div>
          <label htmlFor="embed" className="mt-5 block text-sm font-medium">
            Insluitcode voor uw website
          </label>
          <textarea id="embed" readOnly rows={3} value={embed} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs" />
          <p className="mt-1 text-xs text-muted">Vervang het pad door de volledige URL van uw Werkly-omgeving.</p>
        </Card>

        <Card>
          <SectionTitle>Prijsregels richtprijs</SectionTitle>
          <p className="mb-5 text-sm text-muted">
            De richtprijs in de intake en de conceptofferte komen uit deze regels. Bedragen zijn inclusief btw.
            Bestaande aanvragen behouden de prijs die de klant zag.
          </p>
          <PricingForm values={values} />
        </Card>

        <Card>
          <SectionTitle>Voorbeeldberekeningen met de opgeslagen regels</SectionTitle>
          <ul className="divide-y divide-line text-sm">
            {EXAMPLES.map(([label, answers]) => (
              <li key={label} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className="max-w-md text-muted">{label}</span>
                <strong className="tabular">{formatRange(estimatePrice(answers, s.pricing))}</strong>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
