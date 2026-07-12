import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { bmiCategory, computeBMI } from "@/lib/health";

export const runtime = "nodejs";

const schema = z.object({
  weightKg: z.number().min(20).max(400),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const entries = await withDbTimeout(
      prisma.weightEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    );

    const latest = entries[0] ?? null;
    const bmi = latest && user.heightCm ? computeBMI(latest.weightKg, user.heightCm) : null;

    return NextResponse.json({
      entries,
      heightCm: user.heightCm,
      bmi,
      bmiCategory: bmi != null ? bmiCategory(bmi) : null,
    });
  } catch (error) {
    return dbErrorResponse("api/vitals/weight GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Peso inválido" }, { status: 400 });
    }

    const entry = await withDbTimeout(
      prisma.weightEntry.create({
        data: {
          userId: user.id,
          weightKg: parsed.data.weightKg,
          notes: parsed.data.notes ?? null,
        },
      })
    );

    const bmi = user.heightCm ? computeBMI(entry.weightKg, user.heightCm) : null;
    return NextResponse.json({
      entry,
      bmi,
      bmiCategory: bmi != null ? bmiCategory(bmi) : null,
    });
  } catch (error) {
    return dbErrorResponse("api/vitals/weight POST", error);
  }
}
