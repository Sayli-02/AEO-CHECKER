import { CATEGORY_LABELS, CATEGORY_MAX, type AuditResult, type Category, type CheckResult, type Grade } from "./types";

export function gradeFor(total: number): Grade {
  if (total >= 85) return "A";
  if (total >= 70) return "B";
  if (total >= 50) return "C";
  return "D";
}

export function scoreChecks(
  checks: CheckResult[],
  meta: { url: string; finalUrl: string; responseMs: number },
): AuditResult {
  const byCategory = (Object.keys(CATEGORY_MAX) as Category[]).map((category) => {
    const subset = checks.filter((c) => c.category === category);
    const points = subset.reduce((n, c) => n + c.points, 0);
    return {
      category,
      label: CATEGORY_LABELS[category],
      points: Math.min(CATEGORY_MAX[category], points),
      max: CATEGORY_MAX[category],
    };
  });
  const total = byCategory.reduce((n, c) => n + c.points, 0);
  return {
    url: meta.url,
    finalUrl: meta.finalUrl,
    fetchedAt: new Date().toISOString(),
    responseMs: meta.responseMs,
    total,
    grade: gradeFor(total),
    byCategory,
    checks,
  };
}
