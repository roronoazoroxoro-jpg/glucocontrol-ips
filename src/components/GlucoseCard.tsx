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
      return <CheckCircle className="w-5 h-5 text-teal-600" />;
    if (recommendation.status === "bajo" || recommendation.status === "critico_bajo")
      return <TrendingDown className="w-5 h-5 text-orange-600" />;
    return <TrendingUp className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-teal-700">
            Glucosa actual
          </p>
          {value !== null ? (
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={cn(
                  "font-display text-5xl md:text-6xl font-semibold tabular-nums",
                  recommendation?.color ?? "text-navy-900"
                )}
              >
                {value}
              </span>
              <span className="text-lg text-slate-400">mg/dL</span>
            </div>
          ) : (
            <p className="font-display text-3xl font-semibold text-slate-300 mt-2">— — —</p>
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
          Registrá tu primer valor de glucosa para recibir recomendaciones.
        </p>
      )}

      <button
        onClick={onAddReading}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-300 text-navy-800 font-semibold hover:bg-teal-50 transition text-sm touch-manipulation"
      >
        + Registrar glucosa
      </button>
    </div>
  );
}
