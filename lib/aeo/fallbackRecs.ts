import type { AuditResult, Recommendations } from "./types";

const ORDER = { high: 0, medium: 1, low: 2 } as const;

export function fallbackRecommendations(audit: AuditResult, brand: string, visibilityScore: number): Recommendations {
  const failed = audit.checks.filter((c) => !c.passed);
  const actions = failed.slice(0, 8).map((c) => {
    const priority = c.maxPoints >= 4 ? "high" : c.maxPoints >= 2 ? "medium" : "low";
    const effort = c.maxPoints >= 5 ? "moderate" : "quick";
    return {
      priority: priority as "high" | "medium" | "low",
      title: c.label,
      why: c.detail,
      how: c.fixHint,
      effort: effort as "quick" | "moderate" | "large",
    };
  });
  actions.sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);

  const summary =
    failed.length === 0
      ? `${brand} already passes the on-page AEO checks (grade ${audit.grade}). Gemini mentioned it in ${visibilityScore}% of buyer questions.`
      : `${brand} scores ${audit.total}/100 (grade ${audit.grade}) on on-page AEO. Gemini mentioned it in ${visibilityScore}% of buyer questions. Start with the high-priority items below.`;

  return { summary, actions };
}
