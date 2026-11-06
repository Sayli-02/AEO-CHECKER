import { clientIp, rateLimit } from "@/lib/aeo/rateLimit";
import { runVisibility } from "@/lib/aeo/runVisibility";
import { VisibilityRequestSchema } from "@/lib/aeo/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`full:${ip}`, 3, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: "This network already ran 3 full AI checks this hour." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const parsed = VisibilityRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "The visibility request was missing fields." }, { status: 400 });
  }

  try {
    const result = await runVisibility(parsed.data);
    return Response.json(result);
  } catch (err) {
    console.error("[aeo-visibility]", err);
    return Response.json(
      { error: "AI part unavailable, here is your audit.", aiUnavailable: true },
      { status: 503 },
    );
  }
}
