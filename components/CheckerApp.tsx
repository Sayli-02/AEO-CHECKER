"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconArrow, IconCheck, IconClose, IconPrint } from "@/components/Icons";
import type { AuditResult, CheckResult, VisibilityResult } from "@/lib/aeo/types";

type Step = "form" | "fetching" | "checking" | "asking" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "fetching", label: "Fetching page" },
  { id: "checking", label: "Running 30 plus checks" },
  { id: "asking", label: "Asking AI" },
];


function ScoreRing({ total, grade }: { total: number; grade: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (total / 100) * c;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 128 128" className="h-32 w-32" role="img" aria-label={`Score ${total} out of 100, grade ${grade}`}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="#313131" strokeWidth="8" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#d08a4c"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
        <text
          x="64"
          y="72"
          textAnchor="middle"
          fill="#f4efe6"
          style={{ fontSize: "28px", fontFamily: "var(--font-geist-mono), ui-monospace" }}
        >
          {total}
        </text>
      </svg>
      <div>
        <p className="caption-4 text-muted">AEO readiness</p>
        <p className="heading-4">Grade {grade}</p>
        <p className="body-6 mt-2 text-muted">{total} out of 100 on page checks</p>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: CheckResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-line bg-surface-2">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {check.passed ? (
          <IconCheck className="mt-1 h-4 w-4 text-pass" />
        ) : (
          <IconClose className="mt-1 h-4 w-4 text-fail" />
        )}
        <span className="body-5 flex-1">{check.label}</span>
        <span className="caption-5 font-mono text-muted">
          {check.points}/{check.maxPoints}
        </span>
      </button>
      {open ? (
        <div className="border-t border-line px-4 py-3">
          <p className="body-6 text-muted">{check.detail}</p>
          {!check.passed ? <p className="body-5 mt-2">{check.fixHint}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function CheckerApp() {
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [visibility, setVisibility] = useState<VisibilityResult | null>(null);

  const grouped = useMemo(() => {
    if (!audit) return [];
    return audit.byCategory.map((cat) => ({
      ...cat,
      checks: audit.checks.filter((c) => c.category === cat.category),
    }));
  }, [audit]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAudit(null);
    setVisibility(null);
    if (!url.trim()) {
      setError("Enter a URL to check.");
      return;
    }
    setStep("checking");
    try {
      const auditRes = await fetch("/api/aeo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const auditJson = await auditRes.json();
      if (!auditRes.ok) {
        setError(auditJson.error || "The audit failed.");
        setStep("form");
        return;
      }
      setAudit(auditJson);
      setStep("asking");
      const visRes = await fetch("/api/aeo/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          brand: brand.trim() || undefined,
          auditResult: auditJson,
        }),
      });
      const visJson = await visRes.json();
      if (visRes.ok) setVisibility(visJson);
      else {
        setVisibility({
          brand: brand.trim() || "Your brand",
          category: "",
          location: null,
          visibilityScore: 0,
          questions: [],
          recommendations: {
            summary: "AI part unavailable, here is your audit. Use the failed checks as the fix list.",
            actions: (auditJson.checks as CheckResult[])
              .filter((c) => !c.passed)
              .slice(0, 8)
              .map((c) => ({
                priority: "high" as const,
                title: c.label,
                why: c.detail,
                how: c.fixHint,
                effort: "moderate" as const,
              })),
          },
          cached: false,
          aiUnavailable: true,
          caveat:
            "This uses Gemini's built-in knowledge, not live search. New sites usually score 0% here — that's normal and is what AEO work improves.",
        });
      }
      setStep("done");
    } catch {
      setError("The check could not finish. Try again in a moment.");
      setStep("form");
    }
  }

  const loading = step === "fetching" || step === "checking" || step === "asking";

  return (
    <div id="checker" className="w-full">
      <form onSubmit={onSubmit} className="no-print rounded-2xl border border-line bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
          <label className="block">
            <span className="caption-4 text-muted">Site URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourbrand.com"
              className="body-3 mt-2 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-foreground placeholder:text-muted"
              autoComplete="url"
              inputMode="url"
              required
            />
          </label>
          <label className="block">
            <span className="caption-4 text-muted">Brand name optional</span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Acme"
              className="body-3 mt-2 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-foreground placeholder:text-muted"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="button-md mt-6 flex items-center justify-center gap-2 self-end rounded-lg bg-accent px-3 py-2 text-accent-text transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            Check my site
            <IconArrow className="h-4 w-4" />
          </button>
        </div>
        {error ? <p className="body-5 mt-3 text-fail">{error}</p> : null}
        {loading ? (
          <ol className="mt-4 flex flex-col gap-2">
            {STEPS.map((s) => {
              const activeIndex = STEPS.findIndex((x) => x.id === step);
              const thisIndex = STEPS.findIndex((x) => x.id === s.id);
              const on = thisIndex <= activeIndex;
              return (
                <li key={s.id} className={`body-5 ${on ? "text-foreground" : "text-muted"}`}>
                  {s.label}
                  {step === s.id ? " …" : ""}
                </li>
              );
            })}
          </ol>
        ) : null}
      </form>

      {audit ? (
        <div className="mt-8 space-y-8">
          <ScoreRing total={audit.total} grade={audit.grade} />
          <div className="space-y-6">
            {grouped.map((cat) => (
              <div key={cat.category}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="title-4">{cat.label}</p>
                  <p className="caption-5 font-mono text-muted">
                    {cat.points}/{cat.max}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${cat.max ? (cat.points / cat.max) * 100 : 0}%` }}
                  />
                </div>
                <div className="mt-2 space-y-2">
                  {cat.checks.map((check) => (
                    <CheckRow key={check.id} check={check} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {visibility ? (
        <section className="mt-12 rounded-2xl border border-line bg-surface p-4">
          <p className="title-3">AI answer visibility</p>
          <p className="heading-5 mt-2">{visibility.visibilityScore}% mentioned</p>
          <p className="body-6 mt-3 max-w-3xl text-muted">{visibility.caveat}</p>
          {visibility.questions.length ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="caption-4 text-muted">
                    <th className="border border-line px-3 py-2">Question</th>
                    <th className="border border-line px-3 py-2">Mentioned</th>
                    <th className="border border-line px-3 py-2">Cited</th>
                    <th className="border border-line px-3 py-2">Competitors</th>
                  </tr>
                </thead>
                <tbody>
                  {visibility.questions.map((row) => (
                    <tr key={row.question}>
                      <td className="body-6 border border-line px-3 py-2">{row.question}</td>
                      <td className="body-6 border border-line px-3 py-2">{row.mentioned ? "Yes" : "No"}</td>
                      <td className="body-6 border border-line px-3 py-2">{row.cited ? "Yes" : "No"}</td>
                      <td className="body-6 border border-line px-3 py-2">
                        {row.competitors.join(", ") || "None named"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="body-6 mt-4 text-muted">No Gemini answers yet. Your on page audit still stands.</p>
          )}
        </section>
      ) : null}

      {visibility?.recommendations ? (
        <section className="mt-8">
          <p className="title-3">Top fixes</p>
          <p className="body-6 mt-2 max-w-3xl text-muted">{visibility.recommendations.summary}</p>
          <ol className="mt-6 space-y-3">
            {visibility.recommendations.actions.map((action, i) => (
              <li key={`${action.title}-${i}`} className="rounded-2xl border border-line bg-surface p-4">
                <p className="caption-4 text-accent">
                  {action.priority} · {action.effort}
                </p>
                <p className="title-2 mt-2">{action.title}</p>
                <p className="body-6 mt-2 text-muted">{action.why}</p>
                <p className="body-5 mt-2">{action.how}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {audit ? (
        <div className="no-print mt-12 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="button-md inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-text"
          >
            Want us to fix these? Book a free AEO consultation
            <IconArrow className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="button-md inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2"
          >
            <IconPrint className="h-4 w-4" />
            Download report
          </button>
        </div>
      ) : null}
    </div>
  );
}
