"use client";

import { Activity, Droplets, HeartPulse, Scale, TriangleAlert } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { SYMPTOM_TYPES } from "@/lib/health";

interface HealthVitalsPanelProps {
  latestBp: { systolic: number; diastolic: number; pulse?: number | null; createdAt: string } | null;
  bpStatus: { label: string; alert: boolean; color: string } | null;
  latestWeight: { weightKg: number; createdAt: string } | null;
  bmi: number | null;
  bmiCategory: { label: string } | null;
  latestHr: { bpm: number; context: string; createdAt: string } | null;
  hrStatus: { label: string; alert: boolean } | null;
  latestChol: {
    total?: number | null;
    ldl?: number | null;
    hdl?: number | null;
    triglycerides?: number | null;
    measuredAt: string;
  } | null;
  cholStatus: { label: string; alert: boolean } | null;
  symptoms: { id: string; type: string; severity: number; createdAt: string }[];
}

export function HealthVitalsPanel({
  latestBp,
  bpStatus,
  latestWeight,
  bmi,
  bmiCategory,
  latestHr,
  hrStatus,
  latestChol,
  cholStatus,
  symptoms,
}: HealthVitalsPanelProps) {
  return (
    <div className="space-y-4 animate-fade-up">
      <h3 className="font-display font-semibold text-navy-900 text-base">Signos vitales y salud</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <VitalCard
          icon={Activity}
          title="Presión"
          value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "—"}
          unit={latestBp ? "mmHg" : undefined}
          sub={bpStatus?.label}
          alert={bpStatus?.alert}
          when={latestBp?.createdAt}
        />
        <VitalCard
          icon={Scale}
          title="Peso / IMC"
          value={latestWeight ? `${latestWeight.weightKg}` : "—"}
          unit={latestWeight ? "kg" : undefined}
          sub={bmi != null ? `IMC ${bmi} · ${bmiCategory?.label ?? ""}` : "Cargá altura en perfil"}
          when={latestWeight?.createdAt}
        />
        <VitalCard
          icon={HeartPulse}
          title="Pulso"
          value={latestHr ? String(latestHr.bpm) : "—"}
          unit={latestHr ? "bpm" : undefined}
          sub={hrStatus?.label}
          alert={hrStatus?.alert}
          when={latestHr?.createdAt}
        />
        <VitalCard
          icon={Droplets}
          title="Colesterol"
          value={
            latestChol
              ? String(latestChol.ldl ?? latestChol.total ?? "—")
              : "—"
          }
          unit={latestChol ? "mg/dL" : undefined}
          sub={cholStatus?.label ?? "Sin laboratorio"}
          alert={cholStatus?.alert}
          when={latestChol?.measuredAt}
        />
      </div>

      {symptoms.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-amber-600" />
            Síntomas recientes
          </h4>
          <div className="space-y-2">
            {symptoms.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm bg-white/70 rounded-lg px-3 py-2 border border-slate-100"
              >
                <span>
                  {SYMPTOM_TYPES.find((t) => t.id === s.type)?.label ?? s.type}
                  <span className="text-xs text-slate-400 ml-2">intensidad {s.severity}/5</span>
                </span>
                <span className="text-xs text-slate-400">{formatDate(s.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VitalCard({
  icon: Icon,
  title,
  value,
  unit,
  sub,
  alert,
  when,
}: {
  icon: typeof Activity;
  title: string;
  value: string;
  unit?: string;
  sub?: string;
  alert?: boolean;
  when?: string;
}) {
  return (
    <div className={cn("glass-card rounded-2xl p-4", alert && "ring-2 ring-red-200")}>
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className={cn("text-2xl font-bold", alert ? "text-red-600" : "text-slate-800")}>
        {value}
        {unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {when && <p className="text-[10px] text-slate-400 mt-1">{formatDate(when)}</p>}
    </div>
  );
}
