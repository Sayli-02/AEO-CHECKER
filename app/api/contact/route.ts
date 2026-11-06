import { z } from "zod";
import { NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/aeo/rateLimit";

const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().max(200),
  url: z.string().max(2048).optional(),
  message: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  const limit = rateLimit(`contact:${clientIp(req.headers)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Check your name, email, and message." }, { status: 400 });
  }

  console.info("[aeo-lead]", JSON.stringify({ at: new Date().toISOString(), ...parsed.data }));
  return Response.json({ ok: true });
}
