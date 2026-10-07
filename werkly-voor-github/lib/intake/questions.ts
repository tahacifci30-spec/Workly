import { UNKNOWN } from "../types";

export type Option = { id: string; label: string; hint?: string };

export type Question = {
  id: string;
  title: string;
  help?: string;
  options: Option[];
};

const dontKnow: Option = { id: UNKNOWN, label: "Weet ik niet" };

export const QUESTIONS: Record<string, Question> = {
  spaces: {
    id: "spaces",
    title: "Waar wilt u een airco?",
    options: [
      { id: "living", label: "Woonkamer" },
      { id: "bedroom", label: "Slaapkamer" },
      { id: "living_bedroom", label: "Woonkamer + slaapkamer" },
      { id: "multiple", label: "Meerdere ruimtes", hint: "3 of meer" },
      dontKnow,
    ],
  },
  area: {
    id: "area",
    title: "Hoe groot is de ruimte ongeveer?",
    help: "Bij meerdere ruimtes: de grootste ruimte.",
    options: [
      { id: "lt20", label: "< 20 m²" },
      { id: "20_30", label: "20 – 30 m²" },
      { id: "30_40", label: "30 – 40 m²" },
      { id: "gt40", label: "> 40 m²" },
      dontKnow,
    ],
  },
  property: {
    id: "property",
    title: "In wat voor woning komt de airco?",
    options: [
      { id: "terraced", label: "Rijtjeswoning" },
      { id: "corner", label: "Hoekwoning / twee-onder-een-kap" },
      { id: "detached", label: "Vrijstaande woning" },
      { id: "apartment", label: "Appartement" },
      dontKnow,
    ],
  },
  purpose: {
    id: "purpose",
    title: "Waarvoor wilt u de airco gebruiken?",
    options: [
      { id: "cooling", label: "Alleen koelen" },
      { id: "both", label: "Koelen en verwarmen" },
      dontKnow,
    ],
  },
  // Alleen bij meerdere ruimtes
  system: {
    id: "system",
    title: "Welke opstelling heeft uw voorkeur?",
    help: "Eén buitenunit voor alle ruimtes, of een eigen unit per ruimte.",
    options: [
      { id: "multisplit", label: "Eén buitenunit", hint: "Multisplit" },
      { id: "separate", label: "Eigen unit per ruimte", hint: "Losse single-splits" },
      dontKnow,
    ],
  },
  // Alleen bij één ruimte
  existing: {
    id: "existing",
    title: "Is er al een airco of leidingwerk aanwezig?",
    options: [
      { id: "none", label: "Nee, nieuwe installatie" },
      { id: "replace", label: "Ja, een airco vervangen" },
      { id: "piping", label: "Ja, leidingwerk ligt er al" },
      dontKnow,
    ],
  },
};

export const TOTAL_QUESTIONS = 5;

const MULTI = new Set(["living_bedroom", "multiple"]);

/**
 * Deterministische routing: welke vraag volgt op de huidige antwoorden?
 * De opties staan vast in QUESTIONS; er wordt niets gegenereerd.
 * Geeft null terug wanneer de intake klaar is.
 */
export function nextQuestion(answers: Record<string, string>): Question | null {
  if (!answers.spaces) return QUESTIONS.spaces;
  if (!answers.area) return QUESTIONS.area;
  if (!answers.property) return QUESTIONS.property;
  if (!answers.purpose) return QUESTIONS.purpose;
  if (MULTI.has(answers.spaces)) {
    return answers.system ? null : QUESTIONS.system;
  }
  return answers.existing ? null : QUESTIONS.existing;
}

export function isComplete(answers: Record<string, string>) {
  return nextQuestion(answers) === null;
}

export function optionLabel(questionId: string, optionId: string | undefined) {
  if (!optionId) return "—";
  return (
    QUESTIONS[questionId]?.options.find((o) => o.id === optionId)?.label ??
    optionId
  );
}

/** Alle geldige antwoorden, gebruikt voor server-side validatie. */
export function isValidAnswer(questionId: string, optionId: string) {
  return !!QUESTIONS[questionId]?.options.some((o) => o.id === optionId);
}
