import { NextResponse } from "next/server";
import { analyzeFoodPhoto } from "@/lib/nutrition-vision";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const image = body.image;
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }

  // ~7MB de data URL como tope de seguridad
  if (image.length > 7_500_000) {
    return NextResponse.json(
      { error: "La imagen es muy grande. Probá con una foto más liviana." },
      { status: 413 }
    );
  }

  const analysis = await analyzeFoodPhoto(image);

  if (!analysis.ok) {
    const status = analysis.reason === "no_key" ? 200 : analysis.reason === "no_food" ? 422 : 502;
    return NextResponse.json(
      { error: analysis.message, reason: analysis.reason },
      { status }
    );
  }

  return NextResponse.json({ result: analysis.result });
}
