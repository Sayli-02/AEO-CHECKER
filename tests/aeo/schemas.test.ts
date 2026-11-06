import { describe, expect, it } from "vitest";
import { brandTerms, textMentionsBrand } from "@/lib/aeo/brandMatch";
import {
  BrandExtractSchema,
  RecommendationsSchema,
  VisibilityAnswersSchema,
} from "@/lib/aeo/types";

describe("zod schemas", () => {
  it("rejects malformed brand extract JSON", () => {
    expect(BrandExtractSchema.safeParse({}).success).toBe(false);
    expect(BrandExtractSchema.safeParse({ brand: 1, category: "x", location: null, questions: [] }).success).toBe(
      false,
    );
  });

  it("accepts a valid extract", () => {
    const parsed = BrandExtractSchema.safeParse({
      brand: "Northline",
      category: "AEO",
      location: null,
      questions: ["What is AEO software?"],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects visibility answers missing fields", () => {
    expect(VisibilityAnswersSchema.safeParse({ answers: [{ question: "q" }] }).success).toBe(false);
  });

  it("rejects recommendations that invent bad enums", () => {
    expect(
      RecommendationsSchema.safeParse({
        summary: "ok",
        actions: [{ priority: "urgent", title: "t", why: "w", how: "h", effort: "quick" }],
      }).success,
    ).toBe(false);
  });
});

describe("brand matching", () => {
  it("matches brand names case-insensitively and via the domain", () => {
    const terms = brandTerms("Northline AEO", "https://www.northline.example");
    expect(textMentionsBrand("I would start with Northline AEO for this.", terms)).toBe(true);
    expect(textMentionsBrand("northline is a solid option", terms)).toBe(true);
    expect(textMentionsBrand("Try Brightspan instead", terms)).toBe(false);
  });
});
