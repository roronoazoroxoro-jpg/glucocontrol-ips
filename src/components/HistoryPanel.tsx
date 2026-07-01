"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Coffee, Utensils } from "lucide-react";
import type { Period } from "@/lib/stats";

interface HistoryPanelProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
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
  readings: { id: string; value: number; createdAt: string }[];
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "day", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
];

export function HistoryPanel({
  period,
  onPeriodChange,
  meals,
  readings,
}: HistoryPanelProps) {
  const timeline = [
    ...readings.map((r) => ({
      id: r.id,
      type: "glucose" as const,
      label: `${r.value} mg/dL`,
      sub: "Lectura de glucosa",
      date: r.createdAt,
    })),
    ...meals.map((m) => ({
      id: m.id,
      type: "meal" as const,
      label: m.name,
      sub: [
        m.type,
        `${m.carbs}g carbs`,
        m.sugar != null ? `${m.sugar}g azúcar` : null,
        m.fat != null ? `${m.fat}g grasa` : null,
        m.protein != null ? `${m.protein}g prot` : null,
        m.calories != null ? `${m.calories} kcal` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      date: m.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-800">Historial</h3>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPeriodChange(p.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition",
                period === p.key
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {timeline.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">
          No hay registros en este periodo
        </p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {timeline.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  item.type === "glucose" ? "bg-emerald-100" : "bg-blue-100"
                )}
              >
                {item.type === "glucose" ? (
                  <span className="text-emerald-700 text-xs font-bold">G</span>
                ) : item.sub.includes("bebida") ? (
                  <Coffee className="w-4 h-4 text-blue-600" />
                ) : (
                  <Utensils className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatDate(item.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
