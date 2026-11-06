import { AI_BOTS } from "../config";
import { isBotAllowed } from "../robots";
import type { CheckResult, FetchedSite, ParsedPage } from "../types";
import { scored } from "./helpers";

export function checkCrawlers(site: FetchedSite, page: ParsedPage): CheckResult[] {
  const path = (() => {
    try {
      return new URL(site.finalUrl).pathname || "/";
    } catch {
      return "/";
    }
  })();

  const botChecks = AI_BOTS.map((bot) => {
    const allowed = isBotAllowed(site.robotsTxt, bot, path);
    return scored(
      `crawler-${bot.toLowerCase()}`,
      "crawlers",
      `${bot} is allowed`,
      allowed ? 1 : 0,
      1,
      site.robotsTxt
        ? allowed
          ? `robots.txt allows ${bot} on ${path}`
          : `robots.txt blocks ${bot} on ${path}`
        : `No robots.txt found, so ${bot} is allowed by default`,
      `Add a User-agent: ${bot} group with Allow: / in robots.txt.`,
    );
  });

  const robotsPresent = scored(
    "crawler-robots-present",
    "crawlers",
    "robots.txt is published",
    site.robotsTxt ? 2 : 0,
    2,
    site.robotsTxt ? "Found /robots.txt" : "No /robots.txt at the site origin",
    "Publish /robots.txt that allows the major AI crawlers.",
  );

  const noindexMeta = /noindex/.test(page.robotsMeta);
  const indexable = scored(
    "crawler-indexable",
    "crawlers",
    "Page is not marked noindex",
    noindexMeta || page.noindexHeader ? 0 : 5,
    5,
    noindexMeta
      ? `meta robots includes noindex (${page.robotsMeta})`
      : page.noindexHeader
        ? "X-Robots-Tag includes noindex"
        : "No noindex directive in meta or headers",
    "Remove noindex from the robots meta tag and the X-Robots-Tag header if you want AI systems to use this page.",
  );

  return [...botChecks, robotsPresent, indexable];
}
