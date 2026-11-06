import type { CheckResult, ParsedPage } from "../types";
import { scored } from "./helpers";

function hierarchyOk(headings: ParsedPage["headings"]): boolean {
  let prev = 0;
  for (const h of headings) {
    if (prev > 0 && h.level > prev + 1) return false;
    prev = h.level;
  }
  return headings.length > 0;
}

export function checkContent(page: ParsedPage): CheckResult[] {
  const h1 = scored(
    "content-h1",
    "content",
    "Exactly one H1",
    page.h1s.length === 1 ? 4 : 0,
    4,
    page.h1s.length === 1 ? `H1: ${page.h1s[0]}` : `Found ${page.h1s.length} H1 tags`,
    "Use a single H1 that states the page topic as a person would ask it.",
  );

  const h2h3 = page.headings.filter((h) => h.level === 2 || h.level === 3);
  const hierarchy = scored(
    "content-hierarchy",
    "content",
    "Logical H2 / H3 hierarchy",
    hierarchyOk(page.headings) && h2h3.length >= 2 ? 4 : hierarchyOk(page.headings) ? 2 : 0,
    4,
    hierarchyOk(page.headings)
      ? `${h2h3.length} H2/H3 headings, no skipped levels`
      : "Heading levels skip (for example H2 to H4) or headings are missing",
    "Nest headings in order. Follow H1 with H2s, then H3s. Do not skip a level.",
  );

  const questions = scored(
    "content-questions",
    "content",
    "Question-style headings",
    page.questionHeadings.length >= 2 ? 5 : page.questionHeadings.length === 1 ? 2 : 0,
    5,
    page.questionHeadings.length
      ? `${page.questionHeadings.length} question heading(s): ${page.questionHeadings.slice(0, 3).join("; ")}`
      : "No headings phrased as questions",
    'Phrase H2s as questions a buyer would ask, such as "What is …" or "How to …".',
  );

  const direct = page.paragraphsAfterHeadings.filter((p) => p.words >= 40 && p.words <= 60);
  const nearby = page.paragraphsAfterHeadings.filter((p) => p.words >= 30 && p.words <= 80);
  const answer = scored(
    "content-direct-answer",
    "content",
    "Short direct answer after a heading",
    direct.length >= 1 ? 5 : nearby.length >= 1 ? 2 : 0,
    5,
    direct.length
      ? `${direct.length} heading(s) followed by a 40 to 60 word answer`
      : nearby.length
        ? "Found nearby answers, but not in the 40 to 60 word band"
        : "No short paragraph sitting directly after a heading",
    "Put a 40 to 60 word self-contained answer in the first paragraph after each question heading.",
  );

  const lists = scored(
    "content-lists",
    "content",
    "Lists or tables present",
    page.hasList || page.hasTable ? 3 : 0,
    3,
    page.hasList && page.hasTable
      ? "Page includes lists and a table"
      : page.hasList
        ? "Page includes a list"
        : page.hasTable
          ? "Page includes a table"
          : "No ul, ol, or table elements",
    "Add a bullet list or a table for steps, comparisons, or facts that models can quote.",
  );

  const words = scored(
    "content-word-count",
    "content",
    "At least 300 words of visible text",
    page.wordCount >= 300 ? 4 : page.wordCount >= 150 ? 2 : 0,
    4,
    `${page.wordCount} visible words`,
    "Write at least 300 words of useful, specific page copy in the HTML, not only in JavaScript.",
  );

  return [h1, hierarchy, questions, answer, lists, words];
}
