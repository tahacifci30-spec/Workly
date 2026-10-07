import Link from "next/link";
import { DemoForm } from "@/components/marketing/DemoForm";
import { MobileMenu } from "@/components/marketing/MobileMenu";
import { RoiCalculator } from "@/components/marketing/RoiCalculator";
import { Logo, btn } from "@/components/ui";

const DEMO = "#demo";

const problems = [
  ["Informatie ontbreekt", "Elke aanvraag mist iets: afmetingen, woningtype, foto’s. Medewerkers bellen of appen terug."],
  ["Heen-en-weer", "Een telefoontje voor de ruimte, een mail voor de foto’s, een bericht voor het adres. Dagen verstrijken."],
  ["Offerte kost uren", "Na het bezoek wordt de offerte opnieuw uitgezocht, in plaats van gecontroleerd."],
];

const steps = [
  ["1", "Klant doorloopt de intake", "5 vragen met keuzeknoppen. Geen vrije tekst, wel direct een richtlijnprijs."],
  ["2", "U krijgt een bezoekklaar dossier", "Wat bekend is, wat nog onbekend is en wat uw technieker moet controleren."],
  ["3", "Technieker vult aan op locatie", "Checklist, foto’s en notities. Onbekende punten worden gecontroleerd."],
  ["4", "U controleert de conceptofferte", "Regels staan klaar. U past aan, keurt goed en verstuurt."],
];

const faq = [
  ["Is Werkly een CRM?", "Nee. Werkly volgt één route: aanvraag, richtlijn, bezoek, technische controle, offerte. Alles in het product dient die route."],
  ["Wie bepaalt de prijzen?", "U. De richtlijnprijs komt uit prijsregels die u zelf instelt. Er wordt geen prijs verzonnen."],
  ["Wat als een klant iets niet weet?", "Bij elke vraag staat ‘Weet ik niet’. De aanvraag blijft bruikbaar en het punt komt op de controlelijst van de technieker."],
  ["Gaat er een offerte de deur uit zonder mij?", "Nooit. U controleert en keurt elke offerte goed voordat die wordt verstuurd."],
  ["Kan ik de intake op mijn eigen website zetten?", "Dat staat op de planning, samen met uw eigen logo en kleuren."],
  ["Voor wie is het bedoeld?", "Installatie- en servicebedrijven. We beginnen bij airco- en klimaatinstallateurs; de werkstroom is niet aan één sector gebonden."],
];

export default function MarketingPage() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Naar hoofdinhoud
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-6 whitespace-nowrap text-sm font-medium text-muted lg:flex">
            <a href="#hoe-het-werkt" className="hover:text-foreground">Hoe het werkt</a>
            <a href="#dashboard" className="hover:text-foreground">Dashboard</a>
            <a href="#besparing" className="hover:text-foreground">Besparing</a>
            <a href="#prijzen" className="hover:text-foreground">Prijzen</a>
            <a href="#faq" className="hover:text-foreground">Veelgestelde vragen</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-muted hover:text-foreground sm:inline">
              Inloggen
            </Link>
            <a href={DEMO} className={`${btn.primary} hidden sm:inline-flex`}>Plan een demo</a>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="text-sm font-semibold text-brand">Voor installatie- en servicebedrijven</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Van aanvraag naar bezoekklaar dossier.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted">
                Werkly verzamelt de juiste informatie, bereidt aanvragen voor en helpt installatiebedrijven sneller van
                aanvraag naar offerte te gaan.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={DEMO} className={btn.primary}>Plan een demo</a>
                <Link href="/intake" className={btn.secondary}>Bekijk de klant-intake</Link>
              </div>
              <p className="mt-4 text-sm text-muted">Minder administratie. Betere aanvragen. Sneller naar een bezoek.</p>
            </div>
            <IntakeMock />
          </div>
        </section>

        {/* Probleem */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
            Elke aanvraag kost nu te veel losse telefoontjes.
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {problems.map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-2 text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Hoe het werkt */}
        <section id="hoe-het-werkt" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
              Eén route, van klant tot offerte.
            </h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(([n, t, d]) => (
                <li key={n} className="rounded-2xl bg-background p-6">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-semibold text-white">{n}</span>
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-muted">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Vergelijking */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">Geen CRM. Geen losse offertetool.</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Veel software begint bij de offerte. Werkly begint eerder: bij de aanvraag die nog niet compleet is.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">Vergelijking tussen Werkly, een algemeen CRM en offertesoftware</caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">&nbsp;</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-strong">Werkly</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Algemeen CRM</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Offertesoftware</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  ["Klant vult gerichte intake in", "Ja, met richtprijs", "Zelf formulier bouwen", "Nee"],
                  ["Onbekende gegevens blijven zichtbaar", "Ja, per veld", "Nee", "Nee"],
                  ["Technieker-checklist op locatie", "Ja", "Maatwerk", "Soms"],
                  ["Conceptofferte uit bezoekdata", "Ja", "Nee", "Handmatig"],
                  ["Klant geeft online akkoord", "Ja", "Soms", "Ja"],
                ].map(([a, b, c, d]) => (
                  <tr key={a}>
                    <th scope="row" className="px-4 py-3 font-medium">{a}</th>
                    <td className="px-4 py-3 font-medium text-emerald-800">{b}</td>
                    <td className="px-4 py-3 text-muted">{c}</td>
                    <td className="px-4 py-3 text-muted">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Customer intake */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand">Customer intake</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Geen chatbot. Een offertecalculator.</h2>
            <p className="mt-4 text-muted">
              Klanten kiezen uit vaste antwoorden en zien na vijf vragen een richtlijnprijs. Bij elke vraag is er een
              ‘Weet ik niet’, zodat niemand vastloopt. De prijs komt uit uw eigen regels, niet uit een taalmodel.
            </p>
            <Link href="/intake" className={`${btn.secondary} mt-6`}>Probeer het zelf</Link>
          </div>
          <ul className="grid gap-3 text-sm">
            {["Vaste antwoordopties, niets typen", "Slimme routing: geen dubbele vragen", "Onbekend wordt ‘controleren tijdens bezoek’", "Richtlijnprijs op basis van uw prijsregels"].map((t) => (
              <li key={t} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 font-medium">
                <Check /> {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Dashboard */}
        <section id="dashboard" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
            <DashboardMock />
            <div>
              <p className="text-sm font-semibold text-brand">Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Wat moet ik vandaag doen?</h2>
              <p className="mt-4 text-muted">
                Bij binnenkomst ziet u welke bezoeken u moet plannen, welke offertes wachten op controle en welke
                aanvragen nieuw zijn. Elke aanvraag heeft een duidelijke volgende actie.
              </p>
            </div>
          </div>
        </section>

        {/* Technieker + offerte */}
        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm font-semibold text-brand">Technieker</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ziet direct wat te controleren.</h2>
            <p className="mt-3 text-muted">
              Een eenvoudig bezoekoverzicht met klant, aanvraag en checklist. Foto’s en notities gaan na afronding
              terug naar het dossier. Per gegeven blijft zichtbaar of het van de klant komt, geschat is of gecontroleerd.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm font-semibold text-brand">Offerteworkflow</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">U controleert, het systeem bereidt voor.</h2>
            <p className="mt-3 text-muted">
              Zodra de technische gegevens compleet zijn staat er een conceptofferte klaar. U past aan, keurt goed en
              verstuurt. Er gaat nooit een offerte de deur uit zonder uw controle.
            </p>
          </div>
        </section>

        {/* Besparing */}
        <section id="besparing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">Wat levert minder heen-en-weer op?</h2>
          <p className="mt-3 max-w-2xl text-muted">Vul uw eigen cijfers in. Er wordt niets opgeslagen.</p>
          <div className="mt-8">
            <RoiCalculator />
          </div>
        </section>

        {/* Integraties */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold tracking-tight">Integraties</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Eerst de kern goed. Daarna sluiten we aan op de tools die u al gebruikt.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
              {["Google Agenda", "E-mail", "WhatsApp", "Boekhouding", "Eigen website (widget)"].map((t) => (
                <li key={t} className="rounded-full border border-line bg-background px-4 py-2">
                  {t} <span className="text-muted">· binnenkort</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section id="prijzen" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Prijzen</h2>
          <p className="mt-3 text-muted">Maandelijks opzegbaar. Prijzen excl. btw.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Starter", "€149", "per maand", ["1 gebruiker", "Klant-intake en richtlijnprijs", "Dashboard en dossiers"]],
              ["Team", "€299", "per maand", ["Tot 5 gebruikers", "Technieker-omgeving", "Offerteworkflow"]],
              ["Op maat", "Neem contact op", "", ["Eigen branding", "Integraties", "Persoonlijke begeleiding"]],
            ].map(([name, price, per, feats], i) => (
              <div key={name as string} className={`rounded-2xl border bg-white p-6 ${i === 1 ? "border-brand ring-1 ring-brand" : "border-line"}`}>
                <h3 className="font-semibold">{name as string}</h3>
                <p className="tabular mt-3 text-3xl font-semibold">{price as string}</p>
                <p className="text-sm text-muted">{per as string}&nbsp;</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {(feats as string[]).map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check /> {f}</li>
                  ))}
                </ul>
                <a href={DEMO} className={`${i === 1 ? btn.primary : btn.secondary} mt-6 w-full`}>Plan een demo</a>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-3xl font-semibold tracking-tight">Veelgestelde vragen</h2>
            <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
              {faq.map(([q, a]) => (
                <details key={q} className="group px-5 py-4">
                  <summary className="flex min-h-8 items-center justify-between gap-4 font-medium marker:content-none">
                    {q}
                    <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + demo */}
        <section id="demo" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <div className="grid items-center gap-8 rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Zie hoe een aanvraag bezoekklaar wordt.</h2>
              <p className="mt-3 text-slate-300">
                In een demo van 20 minuten lopen we de route door met uw eigen type aanvragen. Vrijblijvend.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                <li>Klant-intake met richtprijs op uw tarieven</li>
                <li>Dossier, technieker-checklist en conceptofferte</li>
                <li>Antwoord op uw vragen over invoeren en migreren</li>
              </ul>
              <Link href="/intake" className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800">
                Bekijk eerst de klant-intake
              </Link>
            </div>
            <DemoForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
          <Logo />
          <span>© {new Date().getFullYear()} Werkly</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/login" className="hover:text-foreground">Inloggen</Link>
          </span>
        </div>
      </footer>
    </>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

function IntakeMock() {
  return (
    <div aria-hidden="true" className="rounded-2xl border border-line bg-background p-6 shadow-lg">
      <div className="flex justify-between text-xs font-medium text-muted"><span>← Terug</span><span>Vraag 2 van 5</span></div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full w-2/5 rounded-full bg-brand" /></div>
      <p className="mt-5 text-xl font-semibold">Hoe groot is de ruimte ongeveer?</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold">
        {["< 20 m²", "20 – 30 m²", "30 – 40 m²", "> 40 m²"].map((o, i) => (
          <div key={o} className={`rounded-xl border px-4 py-3 ${i === 1 ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>{o}</div>
        ))}
        <div className="col-span-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-muted">Weet ik niet</div>
      </div>
    </div>
  );
}

function DashboardMock() {
  const rows = [
    ["Jan de Vries", "Nieuw", "€2.300 – €3.100", "Aanvraag controleren"],
    ["Pieter Jansen", "Bezoek gepland", "€2.700 – €3.400", "Wacht op controle"],
    ["Mark van Dijk", "Offerte ter controle", "€5.900 – €7.600", "Offerte controleren"],
  ];
  return (
    <div aria-hidden="true" className="rounded-2xl border border-line bg-background p-5 shadow-lg">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["2", "bezoeken plannen"], ["1", "bezoek afronden"], ["3", "offertes controleren"]].map(([n, l]) => (
          <div key={l} className="rounded-xl bg-white p-3"><div className="text-2xl font-semibold text-brand">{n}</div><div className="text-xs text-muted">{l}</div></div>
        ))}
      </div>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl bg-white text-sm">
        {rows.map(([n, s, p, a]) => (
          <li key={n} className="grid grid-cols-2 gap-1 px-4 py-3">
            <span className="font-semibold">{n}</span><span className="text-right text-muted">{s}</span>
            <span className="tabular text-muted">{p}</span><span className="text-right font-medium text-brand-strong">{a} →</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
