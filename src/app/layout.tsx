import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { PreferencesProvider } from "@/components/preferences";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
import "./theme.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightwisdom.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "KnightWisdom Tools — Fast, Free Online Tools", template: "%s | KnightWisdom Tools" },
  description: "Fast, free, privacy-friendly online text and developer tools.",
  openGraph: { type: "website", siteName: "KnightWisdom Tools", title: "KnightWisdom Tools", description: "Fast, free, privacy-friendly online tools." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  return <html lang="en"><body className={geist.variable}><PreferencesProvider>
    {adsenseClientId ? <Script async strategy="afterInteractive" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`} crossOrigin="anonymous" /> : null}
    <Suspense fallback={<header className="site-header"><Link className="brand" href="/"><span>✦</span> KnightWisdom</Link></header>}><SiteHeader /></Suspense>
    {children}
    <SiteFooter />
  </PreferencesProvider></body></html>;
}
