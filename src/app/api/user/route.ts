import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { DEFAULT_REMINDERS } from "@/lib/reminders";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await withDbTimeout(prisma.user.findFirst());
    return NextResponse.json({ user });
  } catch (error) {
    return dbErrorResponse("api/user GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
  const {
    name,
    diabetesType,
    targetMin,
    targetMax,
    doctorName,
    medications,
    mealTimes,
    glucoseIntervalHours,
    notificationsEnabled,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst();

  const data = {
    name: name.trim(),
    diabetesType: diabetesType ?? "tipo2",
    targetMin: targetMin ?? 70,
    targetMax: targetMax ?? 140,
    doctorName: doctorName?.trim() || null,
    medications: medications ? JSON.stringify(medications) : undefined,
    mealTimes: mealTimes ? JSON.stringify(mealTimes) : undefined,
    glucoseIntervalHours: glucoseIntervalHours ?? 4,
    notificationsEnabled: notificationsEnabled ?? true,
  };

  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data })
    : await prisma.user.create({
        data: {
          ...data,
          mealTimes: JSON.stringify(mealTimes ?? DEFAULT_REMINDERS.mealTimes),
          medications: JSON.stringify(medications ?? []),
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
        {
          name: "Avena con frutas",
          type: "desayuno",
          carbs: 40,
          sugar: 18,
          fat: 4,
          protein: 7,
          calories: 220,
          autoAnalyzed: true,
          nutritionSource: "local",
          createdAt: new Date(now - 3600000 * 3),
        },
        {
          name: "Agua",
          type: "bebida",
          carbs: 0,
          sugar: 0,
          fat: 0,
          calories: 0,
          autoAnalyzed: true,
          nutritionSource: "local",
          createdAt: new Date(now - 3600000 * 2),
        },
        {
          name: "Ensalada con pollo",
          type: "comida",
          carbs: 10,
          sugar: 5,
          fat: 12,
          protein: 28,
          calories: 250,
          autoAnalyzed: true,
          nutritionSource: "local",
          createdAt: new Date(now - 3600000),
        },
      ],
    });
  }

  return NextResponse.json({ user });
  } catch (error) {
    return dbErrorResponse("api/user POST", error);
  }
}
