import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { analyzeGlucose } from "@/lib/recommendations";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const latest = await withDbTimeout(
      prisma.glucoseReading.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    );

    if (!latest) {
      return NextResponse.json({
        recommendation: null,
        message: "Registra tu glucosa para obtener recomendaciones.",
      });
    }

    const recentMeals = await withDbTimeout(
      prisma.mealEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      })
    );

    const recommendation = analyzeGlucose({
      glucose: latest.value,
      userName: user.name,
      diabetesType: user.diabetesType,
      targetMin: user.targetMin,
      targetMax: user.targetMax,
      recentMeals: recentMeals.map((m) => ({ name: m.name, carbs: m.carbs })),
    });

    return NextResponse.json({ recommendation, glucose: latest.value });
  } catch (error) {
    return dbErrorResponse("api/recommendations", error);
  }
}
