"use client";

import { useEffect, useState } from "react";
import { Droplets, Loader2, Sparkles, Utensils, X } from "lucide-react";
import type { NutritionAnalysis } from "@/lib/nutrition";
import { formatNutritionSummary, getSourceLabel } from "@/lib/nutrition";

interface QuickActionsProps {
  onSuccess: () => void;
  openGlucose?: boolean;
  onGlucoseClose?: () => void;
}

export function QuickActions({ onSuccess, openGlucose, onGlucoseClose }: QuickActionsProps) {
  const [showGlucose, setShowGlucose] = useState(false);
  const [showMeal, setShowMeal] = useState(false);
  const [glucoseValue, setGlucoseValue] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("comida");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionAnalysis | null>(null);

  useEffect(() => {
    if (openGlucose) {
      setShowGlucose(true);
      setShowMeal(false);
    }
  }, [openGlucose]);

  function closeGlucose() {
    setShowGlucose(false);
    onGlucoseClose?.();
  }

  function resetMealForm() {
    setMealName("");
    setNutrition(null);
    setShowMeal(false);
  }

  useEffect(() => {
    if (!mealName.trim() || mealName.length < 3) {
      setNutrition(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const res = await fetch("/api/nutrition/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: mealName.trim(), type: mealType }),
        });
        const data = await res.json();
        if (data.nutrition) setNutrition(data.nutrition);
      } finally {
        setAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [mealName, mealType]);

  async function submitGlucose(e: React.FormEvent) {
    e.preventDefault();
    const value = parseInt(glucoseValue, 10);
    if (isNaN(value)) return;

    setLoading(true);
    try {
      await fetch("/api/glucose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      setGlucoseValue("");
      closeGlucose();
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  async function submitMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!mealName.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mealName.trim(),
          type: mealType,
        }),
      });
      resetMealForm();
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => { setShowGlucose(true); setShowMeal(false); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition text-sm touch-manipulation"
        >
          <Droplets className="w-4 h-4" />
          Glucosa
        </button>
        <button
          onClick={() => { setShowMeal(true); setShowGlucose(false); setNutrition(null); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:border-emerald-300 hover:bg-emerald-50 transition text-sm touch-manipulation"
        >
          <Utensils className="w-4 h-4" />
          Comida / Bebida
        </button>
      </div>

      {(showGlucose || showMeal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 safe-bottom">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">
                {showGlucose ? "Registrar glucosa" : "Registrar comida o bebida"}
              </h3>
              <button
                onClick={() => { closeGlucose(); resetMealForm(); }}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {showGlucose ? (
              <form onSubmit={submitGlucose} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Valor (mg/dL)</label>
                  <input
                    type="number"
                    value={glucoseValue}
                    onChange={(e) => setGlucoseValue(e.target.value)}
                    placeholder="Ej: 120"
                    min={20}
                    max={600}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-2xl font-bold text-center"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !glucoseValue}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50 touch-manipulation"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </form>
            ) : (
              <form onSubmit={submitMeal} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    ¿Qué comió o bebió?
                  </label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="Ej: Milanesa con ensalada y mate"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-base"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Solo escriba el alimento — los nutrientes se calculan solos
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Tipo</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-base"
                  >
                    <option value="desayuno">Desayuno</option>
                    <option value="comida">Comida</option>
                    <option value="cena">Cena</option>
                    <option value="bebida">Bebida</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {(analyzing || nutrition) && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {analyzing ? (
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="text-sm font-medium text-emerald-800">
                        {analyzing ? "Analizando nutrientes..." : "Análisis automático"}
                      </span>
                    </div>
                    {nutrition && !analyzing && (
                      <>
                        <p className="text-xs text-emerald-700 mb-2">
                          Porción: {nutrition.servingSize}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <NutrientBadge label="Calorías" value={`${nutrition.calories} kcal`} />
                          <NutrientBadge label="Carbohidratos" value={`${nutrition.carbs}g`} />
                          <NutrientBadge label="Azúcares" value={`${nutrition.sugar}g`} />
                          <NutrientBadge label="Grasas" value={`${nutrition.fat}g`} />
                          <NutrientBadge label="Proteínas" value={`${nutrition.protein}g`} />
                          <NutrientBadge label="Fibra" value={`${nutrition.fiber}g`} />
                          <NutrientBadge label="Grasa sat." value={`${nutrition.saturatedFat}g`} />
                          <NutrientBadge label="Sodio" value={`${nutrition.sodium}mg`} />
                        </div>
                        <p className="text-[10px] text-emerald-600/80 mt-2 flex items-center justify-between gap-2">
                          <span>{formatNutritionSummary(nutrition)}</span>
                          <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                            {getSourceLabel(nutrition.source)} · {nutrition.confidence}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !mealName.trim() || analyzing}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50 touch-manipulation"
                >
                  {loading ? "Guardando..." : analyzing ? "Analizando..." : "Registrar comida"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NutrientBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg px-2 py-1.5">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}
