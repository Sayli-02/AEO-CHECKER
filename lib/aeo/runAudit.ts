import { cacheSet, pageSummaryKey } from "./cache";
import { runChecks } from "./checks";
import { fetchPage } from "./fetchPage";
import { firstWords, parsePage } from "./parsePage";
import { scoreChecks } from "./score";
import type { AuditResult } from "./types";

export async function runAudit(url: string): Promise<AuditResult> {
  const site = await fetchPage(url);
  const page = parsePage(site);
  cacheSet(
    pageSummaryKey(site.finalUrl),
    {
      title: page.title,
      description: page.description,
      headings: page.headings.map((h) => h.text),
      text: firstWords(page.visibleText, 2000),
      finalUrl: site.finalUrl,
    },
    10 * 60 * 1000,
  );
  const checks = runChecks(site, page);
  return scoreChecks(checks, {
    url: site.url,
    finalUrl: site.finalUrl,
    responseMs: site.responseMs,
  });
}
