"use client";

import { useState } from "react";
import { formatEur } from "@/lib/pricing/engine";
import { field } from "../ui";

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
  min,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix: string;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          className={`${field} tabular pr-20`}
        />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function RoiCalculator() {
  const [requests, setRequests] = useState(40);
  const [minutes, setMinutes] = useState(45);
  const [rate, setRate] = useState(55);
  const [saving, setSaving] = useState(50);

  const hoursPerMonth = (requests * minutes * (saving / 100)) / 60;
  const perYear = hoursPerMonth * 12 * rate;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2">
        <NumberField id="roi-req" label="Aanvragen per maand" value={requests} onChange={setRequests} suffix="aanvragen" min={1} max={1000} />
        <NumberField id="roi-min" label="Administratietijd per aanvraag" value={minutes} onChange={setMinutes} suffix="minuten" min={5} max={240} />
        <NumberField id="roi-rate" label="Interne kosten per uur" value={rate} onChange={setRate} suffix="euro/uur" min={10} max={250} />
        <NumberField id="roi-save" label="Verwachte tijdwinst" value={saving} onChange={setSaving} suffix="procent" min={5} max={90} />
        <p className="text-xs text-muted sm:col-span-2">
          Administratietijd = informatie nabellen, foto’s opvragen, dossier uitzoeken en offerte opstellen. De tijdwinst is
          uw eigen schatting en geen garantie.
        </p>
      </form>
      <div className="rounded-2xl bg-slate-900 p-6 text-white" role="status" aria-live="polite">
        <p className="text-sm text-slate-300">Geschatte besparing</p>
        <p className="tabular mt-1 text-4xl font-semibold">{formatEur(perYear)}</p>
        <p className="text-sm text-slate-300">per jaar</p>
        <p className="mt-5 border-t border-slate-700 pt-4 text-sm text-slate-200">
          Dat is ongeveer{" "}
          <strong className="tabular text-white">{hoursPerMonth.toFixed(1).replace(".", ",")} uur per maand</strong> die u
          kunt besteden aan bezoeken en offertes in plaats van administratie.
        </p>
      </div>
    </div>
  );
}
