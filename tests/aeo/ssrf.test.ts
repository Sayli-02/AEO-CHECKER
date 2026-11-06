import { describe, expect, it } from "vitest";
import { assertPublicUrl, isBlockedIp, normalizeUrl } from "@/lib/aeo/ssrf";
import { FetchPageError } from "@/lib/aeo/types";

describe("normalizeUrl", () => {
  it("adds https when the scheme is missing", () => {
    expect(normalizeUrl("example.com/path").toString()).toBe("https://example.com/path");
  });

  it("rejects non-http schemes", () => {
    expect(() => normalizeUrl("file:///etc/passwd")).toThrow(FetchPageError);
  });
});

describe("isBlockedIp", () => {
  it("rejects loopback, private, and link-local addresses", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("10.1.2.3")).toBe(true);
    expect(isBlockedIp("172.16.4.4")).toBe(true);
    expect(isBlockedIp("192.168.0.9")).toBe(true);
    expect(isBlockedIp("169.254.169.254")).toBe(true);
    expect(isBlockedIp("::1")).toBe(true);
    expect(isBlockedIp("fc00::1")).toBe(true);
    expect(isBlockedIp("::ffff:127.0.0.1")).toBe(true);
  });

  it("allows public addresses", () => {
    expect(isBlockedIp("1.1.1.1")).toBe(false);
    expect(isBlockedIp("8.8.8.8")).toBe(false);
  });
});

describe("assertPublicUrl", () => {
  it("rejects localhost without DNS", async () => {
    await expect(assertPublicUrl(new URL("http://localhost/"))).rejects.toMatchObject({
      code: "ssrf",
    });
    await expect(assertPublicUrl(new URL("http://127.0.0.1/"))).rejects.toMatchObject({
      code: "ssrf",
    });
    await expect(assertPublicUrl(new URL("http://192.168.1.20/"))).rejects.toMatchObject({
      code: "ssrf",
    });
    await expect(assertPublicUrl(new URL("http://[::1]/"))).rejects.toMatchObject({
      code: "ssrf",
    });
  });
});
