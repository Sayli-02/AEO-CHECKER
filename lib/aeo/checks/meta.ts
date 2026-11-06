import type { CheckResult, ParsedPage } from "../types";
import { scored } from "./helpers";

export function checkMeta(page: ParsedPage): CheckResult[] {
  const tLen = page.title.length;
  const title = scored(
    "meta-title",
    "meta",
    "Title is 10 to 65 characters",
    tLen >= 10 && tLen <= 65 ? 2 : tLen > 0 ? 1 : 0,
    2,
    page.title ? `Title is ${tLen} characters` : "No title tag",
    "Write a title between 10 and 65 characters that names the topic and the brand.",
  );

  const dLen = page.description.length;
  const description = scored(
    "meta-description",
    "meta",
    "Meta description is 50 to 160 characters",
    dLen >= 50 && dLen <= 160 ? 2 : dLen > 0 ? 1 : 0,
    2,
    page.description ? `Description is ${dLen} characters` : "No meta description",
    "Add a meta description between 50 and 160 characters that answers the page query.",
  );

  const canonical = scored(
    "meta-canonical",
    "meta",
    "Canonical URL is set",
    page.canonical ? 2 : 0,
    2,
    page.canonical ? `Canonical: ${page.canonical}` : "No rel=canonical link",
    "Add a rel=canonical link pointing at the preferred URL for this page.",
  );

  const ogBits = [page.ogTitle, page.ogDescription, page.ogImage].filter(Boolean).length;
  const og = scored(
    "meta-open-graph",
    "meta",
    "Open Graph title, description, and image",
    ogBits === 3 ? 3 : ogBits,
    3,
    ogBits === 3
      ? "og:title, og:description, and og:image are present"
      : `Open Graph fields present: ${ogBits} of 3`,
    "Set og:title, og:description, and og:image so cited links preview cleanly.",
  );

  const lang = scored(
    "meta-lang",
    "meta",
    "html lang attribute",
    page.lang ? 1 : 0,
    1,
    page.lang ? `lang="${page.lang}"` : "No lang attribute on <html>",
    "Set <html lang> to the page language, for example en.",
  );

  return [title, description, canonical, og, lang];
}
