import { NextResponse } from "next/server";
import { generateVoiceGreeting } from "@/lib/ai";

export async function GET() {
  const greeting = await generateVoiceGreeting();
  return NextResponse.json({ greeting });
}
