import { hasSameAs, mainEntity } from "../parsePage";
import type { CheckResult, ParsedPage } from "../types";
import { scored } from "./helpers";

const IDENTITY = new Set(["Organization", "WebSite", "LocalBusiness", "Person"]);
const ANSWER = new Set([
  "FAQPage",
  "Article",
  "BlogPosting",
  "NewsArticle",
  "Product",
  "Service",
  "HowTo",
]);

export function checkSchema(page: ParsedPage): CheckResult[] {
  const parsed = page.jsonLd.length > 0 && !page.jsonLdParseError;
  const present = scored(
    "schema-jsonld",
    "schema",
    "JSON-LD is present and parses",
    parsed ? 6 : page.jsonLdParseError ? 2 : 0,
    6,
    parsed
      ? `Parsed ${page.jsonLd.length} JSON-LD block(s); types: ${page.jsonLdTypes.join(", ") || "none"}`
      : page.jsonLdParseError
        ? "JSON-LD script tags were found but at least one block failed to parse"
        : "No application/ld+json blocks found",
    "Add a JSON-LD script with valid JSON. Start with WebSite and Organization.",
  );

  const identityHit = page.jsonLdTypes.some((t) => IDENTITY.has(t));
  const identity = scored(
    "schema-identity",
    "schema",
    "Organization or WebSite schema",
    identityHit ? 4 : 0,
    4,
    identityHit
      ? `Found ${page.jsonLdTypes.filter((t) => IDENTITY.has(t)).join(", ")}`
      : "No Organization or WebSite node",
    "Add Organization and WebSite JSON-LD so answer engines can identify the publisher.",
  );

  const answerHit = page.jsonLdTypes.some((t) => ANSWER.has(t));
  const answer = scored(
    "schema-answer-type",
    "schema",
    "FAQ, Article, Product, Service, or HowTo schema",
    answerHit ? 5 : 0,
    5,
    answerHit
      ? `Found ${page.jsonLdTypes.filter((t) => ANSWER.has(t)).join(", ")}`
      : "No FAQPage, Article, Product, Service, or HowTo node",
    "Add FAQPage for Q and A content, or Article / Product / Service / HowTo where it fits the page.",
  );

  const entity = mainEntity(page.jsonLd);
  const attrs = entity
    ? Object.keys(entity).filter((k) => k !== "@context" && k !== "@type").length
    : 0;
  const rich = scored(
    "schema-richness",
    "schema",
    "Main entity has at least 5 attributes",
    attrs >= 5 ? 3 : attrs >= 3 ? 1 : 0,
    3,
    entity ? `Main entity has ${attrs} attributes` : "No schema entity to inspect",
    "Fill in name, url, description, sameAs, and a type-specific field on the main JSON-LD entity.",
  );

  const sameAs = scored(
    "schema-sameas",
    "schema",
    "sameAs profile links",
    hasSameAs(page.jsonLd) ? 2 : 0,
    2,
    hasSameAs(page.jsonLd) ? "sameAs is present" : "No sameAs links on any entity",
    "Add sameAs URLs for LinkedIn, Wikipedia, Crunchbase, or other official profiles.",
  );

  return [present, identity, answer, rich, sameAs];
}
