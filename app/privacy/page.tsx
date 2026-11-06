import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AEO Checker handles URLs, scores, and consultation messages.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="heading-3">Privacy</h1>
      <p className="body-3 mt-4">
        We fetch the public URL you submit, plus robots.txt, llms.txt, and sitemap.xml at that origin. We store an anonymized hostname and score in server logs so we can see which domains become leads. We do not store full HTML.
      </p>
      <p className="body-3 mt-4">
        Gemini requests include page title, headings, and a text excerpt. They are processed by Google under the Gemini API terms for your API key. Consultation form fields are logged on the server so we can reply. Do not send secrets in the form.
      </p>
      <p className="body-3 mt-4">
        Full AI checks are capped at three per network per hour. Repeat checks of the same URL are served from a 24 hour cache when possible so we do not spend extra model quota.
      </p>
    </article>
  );
}
