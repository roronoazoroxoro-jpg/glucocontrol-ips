import { NextResponse } from "next/server";
import { getSessionUser, sanitizeUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();
  return NextResponse.json({ user: sanitizeUser(user) });
}
