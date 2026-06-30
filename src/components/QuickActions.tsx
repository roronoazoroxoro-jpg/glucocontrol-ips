"use client";

import { useEffect, useState } from "react";
import { Droplets, Utensils, X } from "lucide-react";

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
  const [mealCarbs, setMealCarbs] = useState("");
  const [loading, setLoading] = useState(false);

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
          carbs: parseFloat(mealCarbs) || 0,
        }),
      });
      setMealName("");
      setMealCarbs("");
      setShowMeal(false);
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
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition text-sm"
        >
          <Droplets className="w-4 h-4" />
          Glucosa
        </button>
        <button
          onClick={() => { setShowMeal(true); setShowGlucose(false); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:border-emerald-300 hover:bg-emerald-50 transition text-sm"
        >
          <Utensils className="w-4 h-4" />
          Comida / Bebida
        </button>
      </div>

      {(showGlucose || showMeal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">
                {showGlucose ? "Registrar glucosa" : "Registrar comida o bebida"}
              </h3>
              <button
                onClick={() => { closeGlucose(); setShowMeal(false); }}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {showGlucose ? (
              <form onSubmit={submitGlucose} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    Valor (mg/dL)
                  </label>
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
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </form>
            ) : (
              <form onSubmit={submitMeal} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Qué comiste/bebiste</label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="Ej: Avena con frutas"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Tipo</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="desayuno">Desayuno</option>
                      <option value="comida">Comida</option>
                      <option value="cena">Cena</option>
                      <option value="bebida">Bebida</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Carbohidratos (g)</label>
                    <input
                      type="number"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(e.target.value)}
                      placeholder="0"
                      min={0}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !mealName.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Registrar"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
