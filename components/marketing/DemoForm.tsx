"use client";

import { requestDemo } from "@/app/actions";
import { ActionForm } from "../ActionForm";
import { SubmitButton } from "../SubmitButton";
import { field } from "../ui";

export function DemoForm() {
  return (
    <ActionForm action={requestDemo} className="space-y-4 rounded-2xl bg-white p-6 text-left text-slate-900">
      {({ state, pending }) =>
        state?.ok ? (
          <div role="status">
            <h3 className="text-lg font-semibold">Bedankt, we nemen contact met u op.</h3>
            <p className="mt-2 text-sm text-slate-700">
              U hoort binnen één werkdag van ons om een moment voor de demo te kiezen.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="d-name" className="mb-1.5 block text-sm font-medium">Naam</label>
              <input id="d-name" name="name" required autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="d-company" className="mb-1.5 block text-sm font-medium">Bedrijf</label>
              <input id="d-company" name="company" required autoComplete="organization" className={field} />
            </div>
            <div>
              <label htmlFor="d-email" className="mb-1.5 block text-sm font-medium">Zakelijk e-mailadres</label>
              <input id="d-email" name="email" type="email" required autoComplete="email" className={field} />
            </div>
            <div>
              <label htmlFor="d-size" className="mb-1.5 block text-sm font-medium">Aantal aanvragen per maand</label>
              <select id="d-size" name="size" className={field} defaultValue="10-30">
                <option value="<10">Minder dan 10</option>
                <option value="10-30">10 – 30</option>
                <option value="30-100">30 – 100</option>
                <option value=">100">Meer dan 100</option>
              </select>
            </div>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Ik geef toestemming om contact met mij op te nemen over een demo. Zie de{" "}
                <a href="/privacy" className="font-medium text-brand underline">privacyverklaring</a>.
              </span>
            </label>
            {state?.error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {state.error}
              </p>
            )}
            <SubmitButton pending={pending} pendingText="Versturen…" className="w-full">
              Plan een demo
            </SubmitButton>
          </>
        )
      }
    </ActionForm>
  );
}
