"use client";

import type { FormState } from "@/app/actions";
import { TECH_KEYS, TECH_OPTIONS } from "@/lib/dossier";
import { UNKNOWN, type TechCheck } from "@/lib/types";
import { ActionForm } from "../ActionForm";
import { SubmitButton } from "../SubmitButton";
import { field } from "../ui";

export function TechForm({
  action,
  check,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  check: TechCheck;
}) {
  return (
    <ActionForm action={action} className="space-y-6">
      {({ state, pending }) => (
        <>
      {TECH_KEYS.map((key) => {
        const def = TECH_OPTIONS[key];
        const current = check[key].value;
        return (
          <fieldset key={key}>
            <legend className="mb-2 text-base font-semibold">{def.label}</legend>
            <div className="flex flex-wrap gap-2">
              {def.options.map((o) => (
                <label key={o.id} className="relative">
                  <input
                    type="radio"
                    name={key}
                    value={o.id}
                    defaultChecked={current === o.id}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-4 font-medium transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
                    {o.label}
                  </span>
                </label>
              ))}
              <label className="relative">
                <input type="radio" name={key} value={UNKNOWN} defaultChecked={current === UNKNOWN} className="peer sr-only" />
                <span className="flex min-h-12 items-center rounded-xl border border-dashed border-slate-300 px-4 text-muted peer-checked:border-slate-500 peer-checked:bg-slate-100 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
                  Nog onbekend
                </span>
              </label>
            </div>
          </fieldset>
        );
      })}

      <div>
        <label htmlFor="photos" className="mb-1.5 block text-base font-semibold">
          Foto&apos;s toevoegen
        </label>
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          multiple
          className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:font-medium file:text-brand-strong`}
        />
        <p className="mt-1 text-sm text-muted">Maximaal 6 foto&apos;s, JPG/PNG/WebP, tot 5 MB per foto.</p>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-base font-semibold">
          Notities
        </label>
        <textarea id="notes" name="notes" rows={4} defaultValue={check.notes} className={field} />
      </div>

      {state?.error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <p>{state.error}</p>
          {state.error.includes("nog niet ingevuld") && (
            <label className="mt-2 flex items-center gap-2 font-medium">
              <input type="checkbox" name="confirm_incomplete" className="h-5 w-5" />
              Rond toch af, de rest blijft onbekend
            </label>
          )}
        </div>
      )}

      <SubmitButton pending={pending} pendingText="Afronden…" className="w-full">
        Bezoek afronden
      </SubmitButton>
    </>
      )}
    </ActionForm>
  );
}
