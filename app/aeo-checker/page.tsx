import { CheckerApp } from "@/components/CheckerApp";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free AEO Checker: Is Your Site Ready for ChatGPT and Gemini?",
  description:
    "Paste a URL for a 0 to 100 AEO readiness score, a Gemini visibility check, and a prioritized fix list. Free, no account.",
  alternates: { canonical: "/aeo-checker" },
};

export default function AeoCheckerPage() {
  return (
    <div>
      <JsonLd />
      <article className="mx-auto max-w-5xl px-6 py-24">
        <p className="caption-4 text-muted">
          By <span className="author">AEO Checker editorial team</span>
          {" · "}
          <time dateTime="2026-11-06">Updated 6 November 2026</time>
          {" · "}
          <Link href="/about">About</Link>
          {" · "}
          <Link href="/contact">Contact</Link>
        </p>
        <h1 className="heading-1 hero-heading mt-6 max-w-[680px]">
          Free AEO Checker
          <br />
          for ChatGPT and Gemini
        </h1>
        <p className="body-3 mt-6 max-w-[680px] text-muted">
          Enter a URL and an optional brand name. We score on page AEO from 0 to 100, then ask Gemini buyer questions and check whether you are named. Print the report when you are done.
        </p>
        <div className="mt-10">
          <CheckerApp />
        </div>
        <section className="mt-16">
          <h2 className="heading-5">What is a good AEO score?</h2>
          <p className="body-3 mt-4 max-w-3xl">
            Grade A is 85 or higher. That usually means AI crawlers are allowed, JSON-LD identifies the publisher, the HTML has real answers, and llms.txt exists. Grade D is a crawl or identity problem, not a copywriting tweak. Use the category bars to see which bucket is pulling the total down before you rewrite anything.
          </p>
        </section>
        <section className="mt-12">
          <h2 className="heading-5">FAQ</h2>
          <div className="mt-6 space-y-8">
            {FAQS.slice(0, 4).map((item) => (
              <div key={item.q}>
                <h3 className="heading-6">{item.q}</h3>
                <p className="body-3 mt-3 max-w-3xl">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
