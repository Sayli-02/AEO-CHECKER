import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About AEO Checker",
  description: "Who publishes the free AEO checker and how to reach the editorial team.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="heading-3">About AEO Checker</h1>
      <p className="body-3 mt-4">
        AEO Checker is a free on page audit for marketers and founders who want ChatGPT, Gemini, Claude, and Perplexity to treat their site as a source. The score is deterministic. The visibility pass uses the Gemini API on the server and never sends your API key to the browser.
      </p>
      <p className="body-3 mt-4">
        The editorial team publishes the rubric, the checker, and the consultation practice. We cite public research on generative engine optimization and keep the Gemini search grounding switch off by default.
      </p>
      <p className="body-3 mt-4">
        Questions or press: use the <Link href="/contact">contact form</Link>. Privacy details live on the{" "}
        <Link href="/privacy">privacy page</Link>.
      </p>
    </article>
  );
}
