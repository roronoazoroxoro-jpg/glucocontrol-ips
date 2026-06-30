import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeGlucose } from "@/lib/recommendations";
import { computeStats, getPeriodRange, type Period } from "@/lib/stats";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "day") as Period;

  const user = await prisma.user.findFirst();
  const { start, end } = getPeriodRange(period);

  const readings = await prisma.glucoseReading.findMany({
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "asc" },
  });

  const meals = await prisma.mealEntry.findMany({
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
  });

  const latest = await prisma.glucoseReading.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const stats = computeStats(
    readings,
    meals,
    user?.targetMin ?? 70,
    user?.targetMax ?? 140
  );

  const recommendation = latest
    ? analyzeGlucose({
        glucose: latest.value,
        userName: user?.name ?? "Usuario",
        diabetesType: user?.diabetesType ?? "tipo2",
        targetMin: user?.targetMin ?? 70,
        targetMax: user?.targetMax ?? 140,
        recentMeals: meals.slice(0, 3).map((m) => ({ name: m.name, carbs: m.carbs })),
      })
    : null;

  return NextResponse.json({
    period,
    start: start.toISOString(),
    end: end.toISOString(),
    readings,
    meals,
    latest,
    stats,
    recommendation,
  });
}
