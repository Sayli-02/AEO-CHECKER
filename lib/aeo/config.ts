export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const USER_AGENT = `AEOCheckerBot/1.0 (+${SITE_URL}/aeo-checker)`;

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_BODY_BYTES = 3 * 1024 * 1024;
export const MAX_REDIRECTS = 5;
export const GEMINI_TIMEOUT_MS = 20_000;

export const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

export type AiBot = (typeof AI_BOTS)[number];
