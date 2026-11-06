import { z } from "zod";

export const CATEGORIES = [
  "crawlers",
  "schema",
  "meta",
  "content",
  "trust",
  "llmsTxt",
  "technical",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  crawlers: "AI crawler access",
  schema: "Structured data",
  meta: "Meta and identity",
  content: "Answer-ready content",
  trust: "Trust / E-E-A-T signals",
  llmsTxt: "llms.txt",
  technical: "Technical",
};

export const CATEGORY_MAX: Record<Category, number> = {
  crawlers: 15,
  schema: 20,
  meta: 10,
  content: 25,
  trust: 15,
  llmsTxt: 5,
  technical: 10,
};

export const CheckResultSchema = z.object({
  id: z.string(),
  category: z.enum(CATEGORIES),
  label: z.string(),
  passed: z.boolean(),
  points: z.number(),
  maxPoints: z.number(),
  detail: z.string(),
  fixHint: z.string(),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;

export const GradeSchema = z.enum(["A", "B", "C", "D"]);
export type Grade = z.infer<typeof GradeSchema>;

export const CategoryScoreSchema = z.object({
  category: z.enum(CATEGORIES),
  label: z.string(),
  points: z.number(),
  max: z.number(),
});

export const AuditResultSchema = z.object({
  url: z.string(),
  finalUrl: z.string(),
  fetchedAt: z.string(),
  responseMs: z.number(),
  total: z.number(),
  grade: GradeSchema,
  byCategory: z.array(CategoryScoreSchema),
  checks: z.array(CheckResultSchema),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

export const AuditRequestSchema = z.object({
  url: z.string().min(1).max(2048),
});

export const VisibilityRequestSchema = z.object({
  url: z.string().min(1).max(2048),
  brand: z.string().max(200).optional(),
  auditResult: AuditResultSchema,
});

export const BrandExtractSchema = z.object({
  brand: z.string(),
  category: z.string(),
  location: z.string().nullable(),
  questions: z.array(z.string()).min(1).max(8),
});

export type BrandExtract = z.infer<typeof BrandExtractSchema>;

export const VisibilityAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  brandsMentioned: z.array(z.string()),
  urlsMentioned: z.array(z.string()),
});

export const VisibilityAnswersSchema = z.object({
  answers: z.array(VisibilityAnswerSchema).min(1),
});

export const QuestionVisibilitySchema = z.object({
  question: z.string(),
  answer: z.string(),
  mentioned: z.boolean(),
  cited: z.boolean(),
  competitors: z.array(z.string()),
  brandsMentioned: z.array(z.string()),
  urlsMentioned: z.array(z.string()),
});

export type QuestionVisibility = z.infer<typeof QuestionVisibilitySchema>;

export const ActionSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  why: z.string(),
  how: z.string(),
  effort: z.enum(["quick", "moderate", "large"]),
});

export const RecommendationsSchema = z.object({
  summary: z.string(),
  actions: z.array(ActionSchema).max(8),
});

export type Recommendations = z.infer<typeof RecommendationsSchema>;

export const VisibilityResultSchema = z.object({
  brand: z.string(),
  category: z.string(),
  location: z.string().nullable(),
  visibilityScore: z.number(),
  questions: z.array(QuestionVisibilitySchema),
  recommendations: RecommendationsSchema,
  cached: z.boolean(),
  aiUnavailable: z.boolean(),
  caveat:
    z.string().default(
      "This uses Gemini's built-in knowledge, not live search. New sites usually score 0% here — that's normal and is what AEO work improves.",
    ),
});

export type VisibilityResult = z.infer<typeof VisibilityResultSchema>;

export type FetchedSite = {
  url: string;
  finalUrl: string;
  status: number;
  html: string;
  headers: Record<string, string>;
  robotsTxt: string | null;
  llmsTxt: string | null;
  sitemapFound: boolean;
  responseMs: number;
};

export type ParsedPage = {
  title: string;
  description: string;
  canonical: string;
  lang: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsMeta: string;
  h1s: string[];
  headings: { level: number; text: string }[];
  questionHeadings: string[];
  paragraphsAfterHeadings: { heading: string; text: string; words: number }[];
  hasList: boolean;
  hasTable: boolean;
  wordCount: number;
  visibleText: string;
  scriptChars: number;
  jsonLd: unknown[];
  jsonLdTypes: string[];
  jsonLdParseError: boolean;
  author: string;
  dates: string[];
  aboutOrContact: boolean;
  outboundCount: number;
  reputableOutbound: number;
  hasStatistics: boolean;
  noindexHeader: boolean;
};

export class FetchPageError extends Error {
  constructor(
    message: string,
    readonly code: "ssrf" | "timeout" | "too_large" | "invalid_url" | "network",
  ) {
    super(message);
    this.name = "FetchPageError";
  }
}
