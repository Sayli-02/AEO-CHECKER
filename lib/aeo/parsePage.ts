import * as cheerio from "cheerio";
import type { FetchedSite, ParsedPage } from "./types";

const REPUTABLE = /\.(gov|edu|org)(?:\/|$)/i;
const QUESTION_START = /^(what|why|how|when|where|who|which|can|does|do|is|are|should)\b/i;
const ABOUT_CONTACT = /(\/about|\/contact|\/team|about us|contact us|about-us|contact-us)/i;
const STATS = /\b\d{1,3}(?:,\d{3})+\b|\b\d+(?:\.\d+)?\s*%|\b\d+\s*(million|billion|thousand)\b/i;

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function typesOf(node: unknown, bag: Set<string>) {
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") bag.add(t);
  else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") bag.add(x);
  if (Array.isArray(obj["@graph"])) for (const child of obj["@graph"]) typesOf(child, bag);
  if (Array.isArray(node)) for (const child of node) typesOf(child, bag);
}

function flattenLd(node: unknown, out: Record<string, unknown>[]): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) flattenLd(child, out);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (obj["@graph"]) flattenLd(obj["@graph"], out);
  if (obj["@type"]) out.push(obj);
}

function attrCount(entity: Record<string, unknown>): number {
  return Object.keys(entity).filter((k) => k !== "@context" && k !== "@type").length;
}

export function mainEntity(jsonLd: unknown[]): Record<string, unknown> | null {
  const flat: Record<string, unknown>[] = [];
  for (const node of jsonLd) flattenLd(node, flat);
  if (!flat.length) return null;
  return flat.reduce((best, cur) => (attrCount(cur) > attrCount(best) ? cur : best));
}

export function hasSameAs(jsonLd: unknown[]): boolean {
  const flat: Record<string, unknown>[] = [];
  for (const node of jsonLd) flattenLd(node, flat);
  return flat.some((n) => {
    const same = n.sameAs;
    return Array.isArray(same) ? same.length > 0 : typeof same === "string" && same.length > 0;
  });
}

export function parsePage(site: FetchedSite): ParsedPage {
  const $ = cheerio.load(site.html);
  $("script, style, noscript, svg, template").remove();

  const title = clean($("title").first().text());
  const description = $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
  const lang = $("html").attr("lang")?.trim() || "";
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || "";
  const ogDescription = $('meta[property="og:description"]').attr("content")?.trim() || "";
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim() || "";
  const robotsMeta = $('meta[name="robots"]').attr("content")?.toLowerCase() || "";

  const h1s = $("h1")
    .toArray()
    .map((el) => clean($(el).text()))
    .filter(Boolean);

  const headings = $("h1, h2, h3, h4")
    .toArray()
    .map((el) => ({
      level: Number(($(el).prop("tagName") as string | undefined)?.replace(/h/i, "") || 0),
      text: clean($(el).text()),
    }))
    .filter((h) => h.text && h.level > 0);

  const questionHeadings = headings
    .filter((h) => h.level >= 2)
    .map((h) => h.text)
    .filter((t) => t.endsWith("?") || QUESTION_START.test(t));

  const paragraphsAfterHeadings: ParsedPage["paragraphsAfterHeadings"] = [];
  $("h2, h3").each((_, el) => {
    const heading = clean($(el).text());
    const next = $(el).nextAll("p").first();
    if (!next.length) return;
    const text = clean(next.text());
    const words = text ? text.split(/\s+/).length : 0;
    paragraphsAfterHeadings.push({ heading, text, words });
  });

  const hasList = $("ul, ol").length > 0;
  const hasTable = $("table").length > 0;
  const visibleText = $("body").text().replace(/\s+/g, " ").trim() || $.root().text().replace(/\s+/g, " ").trim();
  const wordCount = visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0;

  const $raw = cheerio.load(site.html);
  const scriptChars = $raw("script")
    .toArray()
    .reduce((n, el) => n + ($raw(el).html()?.length ?? 0), 0);

  const jsonLd: unknown[] = [];
  let jsonLdParseError = false;
  $raw('script[type="application/ld+json"]').each((_, el) => {
    const raw = $raw(el).html();
    if (!raw) return;
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      jsonLdParseError = true;
    }
  });
  const jsonLdTypes = new Set<string>();
  for (const node of jsonLd) typesOf(node, jsonLdTypes);

  const author =
    $('meta[name="author"]').attr("content")?.trim() ||
    clean($('[rel="author"], .author, [itemprop="author"]').first().text()) ||
    "";

  const dates: string[] = [];
  $("time[datetime]").each((_, el) => {
    const v = $(el).attr("datetime");
    if (v) dates.push(v);
  });
  for (const key of ["article:published_time", "article:modified_time", "og:updated_time"]) {
    const v = $(`meta[property="${key}"]`).attr("content");
    if (v) dates.push(v);
  }

  let aboutOrContact = false;
  const outboundHosts = new Set<string>();
  let reputableOutbound = 0;
  let pageHost = "";
  try {
    pageHost = new URL(site.finalUrl).hostname.replace(/^www\./, "");
  } catch {
    pageHost = "";
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = `${href} ${clean($(el).text())}`;
    if (ABOUT_CONTACT.test(label)) aboutOrContact = true;
    if (!/^https?:/i.test(href)) return;
    try {
      const host = new URL(href).hostname.replace(/^www\./, "");
      if (host && host !== pageHost) {
        outboundHosts.add(host);
        if (REPUTABLE.test(href) || /\b(wikipedia|schema\.org|w3\.org|nist\.gov)\b/i.test(href)) {
          reputableOutbound += 1;
        }
      }
    } catch {
      /* skip */
    }
  });

  const noindexHeader = /noindex/i.test(site.headers["x-robots-tag"] || "");

  return {
    title,
    description,
    canonical,
    lang,
    ogTitle,
    ogDescription,
    ogImage,
    robotsMeta,
    h1s,
    headings,
    questionHeadings,
    paragraphsAfterHeadings,
    hasList,
    hasTable,
    wordCount,
    visibleText,
    scriptChars,
    jsonLd,
    jsonLdTypes: [...jsonLdTypes],
    jsonLdParseError,
    author,
    dates,
    aboutOrContact,
    outboundCount: outboundHosts.size,
    reputableOutbound,
    hasStatistics: STATS.test(visibleText),
    noindexHeader,
  };
}

export function firstWords(text: string, n = 2000): string {
  return text.split(/\s+/).filter(Boolean).slice(0, n).join(" ");
}
