"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity,
  Calendar,
  ChevronRight,
  Droplets,
  HeartPulse,
  Scale,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { GlucoseAnalysis } from "@/lib/recommendations";
import { cn, formatDate } from "@/lib/utils";

interface HomeDashboardProps {
  userName: string;
  doctorName?: string | null;
  latestGlucose: number | null;
  glucoseAt?: string | null;
  recommendation: GlucoseAnalysis | null;
  latestBp: { systolic: number; diastolic: number; createdAt: string } | null;
  bpStatus: { label: string; alert: boolean } | null;
  latestWeight: { weightKg: number; createdAt: string } | null;
  weights: { weightKg: number; createdAt: string }[];
  bmi: number | null;
  bmiCategory?: { label: string } | null;
  onOpenGlucose: () => void;
  onOpenVitals: () => void;
  onOpenProfile: () => void;
}

function timeLabel(iso?: string | null) {
  if (!iso) return "Sin registro";
  try {
    return format(new Date(iso), "d MMM · HH:mm", { locale: es });
  } catch {
    return formatDate(iso);
  }
}

export function HomeDashboard({
  userName,
  doctorName,
  latestGlucose,
  glucoseAt,
  recommendation,
  latestBp,
  bpStatus,
  latestWeight,
  weights,
  bmi,
  bmiCategory,
  onOpenGlucose,
  onOpenVitals,
  onOpenProfile,
}: HomeDashboardProps) {
  const firstName = userName.trim().split(/\s+/)[0] || userName;
  const glucoseOk = recommendation?.status === "normal";
  const bpOk = bpStatus && !bpStatus.alert;

  const weightSeries = [...weights]
    .slice(-8)
    .map((w) => ({
      v: w.weightKg,
      t: format(new Date(w.createdAt), "d/M", { locale: es }),
    }));

  return (
    <div className="space-y-5 animate-fade-up max-w-lg mx-auto w-full">
      <div className="pt-1">
        <h2 className="font-display text-[1.85rem] leading-tight font-semibold text-navy-900">
          Hola, {firstName}
        </h2>
        <p className="text-teal-700/90 text-[15px] mt-1 font-medium">
          Así va tu salud hoy
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenGlucose}
        className="w-full text-left rounded-[1.35rem] bg-gradient-to-br from-[#063a5c] via-[#0b4f8c] to-[#0a6b6b] p-5 text-white shadow-xl shadow-navy-900/20 touch-manipulation active:scale-[0.99] transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-teal-200" />
            </span>
            <div>
              <p className="text-sm text-teal-100/90 font-medium">Glucosa</p>
              <p className="text-[11px] text-white/50">mg/dL</p>
            </div>
          </div>
          {recommendation && (
            <span
              className={cn(
                "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                glucoseOk
                  ? "bg-teal-300/25 text-teal-100"
                  : recommendation.urgency === "emergency"
                    ? "bg-red-400/30 text-red-100"
                    : "bg-amber-300/25 text-amber-100"
              )}
            >
              {recommendation.label}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <p className="font-display text-5xl font-semibold tabular-nums tracking-tight">
            {latestGlucose ?? "—"}
          </p>
          <p className="text-[11px] text-white/55 pb-1">{timeLabel(glucoseAt)}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onOpenVitals}
        className="w-full text-left rounded-[1.35rem] bg-gradient-to-br from-[#072f4a] via-[#0a4578] to-[#0f6e6a] p-5 text-white shadow-xl shadow-navy-900/15 touch-manipulation active:scale-[0.99] transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-teal-200" />
            </span>
            <div>
              <p className="text-sm text-teal-100/90 font-medium">Presión arterial</p>
              <p className="text-[11px] text-white/50">mmHg</p>
            </div>
          </div>
          {bpStatus && (
            <span
              className={cn(
                "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                bpOk ? "bg-teal-300/25 text-teal-100" : "bg-amber-300/25 text-amber-100"
              )}
            >
              {bpStatus.label}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <p className="font-display text-4xl md:text-5xl font-semibold tabular-nums tracking-tight">
            {latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "—"}
          </p>
          <p className="text-[11px] text-white/55 pb-1">
            {timeLabel(latestBp?.createdAt)}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={onOpenVitals}
        className="w-full text-left rounded-[1.35rem] bg-gradient-to-br from-[#053047] via-[#0b4f8c] to-[#0d7c74] p-5 text-white shadow-xl shadow-navy-900/15 touch-manipulation active:scale-[0.99] transition overflow-hidden"
      >
        <div className="flex items-center gap-3 relative z-10">
          <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Scale className="w-5 h-5 text-teal-200" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-teal-100/90 font-medium">Peso</p>
            <p className="font-display text-3xl font-semibold tabular-nums mt-0.5">
              {latestWeight ? `${latestWeight.weightKg}` : "—"}
              {latestWeight && (
                <span className="text-base font-medium text-white/60 ml-1.5">kg</span>
              )}
            </p>
            {bmi != null && (
              <p className="text-[11px] text-white/55 mt-0.5">
                IMC {bmi}
                {bmiCategory ? ` · ${bmiCategory.label}` : ""}
              </p>
            )}
          </div>
        </div>

        {weightSeries.length > 1 ? (
          <div className="mt-3 h-24 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightSeries}>
                <defs>
                  <linearGradient id="weightFillHome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5eead4" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#5eead4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "none",
                    fontSize: 12,
                    background: "#0b4f8c",
                    color: "#fff",
                  }}
                  formatter={(v: number) => [`${v} kg`, "Peso"]}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#5eead4"
                  strokeWidth={2.5}
                  fill="url(#weightFillHome)"
                  dot={{ r: 3, fill: "#99f6e4", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-xs text-white/50 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Registrá más pesos para ver la tendencia
          </p>
        )}
      </button>

      <button
        type="button"
        onClick={onOpenProfile}
        className="w-full flex items-center gap-3 rounded-[1.25rem] bg-white border border-slate-200/90 px-4 py-3.5 text-left shadow-sm touch-manipulation hover:border-teal-200 transition"
      >
        <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-teal-700" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-900">Tu equipo médico IPS</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {doctorName?.trim()
              ? doctorName
              : "Agregá tu médico en Perfil para un mejor seguimiento"}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>
    </div>
  );
}
