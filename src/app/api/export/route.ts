import { NextResponse } from "next/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { parseMedications } from "@/lib/reminders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const fmt = searchParams.get("format") ?? "json";

    const [readings, meals] = await Promise.all([
      withDbTimeout(
        prisma.glucoseReading.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      ),
      withDbTimeout(
        prisma.mealEntry.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      ),
    ]);

    const meds = parseMedications(user.medications);
    const generated = format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es });

    if (fmt === "html") {
      const html = `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8"/>
  <title>Informe VitalIPS — ${user.name}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #0f172a; }
    h1 { color: #047857; font-size: 1.4rem; }
    h2 { font-size: 1rem; margin-top: 1.5rem; color: #334155; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin-top: 0.5rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
    th { background: #f0fdf4; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>VitalIPS — Informe de salud</h1>
  <p><strong>Paciente:</strong> ${user.name}<br/>
  <strong>Email:</strong> ${user.email}<br/>
  <strong>Tipo diabetes:</strong> ${user.diabetesType}<br/>
  <strong>Médico:</strong> ${user.doctorName ?? "No registrado"}<br/>
  <strong>Generado:</strong> ${generated}</p>

  <h2>Glucosa reciente (mg/dL)</h2>
  <table>
    <tr><th>Fecha</th><th>Valor</th><th>Notas</th></tr>
    ${readings.map((r) => `<tr><td>${format(r.createdAt, "dd/MM/yyyy HH:mm")}</td><td>${r.value}</td><td>${r.notes ?? "—"}</td></tr>`).join("") || "<tr><td colspan='3'>Sin registros</td></tr>"}
  </table>

  <h2>Comidas recientes</h2>
  <table>
    <tr><th>Fecha</th><th>Alimento</th><th>Carbs (g)</th><th>Calorías</th></tr>
    ${meals.map((m) => `<tr><td>${format(m.createdAt, "dd/MM/yyyy HH:mm")}</td><td>${m.name}</td><td>${m.carbs}</td><td>${m.calories ?? "—"}</td></tr>`).join("") || "<tr><td colspan='4'>Sin registros</td></tr>"}
  </table>

  ${meds.length ? `<h2>Medicación</h2><ul>${meds.map((m) => `<li>${m.name} — ${m.times.join(", ")}</li>`).join("")}</ul>` : ""}

  <p class="footer">
    ⚕️ Este informe es orientativo. Instituto de Previsión Social de Misiones — Posadas.<br/>
    Consulte siempre con su médico asignado antes de modificar tratamiento o alimentación.
  </p>
  <button onclick="window.print()">Imprimir / Guardar PDF</button>
</body>
</html>`;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      user: { name: user.name, email: user.email, diabetesType: user.diabetesType },
      readings,
      meals,
      medications: meds,
    });
  } catch (error) {
    return dbErrorResponse("api/export", error);
  }
}
