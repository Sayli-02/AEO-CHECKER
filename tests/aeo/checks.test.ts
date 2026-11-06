import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runChecks } from "@/lib/aeo/checks";
import { parsePage } from "@/lib/aeo/parsePage";
import { scoreChecks } from "@/lib/aeo/score";
import type { FetchedSite } from "@/lib/aeo/types";

const dir = dirname(fileURLToPath(import.meta.url));

function site(html: string, extra: Partial<FetchedSite> = {}): FetchedSite {
  return {
    url: "https://northline.example/aeo",
    finalUrl: "https://northline.example/aeo",
    status: 200,
    html,
    headers: {},
    robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://northline.example/sitemap.xml\n",
    llmsTxt: "# Northline\n\n- [Docs](https://northline.example/docs)\n",
    sitemapFound: true,
    responseMs: 120,
    ...extra,
  };
}

describe("audit checks", () => {
  it("scores a complete page well", () => {
    const html = readFileSync(join(dir, "../fixtures/good.html"), "utf8");
    const fetched = site(html);
    const page = parsePage(fetched);
    const checks = runChecks(fetched, page);
    const result = scoreChecks(checks, {
      url: fetched.url,
      finalUrl: fetched.finalUrl,
      responseMs: fetched.responseMs,
    });
    expect(result.total).toBeGreaterThanOrEqual(85);
    expect(result.grade).toBe("A");
    expect(checks.find((c) => c.id === "content-h1")?.passed).toBe(true);
    expect(checks.find((c) => c.id === "schema-jsonld")?.passed).toBe(true);
  });

  it("fails a thin noindex page", () => {
    const html = readFileSync(join(dir, "../fixtures/bad.html"), "utf8");
    const fetched = site(html, { robotsTxt: null, llmsTxt: null, sitemapFound: false });
    const checks = runChecks(fetched, parsePage(fetched));
    expect(checks.find((c) => c.id === "crawler-indexable")?.passed).toBe(false);
    expect(checks.find((c) => c.id === "content-h1")?.passed).toBe(false);
    expect(checks.find((c) => c.id === "schema-jsonld")?.passed).toBe(false);
    expect(scoreChecks(checks, { url: fetched.url, finalUrl: fetched.finalUrl, responseMs: 90 }).total).toBeLessThan(50);
  });

  it("detects a JS-only shell", () => {
    const html = readFileSync(join(dir, "../fixtures/js-shell.html"), "utf8");
    const fetched = site(html, { llmsTxt: null });
    const checks = runChecks(fetched, parsePage(fetched));
    expect(checks.find((c) => c.id === "tech-server-html")?.passed).toBe(false);
    expect(checks.find((c) => c.id === "content-word-count")?.passed).toBe(false);
  });
});
