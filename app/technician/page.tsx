import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, dayNl } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { optionLabel } from "@/lib/intake/questions";
import { openChecks } from "@/lib/dossier";
import { listLeads } from "@/lib/store";

export const metadata: Metadata = { title: "Vandaag" };
export const dynamic = "force-dynamic";

export default async function TechnicianPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const session = await requireSession("technician");
  const { done } = await searchParams;
  const all = await listLeads(session.company_id);
  const visits = all
    .filter((l) => l.status === "visit_planned" && l.appointment?.technician === session.name)
    .sort((a, b) =>
      `${a.appointment!.date}${a.appointment!.time}`.localeCompare(`${b.appointment!.date}${b.appointment!.time}`),
    );

  const today = new Date().toISOString().slice(0, 10);
  const groups = [
    ["Vandaag", visits.filter((l) => l.appointment!.date <= today)],
    ["Binnenkort", visits.filter((l) => l.appointment!.date > today)],
  ] as const;

  return (
    <AppShell session={session}>
      <h1 className="text-2xl font-semibold tracking-tight">Mijn bezoeken</h1>

      {done && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-800">
          Bezoek afgerond. De gegevens zijn doorgestuurd naar de installateur.
        </p>
      )}

      {visits.length === 0 && (
        <Card className="mt-6">
          <p className="font-medium">Geen bezoeken gepland.</p>
          <p className="text-muted">Zodra de installateur een bezoek voor u inplant, ziet u dat hier.</p>
        </Card>
      )}

      {groups.map(
        ([title, list]) =>
          list.length > 0 && (
            <section key={title} className="mt-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
              <ul className="space-y-3">
                {list.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/technician/${l.id}`}
                      className="block rounded-2xl border border-line bg-surface p-4 shadow-sm transition-colors hover:border-brand"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-semibold">{l.customer.name}</span>
                        <span className="tabular rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong">
                          {title === "Vandaag" ? l.appointment!.time : `${dayNl(l.appointment!.date)} ${l.appointment!.time}`}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {l.customer.street}, {l.customer.city} · {optionLabel("spaces", l.answers.spaces)} ·{" "}
                        {optionLabel("property", l.answers.property)}
                      </p>
                      <p className="mt-2 text-sm font-medium text-amber-900">
                        {openChecks(l).length} punten controleren
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </AppShell>
  );
}
