import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addNote, advance, approveAndSend, saveQuote, scheduleVisit, setOutcome } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { Flash } from "@/components/Flash";
import { NoteForm } from "@/components/lead/NoteForm";
import { QuoteEditor } from "@/components/lead/QuoteEditor";
import { ScheduleForm } from "@/components/lead/ScheduleForm";
import { SubmitButton } from "@/components/SubmitButton";
import { Card, SectionTitle, StatusBadge, btn, dateTimeNl, dayNl } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import {
  SOURCE_LABEL,
  SOURCE_STYLE,
  TECH_KEYS,
  TECH_OPTIONS,
  openChecks,
  requestFacts,
  techLabel,
} from "@/lib/dossier";
import { formatEur, formatRange, quoteTotal } from "@/lib/pricing/engine";
import { getLead } from "@/lib/store";
import { NOTICES } from "@/lib/notices";
import { NEXT_ACTION } from "@/lib/workflow";

export const metadata: Metadata = { title: "Aanvraag" };
export const dynamic = "force-dynamic";

const TABS = [
  ["overview", "Overzicht"],
  ["customer", "Klantgegevens"],
  ["visit", "Bezoek"],
  ["quote", "Offerte"],
  ["log", "Logboek"],
] as const;
type Tab = (typeof TABS)[number][0];

const TECHNICIANS = ["Sven Bakker", "Lars Visser"];

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; notice?: string }>;
}) {
  const session = await requireSession("owner");
  const { id } = await params;
  const lead = await getLead(id, session.company_id);
  if (!lead) notFound();

  const sp = await searchParams;
  const tab: Tab = TABS.some(([t]) => t === sp.tab) ? (sp.tab as Tab) : "overview";
  const todo = openChecks(lead);
  const facts = requestFacts(lead);
  const base = `/dashboard/${lead.id}`;
  const fullAddress = `${lead.customer.street}, ${lead.customer.postcode} ${lead.customer.city}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <AppShell session={session} wide>
      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-foreground">
        ← Alle aanvragen
      </Link>

      <div className="mt-3">
        <Flash key={sp.notice} message={sp.notice ? NOTICES[sp.notice] : undefined} />
      </div>

      {/* Kop: wie, status, richtlijn, volgende actie, bezoekdatum */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{lead.customer.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <StatusBadge status={lead.status} />
              <span>
                Richtlijn <strong className="tabular text-foreground">{formatRange(lead.estimate)}</strong>
              </span>
              <span>
                Bezoek{" "}
                <strong className="text-foreground">
                  {lead.appointment ? `${dayNl(lead.appointment.date)} ${lead.appointment.time}` : "nog niet gepland"}
                </strong>
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-brand-soft px-4 py-3 sm:min-w-64">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong">Volgende actie</p>
            <p className="mt-0.5 font-semibold">{NEXT_ACTION[lead.status]}</p>
            <div className="mt-3">
              <PrimaryAction status={lead.status} id={lead.id} />
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Aanvraag" className="mt-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`${base}?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
              tab === key ? "border-brand text-brand-strong" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <SectionTitle>Klant</SectionTitle>
              <Dl rows={[["Naam", lead.customer.name], ["Telefoon", lead.customer.phone], ["E-mail", lead.customer.email], ["Adres", fullAddress]]} />
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
                Route bekijken ↗
              </a>
            </Card>
            <Card>
              <SectionTitle>Aanvraag</SectionTitle>
              <ul className="space-y-2.5">
                {facts.map((f) => (
                  <li key={f.label} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-muted">{f.label}</span>
                    <span className="flex flex-col items-end gap-1 text-right">
                      <span className="font-medium">{f.value}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${SOURCE_STYLE[f.source]}`}>
                        {SOURCE_LABEL[f.source]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <SectionTitle>{todo.length > 0 ? `${todo.length} punten controleren tijdens bezoek` : "Technische controle"}</SectionTitle>
              {todo.length === 0 ? (
                <p className="text-sm text-emerald-800">Alle technische punten zijn gecontroleerd.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {todo.map((k) => (
                    <li key={k} className="flex justify-between gap-3">
                      <span>{TECH_OPTIONS[k].label}</span>
                      <span className="text-amber-900">Onbekend</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <SectionTitle>Richtlijnprijs</SectionTitle>
              <p className="tabular text-3xl font-semibold">{formatRange(lead.estimate)}</p>
              {lead.estimate.unknownFactors.length > 0 ? (
                <p className="mt-2 text-sm text-muted">
                  Bredere range door onbekend: {lead.estimate.unknownFactors.join(", ")}.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">Op basis van de antwoorden van de klant.</p>
              )}
            </Card>
            {lead.customer_photos.length > 0 && (
              <Card className="lg:col-span-2">
                <SectionTitle>Foto’s van de klant ({lead.customer_photos.length})</SectionTitle>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {lead.customer_photos.map((p, i) => (
                    <li key={p}>
                      <a href={`/api/photo/${p}`} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/api/photo/${p}`} alt={`Foto ${i + 1} van de klant`} className="aspect-square w-full rounded-lg object-cover" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <Card className="lg:col-span-2">
              <SectionTitle>Interne notities</SectionTitle>
              {lead.notes.length === 0 ? (
                <p className="text-sm text-muted">Nog geen notities. Alleen uw team ziet deze.</p>
              ) : (
                <ul className="space-y-3">
                  {[...lead.notes].reverse().map((n, i) => (
                    <li key={i} className="rounded-lg bg-slate-50 p-3 text-sm">
                      <p className="whitespace-pre-line">{n.text}</p>
                      <p className="mt-1 text-xs text-muted">
                        {n.by} · {dateTimeNl(n.at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <NoteForm action={addNote.bind(null, lead.id)} />
            </Card>
          </div>
        )}

        {tab === "customer" && (
          <Card>
            <SectionTitle>Klantgegevens</SectionTitle>
            <Dl
              rows={[
                ["Naam", lead.customer.name],
                ["Telefoon", lead.customer.phone],
                ["E-mail", lead.customer.email],
                ["Adres", fullAddress],
                ["Aanvraag ontvangen", dateTimeNl(lead.created_at)],
                ["Toestemming gegeven", dateTimeNl(lead.consent_at)],
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <a className={btn.secondary} href={`tel:${lead.customer.phone.replace(/\s/g, "")}`}>
                Bellen
              </a>
              <a className={btn.secondary} href={`mailto:${lead.customer.email}`}>
                E-mailen
              </a>
            </div>
          </Card>
        )}

        {tab === "visit" && (
          <div className="grid gap-4">
            <Card>
              <SectionTitle>Afspraak</SectionTitle>
              {lead.appointment && (
                <p className="mb-4 font-medium">
                  {dayNl(lead.appointment.date)} om {lead.appointment.time} · {lead.appointment.technician}
                </p>
              )}
              {["in_progress", "visit_to_plan", "visit_planned"].includes(lead.status) || lead.status === "new" ? (
                <ScheduleForm
                  action={scheduleVisit.bind(null, lead.id)}
                  technicians={TECHNICIANS}
                  defaults={lead.appointment}
                />
              ) : lead.appointment ? null : (
                <p className="text-muted">Geen bezoek gepland.</p>
              )}
            </Card>
            <Card>
              <SectionTitle>Technische controle</SectionTitle>
              <ul className="divide-y divide-line">
                {TECH_KEYS.map((k) => {
                  const f = lead.check[k];
                  return (
                    <li key={k} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <span>{TECH_OPTIONS[k].label}</span>
                      <span className="flex items-center gap-2">
                        <strong>{techLabel(k, f.value)}</strong>
                        <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${SOURCE_STYLE[f.source]}`}>
                          {SOURCE_LABEL[f.source]}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {lead.check.notes && (
                <p className="mt-4 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm">{lead.check.notes}</p>
              )}
              {lead.check.photos.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {lead.check.photos.map((p, i) => (
                    <li key={p}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/photo/${p}`} alt={`Foto ${i + 1} van het bezoek`} className="aspect-square w-full rounded-lg object-cover" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}

        {tab === "quote" && (
          <Card>
            <SectionTitle>{lead.quote ? "Concept offerte" : "Offerte"}</SectionTitle>
            {!lead.quote ? (
              <div>
                <p className="text-muted">
                  De conceptofferte wordt gemaakt zodra het bezoek is afgerond en de technische gegevens bekend zijn.
                </p>
                {lead.status === "visit_done" && (
                  <form action={advance.bind(null, lead.id)} className="mt-4">
                    <SubmitButton pendingText="Genereren…">Conceptofferte genereren</SubmitButton>
                  </form>
                )}
              </div>
            ) : (
              <QuoteEditor
                key={JSON.stringify(lead.quote.items)}
                initial={lead.quote.items}
                editable={lead.status === "quote_preparing" || lead.status === "quote_review"}
                save={saveQuote.bind(null, lead.id)}
                approve={lead.status === "quote_review" ? approveAndSend.bind(null, lead.id) : undefined}
                recipient={lead.customer.email}
              />
            )}
            {lead.quote?.sent_at && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                <p>
                  Verstuurd op {dateTimeNl(lead.quote.sent_at)}. Totaal {formatEur(quoteTotal(lead.quote.items))}.
                </p>
                <p className="mt-1 text-muted">
                  De klant kan online akkoord geven via de offertelink. In deze demo wordt er nog geen e-mail verstuurd: kopieer de link en stuur die zelf.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton value={`/offerte/${lead.token}`} label="Offertelink kopiëren" />
                  <Link href={`/offerte/${lead.token}`} target="_blank" className={btn.secondary}>
                    Bekijken als klant ↗
                  </Link>
                </div>
              </div>
            )}
            {lead.status === "quote_preparing" && (
              <form action={advance.bind(null, lead.id)} className="mt-4">
                <SubmitButton variant="primary" pendingText="Aanbieden…">
                  Offerte ter controle aanbieden
                </SubmitButton>
              </form>
            )}
          </Card>
        )}

        {tab === "log" && (
          <Card>
            <SectionTitle>Logboek</SectionTitle>
            <ol className="space-y-4">
              {[...lead.log].reverse().map((e, i) => (
                <li key={i} className="grid grid-cols-[7.5rem_1fr] gap-3 text-sm">
                  <time dateTime={e.at} className="tabular text-muted">
                    {dateTimeNl(e.at)}
                  </time>
                  <span>{e.text}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function Dl({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="space-y-2.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function PrimaryAction({ status, id }: { status: string; id: string }) {
  const base = `/dashboard/${id}`;
  const step = (label: string) => (
    <form action={advance.bind(null, id)}>
      <SubmitButton pendingText="Bezig…">{label}</SubmitButton>
    </form>
  );
  switch (status) {
    case "new":
      return step("In behandeling nemen");
    case "in_progress":
      return step("Klaar voor bezoek");
    case "visit_to_plan":
      return (
        <Link href={`${base}?tab=visit`} className={btn.primary}>
          Bezoek inplannen
        </Link>
      );
    case "visit_planned":
      return (
        <p className="text-sm text-muted">
          De technieker rondt het bezoek af. U kunt het bezoek hier verplaatsen.
        </p>
      );
    case "visit_done":
      return step("Conceptofferte genereren");
    case "quote_preparing":
      return step("Ter controle aanbieden");
    case "quote_review":
      return (
        <Link href={`${base}?tab=quote`} className={btn.primary}>
          Offerte controleren
        </Link>
      );
    case "quote_sent":
      return (
        <div className="flex flex-wrap gap-2">
          <form action={setOutcome.bind(null, id, "accepted")}>
            <SubmitButton pendingText="Opslaan…">Akkoord</SubmitButton>
          </form>
          <form action={setOutcome.bind(null, id, "rejected")}>
            <SubmitButton variant="danger" pendingText="Opslaan…">
              Afgewezen
            </SubmitButton>
          </form>
        </div>
      );
    default:
      return <p className="text-sm text-muted">Deze aanvraag is afgerond.</p>;
  }
}
