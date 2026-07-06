import { NextResponse } from "next/server";
import { analyzeNutrition } from "@/lib/nutrition";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const { name, type } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const nutrition = await analyzeNutrition(name.trim(), type ?? "comida");
  return NextResponse.json({ nutrition });
}
