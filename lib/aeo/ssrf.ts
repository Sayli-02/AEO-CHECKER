import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { FetchPageError } from "./types";

const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("::1", 128, "ipv6");
blocked.addSubnet("::", 128, "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");
blocked.addSubnet("ff00::", 8, "ipv6");

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.",
  "metadata.google.internal",
  "metadata.goog",
]);

export function isBlockedIp(ip: string): boolean {
  const mapped = ipv4Mapped(ip);
  if (mapped) return isBlockedIp(mapped);

  const version = isIP(ip);
  if (version === 4) return blocked.check(ip, "ipv4");
  if (version === 6) return blocked.check(ip, "ipv6");
  return true;
}

function ipv4Mapped(ip: string): string | null {
  const lower = ip.toLowerCase();
  if (lower.startsWith("::ffff:")) {
    const rest = lower.slice("::ffff:".length);
    return isIP(rest) === 4 ? rest : null;
  }
  return null;
}

export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) throw new FetchPageError("Enter a URL.", "invalid_url");

  let raw = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) raw = `https://${raw}`;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchPageError("That URL is not valid.", "invalid_url");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new FetchPageError("Only http and https URLs are allowed.", "invalid_url");
  }

  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new FetchPageError("Only ports 80 and 443 are allowed.", "ssrf");
  }

  return url;
}

export async function assertPublicUrl(url: URL): Promise<void> {
  const host = url.hostname.replace(/\.$/, "").toLowerCase();

  if (!host) throw new FetchPageError("That URL is not valid.", "invalid_url");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new FetchPageError("Private or local addresses are not allowed.", "ssrf");
  }

  if (isIP(host)) {
    if (isBlockedIp(host)) {
      throw new FetchPageError("Private or local addresses are not allowed.", "ssrf");
    }
    return;
  }

  let records: { address: string; family: number }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new FetchPageError("Could not resolve that hostname.", "network");
  }

  if (!records.length || records.some((r) => isBlockedIp(r.address))) {
    throw new FetchPageError("Private or local addresses are not allowed.", "ssrf");
  }
}
