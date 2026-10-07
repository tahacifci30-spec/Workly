# Werkly

Van aanvraag naar bezoekklaar dossier: klant-intake, richtlijnprijs, dossier, technische controle, conceptofferte.

```bash
npm run dev
```

| Route | Wat |
|---|---|
| `/` | Marketingwebsite |
| `/intake` | Klant-intake (5 vragen, richtlijnprijs) |
| `/login` | Inloggen (demo-accounts staan op de pagina, alleen in development) |
| `/dashboard`, `/dashboard/[id]` | Installateur: acties, KPI's, zoeken en filteren, dossier met tabs, notities |
| `/dashboard/settings` | Bedrijfsgegevens, prijsregels, intake-link en insluitcode |
| `/dashboard/export` | CSV-export van alle aanvragen |
| `/offerte/[token]` | Publieke offertelink: klant bekijkt en geeft online akkoord |
| `/privacy` | Privacyverklaring (sjabloon, laat juridisch controleren) |
| `/technician`, `/technician/[id]` | Technieker: bezoeken en checklist |

## Structuur

- `lib/intake/questions.ts`: vragen en routing (vaste opties, `nextQuestion`)
- `lib/pricing/`: `rules.ts` (aanpasbare prijsregels) en `engine.ts` (deterministische berekening, conceptofferte)
- `lib/workflow.ts`: statussen en volgende actie
- `lib/store.ts`: **enige** opslaglaag (nu `data/db.json`, wordt bij de eerste start gevuld met demo-data)
- `lib/auth.ts`: sessie (nu ondertekende cookie met demo-gebruikers)
- `app/actions.ts`: server actions voor alle statuswijzigingen
- `components/ActionForm.tsx`: formulier dat invoer behoudt bij een fout (React 19 wist `<form action>` anders)
- `lib/metrics.ts`: KPI's (volledigheid, doorlooptijd, conversie)
- `supabase/migrations/0001_init.sql`: voorgesteld schema met RLS (nog niet uitgevoerd)

## Supabase aanzetten

1. Plak `supabase/migrations/0001_init.sql` in Supabase > SQL Editor en voer uit. Stap 1 zet RLS aan op `public.leads` (daar stond alles publiek leesbaar).
2. Zet in `.env.local` (nooit committen, geen `NEXT_PUBLIC_`-prefix):
   `SUPABASE_SERVICE_ROLE_KEY=...` (Project Settings > API > service_role)
   en een eigen `AUTH_SECRET=...` (lange willekeurige tekst).
3. Herstart `npm run dev`. De app gebruikt Supabase zodra de sleutel is ingesteld, anders het JSON-bestand (`lib/store.ts`).

Nog niet in Supabase: foto's (lokale schijf, nodig: Storage) en inloggen (cookie met demo-gebruikers; tabel `profiles` en policies zijn voorbereid voor Supabase Auth).
