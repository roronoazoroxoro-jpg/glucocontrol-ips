import { NextResponse } from "next/server";

export function dbErrorResponse(context: string, error: unknown) {
  console.error(`[${context}]`, error);
  const message =
    error instanceof Error ? error.message : "Error de base de datos";
  return NextResponse.json(
    { error: "No se pudo conectar con la base de datos", detail: message },
    { status: 503 }
  );
}
