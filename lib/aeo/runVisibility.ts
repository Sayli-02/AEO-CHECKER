import { brandTerms, domainCited, textMentionsBrand } from "./brandMatch";
import { cacheGet, cacheKey, cacheSet, pageSummaryKey, type PageSummary } from "./cache";
import { fallbackRecommendations } from "./fallbackRecs";
import { fetchPage } from "./fetchPage";
import {
  brandExtractSchema,
  geminiConfigured,
  generateJson,
  recommendationsGeminiSchema,
  visibilityAnswersSchema,
} from "./gemini";
import { firstWords, parsePage } from "./parsePage";
import { brandQuestionsPrompt, recommendationsPrompt, visibilityAnswersPrompt } from "./prompts";
import {
  BrandExtractSchema,
  RecommendationsSchema,
  VisibilityAnswersSchema,
  type AuditResult,
  type QuestionVisibility,
  type VisibilityResult,
} from "./types";

const CAVEAT =
  "This uses Gemini's built-in knowledge, not live search. New sites usually score 0% here — that's normal and is what AEO work improves.";

function emptyVisibility(brand: string, audit: AuditResult, message: string): VisibilityResult {
  return {
    brand,
    category: "",
    location: null,
    visibilityScore: 0,
    questions: [],
    recommendations: fallbackRecommendations(audit, brand, 0),
    cached: false,
    aiUnavailable: true,
    caveat: `${CAVEAT} ${message}`,
  };
}

export async function runVisibility(input: {
  url: string;
  brand?: string;
  auditResult: AuditResult;
}): Promise<VisibilityResult> {
  const key = cacheKey(input.auditResult.finalUrl || input.url, input.brand);
  const cached = cacheGet<VisibilityResult>(key);
  if (cached) return { ...cached, cached: true };

  if (!geminiConfigured()) {
    return emptyVisibility(
      input.brand || "Your brand",
      input.auditResult,
      "AI part unavailable: GEMINI_API_KEY is not set, so here is your on-page audit.",
    );
  }

  try {
    const finalUrl = input.auditResult.finalUrl || input.url;
    let summary = cacheGet<PageSummary>(pageSummaryKey(finalUrl));
    if (!summary) {
      const site = await fetchPage(input.url);
      const page = parsePage(site);
      summary = {
        title: page.title,
        description: page.description,
        headings: page.headings.map((h) => h.text),
        text: firstWords(page.visibleText, 2000),
        finalUrl: site.finalUrl,
      };
    }
    const extract = await generateJson(
      brandQuestionsPrompt({
        title: summary.title,
        description: summary.description,
        headings: summary.headings,
        text: summary.text,
        brand: input.brand,
      }),
      brandExtractSchema,
      BrandExtractSchema,
    );

    const brand = input.brand?.trim() || extract.brand;
    const questions = extract.questions.slice(0, 5);
    const packed = await generateJson(
      visibilityAnswersPrompt(questions),
      visibilityAnswersSchema,
      VisibilityAnswersSchema,
    );

    const terms = brandTerms(brand, summary.finalUrl);
    const scored: QuestionVisibility[] = packed.answers.slice(0, questions.length).map((row, i) => {
      const question = questions[i] || row.question;
      const mentioned =
        textMentionsBrand(row.answer, terms) ||
        row.brandsMentioned.some((b) => textMentionsBrand(b, terms));
      const cited = domainCited(row.urlsMentioned, summary.finalUrl);
      const competitors = row.brandsMentioned.filter((b) => !textMentionsBrand(b, terms));
      return {
        question,
        answer: row.answer,
        mentioned,
        cited,
        competitors,
        brandsMentioned: row.brandsMentioned,
        urlsMentioned: row.urlsMentioned,
      };
    });

    const mentionedCount = scored.filter((q) => q.mentioned).length;
    const visibilityScore = scored.length ? Math.round((mentionedCount / scored.length) * 100) : 0;
    const failed = input.auditResult.checks.filter((c) => !c.passed);

    let recommendations;
    try {
      recommendations = await generateJson(
        recommendationsPrompt({
          brand,
          category: extract.category,
          visibilityScore,
          failed,
        }),
        recommendationsGeminiSchema,
        RecommendationsSchema,
      );
      recommendations = {
        ...recommendations,
        actions: recommendations.actions.slice(0, 8),
      };
    } catch {
      recommendations = fallbackRecommendations(input.auditResult, brand, visibilityScore);
    }

    const result: VisibilityResult = {
      brand,
      category: extract.category,
      location: extract.location,
      visibilityScore,
      questions: scored,
      recommendations,
      cached: false,
      aiUnavailable: false,
      caveat: CAVEAT,
    };
    cacheSet(key, result);
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI part unavailable, here is your audit.";
    return emptyVisibility(input.brand || "Your brand", input.auditResult, message);
  }
}
