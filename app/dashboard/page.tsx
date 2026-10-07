import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge, btn, dateNl, field } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { ageLabel, daysSince, lastActivity } from "@/lib/metrics";
import { formatRange } from "@/lib/pricing/engine";
import { listLeads } from "@/lib/store";
import type { Lead } from "@/lib/types";
import { NEXT_ACTION, TODO_LABEL, isOpen, todoKey, type TodoKey } from "@/lib/workflow";

export const metadata: Metadata = { title: "Aanvragen" };
export const dynamic = "force-dynamic";

const FILTERS = [
  ["open", "Open"],
  ["action", "Wacht op mij"],
  ["visit", "Bezoek"],
  ["quote", "Offerte"],
  ["closed", "Afgerond"],
  ["all", "Alles"],
] as const;
type Filter = (typeof FILTERS)[number][0];

// "Wacht op mij": statussen waarin de installateur zelf aan zet is.
const STALE_DAYS = 3;
const OWNER_TURN = new Set(["new", "in_progress", "visit_to_plan", "visit_done", "quote_preparing", "quote_review", "quote_sent"]);
const VISIT = new Set(["visit_to_plan", "visit_planned", "visit_done"]);
const QUOTE = new Set(["quote_preparing", "quote_review", "quote_sent"]);

const matches: Record<Filter, (l: Lead) => boolean> = {
  open: isOpen,
  action: (l) => OWNER_TURN.has(l.status),
  visit: (l) => VISIT.has(l.status) || l.status === "in_progress",
  quote: (l) => QUOTE.has(l.status),
  closed: (l) => !isOpen(l),
  all: () => true,
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const session = await requireSession("owner");
  const sp = await searchParams;
  const filter: Filter = FILTERS.some(([f]) => f === sp.filter) ? (sp.filter as Filter) : "open";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 80);

  const all = await listLeads(session.company_id);
  const open = all.filter(isOpen);

  // Bezoeken van vandaag (en nog niet afgeronde bezoeken van eerdere dagen).
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
  const visitsToday = open
    .filter((l) => l.status === "visit_planned" && l.appointment && l.appointment.date <= today)
    .sort((a, b) =>
      `${a.appointment!.date}${a.appointment!.time}`.localeCompare(`${b.appointment!.date}${b.appointment!.time}`),
    );

  // Aanvragen waar de installateur aan zet is en die al een tijd stilliggen.
  const waiting = open
    .filter((l) => OWNER_TURN.has(l.status) && daysSince(lastActivity(l)) >= STALE_DAYS)
    .sort((a, b) => lastActivity(a).localeCompare(lastActivity(b)));

  const counts = new Map<TodoKey, number>();
  for (const l of open) {
    const k = todoKey(l.status);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const todos = (Object.keys(TODO_LABEL) as TodoKey[]).filter((k) => counts.get(k));

  const shown = all
    .filter(matches[filter])
    .filter(
      (l) =>
        !q ||
        [l.customer.name, l.customer.postcode, l.customer.city, l.customer.email, l.customer.phone]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );

  const href = (f: Filter) => `/dashboard?filter=${f}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <AppShell session={session} wide>
      <h1 className="text-2xl font-semibold tracking-tight">Acties voor vandaag</h1>

      {todos.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
          <p className="font-medium">Alles is bijgewerkt.</p>
          <p className="text-muted">
            Er staan geen acties open. Deel de intake-link op uw website of in uw e-mailhandtekening om aanvragen te ontvangen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value="/intake" label="Intake-link kopiëren" />
            <Link href="/intake" target="_blank" className={btn.secondary}>
              Intake bekijken ↗
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {todos.map((k) => {
            const n = counts.get(k)!;
            return (
              <li key={k} className="flex items-baseline gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
                <span className="tabular text-3xl font-semibold text-brand">{n}</span>
                <span className="font-medium">{n === 1 ? TODO_LABEL[k].one : TODO_LABEL[k].many}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="visits-today" className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 id="visits-today" className="text-base font-semibold">Bezoeken vandaag</h2>
          {visitsToday.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Geen bezoeken gepland voor vandaag.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {visitsToday.map((l) => (
                <li key={l.id}>
                  <Link href={`/dashboard/${l.id}?tab=visit`} className="flex items-center gap-4 py-3 hover:text-brand-strong">
                    <span className="tabular w-14 shrink-0 text-lg font-semibold">{l.appointment!.time}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{l.customer.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {l.customer.street}, {l.customer.city} · {l.appointment!.technician}
                      </span>
                    </span>
                    {l.appointment!.date < today && (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-200">
                        Nog niet afgerond
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="waiting" className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 id="waiting" className="text-base font-semibold">Wacht te lang</h2>
          {waiting.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Er ligt niets langer dan {STALE_DAYS} dagen stil.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {waiting.map((l) => (
                <li key={l.id}>
                  <Link href={`/dashboard/${l.id}`} className="flex items-center gap-4 py-3 hover:text-brand-strong">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{l.customer.name}</span>
                      <span className="block truncate text-sm text-muted">{NEXT_ACTION[l.status]}</span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-amber-900">
                      {daysSince(lastActivity(l))} dagen
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Aanvragen</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <CopyButton value="/intake" label="Intake-link kopiëren" className="rounded-md px-2 py-1 font-medium text-brand hover:underline" />
          <a href="/dashboard/export" download className="rounded-md px-2 py-1 font-medium text-brand hover:underline">
            Exporteren (CSV)
          </a>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter aanvragen" className="flex flex-wrap gap-1.5">
          {FILTERS.map(([f, label]) => {
            const n = all.filter(matches[f]).length;
            return (
              <Link
                key={f}
                href={href(f)}
                aria-current={filter === f ? "page" : undefined}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  filter === f ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface text-muted hover:text-foreground"
                }`}
              >
                {label} <span className="tabular opacity-70">{n}</span>
              </Link>
            );
          })}
        </nav>
        <form role="search" action="/dashboard" className="flex gap-2">
          <input type="hidden" name="filter" value={filter} />
          <label htmlFor="q" className="sr-only">
            Zoek op naam, postcode of plaats
          </label>
          <input id="q" name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Zoek naam, postcode, plaats" className={`${field} w-64`} />
          <button type="submit" className={btn.secondary}>
            Zoeken
          </button>
        </form>
      </div>

      <LeadList leads={shown} query={q} filter={filter} clearHref={href("all").replace(/&q=.*/, "")} />
    </AppShell>
  );
}

function LeadList({
  leads,
  query,
  filter,
  clearHref,
}: {
  leads: Lead[];
  query: string;
  filter: Filter;
  clearHref: string;
}) {
  if (leads.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
        {query ? (
          <>
            <p className="font-medium">Geen aanvragen gevonden voor “{query}”.</p>
            <p className="text-muted">Controleer de spelling, zoek op postcode of woonplaats, of bekijk alle aanvragen.</p>
            <Link href={clearHref} className={`${btn.secondary} mt-4`}>
              Alle aanvragen tonen
            </Link>
          </>
        ) : (
          <p className="text-muted">
            {filter === "closed" ? "Nog geen afgeronde aanvragen." : "Geen aanvragen in deze weergave."}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.5fr] gap-4 border-b border-line bg-slate-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
        <span>Klant</span>
        <span>Status</span>
        <span>Richtlijn</span>
        <span>Volgende actie</span>
      </div>
      <ul className="divide-y divide-line">
        {leads.map((l) => {
          const days = daysSince(lastActivity(l));
          const stale = isOpen(l) && days >= 3;
          return (
            <li key={l.id}>
              <Link
                href={`/dashboard/${l.id}`}
                className={`grid gap-1.5 px-5 py-4 transition-colors hover:bg-brand-soft md:grid-cols-[1.4fr_1fr_1fr_1.5fr] md:items-center md:gap-4 ${isOpen(l) ? "" : "opacity-75"}`}
              >
                <span>
                  <span className="block font-semibold">{l.customer.name}</span>
                  <span className="block text-sm text-muted">
                    {l.customer.postcode} {l.customer.city} · {dateNl(l.created_at)}
                  </span>
                </span>
                <span>
                  <StatusBadge status={l.status} />
                </span>
                <span className="tabular text-sm">{formatRange(l.estimate)}</span>
                <span className="text-sm">
                  <span className="font-medium text-brand-strong">
                    {NEXT_ACTION[l.status]} <span aria-hidden="true">→</span>
                  </span>
                  {isOpen(l) && (
                    <span className={`mt-0.5 block text-xs ${stale ? "font-medium text-amber-900" : "text-muted"}`}>
                      {stale && "⚠ "}Laatste activiteit {ageLabel(days)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
