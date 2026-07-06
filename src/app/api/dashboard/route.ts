import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { analyzeGlucose } from "@/lib/recommendations";
import { computeStats, getPeriodRange, type Period } from "@/lib/stats";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "day") as Period;
    const { start, end } = getPeriodRange(period);

    const readings = await withDbTimeout(
      prisma.glucoseReading.findMany({
        where: { userId: user.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "asc" },
      })
    );

    const meals = await withDbTimeout(
      prisma.mealEntry.findMany({
        where: { userId: user.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
      })
    );

    const latest = await withDbTimeout(
      prisma.glucoseReading.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    );

    const stats = computeStats(readings, meals, user.targetMin, user.targetMax);

    const recommendation = latest
      ? analyzeGlucose({
          glucose: latest.value,
          userName: user.name,
          diabetesType: user.diabetesType,
          targetMin: user.targetMin,
          targetMax: user.targetMax,
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
  } catch (error) {
    return dbErrorResponse("api/dashboard", error);
  }
}
