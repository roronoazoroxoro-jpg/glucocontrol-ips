import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
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

    const readings = await withDbTimeout(
      prisma.glucoseReading.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    );

    return NextResponse.json({ readings, latest: readings[0] ?? null });
  } catch (error) {
    return dbErrorResponse("api/glucose", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { value, notes, source } = body;

    if (!value || value < 20 || value > 600) {
      return NextResponse.json(
        { error: "Valor de glucosa inválido (20-600 mg/dL)" },
        { status: 400 }
      );
    }

    const reading = await withDbTimeout(
      prisma.glucoseReading.create({
        data: {
          userId: user.id,
          value: Math.round(value),
          notes: notes ?? null,
          source: source ?? "manual",
        },
      })
    );

    return NextResponse.json({ reading });
  } catch (error) {
    return dbErrorResponse("api/glucose POST", error);
  }
}
