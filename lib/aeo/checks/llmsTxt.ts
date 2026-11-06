import type { CheckResult, FetchedSite } from "../types";
import { scored } from "./helpers";

export function checkLlmsTxt(site: FetchedSite): CheckResult[] {
  const text = site.llmsTxt;
  const exists = Boolean(text && text.trim());
  const title = exists && /^#\s+\S+/m.test(text!);
  const linkRe = /\[[^\]]+\]\([^)]+\)|https?:\/\/\S+/;
  const links = exists && linkRe.test(text!);

  const present = scored(
    "llms-exists",
    "llmsTxt",
    "/llms.txt exists",
    exists ? 3 : 0,
    3,
    exists ? `Found /llms.txt (${text!.trim().split(/\s+/).length} words)` : "No /llms.txt at the site origin",
    "Publish /llms.txt at the site root describing the product and linking to key pages.",
  );

  const useful = scored(
    "llms-title-links",
    "llmsTxt",
    "llms.txt has a title and links",
    title && links ? 2 : title || links ? 1 : 0,
    2,
    !exists
      ? "Skipped because /llms.txt is missing"
      : `Title heading: ${title ? "yes" : "no"}; links: ${links ? "yes" : "no"}`,
    "Start llms.txt with a # heading and include markdown links to docs, product, and contact pages.",
  );

  return [present, useful];
}
