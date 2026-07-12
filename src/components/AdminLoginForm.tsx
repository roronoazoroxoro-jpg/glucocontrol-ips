"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Stethoscope } from "lucide-react";
import { IPSLogo } from "./IPSLogo";
import { BrandMark } from "./BrandMark";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar sesión");

      const role = data.user?.role ?? "patient";
      if (role !== "doctor" && role !== "admin") {
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("Esta cuenta no tiene acceso al panel médico.");
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col safe-top bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-6 md:p-10 max-w-md w-full border border-blue-100 animate-scale-in">
          <div className="flex flex-col items-center mb-8">
            <IPSLogo size="md" />
            <BrandMark size="md" className="mt-5" />
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5" />
              Panel médico IPS
            </div>
            <h1 className="text-lg font-semibold text-slate-800 mt-4">Acceso para doctores</h1>
            <p className="text-sm text-slate-500 mt-1 text-center">
              Seguimiento de pacientes en tiempo real
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Mail className="w-4 h-4" /> Email institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="doctor@ipsmisiones.gov.ar"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Lock className="w-4 h-4" /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1e5a9e] text-white font-semibold hover:bg-[#174a82] disabled:opacity-50 transition touch-manipulation"
            >
              {loading ? "Ingresando..." : "Entrar al panel"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            <Link href="/" className="text-[#1e5a9e] hover:underline">
              Volver al inicio público
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
