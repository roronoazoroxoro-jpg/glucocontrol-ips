"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Search,
  Stethoscope,
  Users,
  Utensils,
} from "lucide-react";
import { IPSLogo } from "./IPSLogo";
import { formatDate, formatGlucose } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { StatsSummary } from "@/lib/stats";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PatientRow {
  id: string;
  name: string;
  email: string;
  diabetesType: string;
  conditionsList?: string[];
  latestGlucose: number | null;
  latestGlucoseAt: string | null;
  glucoseStatus: string;
  glucoseAlert: boolean;
  latestBp?: string | null;
  bpStatus?: string;
  bpAlert?: boolean;
  symptomAlert?: boolean;
  anyAlert?: boolean;
  mealsToday: number;
  readingsToday: number;
  stats: StatsSummary;
}

interface OverviewData {
  updatedAt: string;
  summary: {
    totalPatients: number;
    activeToday: number;
    alerts: number;
    profileIncomplete: number;
  };
  patients: PatientRow[];
}

const REFRESH_MS = 15000;

export function AdminDashboard() {
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const meRes = await fetch("/api/admin/me");
      if (meRes.status === 401 || meRes.status === 403) {
        window.location.href = "/admin/login?next=/admin";
        return;
      }
      const meData = await meRes.json();
      setStaff(meData.user);

      const res = await fetch("/api/admin/overview?period=day");
      const overview = await res.json();
      if (!res.ok) throw new Error(overview.error ?? "No se pudo cargar el panel");
      setData(overview);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const visiblePatients = (data?.patients ?? [])
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!!a.anyAlert !== !!b.anyAlert) return a.anyAlert ? -1 : 1;
      if (a.glucoseAlert !== b.glucoseAlert) return a.glucoseAlert ? -1 : 1;
      return 0;
    });

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 safe-top">
        <IPSLogo size="md" />
        <p className="text-sm text-slate-500">Cargando panel médico...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen safe-bottom bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      <header className="sticky top-0 z-30 glass-card border-b border-white/70 safe-top">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <IPSLogo size="sm" className="shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 text-sm md:text-base truncate flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#1e5a9e] shrink-0" />
                Panel médico VitalIPS
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {staff?.name} · {staff?.role === "admin" ? "Administrador" : "Médico"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white touch-manipulation"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium touch-manipulation"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Pacientes registrados</h2>
                <p className="text-xs text-slate-500">
                  Actualización automática cada {REFRESH_MS / 1000}s
                  {lastUpdate && ` · Última: ${formatDate(lastUpdate)}`}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
                En vivo
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard
                icon={Users}
                label="Total pacientes"
                value={String(data.summary.totalPatients)}
                color="blue"
              />
              <SummaryCard
                icon={Activity}
                label="Activos hoy"
                value={String(data.summary.activeToday)}
                color="emerald"
              />
              <SummaryCard
                icon={AlertTriangle}
                label="Alertas glucosa"
                value={String(data.summary.alerts)}
                color="amber"
                highlight={data.summary.alerts > 0}
              />
              <SummaryCard
                icon={Utensils}
                label="Perfil incompleto"
                value={String(data.summary.profileIncomplete)}
                color="slate"
              />
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar paciente por nombre o email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              />
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/70">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-left text-xs text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-3 font-semibold">Paciente</th>
                      <th className="px-4 py-3 font-semibold">Perfil</th>
                      <th className="px-4 py-3 font-semibold">Última glucosa</th>
                      <th className="px-4 py-3 font-semibold">Presión</th>
                      <th className="px-4 py-3 font-semibold">Hoy</th>
                      <th className="px-4 py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visiblePatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                          {data.patients.length === 0
                            ? "Aún no hay pacientes registrados"
                            : "Ningún paciente coincide con la búsqueda"}
                        </td>
                      </tr>
                    ) : (
                      visiblePatients.map((p) => (
                        <tr key={p.id} className="hover:bg-white/60 transition">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.email}</p>
                            {p.anyAlert && (
                              <span className="inline-block mt-1 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Alerta
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {(p.conditionsList ?? []).length
                              ? (p.conditionsList ?? []).join(", ")
                              : p.diabetesType}
                          </td>
                          <td className="px-4 py-3">
                            {p.latestGlucose != null ? (
                              <div>
                                <p
                                  className={cn(
                                    "font-semibold",
                                    p.glucoseAlert ? "text-red-600" : "text-emerald-700"
                                  )}
                                >
                                  {formatGlucose(p.latestGlucose)}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {p.glucoseStatus}
                                  {p.latestGlucoseAt && ` · ${formatDate(p.latestGlucoseAt)}`}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400">Sin registros</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.latestBp ? (
                              <div>
                                <p className={cn("font-semibold", p.bpAlert ? "text-red-600" : "text-slate-800")}>
                                  {p.latestBp}
                                </p>
                                <p className="text-xs text-slate-400">{p.bpStatus}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <p>{p.readingsToday} glucosa</p>
                            <p>{p.mealsToday} comidas</p>
                            {p.symptomAlert && (
                              <p className="text-xs text-red-600 font-medium">Síntoma alerta</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/pacientes/${p.id}`}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1e5a9e] text-white text-xs font-medium hover:bg-[#174a82] touch-manipulation"
                            >
                              Ver ficha
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "slate";
  highlight?: boolean;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-4 border",
        colors[color],
        highlight && "ring-2 ring-amber-300"
      )}
    >
      <Icon className="w-5 h-5 mb-2 opacity-80" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}
