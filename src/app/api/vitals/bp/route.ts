import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { getBpStatus } from "@/lib/health";

export const runtime = "nodejs";

const schema = z.object({
  systolic: z.number().int().min(60).max(260),
  diastolic: z.number().int().min(30).max(160),
  pulse: z.number().int().min(30).max(220).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const readings = await withDbTimeout(
      prisma.bloodPressureReading.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    );

    return NextResponse.json({ readings });
  } catch (error) {
    return dbErrorResponse("api/vitals/bp GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos de presión inválidos" }, { status: 400 });
    }

    const reading = await withDbTimeout(
      prisma.bloodPressureReading.create({
        data: {
          userId: user.id,
          systolic: parsed.data.systolic,
          diastolic: parsed.data.diastolic,
          pulse: parsed.data.pulse ?? null,
          notes: parsed.data.notes ?? null,
        },
      })
    );

    const status = getBpStatus(reading.systolic, reading.diastolic);
    return NextResponse.json({ reading, status });
  } catch (error) {
    return dbErrorResponse("api/vitals/bp POST", error);
  }
}
