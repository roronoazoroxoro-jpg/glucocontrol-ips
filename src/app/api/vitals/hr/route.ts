import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { getHrStatus } from "@/lib/health";

export const runtime = "nodejs";

const schema = z.object({
  bpm: z.number().int().min(30).max(250),
  context: z.enum(["reposo", "ejercicio", "otro"]).default("reposo"),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    const limit = parseInt(new URL(request.url).searchParams.get("limit") ?? "50", 10);
    const readings = await withDbTimeout(
      prisma.heartRateReading.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    );
    return NextResponse.json({ readings });
  } catch (error) {
    return dbErrorResponse("api/vitals/hr GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Frecuencia cardíaca inválida" }, { status: 400 });
    }

    const reading = await withDbTimeout(
      prisma.heartRateReading.create({
        data: {
          userId: user.id,
          bpm: parsed.data.bpm,
          context: parsed.data.context,
          notes: parsed.data.notes ?? null,
        },
      })
    );

    return NextResponse.json({
      reading,
      status: getHrStatus(reading.bpm, reading.context),
    });
  } catch (error) {
    return dbErrorResponse("api/vitals/hr POST", error);
  }
}
