import type { CheckResult, FetchedSite, ParsedPage } from "../types";
import { scored } from "./helpers";

export function checkTechnical(site: FetchedSite, page: ParsedPage): CheckResult[] {
  let https = false;
  try {
    https = new URL(site.finalUrl).protocol === "https:";
  } catch {
    https = false;
  }

  const httpsCheck = scored(
    "tech-https",
    "technical",
    "Served over HTTPS",
    https ? 3 : 0,
    3,
    https ? "Final URL uses https" : "Final URL is not https",
    "Redirect all traffic to HTTPS and serve the canonical on https.",
  );

  const speed = scored(
    "tech-ttfb",
    "technical",
    "Response under 2.5s",
    site.responseMs < 2500 ? 2 : site.responseMs < 4000 ? 1 : 0,
    2,
    `Document fetch took ${site.responseMs} ms`,
    "Bring HTML response time under 2.5 seconds. Slow pages are dropped by crawlers.",
  );

  const sitemap = scored(
    "tech-sitemap",
    "technical",
    "Sitemap present",
    site.sitemapFound ? 2 : 0,
    2,
    site.sitemapFound ? "Found /sitemap.xml or a Sitemap line in robots.txt" : "No sitemap discovered",
    "Publish /sitemap.xml and list it in robots.txt.",
  );

  const shell =
    page.wordCount < 50 && page.scriptChars > 4000
      ? 0
      : page.wordCount < 80 && page.scriptChars > page.visibleText.length * 10
        ? 1
        : 3;

  const htmlContent = scored(
    "tech-server-html",
    "technical",
    "Content is in server HTML",
    shell,
    3,
    `${page.wordCount} visible words vs ${page.scriptChars} script characters`,
    "Render the main copy in the initial HTML. An empty JS shell is invisible to most AI crawlers.",
  );

  return [httpsCheck, speed, sitemap, htmlContent];
}
