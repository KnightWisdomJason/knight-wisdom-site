import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Knight Wisdom | Smart tools for better work",
    template: "%s | Knight Wisdom",
  },
  description:
    "Free, privacy-minded tools and practical guides for work, business, and everyday life.",
  keywords: ["online tools", "business tools", "productivity", "Knight Wisdom"],
  metadataBase: new URL("https://knightwisdom.com"),
  openGraph: {
    title: "Knight Wisdom | Smart tools for better work",
    description: "Useful online tools and practical guides, built for focused work.",
    url: "https://knightwisdom.com",
    siteName: "Knight Wisdom",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
