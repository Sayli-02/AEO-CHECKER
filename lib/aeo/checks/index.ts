import type { CheckResult, FetchedSite, ParsedPage } from "../types";
import { checkContent } from "./content";
import { checkCrawlers } from "./crawlers";
import { checkLlmsTxt } from "./llmsTxt";
import { checkMeta } from "./meta";
import { checkSchema } from "./schema";
import { checkTechnical } from "./technical";
import { checkTrust } from "./trust";

export function runChecks(site: FetchedSite, page: ParsedPage): CheckResult[] {
  return [
    ...checkCrawlers(site, page),
    ...checkSchema(page),
    ...checkMeta(page),
    ...checkContent(page),
    ...checkTrust(page),
    ...checkLlmsTxt(site),
    ...checkTechnical(site, page),
  ];
}
