import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeGlucose } from "@/lib/recommendations";

export async function GET() {
  const user = await prisma.user.findFirst();
  const latest = await prisma.glucoseReading.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return NextResponse.json({
      recommendation: null,
      message: "Registra tu glucosa para obtener recomendaciones.",
    });
  }

  const recentMeals = await prisma.mealEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const recommendation = analyzeGlucose({
    glucose: latest.value,
    userName: user?.name ?? "Usuario",
    diabetesType: user?.diabetesType ?? "tipo2",
    targetMin: user?.targetMin ?? 70,
    targetMax: user?.targetMax ?? 140,
    recentMeals: recentMeals.map((m) => ({ name: m.name, carbs: m.carbs })),
  });

  return NextResponse.json({ recommendation, glucose: latest.value });
}
