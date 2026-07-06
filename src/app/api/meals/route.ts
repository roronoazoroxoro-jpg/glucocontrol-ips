import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { analyzeNutrition } from "@/lib/nutrition";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: { userId: string; createdAt?: { gte: Date; lte: Date } } = {
      userId: user.id,
    };
    if (from && to) {
      where.createdAt = { gte: new Date(from), lte: new Date(to) };
    }

    const meals = await withDbTimeout(
      prisma.mealEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    );

    return NextResponse.json({ meals });
  } catch (error) {
    return dbErrorResponse("api/meals", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { name, type, notes, skipAnalysis } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    let nutrition = null;
    if (!skipAnalysis) {
      nutrition = await analyzeNutrition(name.trim(), type ?? "comida");
    }

    const meal = await withDbTimeout(
      prisma.mealEntry.create({
        data: {
          userId: user.id,
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
      })
    );

    return NextResponse.json({ meal, nutrition });
  } catch (error) {
    return dbErrorResponse("api/meals POST", error);
  }
}
