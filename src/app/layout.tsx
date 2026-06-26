import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["500", "600", "700"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NID | Muebles a medida",
    template: "%s | NID"
  },
  description: "Diseño, fabricación y montaje de mobiliario a medida para hogares, oficinas y espacios comerciales.",
  openGraph: {
    title: "NID | Diseño que nace de tu espacio",
    description: "Muebles pensados para tu forma de vivir.",
    url: siteUrl,
    siteName: "NID",
    locale: "es_AR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "NID | Muebles a medida",
    description: "Diseño, fabricación y montaje de mobiliario a medida."
  },
  alternates: {
    canonical: siteUrl
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "NID",
    description: "Diseño, fabricación y montaje de mobiliario a medida.",
    url: siteUrl,
    areaServed: "Argentina"
  };

  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloatingButton />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
