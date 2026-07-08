import { NextResponse } from "next/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getStaffUser, staffUnauthorizedResponse, computeStats } from "@/lib/admin";
import { parseMedications } from "@/lib/reminders";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getStaffUser();
    if (!staff) return staffUnauthorizedResponse();

    const { id } = await params;
    const patient = await withDbTimeout(
      prisma.user.findFirst({ where: { id, role: "patient" } })
    );
    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    const [readings, meals] = await Promise.all([
      withDbTimeout(
        prisma.glucoseReading.findMany({
          where: { userId: patient.id },
          orderBy: { createdAt: "desc" },
          take: 60,
        })
      ),
      withDbTimeout(
        prisma.mealEntry.findMany({
          where: { userId: patient.id },
          orderBy: { createdAt: "desc" },
          take: 40,
        })
      ),
    ]);

    const stats = computeStats(readings, meals, patient.targetMin, patient.targetMax);
    const meds = parseMedications(patient.medications);
    const generated = format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es });

    const html = `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8"/>
  <title>Informe médico — ${patient.name}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; color: #0f172a; }
    h1 { color: #1e5a9e; font-size: 1.4rem; }
    h2 { font-size: 1rem; margin-top: 1.5rem; color: #334155; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin: 1rem 0; }
    .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; }
    .box p { margin: 0; }
    .box .v { font-size: 1.25rem; font-weight: bold; }
    .box .l { font-size: 0.75rem; color: #64748b; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin-top: 0.5rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
    th { background: #eff6ff; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>GlucoControl IPS — Informe médico</h1>
  <p><strong>Paciente:</strong> ${patient.name}<br/>
  <strong>Email:</strong> ${patient.email}<br/>
  <strong>Tipo diabetes:</strong> ${patient.diabetesType}<br/>
  <strong>Rango objetivo:</strong> ${patient.targetMin}–${patient.targetMax} mg/dL<br/>
  <strong>Médico asignado:</strong> ${patient.doctorName ?? "No registrado"}<br/>
  <strong>Informe generado por:</strong> ${staff.name} (${staff.role})<br/>
  <strong>Fecha:</strong> ${generated}</p>

  <div class="grid">
    <div class="box"><p class="v">${stats.avgGlucose ?? "—"}</p><p class="l">Promedio mg/dL</p></div>
    <div class="box"><p class="v">${stats.minGlucose ?? "—"} / ${stats.maxGlucose ?? "—"}</p><p class="l">Mín / Máx</p></div>
    <div class="box"><p class="v">${stats.inRangePercent ?? "—"}%</p><p class="l">En rango</p></div>
    <div class="box"><p class="v">${stats.totalMeals}</p><p class="l">Comidas</p></div>
  </div>

  <h2>Glucosa reciente (mg/dL)</h2>
  <table>
    <tr><th>Fecha</th><th>Valor</th><th>Notas</th></tr>
    ${readings.map((r) => `<tr><td>${format(r.createdAt, "dd/MM/yyyy HH:mm")}</td><td>${r.value}</td><td>${r.notes ?? "—"}</td></tr>`).join("") || "<tr><td colspan='3'>Sin registros</td></tr>"}
  </table>

  <h2>Comidas y bebidas</h2>
  <table>
    <tr><th>Fecha</th><th>Alimento</th><th>Tipo</th><th>Carbs (g)</th><th>Calorías</th></tr>
    ${meals.map((m) => `<tr><td>${format(m.createdAt, "dd/MM/yyyy HH:mm")}</td><td>${m.name}</td><td>${m.type}</td><td>${m.carbs}</td><td>${m.calories ?? "—"}</td></tr>`).join("") || "<tr><td colspan='5'>Sin registros</td></tr>"}
  </table>

  ${meds.length ? `<h2>Medicación</h2><ul>${meds.map((m) => `<li>${m.name} — ${m.times.join(", ")}</li>`).join("")}</ul>` : ""}

  <p class="footer">
    Instituto de Previsión Social de Misiones — Posadas. Documento clínico interno.<br/>
    Uso exclusivo del personal médico autorizado.
  </p>
  <button onclick="window.print()">Imprimir / Guardar PDF</button>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return dbErrorResponse("api/admin/patients/[id]/export", error);
  }
}
