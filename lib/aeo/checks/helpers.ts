import type { Category, CheckResult } from "../types";

export function scored(
  id: string,
  category: Category,
  label: string,
  earned: number,
  maxPoints: number,
  detail: string,
  fixHint: string,
): CheckResult {
  const points = Math.max(0, Math.min(maxPoints, earned));
  return {
    id,
    category,
    label,
    passed: points >= maxPoints,
    points,
    maxPoints,
    detail,
    fixHint,
  };
}
