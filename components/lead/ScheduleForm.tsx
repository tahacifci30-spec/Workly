"use client";

import type { FormState } from "@/app/actions";
import { ActionForm } from "../ActionForm";
import { SubmitButton } from "../SubmitButton";
import { field } from "../ui";

export function ScheduleForm({
  action,
  technicians,
  defaults,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  technicians: string[];
  defaults?: { date: string; time: string; technician: string };
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-3">
      {({ state, pending }) => (
        <>
      <div>
        <label htmlFor="date" className="mb-1.5 block text-sm font-medium">
          Datum
        </label>
        <input id="date" name="date" type="date" min={today} required defaultValue={defaults?.date} className={field} />
      </div>
      <div>
        <label htmlFor="time" className="mb-1.5 block text-sm font-medium">
          Tijd
        </label>
        <input id="time" name="time" type="time" required defaultValue={defaults?.time ?? "09:00"} className={field} />
      </div>
      <div>
        <label htmlFor="technician" className="mb-1.5 block text-sm font-medium">
          Technieker
        </label>
        <select id="technician" name="technician" required defaultValue={defaults?.technician} className={field}>
          {technicians.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-3">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-3">
        <SubmitButton pending={pending} pendingText="Inplannen…">{defaults ? "Bezoek verplaatsen" : "Bezoek inplannen"}</SubmitButton>
      </div>
    </>
      )}
    </ActionForm>
  );
}
