"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Apple,
  Brain,
  Camera,
  ChevronRight,
  Download,
  Mic,
  Smartphone,
  Utensils,
} from "lucide-react";
import { IPSLogo } from "@/components/IPSLogo";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function DownloadPage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [appUrl, setAppUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}/app`;
    setAppUrl(url);
    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&color=047857&bgcolor=f0fdf4&data=${encodeURIComponent(url)}`
    );

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);
    setIsStandalone(!!standalone);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
  }

  const features = [
    {
      icon: Camera,
      title: "Foto de tu comida",
      desc: "Sacá una foto del plato y la IA detecta los alimentos y calcula calorías, carbohidratos e impacto en tu glucosa.",
    },
    {
      icon: Activity,
      title: "Monitoreo de glucosa",
      desc: "Registra y visualiza tu nivel de azúcar en sangre con gráficos claros.",
    },
    {
      icon: Utensils,
      title: "Qué comer y beber",
      desc: "Recomendaciones personalizadas según tu glucosa actual.",
    },
    {
      icon: Brain,
      title: "Asistente con IA",
      desc: "Chat inteligente que te habla por tu nombre y te guía día a día.",
    },
    {
      icon: Mic,
      title: "Control por voz",
      desc: "Registra comidas y glucosa hablando, sin escribir.",
    },
  ];

  return (
    <div className="min-h-screen safe-top safe-bottom">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-16 text-center">
          <div className="inline-flex bg-white rounded-2xl px-6 py-4 shadow-xl mb-6">
            <IPSLogo size="lg" showText />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            GlucoControl IPS
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto mb-2">
            Tu asistente inteligente de diabetes
          </p>
          <p className="text-emerald-200/80 text-sm md:text-base max-w-xl mx-auto">
            Instituto de Previsión Social · Posadas, Misiones
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-semibold shadow-lg hover:bg-emerald-50 transition touch-manipulation"
            >
              Crear cuenta gratis
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500/30 text-white border border-white/30 font-semibold hover:bg-emerald-500/40 transition touch-manipulation"
            >
              Ya tengo cuenta
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            {isStandalone ? (
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-semibold shadow-lg hover:bg-emerald-50 transition touch-manipulation"
              >
                Abrir aplicación
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                {deferred && (
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-semibold shadow-lg hover:bg-emerald-50 transition touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                    Instalar en mi celular
                  </button>
                )}
                <Link
                  href="/app"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition touch-manipulation",
                    deferred
                      ? "bg-emerald-500/30 text-white border border-white/30 hover:bg-emerald-500/40"
                      : "bg-white text-emerald-700 shadow-lg hover:bg-emerald-50"
                  )}
                >
                  {deferred ? "Usar en navegador" : "Abrir aplicación"}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">
          Todo lo que necesitás en tu bolsillo
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Download instructions */}
      <section className="bg-white/60 border-y border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-2 flex items-center justify-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-600" />
            Cómo instalar en tu celular
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Escaneá el código QR o seguí los pasos según tu dispositivo
          </p>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* QR */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center md:col-span-1">
              {qrUrl && (
                <Image
                  src={qrUrl}
                  alt="Código QR para descargar GlucoControl IPS"
                  width={220}
                  height={220}
                  className="rounded-xl"
                  unoptimized
                />
              )}
              <p className="text-xs text-slate-500 mt-3">
                Escaneá con la cámara de tu celular
              </p>
              {appUrl && (
                <p className="text-xs text-emerald-600 mt-1 break-all font-mono">{appUrl}</p>
              )}
            </div>

            {/* Android */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Android</h3>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                  Abrí esta página en <strong>Chrome</strong>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                  Tocá el botón <strong>Instalar en mi celular</strong> arriba
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                  O menú ⋮ → <strong>Instalar aplicación</strong>
                </li>
              </ol>
              {deferred && (
                <button
                  onClick={handleInstall}
                  className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium touch-manipulation"
                >
                  Instalar ahora
                </button>
              )}
            </div>

            {/* iPhone */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Apple className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-800">iPhone / iPad</h3>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                  Abrí esta página en <strong>Safari</strong>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                  Tocá el botón <strong>Compartir</strong> (cuadrado con flecha)
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                  Elegí <strong>Agregar a pantalla de inicio</strong>
                </li>
              </ol>
              {isIOS && !isStandalone && (
                <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
                  Estás en iPhone. Seguí los pasos de arriba para instalar la app.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="max-w-4xl mx-auto px-4 py-10 text-center border-t border-slate-200/60">
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/registro"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md touch-manipulation"
          >
            Crear cuenta
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-300 text-emerald-700 font-semibold touch-manipulation"
          >
            Iniciar sesión
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mb-4">
          <Link href="/privacidad" className="text-emerald-700 hover:underline">
            Privacidad
          </Link>
          <Link href="/terminos" className="text-emerald-700 hover:underline">
            Términos
          </Link>
        </nav>
        <p className="text-xs text-slate-400 mt-6 max-w-md mx-auto leading-relaxed">
          Herramienta de apoyo informativo del IPS Misiones. No reemplaza la consulta
          médica profesional. Consulte siempre a su médico de cabecera.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          © {new Date().getFullYear()} Instituto de Previsión Social — Posadas, Misiones
        </p>
      </footer>
    </div>
  );
}
