"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Download, LayoutDashboard, MessageSquare, RefreshCw, Settings } from "lucide-react";
import { IPSLogo } from "./IPSLogo";
import { Onboarding } from "./Onboarding";
import { GlucoseCard } from "./GlucoseCard";
import { RecommendationsPanel } from "./RecommendationsPanel";
import { QuickActions } from "./QuickActions";
import { StatsCards } from "./StatsCards";
import { GlucoseChart } from "./GlucoseChart";
import { HistoryPanel } from "./HistoryPanel";
import { ChatPanel } from "./ChatPanel";
import { VoiceAssistant } from "./VoiceAssistant";
import { InstallPrompt } from "./InstallPrompt";
import { NotificationScheduler, UpcomingRemindersBanner } from "./NotificationScheduler";
import { parseMedications, parseMealTimes, DEFAULT_REMINDERS, type Medication } from "@/lib/reminders";
import type { GlucoseAnalysis } from "@/lib/recommendations";
import type { StatsSummary, Period } from "@/lib/stats";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  diabetesType: string;
  targetMin: number;
  targetMax: number;
  doctorName?: string | null;
  medications?: string | null;
  mealTimes?: string | null;
  glucoseIntervalHours?: number;
  notificationsEnabled?: boolean;
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
}

type Tab = "dashboard" | "historial" | "chat" | "perfil";

export function DashboardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showGlucoseModal, setShowGlucoseModal] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/api/user", { signal: controller.signal });
      clearTimeout(timeout);

      const d = await res.json();
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 safe-top">
        <IPSLogo size="md" />
        <p className="text-sm text-slate-500">Cargando GlucoControl IPS...</p>
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
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e5a9e] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#174a82] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
        <Link href="/" className="text-sm text-[#1e5a9e] hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={fetchUser} />;
  }

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "dashboard", label: "Panel", icon: LayoutDashboard },
    { key: "historial", label: "Historial", icon: Activity },
    { key: "chat", label: "Chat IA", icon: MessageSquare },
    { key: "perfil", label: "Perfil", icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 safe-bottom">
      <header className="sticky top-0 z-30 glass-card border-b border-white/60 safe-top">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IPSLogo size="sm" className="shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 text-sm md:text-base truncate">
                GlucoControl IPS
              </h1>
              <p className="text-xs text-slate-500 truncate">Hola, {user.name}</p>
            </div>
          </div>
          <Link
            href="/descargar"
            className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar
          </Link>
          <div className="hidden md:flex gap-1 bg-slate-100 rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                  tab === t.key
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {(tab === "dashboard" || tab === "historial") && (
          <>
            <QuickActions
              onSuccess={fetchDashboard}
              openGlucose={showGlucoseModal}
              onGlucoseClose={() => setShowGlucoseModal(false)}
            />

            <UpcomingRemindersBanner />

            {data && (
              <>
                <StatsCards stats={data.stats} />

                <div className="grid lg:grid-cols-2 gap-6">
                  <GlucoseCard
                    value={data.latest?.value ?? null}
                    recommendation={data.recommendation}
                    onAddReading={() => setShowGlucoseModal(true)}
                  />
                  <RecommendationsPanel recommendation={data.recommendation} />
                </div>

                <GlucoseChart
                  readings={data.readings}
                  targetMin={user.targetMin}
                  targetMax={user.targetMax}
                />
              </>
            )}
          </>
        )}

        {(tab === "historial" || tab === "dashboard") && data && (
          <HistoryPanel
            period={period}
            onPeriodChange={(p) => {
              setPeriod(p);
            }}
            meals={data.meals}
            readings={data.readings}
          />
        )}

        {tab === "chat" && <ChatPanel userName={user.name} />}

        {tab === "perfil" && (
          <ProfilePanel user={user} onUpdate={fetchUser} />
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/60 z-30 safe-bottom-nav">
        <div className="flex justify-around py-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs transition",
                tab === t.key ? "text-emerald-600" : "text-slate-400"
              )}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

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
        <h3 className="font-semibold text-slate-800 mb-4">Mi perfil</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Tipo de diabetes</label>
            <select
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="tipo1">Tipo 1</option>
              <option value="tipo2">Tipo 2</option>
              <option value="gestacional">Gestacional</option>
              <option value="prediabetes">Prediabetes</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Médico asignado (IPS)</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Ej: Dr. García"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition touch-manipulation"
          >
            {saved ? "Guardado ✓" : "Guardar perfil"}
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Recordatorios</h3>
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
                notificationsEnabled ? "bg-emerald-500" : "bg-slate-300"
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
            className="w-full py-2 rounded-xl border border-emerald-300 text-emerald-700 text-sm font-medium touch-manipulation"
          >
            Activar permisos de notificación
          </button>
          {notifStatus && <p className="text-xs text-emerald-600">{notifStatus}</p>}

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
                className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSave({ preventDefault: () => {} } as React.FormEvent)}
            className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-medium touch-manipulation"
          >
            Guardar recordatorios
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Aviso médico:</strong> GlucoControl IPS es apoyo informativo del Instituto
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
