import { NextResponse } from "next/server";
import { generateVoiceGreeting } from "@/lib/ai";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();
  const greeting = await generateVoiceGreeting(user.id);
  return NextResponse.json({ greeting });
}
