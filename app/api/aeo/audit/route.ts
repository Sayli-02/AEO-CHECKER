import { FetchPageError, AuditRequestSchema } from "@/lib/aeo/types";
import { clientIp, rateLimit } from "@/lib/aeo/rateLimit";
import { runAudit } from "@/lib/aeo/runAudit";
import { logAudit } from "@/lib/aeo/usageLog";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`audit:${ip}`, 12, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many checks from this network. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Send a JSON body with a url." }, { status: 400 });
  }

  const parsed = AuditRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Enter a URL to check." }, { status: 400 });
  }

  try {
    const result = await runAudit(parsed.data.url);
    logAudit(result.finalUrl, result.total, result.grade);
    return Response.json(result);
  } catch (err) {
    if (err instanceof FetchPageError) {
      const status = err.code === "ssrf" || err.code === "invalid_url" ? 400 : 502;
      return Response.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[aeo-audit]", err);
    return Response.json({ error: "The audit failed. Try another URL." }, { status: 500 });
  }
}
