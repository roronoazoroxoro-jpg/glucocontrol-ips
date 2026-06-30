import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  const { name, type, carbs, calories, notes } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const meal = await prisma.mealEntry.create({
    data: {
      name: name.trim(),
      type: type ?? "comida",
      carbs: carbs ?? 0,
      calories: calories ?? null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ meal });
}
