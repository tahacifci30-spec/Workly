"use client";

import { resetPricing, saveCompany, savePricing } from "@/app/actions";
import { PRICE_GROUPS } from "@/lib/pricing/fields";
import { ActionForm } from "../ActionForm";
import { SubmitButton } from "../SubmitButton";
import { btn, field } from "../ui";

function Result({ state }: { state: { error?: string; ok?: boolean } | undefined }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
        {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        Opgeslagen.
      </p>
    );
  return null;
}

export function CompanyForm({ values }: { values: { company_name: string; phone: string; email: string } }) {
  return (
    <ActionForm action={saveCompany} className="grid gap-4 sm:grid-cols-2">
      {({ state, pending }) => (
        <>
      <div className="sm:col-span-2">
        <label htmlFor="company_name" className="mb-1.5 block text-sm font-medium">
          Bedrijfsnaam
        </label>
        <input id="company_name" name="company_name" required defaultValue={values.company_name} className={field} />
        <p className="mt-1 text-sm text-muted">Zichtbaar voor klanten in de intake en op de offerte.</p>
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
          Telefoonnummer
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={values.phone} className={field} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          E-mailadres
        </label>
        <input id="email" name="email" type="email" required defaultValue={values.email} className={field} />
      </div>
      <div className="space-y-3 sm:col-span-2">
        <Result state={state} />
        <SubmitButton pending={pending} pendingText="Opslaan…">Opslaan</SubmitButton>
      </div>
</>
      )}
    </ActionForm>
  );
}

export function PricingForm({ values }: { values: Record<string, number> }) {
  return (
    <div>
      <ActionForm action={savePricing} className="space-y-8">
      {({ state, pending }) => (
        <>
        {PRICE_GROUPS.map((g) => (
          <fieldset key={g.title}>
            <legend className="text-base font-semibold">{g.title}</legend>
            {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {g.fields.map((f) => {
                const id = `p-${f.path}`;
                return (
                  <div key={f.path}>
                    <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                      {f.label}
                    </label>
                    <div className="relative">
                      {f.unit === "eur" && (
                        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                          €
                        </span>
                      )}
                      <input
                        id={id}
                        name={f.path}
                        inputMode="decimal"
                        required
                        defaultValue={values[f.path]}
                        aria-describedby={f.hint ? `${id}-h` : undefined}
                        className={`${field} tabular ${f.unit === "eur" ? "pl-7" : "pr-8"}`}
                      />
                      {f.unit === "pct" && (
                        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                          %
                        </span>
                      )}
                    </div>
                    {f.hint && (
                      <p id={`${id}-h`} className="mt-1 text-xs text-muted">
                        {f.hint}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div className="space-y-3">
          <Result state={state} />
          <SubmitButton pending={pending} pendingText="Opslaan…">Prijsregels opslaan</SubmitButton>
        </div>
</>
      )}
    </ActionForm>

      <form action={resetPricing} className="mt-4">
        <button type="submit" className={btn.danger}>
          Terugzetten naar standaard
        </button>
      </form>
    </div>
  );
}
