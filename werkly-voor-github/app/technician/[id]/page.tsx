import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { completeVisit } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { TechForm } from "@/components/technician/TechForm";
import { Card, SectionTitle, dayNl } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { TECH_OPTIONS, openChecks, requestFacts } from "@/lib/dossier";
import { getLead } from "@/lib/store";

export const metadata: Metadata = { title: "Bezoek" };
export const dynamic = "force-dynamic";

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession("technician");
  const { id } = await params;
  const lead = await getLead(id, session.company_id);
  if (!lead || lead.appointment?.technician !== session.name) notFound();

  const open = lead.status === "visit_planned";
  const facts = requestFacts(lead);
  const todo = openChecks(lead);

  return (
    <AppShell session={session}>
      <Link href="/technician" className="text-sm font-medium text-muted hover:text-foreground">
        ← Mijn bezoeken
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{lead.customer.name}</h1>
      {lead.appointment && (
        <p className="text-muted">
          {dayNl(lead.appointment.date)} om {lead.appointment.time}
        </p>
      )}
      <p className="mt-1 font-medium">
        {lead.customer.street}, {lead.customer.postcode} {lead.customer.city}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.customer.street}, ${lead.customer.postcode} ${lead.customer.city}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white"
        >
          Navigeren
        </a>
        <a
          href={`tel:${lead.customer.phone.replace(/\s/g, "")}`}
          className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold"
        >
          Bel {lead.customer.phone}
        </a>
      </div>

      <div className="mt-6 grid gap-4">
        <Card>
          <SectionTitle>Aanvraag</SectionTitle>
          <ul className="space-y-2 text-sm">
            {facts.map((f) => (
              <li key={f.label} className="flex justify-between gap-3">
                <span className="text-muted">{f.label}</span>
                <span className={`text-right font-medium ${f.source === "unknown" ? "text-amber-900" : ""}`}>{f.value}</span>
              </li>
            ))}
          </ul>
        </Card>

        {lead.customer_photos.length > 0 && (
          <Card>
            <SectionTitle>Foto’s van de klant</SectionTitle>
            <ul className="grid grid-cols-3 gap-2">
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

        {open && (
          <Card>
            <SectionTitle>Wat moet gecontroleerd worden</SectionTitle>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {todo.map((k) => (
                <li key={k}>{TECH_OPTIONS[k].label}</li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <SectionTitle>Technische checklist</SectionTitle>
          {open ? (
            <TechForm action={completeVisit.bind(null, lead.id)} check={lead.check} />
          ) : (
            <p className="text-muted">Dit bezoek is afgerond. De gegevens staan bij de installateur.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
