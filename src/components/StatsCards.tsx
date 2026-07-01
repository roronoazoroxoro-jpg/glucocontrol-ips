"use client";

import { cn } from "@/lib/utils";
import type { StatsSummary } from "@/lib/stats";
import { Activity, Droplets, Flame, Target, Wheat, Zap } from "lucide-react";

interface StatsCardsProps {
  stats: StatsSummary;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Promedio glucosa",
      value: stats.avgGlucose !== null ? `${stats.avgGlucose}` : "—",
      unit: "mg/dL",
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "En rango",
      value: stats.inRangePercent !== null ? `${stats.inRangePercent}` : "—",
      unit: "%",
      icon: Target,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Carbohidratos",
      value: `${stats.totalCarbs}`,
      unit: "g",
      icon: Wheat,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Azúcares",
      value: `${stats.totalSugar}`,
      unit: "g",
      icon: Droplets,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Grasas",
      value: `${stats.totalFat}`,
      unit: "g",
      icon: Flame,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Calorías",
      value: `${stats.totalCalories}`,
      unit: "kcal",
      icon: Zap,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-card rounded-xl p-4">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", card.bg)}>
            <card.icon className={cn("w-4 h-4", card.color)} />
          </div>
          <p className="text-xs text-slate-500 mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">
            {card.value}
            {card.unit && (
              <span className="text-sm font-normal text-slate-400 ml-1">{card.unit}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
