import type { CheckResult, ParsedPage } from "../types";
import { scored } from "./helpers";

export function checkTrust(page: ParsedPage): CheckResult[] {
  const author = scored(
    "trust-author",
    "trust",
    "Author or organization byline",
    page.author ? 4 : 0,
    4,
    page.author ? `Byline: ${page.author}` : "No author meta, rel=author, or byline element",
    "Add a visible byline and an author or Organization name in meta and JSON-LD.",
  );

  const date = scored(
    "trust-date",
    "trust",
    "Publish or updated date",
    page.dates.length ? 3 : 0,
    3,
    page.dates.length ? `Date signals: ${page.dates.slice(0, 3).join(", ")}` : "No time[datetime] or article date meta",
    "Add a visible <time datetime> and datePublished / dateModified in JSON-LD.",
  );

  const contact = scored(
    "trust-contact",
    "trust",
    "About or contact links",
    page.aboutOrContact ? 3 : 0,
    3,
    page.aboutOrContact ? "Found an about or contact link" : "No about or contact link detected",
    "Link to /about and /contact from the page so crawlers can find the entity behind it.",
  );

  const citations = scored(
    "trust-citations",
    "trust",
    "Outbound citations",
    page.reputableOutbound >= 1 ? 3 : page.outboundCount >= 2 ? 1 : 0,
    3,
    page.reputableOutbound
      ? `${page.reputableOutbound} citation(s) to reputable hosts, ${page.outboundCount} outbound domain(s)`
      : `${page.outboundCount} outbound domain(s)`,
    "Cite reputable sources (.gov, .edu, Wikipedia, standards bodies) next to claims and statistics.",
  );

  const stats = scored(
    "trust-statistics",
    "trust",
    "Statistics or numbers present",
    page.hasStatistics ? 2 : 0,
    2,
    page.hasStatistics ? "Found numbers, percentages, or large figures" : "No statistics detected in visible text",
    "Include specific figures (and their source) rather than vague claims.",
  );

  return [author, date, contact, citations, stats];
}
