import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the free AEO Checker.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="heading-3">Terms</h1>
      <p className="body-3 mt-4">
        The checker is provided as is for evaluating public pages. Scores and Gemini mention rates are snapshots, not a promise that any assistant will cite you. Do not use the tool to scan systems you are not allowed to fetch.
      </p>
      <p className="body-3 mt-4">
        Private, loopback, and link local addresses are rejected. We may rate limit abusive traffic. Consultations described on this site are optional and scoped in writing after the first conversation.
      </p>
    </article>
  );
}
