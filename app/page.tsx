import { CheckerApp } from "@/components/CheckerApp";
import { JsonLd } from "@/components/JsonLd";
import { TaglineReveal } from "@/components/TaglineReveal";
import { FAQS } from "@/lib/site";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <JsonLd />
      <article className="mx-auto max-w-5xl px-6 pb-24">
        <header className="pt-24">
          <p className="caption-4 text-muted">
            By <span className="author">AEO Checker editorial team</span>
            {" · "}
            <time dateTime="2026-11-06">Updated 6 November 2026</time>
          </p>
          <h1 className="heading-1 hero-heading mt-6 max-w-[680px]">
            See if ChatGPT
            <br />
            would mention your brand
          </h1>
          <p className="body-3 mt-6 max-w-[680px] text-muted">
            Paste a URL. Get a 0 to 100 AEO score, a Gemini visibility check, and a fix list in about a minute. Free, no account, and the on page audit does not call an AI model.
          </p>
          <p className="body-5 mt-4 text-muted">
            Across public GEO audits the median site lands near 59 out of 100.
            <a className="ml-2 underline" href="https://en.wikipedia.org/wiki/Large_language_model">
              Wikipedia on large language models
            </a>
            {" · "}
            <a className="underline" href="https://schema.org/FAQPage">
              schema.org FAQPage
            </a>
          </p>
        </header>

        <div className="mt-10">
          <CheckerApp />
        </div>

        <TaglineReveal />

        <section className="mt-16">
          <h2 className="heading-5">What do you get from a check?</h2>
          <p className="body-3 mt-4 max-w-3xl">
            You leave with a number you can share, a map of which crawlers are blocked, and a short list of page changes that make you easier to quote. Teams use it before a content sprint, a site launch, or a conversation with leadership about why the brand never appears in assistant answers.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-2xl border border-line bg-surface p-4">
              <p className="title-3">On page score</p>
              <p className="body-6 mt-2 text-muted">Thirty plus checks across crawlers, schema, identity, answers, trust, llms.txt, and speed.</p>
            </li>
            <li className="rounded-2xl border border-line bg-surface p-4">
              <p className="title-3">Gemini mentions</p>
              <p className="body-6 mt-2 text-muted">Five buyer questions answered in one request, then a mention rate for your brand.</p>
            </li>
            <li className="rounded-2xl border border-line bg-surface p-4">
              <p className="title-3">Fix list</p>
              <p className="body-6 mt-2 text-muted">Plain English actions, sorted by priority, only for checks that actually failed.</p>
            </li>
          </ul>
        </section>

        <section id="how-it-works" className="mt-16">
          <h2 className="heading-5">How does the checker work?</h2>
          <p className="body-3 mt-4 max-w-3xl">
            We fetch your public HTML, robots.txt, llms.txt, and sitemap, then run thirty plus deterministic checks. After the score appears, Gemini writes buyer questions, answers them, and we look for your brand name. The AI step uses Gemini knowledge, not live web search, so new sites often score zero there.
          </p>
          <ol className="mt-6 space-y-4">
            <li className="rounded-2xl border border-line bg-surface p-4">
              <p className="title-3">1. Paste a public URL</p>
              <p className="body-6 mt-2 text-muted">Add a brand name if the title tag is vague. We reject private and local addresses.</p>
            </li>
            <li className="rounded-2xl border border-line bg-surface p-4">
              <p className="title-3">2. Read the on page score</p>
              <p className="body-6 mt-2 text-muted">Grade A is 85 or higher. Expand any check for the detail and a static fix hint.</p>
            </li>
            <li className="rounded-2xl border border-line bg-surface p-4">
              <p className="title-3">3. Review Gemini and the fixes</p>
              <p className="body-6 mt-2 text-muted">Then book a consult or print the report for your team. Three full AI checks per hour per network.</p>
            </li>
          </ol>
        </section>

        <section id="faq" className="mt-16">
          <h2 className="heading-5">FAQ</h2>
          <div className="mt-6 space-y-8">
            {FAQS.map((item) => (
              <div key={item.q}>
                <h3 className="heading-6">{item.q}</h3>
                <p className="body-3 mt-3 max-w-3xl">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-line bg-surface p-6">
          <h2 className="heading-5">Want us to fix these?</h2>
          <p className="body-3 mt-4 max-w-3xl">
            Book a free AEO consultation. Bring the URL you just checked. We will walk the failed items, the Gemini mention pattern, and a content plan you can ship.
          </p>
          <Link href="/contact" className="button-md mt-6 inline-flex rounded-lg bg-accent px-3 py-2 text-accent-text">
            Book a free AEO consultation
          </Link>
        </section>
      </article>
    </div>
  );
}
