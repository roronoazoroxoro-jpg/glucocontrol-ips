import { NextResponse } from "next/server";
import { enrichPhotoFromDetection } from "@/lib/food-photo-enrich";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  let body: { name?: string; items?: string[]; candidates?: string[]; mealType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const items = Array.isArray(body.items) ? body.items.map(String) : [];
  const candidates = Array.isArray(body.candidates) ? body.candidates.map(String) : [];
  const mealType = body.mealType ?? "comida";

  if (!name && items.length === 0 && candidates.length === 0) {
    return NextResponse.json({ error: "Faltan datos de la comida" }, { status: 400 });
  }

  const result = await enrichPhotoFromDetection(name, items, mealType, candidates);
  if (!result) {
    return NextResponse.json({ error: "No se pudo calcular la nutrición" }, { status: 422 });
  }

  return NextResponse.json({ result });
}
