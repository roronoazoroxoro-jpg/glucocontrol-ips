"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { IPSLogo } from "./IPSLogo";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { email, password, name, acceptTerms }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar");

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col safe-top">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-6 md:p-10 max-w-md w-full">
          <div className="flex flex-col items-center mb-8">
            <IPSLogo size="lg" showText />
            <h1 className="text-xl font-bold gradient-text mt-4">
              {isRegister ? "Crear cuenta" : "Iniciar sesión"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 text-center">
              GlucoControl IPS · Posadas, Misiones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                  <User className="w-4 h-4" /> Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="Ej: María"
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                placeholder="tu@email.com"
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
                  minLength={isRegister ? 8 : 1}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder={isRegister ? "Mínimo 8 caracteres" : "Tu contraseña"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>
                  Acepto los{" "}
                  <Link href="/terminos" className="text-emerald-700 underline" target="_blank">
                    Términos de uso
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacidad" className="text-emerald-700 underline" target="_blank">
                    Política de privacidad
                  </Link>
                  . Entiendo que esta app no reemplaza la consulta médica.
                </span>
              </label>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 active:scale-[0.98] transition disabled:opacity-60 touch-manipulation"
            >
              {loading ? "Procesando..." : isRegister ? "Crear cuenta" : "Entrar"}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            {isRegister ? (
              <>
                ¿Ya tenés cuenta?{" "}
                <Link href={`/login${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-emerald-700 font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </>
            ) : (
              <>
                ¿Primera vez?{" "}
                <Link href={`/registro${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-emerald-700 font-medium hover:underline">
                  Crear cuenta gratis
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
