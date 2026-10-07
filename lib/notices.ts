/** Bevestigingen na een actie. De URL bevat alleen een code, nooit vrije tekst. */
export const NOTICES: Record<string, string> = {
  behandeling: "Aanvraag in behandeling genomen.",
  klaar: "Dossier is klaar voor het bezoek. Plan nu het bezoek in.",
  ingepland: "Bezoek ingepland. De technieker ziet het direct in zijn overzicht.",
  concept: "Conceptofferte gegenereerd. Controleer de regels hieronder.",
  controle: "Offerte staat klaar ter controle.",
  verstuurd: "Offerte verstuurd. De klant kan online akkoord geven via de offertelink.",
  akkoord: "Offerte akkoord. Plan de installatie in.",
  afgewezen: "Offerte afgewezen. De aanvraag is afgesloten.",
  reset: "Prijsregels teruggezet naar de standaardwaarden.",
};
