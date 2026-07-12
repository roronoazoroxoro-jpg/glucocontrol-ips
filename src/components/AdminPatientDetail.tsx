"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Droplets,
  FileText,
  HeartPulse,
  MessageSquare,
  RefreshCw,
  TriangleAlert,
  Utensils,
} from "lucide-react";
import { GlucoseChart } from "./GlucoseChart";
import { BpChart, WeightChart } from "./VitalCharts";
import { HealthVitalsPanel } from "./HealthVitalsPanel";
import { IPSLogo } from "./IPSLogo";
import { BrandMark } from "./BrandMark";
import { DashboardSkeleton } from "./EmptyState";
import { formatDate, formatGlucose, cn } from "@/lib/utils";
import { SYMPTOM_TYPES } from "@/lib/health";
import type { StatsSummary } from "@/lib/stats";
import type { GlucoseAnalysis } from "@/lib/recommendations";

type Period = "day" | "week" | "month";

interface PatientDetailData {
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
    diabetesType: string;
    conditions?: string | null;
    heightCm?: number | null;
    targetMin: number;
    targetMax: number;
    doctorName: string | null;
    medications: string | null;
    profileComplete: boolean;
    createdAt: string;
  };
  conditions?: string[];
  latest: { value: number; createdAt: string } | null;
  glucoseMeta: { label: string; alert: boolean; inTarget: boolean } | null;
  stats: StatsSummary;
  recommendation: GlucoseAnalysis | null;
  readings: { id: string; value: number; createdAt: string; notes?: string | null }[];
  meals: {
    id: string;
    name: string;
    type: string;
    carbs: number;
    sugar?: number | null;
    calories?: number | null;
    createdAt: string;
  }[];
  recentChat: { role: string; content: string; createdAt: string }[];
  bloodPressures: { systolic: number; diastolic: number; createdAt: string }[];
  latestBp: { systolic: number; diastolic: number; pulse?: number | null; createdAt: string } | null;
  bpStatus: { label: string; alert: boolean; color: string } | null;
  weights: { weightKg: number; createdAt: string }[];
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

const REFRESH_MS = 15000;

export function AdminPatientDetail({ patientId }: { patientId: string }) {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<PatientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/patients/${patientId}?period=${period}`);
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/admin/login";
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "No se pudo cargar la ficha");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de conexión");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [patientId, period]
  );

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="min-h-screen safe-top">
        <div className="flex flex-col items-center gap-2 pt-12 pb-4">
          <IPSLogo size="md" />
          <BrandMark size="sm" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center safe-top">
        <p className="text-slate-700">{error ?? "Paciente no encontrado"}</p>
        <Link href="/admin" className="text-[#1e5a9e] hover:underline text-sm">
          Volver al panel
        </Link>
      </div>
    );
  }

  const { patient } = data;

  return (
    <div className="min-h-screen safe-bottom bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      <header className="sticky top-0 z-30 glass-card border-b border-white/70 safe-top">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 shrink-0 touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 truncate">{patient.name}</h1>
              <p className="text-xs text-slate-500 truncate">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/api/admin/patients/${patientId}/export`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e5a9e] text-white text-xs font-medium hover:bg-[#174a82] touch-manipulation"
            >
              <FileText className="w-3.5 h-3.5" />
              Informe
            </a>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white touch-manipulation"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition touch-manipulation",
                period === p
                  ? "bg-[#1e5a9e] text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              )}
            >
              {p === "day" ? "Hoy" : p === "week" ? "Semana" : "Mes"}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 self-center">
            Actualizado: {formatDate(data.updatedAt)}
          </span>
        </div>

        {(data.conditions ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(data.conditions ?? []).map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-100 capitalize"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <HealthVitalsPanel
          latestBp={data.latestBp}
          bpStatus={data.bpStatus}
          latestWeight={data.latestWeight}
          bmi={data.bmi}
          bmiCategory={data.bmiCategory}
          latestHr={data.latestHr}
          hrStatus={data.hrStatus}
          latestChol={data.latestChol}
          cholStatus={data.cholStatus}
          symptoms={data.symptoms ?? []}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            label="Última glucosa"
            value={data.latest ? formatGlucose(data.latest.value) : "—"}
            sub={data.glucoseMeta?.label}
            alert={data.glucoseMeta?.alert}
          />
          <StatBox
            label="Promedio glucosa"
            value={data.stats.avgGlucose ? `${data.stats.avgGlucose} mg/dL` : "—"}
          />
          <StatBox
            label="% en rango"
            value={data.stats.inRangePercent != null ? `${data.stats.inRangePercent}%` : "—"}
          />
          <StatBox
            label="Comidas"
            value={String(data.stats.totalMeals)}
            sub={`${data.stats.totalCarbs}g carbohidratos`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlucoseChart
              readings={data.readings}
              targetMin={patient.targetMin}
              targetMax={patient.targetMax}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <BpChart readings={data.bloodPressures ?? []} />
              <WeightChart entries={data.weights ?? []} heightCm={patient.heightCm} />
            </div>

            <section className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                Comidas y bebidas
              </h3>
              {data.meals.length === 0 ? (
                <p className="text-sm text-slate-400">Sin registros en este periodo</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {data.meals.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between gap-3 bg-white/70 rounded-xl px-3 py-2.5 border border-slate-100"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{m.name}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {m.type} · {formatDate(m.createdAt)}
                        </p>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <p className="font-semibold text-slate-700">{m.carbs}g carb.</p>
                        {m.calories != null && (
                          <p className="text-slate-400">{Math.round(m.calories)} kcal</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                Registros de glucosa
              </h3>
              {data.readings.length === 0 ? (
                <p className="text-sm text-slate-400">Sin registros en este periodo</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...data.readings].reverse().map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5 border border-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{formatGlucose(r.value)}</span>
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Perfil clínico</h3>
              <dl className="space-y-2 text-sm">
                <Row label="Tipo diabetes" value={patient.diabetesType} />
                <Row label="Altura" value={patient.heightCm ? `${patient.heightCm} cm` : "—"} />
                <Row label="Rango glucosa" value={`${patient.targetMin}–${patient.targetMax} mg/dL`} />
                <Row label="Médico asignado" value={patient.doctorName ?? "—"} />
                <Row label="Registrado" value={formatDate(patient.createdAt)} />
              </dl>
            </section>

            {data.recommendation && (
              <section
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: data.recommendation.bgColor }}
              >
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Estado glucémico
                </h3>
                <p className="text-sm font-medium" style={{ color: data.recommendation.color }}>
                  {data.recommendation.label}
                </p>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                  {data.recommendation.message}
                </p>
              </section>
            )}

            <section className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Cardio / peso
              </h3>
              <dl className="space-y-2 text-sm">
                <Row
                  label="Última presión"
                  value={
                    data.latestBp
                      ? `${data.latestBp.systolic}/${data.latestBp.diastolic}`
                      : "—"
                  }
                />
                <Row label="Estado PA" value={data.bpStatus?.label ?? "—"} />
                <Row
                  label="Peso / IMC"
                  value={
                    data.latestWeight
                      ? `${data.latestWeight.weightKg} kg${data.bmi != null ? ` · IMC ${data.bmi}` : ""}`
                      : "—"
                  }
                />
                <Row
                  label="Pulso"
                  value={data.latestHr ? `${data.latestHr.bpm} bpm` : "—"}
                />
                <Row label="Lípidos" value={data.cholStatus?.label ?? "Sin lab"} />
              </dl>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-amber-600" />
                Síntomas
              </h3>
              {(data.symptoms ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">Sin síntomas en el periodo</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data.symptoms.map((s) => (
                    <div key={s.id} className="text-xs bg-amber-50 rounded-lg px-3 py-2">
                      <p className="font-medium text-amber-900">
                        {SYMPTOM_TYPES.find((t) => t.id === s.type)?.label ?? s.type} · {s.severity}/5
                      </p>
                      <p className="text-amber-700/70">{formatDate(s.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                Chat con IA
              </h3>
              {data.recentChat.length === 0 ? (
                <p className="text-sm text-slate-400">Sin mensajes</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.recentChat.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-xs rounded-lg px-3 py-2",
                        msg.role === "user"
                          ? "bg-blue-50 text-blue-900"
                          : "bg-slate-50 text-slate-700"
                      )}
                    >
                      <p className="font-medium mb-0.5 capitalize">
                        {msg.role === "user" ? "Paciente" : "IA"}
                      </p>
                      <p className="line-clamp-3">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className={cn("glass-card rounded-2xl p-4", alert && "ring-2 ring-red-200")}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("text-xl font-bold mt-1", alert ? "text-red-600" : "text-slate-800")}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800 font-medium text-right capitalize">{value}</dd>
    </div>
  );
}
