"use client";

import { useState } from "react";
import {
  Activity,
  Droplets,
  HeartPulse,
  Scale,
  TriangleAlert,
  X,
} from "lucide-react";
import { SYMPTOM_TYPES } from "@/lib/health";
import { cn } from "@/lib/utils";

interface VitalActionsProps {
  onSuccess: () => void;
}

type VitalModal = "bp" | "weight" | "hr" | "chol" | "symptom" | null;

export function VitalActions({ onSuccess }: VitalActionsProps) {
  const [modal, setModal] = useState<VitalModal>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [weight, setWeight] = useState("");
  const [bpm, setBpm] = useState("");
  const [hrContext, setHrContext] = useState("reposo");
  const [total, setTotal] = useState("");
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [trig, setTrig] = useState("");
  const [symptomType, setSymptomType] = useState("mareos");
  const [severity, setSeverity] = useState(2);
  const [notes, setNotes] = useState("");

  function close() {
    setModal(null);
    setMsg(null);
    setNotes("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      let res: Response;
      if (modal === "bp") {
        res = await fetch("/api/vitals/bp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systolic: parseInt(sys, 10),
            diastolic: parseInt(dia, 10),
            pulse: pulse ? parseInt(pulse, 10) : null,
            notes: notes || null,
          }),
        });
      } else if (modal === "weight") {
        res = await fetch("/api/vitals/weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weightKg: parseFloat(weight), notes: notes || null }),
        });
      } else if (modal === "hr") {
        res = await fetch("/api/vitals/hr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bpm: parseInt(bpm, 10),
            context: hrContext,
            notes: notes || null,
          }),
        });
      } else if (modal === "chol") {
        res = await fetch("/api/vitals/cholesterol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total: total ? parseFloat(total) : null,
            ldl: ldl ? parseFloat(ldl) : null,
            hdl: hdl ? parseFloat(hdl) : null,
            triglycerides: trig ? parseFloat(trig) : null,
            notes: notes || null,
          }),
        });
      } else {
        res = await fetch("/api/vitals/symptoms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: symptomType,
            severity,
            notes: notes || null,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      if (modal === "bp" && data.status) setMsg(data.status.label);
      else if (modal === "weight" && data.bmi != null)
        setMsg(`IMC ${data.bmi} · ${data.bmiCategory?.label ?? ""}`);
      else if (modal === "hr" && data.status) setMsg(data.status.label);
      else if (modal === "chol" && data.status) setMsg(data.status.label);
      else if (modal === "symptom") setMsg(data.message);
      else setMsg("Guardado ✓");

      onSuccess();
      setTimeout(close, 1400);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const actions = [
    { key: "bp" as const, label: "Presión", icon: Activity, color: "from-rose-500 to-red-600" },
    { key: "weight" as const, label: "Peso", icon: Scale, color: "from-amber-500 to-orange-600" },
    { key: "hr" as const, label: "Pulso", icon: HeartPulse, color: "from-pink-500 to-rose-600" },
    { key: "chol" as const, label: "Colesterol", icon: Droplets, color: "from-violet-500 to-purple-600" },
    { key: "symptom" as const, label: "Síntoma", icon: TriangleAlert, color: "from-slate-600 to-slate-800" },
  ];

  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setModal(a.key)}
            className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition touch-manipulation"
          >
            <span className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white", a.color)}>
              <a.icon className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">
              {a.label}
            </span>
          </button>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 safe-bottom">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">
                {modal === "bp" && "Registrar presión arterial"}
                {modal === "weight" && "Registrar peso"}
                {modal === "hr" && "Registrar frecuencia cardíaca"}
                {modal === "chol" && "Registrar laboratorio de lípidos"}
                {modal === "symptom" && "Registrar síntoma"}
              </h3>
              <button type="button" onClick={close} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {modal === "bp" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Sistólica</label>
                      <input
                        type="number"
                        value={sys}
                        onChange={(e) => setSys(e.target.value)}
                        placeholder="120"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xl font-bold text-center outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Diastólica</label>
                      <input
                        type="number"
                        value={dia}
                        onChange={(e) => setDia(e.target.value)}
                        placeholder="80"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xl font-bold text-center outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Pulso (opcional)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="72"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                </>
              )}

              {modal === "weight" && (
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="72.5"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-2xl font-bold text-center outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {modal === "hr" && (
                <>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Latidos por minuto</label>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="72"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-2xl font-bold text-center outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Contexto</label>
                    <select
                      value={hrContext}
                      onChange={(e) => setHrContext(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="reposo">En reposo</option>
                      <option value="ejercicio">Después de ejercicio</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </>
              )}

              {modal === "chol" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total" value={total} onChange={setTotal} />
                  <Field label="LDL" value={ldl} onChange={setLdl} />
                  <Field label="HDL" value={hdl} onChange={setHdl} />
                  <Field label="Triglicéridos" value={trig} onChange={setTrig} />
                </div>
              )}

              {modal === "symptom" && (
                <>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Síntoma</label>
                    <select
                      value={symptomType}
                      onChange={(e) => setSymptomType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {SYMPTOM_TYPES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">
                      Intensidad: {severity}/5
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm text-slate-600 mb-1 block">Notas (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
                  placeholder="Opcional"
                />
              </div>

              {msg && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  {msg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50 touch-manipulation"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-1 block">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none"
      />
    </div>
  );
}
