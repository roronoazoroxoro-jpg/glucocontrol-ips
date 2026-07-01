import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeNutrition } from "@/lib/nutrition";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where =
    from && to
      ? { createdAt: { gte: new Date(from), lte: new Date(to) } }
      : undefined;

  const meals = await prisma.mealEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ meals });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, notes, skipAnalysis } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  let nutrition = null;
  if (!skipAnalysis) {
    nutrition = await analyzeNutrition(name.trim(), type ?? "comida");
  }

  const meal = await prisma.mealEntry.create({
    data: {
      name: name.trim(),
      type: type ?? "comida",
      carbs: nutrition?.carbs ?? body.carbs ?? 0,
      sugar: nutrition?.sugar ?? null,
      fat: nutrition?.fat ?? null,
      saturatedFat: nutrition?.saturatedFat ?? null,
      protein: nutrition?.protein ?? null,
      fiber: nutrition?.fiber ?? null,
      sodium: nutrition?.sodium ?? null,
      calories: nutrition?.calories ?? null,
      servingSize: nutrition?.servingSize ?? null,
      autoAnalyzed: !!nutrition,
      nutritionSource: nutrition?.source ?? null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ meal, nutrition });
}
