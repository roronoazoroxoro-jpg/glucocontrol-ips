"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Droplets,
  MessageSquare,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { GlucoseChart } from "./GlucoseChart";
import { IPSLogo } from "./IPSLogo";
import { formatDate, formatGlucose, cn } from "@/lib/utils";
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
    targetMin: number;
    targetMax: number;
    doctorName: string | null;
    medications: string | null;
    profileComplete: boolean;
    createdAt: string;
  };
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 safe-top">
        <IPSLogo size="md" />
        <p className="text-sm text-slate-500">Cargando ficha del paciente...</p>
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
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white touch-manipulation shrink-0"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Actualizar
          </button>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            label="Última glucosa"
            value={data.latest ? formatGlucose(data.latest.value) : "—"}
            sub={data.glucoseMeta?.label}
            alert={data.glucoseMeta?.alert}
          />
          <StatBox label="Promedio" value={data.stats.avgGlucose ? `${data.stats.avgGlucose} mg/dL` : "—"} />
          <StatBox label="% en rango" value={data.stats.inRangePercent != null ? `${data.stats.inRangePercent}%` : "—"} />
          <StatBox label="Comidas" value={String(data.stats.totalMeals)} sub={`${data.stats.totalCarbs}g carbohidratos`} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlucoseChart
              readings={data.readings}
              targetMin={patient.targetMin}
              targetMax={patient.targetMax}
            />

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
                        {m.calories != null && <p className="text-slate-400">{Math.round(m.calories)} kcal</p>}
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
                <Row label="Rango objetivo" value={`${patient.targetMin}–${patient.targetMax} mg/dL`} />
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
                  Estado actual
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
                <MessageSquare className="w-4 h-4 text-slate-500" />
                Chat con IA (reciente)
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
                        msg.role === "user" ? "bg-blue-50 text-blue-900" : "bg-slate-50 text-slate-700"
                      )}
                    >
                      <p className="font-medium mb-0.5 capitalize">{msg.role === "user" ? "Paciente" : "IA"}</p>
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
      <p className={cn("text-xl font-bold mt-1", alert ? "text-red-600" : "text-slate-800")}>{value}</p>
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
