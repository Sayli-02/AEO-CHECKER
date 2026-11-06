import { describe, expect, it } from "vitest";
import { isBotAllowed } from "@/lib/aeo/robots";

const wildcardBlock = `User-agent: *\nDisallow: /\n`;

const gptAllowed = `User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n`;

const gptBlocked = `User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n`;

describe("isBotAllowed", () => {
  it("allows every bot when robots.txt is missing", () => {
    expect(isBotAllowed(null, "GPTBot")).toBe(true);
  });

  it("honors a wildcard disallow", () => {
    expect(isBotAllowed(wildcardBlock, "GPTBot")).toBe(false);
    expect(isBotAllowed(wildcardBlock, "ClaudeBot")).toBe(false);
  });

  it("lets a specific Allow override a wildcard block", () => {
    expect(isBotAllowed(gptAllowed, "GPTBot")).toBe(true);
    expect(isBotAllowed(gptAllowed, "ClaudeBot")).toBe(false);
  });

  it("honors a specific disallow even when * allows", () => {
    expect(isBotAllowed(gptBlocked, "GPTBot")).toBe(false);
    expect(isBotAllowed(gptBlocked, "ClaudeBot")).toBe(true);
  });
});
