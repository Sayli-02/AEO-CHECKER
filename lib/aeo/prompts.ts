import type { AuditResult } from "./types";

export function brandQuestionsPrompt(input: {
  title: string;
  description: string;
  headings: string[];
  text: string;
  brand?: string;
}): string {
  return [
    "You extract the brand a web page belongs to and write buyer questions for an AI assistant.",
    "Questions must NOT name the brand. They should be realistic queries a potential customer would type.",
    input.brand ? `The user says the brand is: ${input.brand}` : "Infer the brand from the page.",
    "",
    `Title: ${input.title}`,
    `Meta description: ${input.description}`,
    `Headings: ${input.headings.join(" | ")}`,
    `Page text: ${input.text}`,
    "",
    "Return JSON only.",
  ].join("\n");
}

export function visibilityAnswersPrompt(questions: string[]): string {
  return [
    "You are a helpful assistant recommending specific providers and sources.",
    "Answer each question with named companies, products, or publications when you can.",
    "Do not refuse to name brands. If you are unsure, say so and still list the best known options.",
    "",
    "Questions:",
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "For each question return the answer, every brand you named, and every URL you named.",
    "Return JSON only.",
  ].join("\n");
}

export function recommendationsPrompt(input: {
  brand: string;
  category: string;
  visibilityScore: number;
  failed: AuditResult["checks"];
}): string {
  const failed = input.failed
    .map((c) => `- ${c.id} | ${c.label} | ${c.detail} | hint: ${c.fixHint}`)
    .join("\n");

  return [
    "You write a prioritized AEO fix list.",
    "Only recommend fixes for the failed checks listed. Do not invent extra issues.",
    "Max 8 actions, sorted high then medium then low.",
    `Brand: ${input.brand}`,
    `Category: ${input.category}`,
    `Gemini mention rate: ${input.visibilityScore}%`,
    "",
    "Failed checks:",
    failed || "(none)",
    "",
    "Write a 2-sentence plain-English verdict in summary.",
    "Return JSON only.",
  ].join("\n");
}
