"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Download, LayoutDashboard, MessageSquare, Settings } from "lucide-react";
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
import type { GlucoseAnalysis } from "@/lib/recommendations";
import type { StatsSummary, Period } from "@/lib/stats";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  diabetesType: string;
  targetMin: number;
  targetMax: number;
}

interface DashboardData {
  readings: { id: string; value: number; createdAt: string }[];
  meals: { id: string; name: string; type: string; carbs: number; createdAt: string }[];
  latest: { value: number } | null;
  stats: StatsSummary;
  recommendation: GlucoseAnalysis | null;
}

type Tab = "dashboard" | "historial" | "chat" | "perfil";

export function DashboardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("day");
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showGlucoseModal, setShowGlucoseModal] = useState(false);

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/user");
    const d = await res.json();
    setUser(d.user);
    setLoading(false);
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
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, diabetesType }),
    });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="glass-card rounded-2xl p-6 max-w-lg">
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
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
        >
          {saved ? "Guardado ✓" : "Guardar cambios"}
        </button>
      </form>

      <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Aviso médico:</strong> GlucoControl IPS es una herramienta de apoyo
          informativo del Instituto de Previsión Social de Misiones. No sustituye el
          consejo médico profesional.
        </p>
        <div className="mt-4 pt-4 border-t border-amber-200 flex justify-center">
          <IPSLogo size="sm" />
        </div>
      </div>
    </div>
  );
}
