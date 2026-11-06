import { FAQS, SITE_NAME, SITE_URL } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        description: "Free answer engine optimization checker and consultation studio.",
        sameAs: ["https://schema.org/Organization"],
        foundingDate: "2026",
        email: "hello@aeochecker.local",
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: "Check whether AI assistants can crawl and mention your brand.",
        inLanguage: "en",
        publisher: { "@type": "Organization", name: SITE_NAME },
      },
      {
        "@type": "WebPage",
        name: "Free AEO Checker",
        url: `${SITE_URL}/aeo-checker`,
        datePublished: "2026-03-12",
        dateModified: "2026-11-06",
        author: { "@type": "Organization", name: `${SITE_NAME} editorial team` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
