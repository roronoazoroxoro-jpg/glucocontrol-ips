"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  Droplets,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  Scale,
  Settings,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { IPSLogo } from "./IPSLogo";
import { BrandMark } from "./BrandMark";
import { Onboarding } from "./Onboarding";
import { RecommendationsPanel } from "./RecommendationsPanel";
import { QuickActions } from "./QuickActions";
import { StatsCards } from "./StatsCards";
import { GlucoseChart } from "./GlucoseChart";
import { HistoryPanel } from "./HistoryPanel";
import { ChatPanel } from "./ChatPanel";
import { VoiceAssistant } from "./VoiceAssistant";
import { InstallPrompt } from "./InstallPrompt";
import { NotificationScheduler, UpcomingRemindersBanner } from "./NotificationScheduler";
import { VitalActions } from "./VitalActions";
import { HomeDashboard } from "./HomeDashboard";
import { BpChart, WeightChart } from "./VitalCharts";
import { DashboardSkeleton } from "./EmptyState";
import { parseMedications, parseMealTimes, DEFAULT_REMINDERS, type Medication } from "@/lib/reminders";
import { parseConditions, HEALTH_CONDITIONS } from "@/lib/health";
import type { GlucoseAnalysis } from "@/lib/recommendations";
import type { StatsSummary, Period } from "@/lib/stats";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email?: string;
  name: string;
  diabetesType: string;
  conditions?: string;
  heightCm?: number | null;
  targetMin: number;
  targetMax: number;
  bpTargetSys?: number;
  bpTargetDia?: number;
  doctorName?: string | null;
  medications?: string | null;
  mealTimes?: string | null;
  glucoseIntervalHours?: number;
  notificationsEnabled?: boolean;
  profileComplete?: boolean;
}

interface DashboardData {
  readings: { id: string; value: number; createdAt: string }[];
  meals: {
    id: string;
    name: string;
    type: string;
    carbs: number;
    sugar?: number | null;
    fat?: number | null;
    protein?: number | null;
    calories?: number | null;
    createdAt: string;
  }[];
  latest: { value: number } | null;
  stats: StatsSummary;
  recommendation: GlucoseAnalysis | null;
  conditions?: string[];
  bloodPressures?: { systolic: number; diastolic: number; createdAt: string }[];
  weights?: { weightKg: number; createdAt: string }[];
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

type Tab = "dashboard" | "historial" | "reportes" | "perfil" | "chat";

export function DashboardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showGlucoseModal, setShowGlucoseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [vitalModal, setVitalModal] = useState<"bp" | "weight" | "hr" | "chol" | "symptom" | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/api/user", { signal: controller.signal });
      clearTimeout(timeout);

      const d = await res.json();
      if (res.status === 401) {
        window.location.href = "/login?next=/app";
        return;
      }
      if (!res.ok) {
        throw new Error(d.error ?? "No se pudo conectar con el servidor");
      }
      setUser(d.user);
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "El servidor tardó demasiado en responder"
          : err instanceof Error
            ? err.message
            : "Error de conexión";
      setLoadError(message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    const res = await fetch(`/api/dashboard?period=${period}`);
    const d = await res.json();
    setData(d);
  }, [period]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen safe-top">
        <div className="flex flex-col items-center justify-center gap-3 pt-16 pb-6">
          <IPSLogo size="md" />
          <BrandMark size="sm" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 safe-top text-center">
        <IPSLogo size="md" />
        <p className="text-slate-700 font-medium">No pudimos conectar con el servidor</p>
        <p className="text-sm text-slate-500 max-w-sm">{loadError}</p>
        <button
          type="button"
          onClick={fetchUser}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
        <Link href="/" className="text-sm text-navy-700 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!user || !user.profileComplete) {
    return <Onboarding onComplete={fetchUser} initialName={user?.name} />;
  }

  const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
    { key: "dashboard", label: "Inicio", icon: Home },
    { key: "historial", label: "Historial", icon: Activity },
    { key: "reportes", label: "Reportes", icon: BarChart3 },
    { key: "perfil", label: "Perfil", icon: UserRound },
  ];

  const addOptions = [
    { label: "Glucosa", icon: Droplets, action: () => { setShowAddSheet(false); setShowGlucoseModal(true); } },
    { label: "Comida", icon: Utensils, action: () => { setShowAddSheet(false); setShowMealModal(true); } },
    { label: "Presión", icon: Activity, action: () => { setShowAddSheet(false); setVitalModal("bp"); } },
    { label: "Peso", icon: Scale, action: () => { setShowAddSheet(false); setVitalModal("weight"); } },
    { label: "Asistente", icon: MessageSquare, action: () => { setShowAddSheet(false); setTab("chat"); } },
  ];

  return (
    <div className="min-h-screen pb-28 md:pb-10 safe-bottom bg-[#f3faf9]">
      <header className="sticky top-0 z-30 bg-[#f3faf9]/95 backdrop-blur-md safe-top animate-fade-in">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-700 hover:bg-white/80 touch-manipulation"
            aria-label="Menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-center">
            <BrandMark size="sm" />
            <div className="mx-auto mt-1 h-0.5 w-10 rounded-full bg-teal-500/70" />
          </div>
          <button
            type="button"
            onClick={() => setTab("chat")}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-teal-700 hover:bg-white/80 touch-manipulation"
            aria-label="Asistente"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 live-dot" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-5 md:max-w-6xl">
        {tab === "dashboard" && (
          <>
            {data ? (
              <HomeDashboard
                userName={user.name}
                doctorName={user.doctorName}
                latestGlucose={data.latest?.value ?? null}
                glucoseAt={
                  data.readings.length
                    ? data.readings[data.readings.length - 1]?.createdAt
                    : null
                }
                recommendation={data.recommendation}
                latestBp={data.latestBp}
                bpStatus={data.bpStatus}
                latestWeight={data.latestWeight}
                weights={data.weights ?? []}
                bmi={data.bmi}
                bmiCategory={data.bmiCategory}
                onOpenGlucose={() => setShowGlucoseModal(true)}
                onOpenVitals={() => setShowAddSheet(true)}
                onOpenProfile={() => setTab("perfil")}
              />
            ) : (
              <DashboardSkeleton />
            )}
            <UpcomingRemindersBanner />
            {data?.recommendation && (
              <div className="max-w-lg mx-auto">
                <RecommendationsPanel recommendation={data.recommendation} />
              </div>
            )}
          </>
        )}

        {tab === "historial" && data && (
          <div className="space-y-5 max-w-lg mx-auto md:max-w-none">
            <div>
              <h2 className="font-display text-2xl font-semibold text-navy-900">Historial</h2>
              <p className="text-sm text-teal-700 mt-1">Tu evolución en el tiempo</p>
            </div>
            <HistoryPanel
              period={period}
              onPeriodChange={setPeriod}
              meals={data.meals}
              readings={data.readings}
            />
            <div className="grid lg:grid-cols-2 gap-5">
              <GlucoseChart
                readings={data.readings}
                targetMin={user.targetMin}
                targetMax={user.targetMax}
              />
              <BpChart
                readings={data.bloodPressures ?? []}
                targetSys={user.bpTargetSys ?? 130}
                targetDia={user.bpTargetDia ?? 80}
              />
            </div>
          </div>
        )}

        {tab === "reportes" && data && (
          <div className="space-y-5 max-w-lg mx-auto md:max-w-none">
            <div>
              <h2 className="font-display text-2xl font-semibold text-navy-900">Reportes</h2>
              <p className="text-sm text-teal-700 mt-1">Resumen y tendencias</p>
            </div>
            <StatsCards stats={data.stats} />
            <GlucoseChart
              readings={data.readings}
              targetMin={user.targetMin}
              targetMax={user.targetMax}
            />
            <div className="grid lg:grid-cols-2 gap-5">
              <BpChart
                readings={data.bloodPressures ?? []}
                targetSys={user.bpTargetSys ?? 130}
                targetDia={user.bpTargetDia ?? 80}
              />
              <WeightChart entries={data.weights ?? []} heightCm={user.heightCm} />
            </div>
            <a
              href="/api/export?format=html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-navy-800 to-teal-700 text-white font-semibold touch-manipulation"
            >
              <FileText className="w-4 h-4" />
              Exportar informe médico
            </a>
          </div>
        )}

        {tab === "chat" && <ChatPanel userName={user.name} />}

        {tab === "perfil" && <ProfilePanel user={user} onUpdate={fetchUser} />}
      </main>

      {/* Bottom nav — estilo mockup con FAB */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom-nav">
        <div className="mx-3 mb-3 rounded-[1.5rem] bg-white/95 border border-slate-200/80 shadow-lg shadow-navy-900/10 backdrop-blur-md">
          <div className="grid grid-cols-5 items-end px-1 pt-2 pb-1.5">
            {tabs.slice(0, 2).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold touch-manipulation",
                  tab === t.key ? "text-teal-700" : "text-slate-400"
                )}
              >
                <t.icon className="w-5 h-5" />
                {t.label}
              </button>
            ))}

            <div className="flex justify-center -mt-7">
              <button
                type="button"
                onClick={() => setShowAddSheet(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-800 to-teal-600 text-white shadow-xl shadow-teal-800/30 flex items-center justify-center touch-manipulation active:scale-95 transition"
                aria-label="Registrar"
              >
                <Plus className="w-7 h-7" strokeWidth={2.5} />
              </button>
            </div>

            {tabs.slice(2).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold touch-manipulation",
                  tab === t.key ? "text-teal-700" : "text-slate-400"
                )}
              >
                <t.icon className="w-5 h-5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Desktop tabs */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 gap-1 bg-white/95 border border-slate-200 rounded-2xl p-1.5 shadow-xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition",
              tab === t.key
                ? "bg-gradient-to-r from-navy-800 to-teal-700 text-white"
                : "text-slate-500 hover:text-navy-800"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAddSheet(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-navy-800"
        >
          <Plus className="w-4 h-4" />
          Registrar
        </button>
      </div>

      {showAddSheet && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4 safe-bottom">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display text-xl font-semibold text-navy-900">Registrar</p>
                <p className="text-xs text-slate-500 mt-0.5">Elegí qué querés cargar</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSheet(false)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {addOptions.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={o.action}
                  className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-[#f3faf9] px-4 py-3.5 text-left hover:border-teal-300 touch-manipulation"
                >
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-teal-600 text-white flex items-center justify-center">
                    <o.icon className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-navy-900 text-sm">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-[78%] max-w-xs bg-white shadow-2xl p-5 safe-top animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <BrandMark size="sm" />
              <button type="button" onClick={() => setShowMenu(false)} className="p-2">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="mb-4 rounded-2xl bg-[#f3faf9] p-3">
              <IPSLogo size="sm" />
              <p className="text-xs text-slate-500 mt-2">Hola, {user.name}</p>
            </div>
            <nav className="space-y-1">
              {[
                { label: "Inicio", tab: "dashboard" as Tab },
                { label: "Historial", tab: "historial" as Tab },
                { label: "Reportes", tab: "reportes" as Tab },
                { label: "Asistente IA", tab: "chat" as Tab },
                { label: "Perfil", tab: "perfil" as Tab },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setTab(item.tab);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-navy-900 hover:bg-teal-50"
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/descargar"
                className="block px-3 py-3 rounded-xl text-sm font-medium text-teal-800 hover:bg-teal-50"
                onClick={() => setShowMenu(false)}
              >
                Instalar app
              </Link>
            </nav>
          </div>
        </div>
      )}

      <QuickActions
        hideButtons
        onSuccess={fetchDashboard}
        openGlucose={showGlucoseModal}
        onGlucoseClose={() => setShowGlucoseModal(false)}
        openMeal={showMealModal}
        onMealClose={() => setShowMealModal(false)}
      />
      <VitalActions
        hideButtons
        onSuccess={fetchDashboard}
        openModal={vitalModal}
        onModalClose={() => setVitalModal(null)}
      />

      <VoiceAssistant userName={user.name} onMealLogged={fetchDashboard} />
      <NotificationScheduler enabled={user.notificationsEnabled !== false} />
      <InstallPrompt />
    </div>
  );
}

function ProfilePanel({
  user,
  onUpdate,
}: {
  user: User;
  onUpdate: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [diabetesType, setDiabetesType] = useState(user.diabetesType);
  const [doctorName, setDoctorName] = useState(user.doctorName ?? "");
  const [heightCm, setHeightCm] = useState(user.heightCm != null ? String(user.heightCm) : "");
  const [conditions, setConditions] = useState<string[]>(parseConditions(user.conditions));
  const [glucoseInterval, setGlucoseInterval] = useState(user.glucoseIntervalHours ?? 4);
  const [mealTimes, setMealTimes] = useState(parseMealTimes(user.mealTimes).join(", "));
  const [medications, setMedications] = useState<Medication[]>(
    parseMedications(user.medications)
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user.notificationsEnabled !== false
  );
  const [medName, setMedName] = useState("");
  const [medTime, setMedTime] = useState("08:00");
  const [saved, setSaved] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  async function enableNotifications() {
    const { requestNotificationPermission } = await import("@/lib/reminders");
    const ok = await requestNotificationPermission();
    setNotifStatus(ok ? "Notificaciones activadas ✓" : "Permiso denegado");
    if (ok) setNotificationsEnabled(true);
  }

  function addMedication() {
    if (!medName.trim()) return;
    setMedications((prev) => [
      ...prev,
      { name: medName.trim(), times: [medTime] },
    ]);
    setMedName("");
  }

  function removeMedication(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const times = mealTimes
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        diabetesType,
        doctorName,
        heightCm: heightCm ? Number(heightCm) : null,
        conditions,
        glucoseIntervalHours: glucoseInterval,
        mealTimes: times.length > 0 ? times : DEFAULT_REMINDERS.mealTimes,
        medications,
        notificationsEnabled,
      }),
    });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Mi cuenta</h3>
        {user.email && (
          <p className="text-sm text-slate-500 mb-4">
            Sesión: <span className="text-slate-700">{user.email}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="/api/export?format=html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl border border-teal-300 text-navy-700 text-sm font-medium hover:bg-teal-50 transition touch-manipulation"
          >
            <FileText className="w-4 h-4" />
            Exportar informe
          </a>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition touch-manipulation"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Mi perfil de salud</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Tipo de diabetes</label>
            <select
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="ninguna">Sin diabetes</option>
              <option value="tipo1">Tipo 1</option>
              <option value="tipo2">Tipo 2</option>
              <option value="gestacional">Gestacional</option>
              <option value="prediabetes">Prediabetes</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Altura (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="165"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Condiciones de salud</label>
            <div className="flex flex-wrap gap-2">
              {HEALTH_CONDITIONS.map((c) => {
                const selected = conditions.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setConditions((prev) =>
                        selected ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                      )
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                      selected
                        ? "bg-teal-100 border-teal-300 text-navy-800"
                        : "bg-white border-slate-200 text-slate-600"
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Médico asignado (IPS)</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Ej: Dr. García"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-navy-800 to-teal-700 text-white font-medium hover:opacity-95 transition touch-manipulation"
          >
            {saved ? "Guardado ✓" : "Guardar perfil"}
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900 mb-1">Recordatorios</h3>
        <p className="text-xs text-slate-500 mb-4">
          Notificaciones en su celular para glucosa, comidas y medicación
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Notificaciones activas</span>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={cn(
                "w-12 h-7 rounded-full transition relative",
                notificationsEnabled ? "bg-teal-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition",
                  notificationsEnabled ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={enableNotifications}
            className="w-full py-2 rounded-xl border border-teal-300 text-navy-700 text-sm font-medium touch-manipulation"
          >
            Activar permisos de notificación
          </button>
          {notifStatus && <p className="text-xs text-teal-700">{notifStatus}</p>}

          <div>
            <label className="text-sm text-slate-600 mb-1 block">
              Medir glucosa cada (horas)
            </label>
            <select
              value={glucoseInterval}
              onChange={(e) => setGlucoseInterval(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value={2}>Cada 2 horas</option>
              <option value={4}>Cada 4 horas</option>
              <option value={6}>Cada 6 horas</option>
              <option value={8}>Cada 8 horas</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600 mb-1 block">
              Horarios de comida (HH:MM, separados por coma)
            </label>
            <input
              type="text"
              value={mealTimes}
              onChange={(e) => setMealTimes(e.target.value)}
              placeholder="07:30, 12:30, 20:00"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 mb-2 block">Medicamentos / pastillas</label>
            {medications.map((med, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-2 text-sm">
                <span>{med.name} — {med.times.join(", ")}</span>
                <button type="button" onClick={() => removeMedication(i)} className="text-red-500 text-xs">
                  Quitar
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="Ej: Metformina"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <input
                type="time"
                value={medTime}
                onChange={(e) => setMedTime(e.target.value)}
                className="px-2 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <button
                type="button"
                onClick={addMedication}
                className="px-3 py-2 rounded-lg bg-teal-100 text-navy-800 text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSave({ preventDefault: () => {} } as React.FormEvent)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-navy-800 to-teal-700 text-white font-medium touch-manipulation"
          >
            Guardar recordatorios
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Aviso médico:</strong> VitalIPS es apoyo informativo del Instituto
          de Previsión Social de Misiones. Consulte siempre con su médico asignado antes de
          cambiar medicación o alimentación.
        </p>
        <div className="mt-4 pt-4 border-t border-amber-200 flex justify-center">
          <IPSLogo size="sm" />
        </div>
      </div>
    </div>
  );
}
