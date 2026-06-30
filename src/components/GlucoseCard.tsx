"use client";

import { cn } from "@/lib/utils";
import type { GlucoseAnalysis } from "@/lib/recommendations";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";

interface GlucoseCardProps {
  value: number | null;
  recommendation: GlucoseAnalysis | null;
  onAddReading: () => void;
}

export function GlucoseCard({ value, recommendation, onAddReading }: GlucoseCardProps) {
  const statusIcon = () => {
    if (!recommendation) return null;
    if (recommendation.urgency === "emergency")
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (recommendation.status === "normal")
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    if (recommendation.status === "bajo" || recommendation.status === "critico_bajo")
      return <TrendingDown className="w-5 h-5 text-orange-600" />;
    return <TrendingUp className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Glucosa actual
          </p>
          {value !== null ? (
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={cn(
                  "text-5xl md:text-6xl font-bold tabular-nums",
                  recommendation?.color ?? "text-slate-800"
                )}
              >
                {value}
              </span>
              <span className="text-lg text-slate-400">mg/dL</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-slate-300 mt-2">— — —</p>
          )}
        </div>
        {recommendation && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
              recommendation.bgColor,
              recommendation.color
            )}
          >
            {statusIcon()}
            {recommendation.label}
          </div>
        )}
      </div>

      {recommendation ? (
        <p className="text-slate-600 leading-relaxed mb-4">{recommendation.message}</p>
      ) : (
        <p className="text-slate-500 mb-4">
          Registra tu primer valor de glucosa para recibir recomendaciones.
        </p>
      )}

      <button
        onClick={onAddReading}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition text-sm"
      >
        + Registrar glucosa
      </button>
    </div>
  );
}
