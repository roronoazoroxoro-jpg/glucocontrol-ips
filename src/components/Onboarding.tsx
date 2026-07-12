"use client";

import { useState } from "react";
import {
  Activity,
  Heart,
  HeartPulse,
  Ruler,
  Stethoscope,
  User,
} from "lucide-react";
import { IPSLogo } from "./IPSLogo";
import { BrandMark } from "./BrandMark";
import { requestNotificationPermission } from "@/lib/reminders";
import { HEALTH_CONDITIONS } from "@/lib/health";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
  initialName?: string;
}

export function Onboarding({ onComplete, initialName }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName ?? "");
  const [doctorName, setDoctorName] = useState("");
  const [conditions, setConditions] = useState<string[]>(["diabetes"]);
  const [diabetesType, setDiabetesType] = useState("tipo2");
  const [heightCm, setHeightCm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleCondition(id: string) {
    setConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor ingresá tu nombre");
      return;
    }
    if (conditions.length === 0) {
      setError("Elegí al menos una condición o prevención");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          doctorName: doctorName.trim() || null,
          conditions,
          diabetesType: conditions.includes("diabetes") ? diabetesType : "ninguna",
          heightCm: heightCm ? Number(heightCm) : null,
          notificationsEnabled: true,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar perfil");
      await requestNotificationPermission();
      onComplete();
    } catch {
      setError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 safe-top">
      <div className="glass-card rounded-3xl p-6 md:p-10 max-w-lg w-full animate-scale-in">
        <div className="flex flex-col items-center mb-6 pt-2">
          <IPSLogo size="lg" showText />
          <div className="mt-4 text-center">
            <BrandMark size="md" />
            <p className="text-sm text-slate-500 mt-1">
              Salud integral · Posadas, Misiones
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                step >= n ? "bg-emerald-500" : "bg-slate-200"
              )}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Tu perfil</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Datos básicos para personalizar tu seguimiento.
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4" /> Tu nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: María"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Stethoscope className="w-4 h-4" /> Médico asignado (IPS)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Ej: Dr. García"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Ruler className="w-4 h-4" /> Altura (cm) — para IMC
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="Ej: 165"
                  min={100}
                  max={250}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    setError("Ingresá tu nombre");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium"
              >
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">¿Qué querés controlar?</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Podés elegir varias. La app se adapta a tu perfil.
                </p>
              </div>
              <div className="space-y-2">
                {HEALTH_CONDITIONS.map((c) => {
                  const selected = conditions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCondition(c.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border transition touch-manipulation",
                        selected
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      <p className="font-medium text-slate-800 text-sm">{c.label}</p>
                      <p className="text-xs text-slate-500">{c.desc}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (conditions.length === 0) {
                      setError("Elegí al menos una opción");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Detalle clínico</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Ajustamos recomendaciones según tu perfil.
                </p>
              </div>

              {conditions.includes("diabetes") && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Activity className="w-4 h-4" /> Tipo de diabetes
                  </label>
                  <select
                    value={diabetesType}
                    onChange={(e) => setDiabetesType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="tipo1">Tipo 1</option>
                    <option value="tipo2">Tipo 2</option>
                    <option value="gestacional">Gestacional</option>
                    <option value="prediabetes">Prediabetes</option>
                  </select>
                </div>
              )}

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900 space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <HeartPulse className="w-4 h-4" /> Vas a poder registrar
                </p>
                <ul className="text-xs space-y-1 text-blue-800">
                  {(conditions.includes("diabetes") || conditions.includes("prevention")) && (
                    <li>· Glucosa y alimentación con foto</li>
                  )}
                  {(conditions.includes("hypertension") || conditions.includes("cardiac") || conditions.includes("prevention")) && (
                    <li>· Presión arterial y frecuencia cardíaca</li>
                  )}
                  {(conditions.includes("obesity") || conditions.includes("prevention")) && (
                    <li>· Peso e IMC</li>
                  )}
                  {(conditions.includes("dyslipidemia") || conditions.includes("prevention")) && (
                    <li>· Colesterol y triglicéridos</li>
                  )}
                  <li>· Síntomas de alerta para tu médico</li>
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900 flex gap-2">
                <Heart className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Esta app es apoyo informativo del IPS. No reemplaza la consulta médica
                  profesional.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Empezar"}
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
