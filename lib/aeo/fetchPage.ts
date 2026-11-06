import { FETCH_TIMEOUT_MS, MAX_BODY_BYTES, MAX_REDIRECTS, USER_AGENT } from "./config";
import { sitemapFromRobots } from "./robots";
import { assertPublicUrl, normalizeUrl } from "./ssrf";
import { FetchPageError, type FetchedSite } from "./types";

function headerMap(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

async function readLimited(res: Response, max = MAX_BODY_BYTES): Promise<string> {
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > max) throw new FetchPageError("Response is larger than 3 MB.", "too_large");

  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new FetchPageError("Response is larger than 3 MB.", "too_large");
    }
    chunks.push(value);
  }
  return new TextDecoder("utf-8").decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
}

async function fetchOnce(url: URL, method: "GET" | "HEAD" = "GET"): Promise<Response> {
  await assertPublicUrl(url);
  try {
    return await fetch(url, {
      method,
      redirect: "manual",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.1",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof FetchPageError) throw err;
    const name = err instanceof Error ? err.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      throw new FetchPageError("The site took too long to respond.", "timeout");
    }
    throw new FetchPageError("Could not fetch that URL.", "network");
  }
}

async function follow(start: URL): Promise<{ url: URL; res: Response }> {
  let current = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetchOnce(current);
    const status = res.status;
    if (status >= 300 && status < 400) {
      const location = res.headers.get("location");
      if (!location) return { url: current, res };
      if (i === MAX_REDIRECTS) {
        throw new FetchPageError("Too many redirects.", "network");
      }
      current = new URL(location, current);
      if (current.protocol !== "http:" && current.protocol !== "https:") {
        throw new FetchPageError("Redirected to a non-http URL.", "ssrf");
      }
      continue;
    }
    return { url: current, res };
  }
  throw new FetchPageError("Too many redirects.", "network");
}

async function fetchText(url: URL): Promise<{ status: number; text: string } | null> {
  try {
    const { res } = await follow(url);
    if (res.status >= 400) return { status: res.status, text: "" };
    return { status: res.status, text: await readLimited(res) };
  } catch {
    return null;
  }
}

export async function fetchPage(input: string): Promise<FetchedSite> {
  const start = normalizeUrl(input);
  const t0 = Date.now();
  const { url: finalUrl, res } = await follow(start);
  const html = await readLimited(res);
  const responseMs = Date.now() - t0;
  const origin = `${finalUrl.protocol}//${finalUrl.host}`;

  const [robots, llms, sitemap] = await Promise.all([
    fetchText(new URL("/robots.txt", origin)),
    fetchText(new URL("/llms.txt", origin)),
    fetchText(new URL("/sitemap.xml", origin)),
  ]);

  const robotsTxt = robots && robots.status < 400 && robots.text ? robots.text : null;
  const llmsTxt = llms && llms.status < 400 && llms.text ? llms.text : null;
  const sitemapListed = sitemapFromRobots(robotsTxt).length > 0;
  const sitemapFound = Boolean(sitemap && sitemap.status < 400 && sitemap.text.includes("<")) || sitemapListed;

  return {
    url: start.toString(),
    finalUrl: finalUrl.toString(),
    status: res.status,
    html,
    headers: headerMap(res.headers),
    robotsTxt,
    llmsTxt,
    sitemapFound,
    responseMs,
  };
}
