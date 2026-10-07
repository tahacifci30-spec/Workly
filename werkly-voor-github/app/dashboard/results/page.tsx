import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { computeMetrics } from "@/lib/metrics";
import { formatEur } from "@/lib/pricing/engine";
import { listLeads } from "@/lib/store";

export const metadata: Metadata = { title: "Resultaten" };
export const dynamic = "force-dynamic";

// Gemiddelden en percentages zeggen pas iets bij genoeg aanvragen.
const MIN_FOR_RATES = 10;

export default async function ResultsPage() {
  const session = await requireSession("owner");
  const leads = await listLeads(session.company_id);
  const m = computeMetrics(leads);
  const enough = leads.length >= MIN_FOR_RATES;
  const pct = (v: number | null) => (v === null || !enough ? "–" : `${Math.round(v * 100)}%`);

  return (
    <AppShell session={session} wide>
      <h1 className="text-2xl font-semibold tracking-tight">Resultaten</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Hoeveel heen-en-weer en tijd bespaart Werkly? Percentages en gemiddelden verschijnen vanaf {MIN_FOR_RATES}{" "}
        aanvragen. Nu: {leads.length}.
      </p>

      <section aria-label="Cijfers" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Nieuw (7 dagen)" value={String(m.newThisWeek)} />
        <Metric label="Waarde open aanvragen" value={formatEur(m.pipelineValue)} hint="Schatting, geen omzet" />
        <Metric label="Volledig bij binnenkomst" value={pct(m.completeRate)} hint="Geen ‘weet ik niet’ in de intake" />
        <Metric
          label="Aanvraag tot offerte"
          value={m.daysToQuote === null || !enough ? "–" : `${m.daysToQuote.toFixed(1).replace(".", ",")} dagen`}
          hint={m.winRate === null || !enough ? undefined : `${Math.round(m.winRate * 100)}% akkoord (${m.decided} beslist)`}
        />
      </section>
    </AppShell>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="tabular mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
