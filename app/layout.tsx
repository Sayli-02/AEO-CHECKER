import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Free AEO Checker: Is Your Site Ready for ChatGPT and Gemini?",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Paste a URL for a 0 to 100 AEO readiness score, a Gemini visibility check, and a prioritized fix list. Free, no account.",
  authors: [{ name: "AEO Checker editorial team" }],
  openGraph: {
    title: "Free AEO Checker: Is Your Site Ready for ChatGPT and Gemini?",
    description:
      "Paste a URL for a 0 to 100 AEO readiness score, a Gemini visibility check, and a prioritized fix list.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-text">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
