import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await prisma.user.findFirst();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, diabetesType, targetMin, targetMax } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst();

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          diabetesType: diabetesType ?? "tipo2",
          targetMin: targetMin ?? 70,
          targetMax: targetMax ?? 140,
        },
      })
    : await prisma.user.create({
        data: {
          name: name.trim(),
          diabetesType: diabetesType ?? "tipo2",
          targetMin: targetMin ?? 70,
          targetMax: targetMax ?? 140,
        },
      });

  if (!existing) {
    const now = Date.now();
    await prisma.glucoseReading.createMany({
      data: [
        { value: 118, source: "manual", createdAt: new Date(now - 3600000 * 2) },
        { value: 132, source: "manual", createdAt: new Date(now - 3600000) },
        { value: 105, source: "manual", createdAt: new Date(now - 1800000) },
      ],
    });
    await prisma.mealEntry.createMany({
      data: [
        { name: "Avena con frutas", type: "desayuno", carbs: 35, createdAt: new Date(now - 3600000 * 3) },
        { name: "Agua", type: "bebida", carbs: 0, createdAt: new Date(now - 3600000 * 2) },
        { name: "Ensalada con pollo", type: "comida", carbs: 18, createdAt: new Date(now - 3600000) },
      ],
    });
  }

  return NextResponse.json({ user });
}
