type Event = { at: string; domain: string; score: number; grade: string };

const events: Event[] = [];

export function logAudit(url: string, score: number, grade: string): void {
  let domain = url;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* keep raw */
  }
  const event = { at: new Date().toISOString(), domain, score, grade };
  events.push(event);
  if (events.length > 500) events.shift();
  console.info("[aeo-usage]", JSON.stringify(event));
}

export function recentUsage(): Event[] {
  return [...events];
}
