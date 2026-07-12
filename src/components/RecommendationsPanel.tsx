"use client";

import type { GlucoseAnalysis } from "@/lib/recommendations";
import { Apple, Ban, Coffee, UtensilsCrossed } from "lucide-react";

interface RecommendationsPanelProps {
  recommendation: GlucoseAnalysis | null;
}

export function RecommendationsPanel({ recommendation }: RecommendationsPanelProps) {
  if (!recommendation) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">Recomendaciones</h3>
        <p className="text-sm text-slate-500">
          Las sugerencias de comida y bebida aparecerán acá según tu glucosa.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <h3 className="font-display text-lg font-semibold text-navy-900 flex items-center gap-2">
        <UtensilsCrossed className="w-5 h-5 text-teal-700" />
        Qué podés comer y tomar
      </h3>

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-navy-700 mb-2">
          <Apple className="w-4 h-4" />
          Alimentos recomendados
        </div>
        <ul className="space-y-1.5">
          {recommendation.foods.map((food) => (
            <li
              key={food}
              className="text-sm text-slate-600 bg-teal-50 px-3 py-2 rounded-lg"
            >
              {food}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-teal-700 mb-2">
          <Coffee className="w-4 h-4" />
          Bebidas recomendadas
        </div>
        <ul className="space-y-1.5">
          {recommendation.drinks.map((drink) => (
            <li
              key={drink}
              className="text-sm text-slate-600 bg-teal-50 px-3 py-2 rounded-lg"
            >
              {drink}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
          <Ban className="w-4 h-4" />
          Evitar por ahora
        </div>
        <ul className="space-y-1.5">
          {recommendation.avoid.map((item) => (
            <li
              key={item}
              className="text-sm text-slate-600 bg-red-50 px-3 py-2 rounded-lg"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
