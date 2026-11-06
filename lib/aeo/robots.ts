type RobotsGroup = {
  agents: string[];
  rules: { allow: boolean; path: string }[];
};

export function parseRobots(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let collectingAgents = true;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === "user-agent") {
      if (!current || !collectingAgents) {
        current = { agents: [], rules: [] };
        groups.push(current);
        collectingAgents = true;
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (!current) continue;
    if (field === "allow" || field === "disallow") {
      collectingAgents = false;
      current.rules.push({ allow: field === "allow", path: value });
    }
  }

  return groups;
}

function ruleApplies(rulePath: string, path: string): boolean {
  if (rulePath === "") return false;
  const prefix = rulePath.endsWith("*") ? rulePath.slice(0, -1) : rulePath;
  return path.startsWith(prefix);
}

function decide(rules: RobotsGroup["rules"], path: string): boolean {
  let best: { allow: boolean; length: number } | null = null;
  for (const rule of rules) {
    if (!ruleApplies(rule.path, path)) continue;
    const length = rule.path.length;
    if (!best || length > best.length) best = { allow: rule.allow, length };
  }
  return best ? best.allow : true;
}

export function isBotAllowed(robotsTxt: string | null, bot: string, path = "/"): boolean {
  if (!robotsTxt) return true;

  const groups = parseRobots(robotsTxt);
  const name = bot.toLowerCase();
  const specific = groups.filter((g) => g.agents.includes(name));
  const applicable = specific.length ? specific : groups.filter((g) => g.agents.includes("*"));
  if (!applicable.length) return true;

  return applicable.every((group) => decide(group.rules, path || "/"));
}

export function sitemapFromRobots(robotsTxt: string | null): string[] {
  if (!robotsTxt) return [];
  const out: string[] = [];
  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (/^sitemap:/i.test(line)) out.push(line.slice(line.indexOf(":") + 1).trim());
  }
  return out;
}
