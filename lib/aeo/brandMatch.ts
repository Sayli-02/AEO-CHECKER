function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function brandTerms(brand: string, domain: string): string[] {
  const terms = new Set<string>();
  const b = normalize(brand);
  if (b) terms.add(b);
  const compact = b.replace(/\s+/g, "");
  if (compact.length >= 3) terms.add(compact);
  try {
    const host = new URL(domain.startsWith("http") ? domain : `https://${domain}`).hostname
      .replace(/^www\./, "")
      .split(".")[0];
    const h = normalize(host);
    if (h.length >= 3) terms.add(h);
  } catch {
    /* ignore */
  }
  return [...terms];
}

export function textMentionsBrand(text: string, terms: string[]): boolean {
  const n = normalize(text);
  const compact = n.replace(/\s+/g, "");
  return terms.some((term) => {
    if (term.length < 3) return false;
    if (term.includes(" ")) return n.includes(term);
    return new RegExp(`(?:^| )${term}(?: |$)`).test(n) || compact.includes(term);
  });
}

export function domainCited(urls: string[], pageUrl: string): boolean {
  let host = "";
  try {
    host = new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return false;
  }
  if (!host) return false;
  return urls.some((u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, "").toLowerCase() === host;
    } catch {
      return u.toLowerCase().includes(host);
    }
  });
}
