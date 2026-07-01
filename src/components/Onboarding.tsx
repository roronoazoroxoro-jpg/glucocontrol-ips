"use client";

import { useState } from "react";
import { Heart, Stethoscope, User } from "lucide-react";
import { IPSLogo } from "./IPSLogo";
import { requestNotificationPermission } from "@/lib/reminders";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [diabetesType, setDiabetesType] = useState("tipo2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre");
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
          diabetesType,
          doctorName: doctorName.trim() || null,
          notificationsEnabled: true,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar perfil");
      await requestNotificationPermission();
      onComplete();
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 safe-top">
      <div className="glass-card rounded-3xl p-6 md:p-10 max-w-lg w-full">
        <div className="flex flex-col items-center mb-8 pt-2">
          <IPSLogo size="lg" showText />
          <div className="mt-4 text-center">
            <h1 className="text-xl font-bold gradient-text">GlucoControl IPS</h1>
            <p className="text-sm text-slate-500 mt-1">
              Programa de Diabetes · Posadas, Misiones
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Bienvenido/a</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Configura tu perfil para que la IA te hable por tu nombre y te dé
            recomendaciones personalizadas según tu glucosa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User className="w-4 h-4" />
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition text-base"
              autoFocus
              autoComplete="name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Stethoscope className="w-4 h-4" />
              Médico asignado (IPS)
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Ej: Dr. García"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition text-base"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Heart className="w-4 h-4" />
              Tipo de diabetes
            </label>
            <select
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white text-base"
            >
              <option value="tipo1">Tipo 1</option>
              <option value="tipo2">Tipo 2</option>
              <option value="gestacional">Gestacional</option>
              <option value="prediabetes">Prediabetes</option>
            </select>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 active:scale-[0.98] transition disabled:opacity-60 touch-manipulation"
          >
            {loading ? "Guardando..." : "Comenzar"}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center leading-relaxed">
          Herramienta de apoyo del IPS Misiones. No reemplaza la consulta médica profesional.
        </p>
      </div>
    </div>
  );
}
