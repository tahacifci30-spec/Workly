import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decideQuote } from "@/app/actions";
import { PrintButton } from "@/components/CopyButton";
import { SubmitButton } from "@/components/SubmitButton";
import { dateTimeNl } from "@/components/ui";
import { formatEur, quoteTotal } from "@/lib/pricing/engine";
import { getLeadByToken, getSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Uw offerte",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const VISIBLE = new Set(["quote_sent", "accepted", "rejected"]);

export default async function QuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await getLeadByToken(token);
  if (!lead || !lead.quote || !VISIBLE.has(lead.status)) notFound();
  const company = await getSettings(lead.company_id);
  const total = quoteTotal(lead.quote.items);
  const subtotal = total / 1.21;
  const vat = total - subtotal;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 print:py-0">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8 print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">{company.company_name}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Offerte installatie</h1>
          </div>
          <p className="text-right text-sm text-muted">
            Datum {dateTimeNl(lead.quote.sent_at ?? lead.quote.generated_at).split(",")[0]}
            <br />
            Referentie {lead.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold">Aan</p>
            <p>{lead.customer.name}</p>
            <p>{lead.customer.street}</p>
            <p>
              {lead.customer.postcode} {lead.customer.city}
            </p>
          </div>
          <div>
            <p className="font-semibold">Van</p>
            <p>{company.company_name}</p>
            <p>{company.phone}</p>
            <p>{company.email}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <caption className="sr-only">Onderdelen van de offerte</caption>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th scope="col" className="py-2 font-semibold">Omschrijving</th>
              <th scope="col" className="py-2 text-right font-semibold">Bedrag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lead.quote.items.map((i) => (
              <tr key={i.id}>
                <td className="py-3">{i.label}</td>
                <td className="tabular py-3 text-right">{formatEur(i.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="tabular text-sm">
            <tr>
              <td className="pt-4 text-muted">Subtotaal excl. btw</td>
              <td className="pt-4 text-right">{formatEur(subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1 text-muted">Btw 21%</td>
              <td className="py-1 text-right">{formatEur(vat)}</td>
            </tr>
            <tr className="text-lg font-semibold">
              <td className="border-t border-line pt-3">Totaal incl. btw</td>
              <td className="border-t border-line pt-3 text-right">{formatEur(total)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-4 text-xs text-muted">
          Bedragen zijn inclusief btw. Deze offerte is 30 dagen geldig na de datum hierboven.
        </p>

        <div className="mt-8 print:hidden">
          {lead.status === "quote_sent" && (
            <div className="rounded-xl bg-brand-soft p-4">
              <p className="font-medium">Akkoord met deze offerte?</p>
              <p className="mt-1 text-sm text-slate-700">
                Door akkoord te gaan geeft u opdracht. {company.company_name} neemt daarna contact op om de
                installatie in te plannen.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={decideQuote.bind(null, token, "accepted")}>
                  <SubmitButton pendingText="Verwerken…">Akkoord, plan de installatie</SubmitButton>
                </form>
                <form action={decideQuote.bind(null, token, "rejected")}>
                  <SubmitButton variant="secondary" pendingText="Verwerken…">
                    Niet akkoord
                  </SubmitButton>
                </form>
              </div>
            </div>
          )}
          {lead.status === "accepted" && (
            <p role="status" className="rounded-xl bg-emerald-50 p-4 font-medium text-emerald-800">
              Bedankt, u bent akkoord. {company.company_name} neemt contact met u op om de installatie in te plannen.
            </p>
          )}
          {lead.status === "rejected" && (
            <p role="status" className="rounded-xl bg-slate-100 p-4 text-slate-800">
              U heeft aangegeven niet akkoord te zijn. Heeft u vragen of wilt u iets aanpassen? Bel{" "}
              {company.company_name} op {company.phone}.
            </p>
          )}
        </div>

        <div className="mt-6 print:hidden">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
