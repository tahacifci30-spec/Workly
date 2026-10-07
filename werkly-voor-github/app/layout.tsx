import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "Werkly",
    locale: "nl_NL",
    type: "website",
    title: "Werkly: van aanvraag naar bezoekklaar dossier",
    description: "Minder administratie. Betere aanvragen. Sneller naar een bezoek.",
  },
  title: {
    default: "Werkly: van aanvraag naar bezoekklaar dossier",
    template: "%s · Werkly",
  },
  description:
    "Werkly verzamelt de juiste informatie, bereidt aanvragen voor en helpt installatiebedrijven sneller van aanvraag naar offerte.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
