import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { z } from "zod";
import { GEMINI_MODEL, GEMINI_TIMEOUT_MS } from "./config";

let client: GoogleGenAI | null = null;

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function ai(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  if (!client) client = new GoogleGenAI({ apiKey: key });
  return client;
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|timeout|AbortError)\b/i.test(msg);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function generateJson<T>(
  prompt: string,
  schema: Schema,
  zodSchema: z.ZodType<T>,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await Promise.race([
        ai().models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), GEMINI_TIMEOUT_MS),
        ),
      ]);
      const text = response.text || "";
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        if (attempt === 0) {
          lastErr = new Error("Gemini returned non-JSON");
          continue;
        }
        throw new Error("Gemini returned non-JSON");
      }
      const checked = zodSchema.safeParse(parsed);
      if (checked.success) return checked.data;
      if (attempt === 0) {
        lastErr = checked.error;
        continue;
      }
      throw new Error("Gemini JSON failed validation");
    } catch (err) {
      lastErr = err;
      if (attempt < 2 && isRetryable(err)) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Gemini request failed");
}

export const brandExtractSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    brand: { type: Type.STRING },
    category: { type: Type.STRING },
    location: { type: Type.STRING, nullable: true },
    questions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["brand", "category", "location", "questions"],
};

export const visibilityAnswersSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    answers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          brandsMentioned: { type: Type.ARRAY, items: { type: Type.STRING } },
          urlsMentioned: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["question", "answer", "brandsMentioned", "urlsMentioned"],
      },
    },
  },
  required: ["answers"],
};

export const recommendationsGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
          title: { type: Type.STRING },
          why: { type: Type.STRING },
          how: { type: Type.STRING },
          effort: { type: Type.STRING, enum: ["quick", "moderate", "large"] },
        },
        required: ["priority", "title", "why", "how", "effort"],
      },
    },
  },
  required: ["summary", "actions"],
};
