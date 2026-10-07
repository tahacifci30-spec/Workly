"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  isComplete,
  nextQuestion,
  optionLabel,
} from "@/lib/intake/questions";
import { estimatePrice, formatRange } from "@/lib/pricing/engine";
import type { PricingRules } from "@/lib/pricing/rules";
import { UNKNOWN } from "@/lib/types";
import { btn, field } from "../ui";

type Errors = Partial<
  Record<"name" | "email" | "phone" | "postcode" | "street" | "city" | "consent" | "photos", string>
>;

const STORAGE_KEY = "werkly.intake.v1";

export function IntakeFlow({
  companyName,
  phone,
  rules,
}: {
  companyName: string;
  phone: string;
  rules: PricingRules;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const restored = useRef(false);

  const question = nextQuestion(answers);
  const complete = isComplete(answers);
  const step = Math.min(order.length + 1, TOTAL_QUESTIONS);
  const estimate = complete ? estimatePrice(answers, rules) : null;
  const hasUnknown = Object.values(answers).includes(UNKNOWN);

  // Hervat een onderbroken intake (alleen in deze browser, alleen antwoorden, geen contactgegevens).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
        if (saved?.order?.length) {
          setAnswers(saved.answers);
          setOrder(saved.order);
          setStarted(true);
        }
      } catch {}
      restored.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      if (done || order.length === 0) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, order }));
    } catch {}
  }, [answers, order, done]);

  useEffect(() => {
    if (started) heading.current?.focus();
  }, [order.length, started, complete, done]);

  function choose(qid: string, optionId: string) {
    setAnswers((a) => ({ ...a, [qid]: optionId }));
    setOrder((o) => [...o, qid]);
  }

  function back() {
    const last = order[order.length - 1];
    if (!last) return setStarted(false);
    setAnswers((a) => Object.fromEntries(Object.entries(a).filter(([k]) => k !== last)));
    setOrder((o) => o.slice(0, -1));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setFormError("");
    setErrors({});

    const body = new FormData();
    body.set(
      "payload",
      JSON.stringify({
        answers,
        website: form.get("website"),
        consent: form.get("consent") === "on",
        customer: Object.fromEntries(
          ["name", "email", "phone", "postcode", "street", "city"].map((k) => [k, form.get(k)]),
        ),
      }),
    );
    for (const f of form.getAll("photos")) if (f instanceof File && f.size > 0) body.append("photos", f);

    try {
      const res = await fetch("/api/intake", { method: "POST", body });
      const data = await res.json();
      if (res.status === 422) {
        setErrors(data.errors ?? {});
        requestAnimationFrame(() =>
          (document.querySelector("[aria-invalid=true]") as HTMLElement | null)?.focus(),
        );
      } else if (!res.ok) setFormError(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
      else setDone(true);
    } catch {
      setFormError("Geen verbinding. Controleer uw internet en probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Start ---------- */
  if (!started) {
    return (
      <div className="rise text-center">
        <p className="text-sm font-medium text-brand">{companyName}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Airco nodig?</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Beantwoord {TOTAL_QUESTIONS} korte vragen. U ziet daarna direct een richtlijnprijs. U hoeft
          niets te typen.
        </p>
        <button type="button" onClick={() => setStarted(true)} className={`${btn.primary} mt-8 px-8`}>
          Start
        </button>
        <ul className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted">
          <li>Duurt ongeveer een minuut</li>
          <li>Vrijblijvend</li>
          <li>Geen account nodig</li>
        </ul>
      </div>
    );
  }

  /* ---------- Bevestiging ---------- */
  if (done) {
    return (
      <div className="rise text-center" role="status">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12 5 5 9-10" />
          </svg>
        </div>
        <h1 ref={heading} tabIndex={-1} className="mt-5 text-2xl font-semibold outline-none">
          Aanvraag ontvangen
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          {companyName} neemt contact met u op om een bezoek in te plannen. Uw richtlijn:{" "}
          <strong className="tabular text-foreground">{estimate && formatRange(estimate)}</strong>.
        </p>
        <NextSteps />
        <p className="mt-6 text-sm text-muted">
          Vragen? Bel {companyName} op{" "}
          <a className="font-medium text-brand underline" href={`tel:${phone.replace(/\s/g, "")}`}>
            {phone}
          </a>
          .
        </p>
      </div>
    );
  }

  /* ---------- Resultaat + contact ---------- */
  if (complete && estimate) {
    return (
      <div className="rise">
        <button type="button" onClick={back} className="mb-4 text-sm font-medium text-muted hover:text-foreground">
          ← Antwoord aanpassen
        </button>
        <div className="rounded-2xl bg-brand-soft p-6 text-center">
          <p className="text-sm font-medium text-brand-strong">Uw richtlijn</p>
          <h1 ref={heading} tabIndex={-1} className="tabular mt-1 text-4xl font-semibold tracking-tight outline-none">
            {formatRange(estimate)}
          </h1>
          <p className="mt-2 text-sm text-slate-700">Op basis van uw antwoorden, inclusief montage en btw.</p>
          {hasUnknown && (
            <p className="mt-3 text-sm text-slate-700">
              Geen probleem dat u niet alles wist. We controleren dit tijdens het bezoek.
            </p>
          )}
          <p className="mt-3 text-xs text-slate-700">
            Een definitieve offerte volgt na een technische controle op locatie.
          </p>
        </div>

        <details className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          <summary className="font-medium">Uw antwoorden</summary>
          <dl className="mt-3 space-y-1.5">
            {order.map((q) => (
              <div key={q} className="flex justify-between gap-4">
                <dt className="text-muted">{QUESTIONS[q].title.replace(/\?$/, "")}</dt>
                <dd className="text-right font-medium">{optionLabel(q, answers[q])}</dd>
              </div>
            ))}
          </dl>
        </details>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Waar mogen we de aanvraag naartoe sturen?</h2>
          <Field label="Naam" name="name" autoComplete="name" error={errors.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-mailadres" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
            <Field label="Telefoonnummer" name="phone" type="tel" autoComplete="tel" inputMode="tel" error={errors.phone} />
          </div>
          <Field label="Straat en huisnummer" name="street" autoComplete="street-address" placeholder="Kerkstraat 12" error={errors.street} help="Zodat de technieker weet waar hij moet zijn." />
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Field label="Postcode" name="postcode" autoComplete="postal-code" placeholder="5141 AB" error={errors.postcode} />
            <Field label="Woonplaats" name="city" autoComplete="address-level2" error={errors.city} />
          </div>

          <div>
            <label htmlFor="photos" className="mb-1.5 block text-sm font-medium">
              Foto van de plek <span className="font-normal text-muted">(optioneel)</span>
            </label>
            <input
              id="photos"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
              aria-describedby="photos-help"
              className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:font-medium file:text-brand-strong`}
            />
            <p id="photos-help" className="mt-1 text-sm text-muted">
              Waar komt de airco en waar zou de buitenunit kunnen? Dat scheelt een telefoontje.
              {photoCount > 0 && ` ${photoCount} foto('s) gekozen.`}
            </p>
            {errors.photos && <p className="mt-1 text-sm text-red-700">{errors.photos}</p>}
          </div>

          {/* Honeypot */}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

          <div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="consent"
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? "consent-err" : undefined}
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <span>
                Ik geef {companyName} toestemming mijn gegevens te gebruiken om mijn aanvraag te
                beoordelen en contact met mij op te nemen. Lees de{" "}
                <Link href="/privacy" target="_blank" className="font-medium text-brand underline">
                  privacyverklaring
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <p id="consent-err" className="mt-1 text-sm text-red-700">
                {errors.consent}
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {formError}
            </p>
          )}
          <button type="submit" disabled={busy} aria-busy={busy} className={`${btn.primary} w-full`}>
            {busy ? "Versturen…" : "Aanvraag versturen"}
          </button>
          <NextSteps compact />
        </form>
      </div>
    );
  }

  /* ---------- Vraag ---------- */
  const q = question ?? QUESTIONS.spaces;
  return (
    <div key={q.id} className="rise">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={back} className="font-medium text-muted hover:text-foreground">
            ← Terug
          </button>
          <span className="font-medium text-muted" aria-live="polite">
            Vraag {step} van {TOTAL_QUESTIONS}
          </span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_QUESTIONS}
          aria-valuenow={step}
          aria-label="Voortgang intake"
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(step / TOTAL_QUESTIONS) * 100}%` }} />
        </div>
      </div>

      <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none sm:text-3xl">
        {q.title}
      </h1>
      {q.help && <p className="mt-2 text-muted">{q.help}</p>}

      <div role="group" aria-label={q.title} className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((o) => {
          const unknown = o.id === UNKNOWN;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => choose(q.id, o.id)}
              className={`min-h-16 rounded-xl border px-4 py-3 text-left transition-colors hover:border-brand hover:bg-brand-soft ${
                unknown ? "border-dashed border-slate-300 bg-transparent text-muted sm:col-span-2" : "border-line bg-surface shadow-sm"
              }`}
            >
              <span className="block font-semibold">{o.label}</span>
              {o.hint && <span className="block text-sm text-muted">{o.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NextSteps({ compact = false }: { compact?: boolean }) {
  const steps = ["Wij bekijken uw aanvraag", "We plannen een kort bezoek bij u thuis", "U ontvangt een offerte op maat"];
  return (
    <ol className={`${compact ? "mt-2 text-left" : "mx-auto mt-6 max-w-sm text-left"} space-y-2 text-sm`}>
      {!compact && <li className="list-none font-semibold">Hoe gaat het verder?</li>}
      {compact && <li className="list-none font-medium text-muted">Hoe gaat het verder?</li>}
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong">
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}

function Field({
  label,
  name,
  error,
  help,
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
  help?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : help ? `${id}-help` : undefined}
        className={`${field} ${error ? "border-red-500" : ""}`}
        {...rest}
      />
      {help && !error && (
        <p id={`${id}-help`} className="mt-1 text-sm text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
