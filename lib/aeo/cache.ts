type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();
const DAY_MS = 24 * 60 * 60 * 1000;

// shortcut: in-memory Map is per-instance on serverless, swap to Redis or Vercel KV when deploying
export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DAY_MS): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheKey(url: string, brand?: string): string {
  const normalized = url.replace(/\/$/, "").toLowerCase();
  return `vis:${normalized}:${(brand || "").trim().toLowerCase()}`;
}

export type PageSummary = {
  title: string;
  description: string;
  headings: string[];
  text: string;
  finalUrl: string;
};

export function pageSummaryKey(url: string): string {
  return `page:${url.replace(/\/$/, "").toLowerCase()}`;
}
