import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { getCholesterolStatus } from "@/lib/health";

export const runtime = "nodejs";

const schema = z.object({
  total: z.number().min(50).max(500).optional().nullable(),
  ldl: z.number().min(20).max(400).optional().nullable(),
  hdl: z.number().min(10).max(150).optional().nullable(),
  triglycerides: z.number().min(20).max(1000).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  measuredAt: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    const labs = await withDbTimeout(
      prisma.cholesterolLab.findMany({
        where: { userId: user.id },
        orderBy: { measuredAt: "desc" },
        take: 20,
      })
    );
    return NextResponse.json({ labs });
  } catch (error) {
    return dbErrorResponse("api/vitals/cholesterol GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos de laboratorio inválidos" }, { status: 400 });
    }
    if (
      parsed.data.total == null &&
      parsed.data.ldl == null &&
      parsed.data.hdl == null &&
      parsed.data.triglycerides == null
    ) {
      return NextResponse.json({ error: "Ingresá al menos un valor" }, { status: 400 });
    }

    const lab = await withDbTimeout(
      prisma.cholesterolLab.create({
        data: {
          userId: user.id,
          total: parsed.data.total ?? null,
          ldl: parsed.data.ldl ?? null,
          hdl: parsed.data.hdl ?? null,
          triglycerides: parsed.data.triglycerides ?? null,
          notes: parsed.data.notes ?? null,
          measuredAt: parsed.data.measuredAt ? new Date(parsed.data.measuredAt) : new Date(),
        },
      })
    );

    return NextResponse.json({
      lab,
      status: getCholesterolStatus(lab),
    });
  } catch (error) {
    return dbErrorResponse("api/vitals/cholesterol POST", error);
  }
}
