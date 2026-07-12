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
  HeartPulse,
  Mic,
  Scale,
  Smartphone,
} from "lucide-react";
import { IPSLogo } from "@/components/IPSLogo";
import { BrandMark } from "@/components/BrandMark";
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
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&color=0b4f8c&bgcolor=eef8f6&data=${encodeURIComponent(url)}`
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
      icon: HeartPulse,
      title: "Signos vitales",
      desc: "Presión, pulso, glucosa y peso con alertas claras para vos y tu médico.",
    },
    {
      icon: Camera,
      title: "Foto de tu comida",
      desc: "La app reconoce el plato y estima nutrientes e impacto en tu salud.",
    },
    {
      icon: Scale,
      title: "Peso, IMC y colesterol",
      desc: "Seguí tu evolución corporal y de laboratorio en un solo lugar.",
    },
    {
      icon: Brain,
      title: "Asistente con IA",
      desc: "Orientación personalizada según tu perfil de salud integral.",
    },
    {
      icon: Mic,
      title: "Control por voz",
      desc: "Registrá datos hablando, sin escribir.",
    },
    {
      icon: Activity,
      title: "Panel médico IPS",
      desc: "Tu equipo de salud ve tu evolución en tiempo real.",
    },
  ];

  return (
    <div className="min-h-screen safe-top safe-bottom">
      <header className="relative min-h-[92dvh] flex flex-col overflow-hidden hero-mesh">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[12%] left-[8%] w-72 h-72 rounded-full bg-teal-300/25 blur-3xl animate-float" />
          <div className="absolute bottom-[18%] right-[5%] w-96 h-96 rounded-full bg-sky-400/20 blur-3xl animate-float-delayed" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        </div>

        <div className="relative z-10 px-4 pt-6 flex justify-center animate-fade-in">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3 shadow-lg shadow-black/10">
            <IPSLogo size="md" showText />
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16 text-center">
          <BrandMark size="xl" light className="animate-fade-up" />
          <p className="mt-5 text-white/90 text-lg md:text-xl max-w-md animate-fade-up stagger-1 font-medium">
            Tu salud integral, en el bolsillo.
          </p>
          <p className="mt-2 text-teal-100/80 text-sm md:text-base max-w-sm animate-fade-up stagger-2">
            Instituto de Previsión Social · Posadas, Misiones
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10 w-full max-w-md animate-fade-up stagger-3">
            {isStandalone ? (
              <Link
                href="/app"
                className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-navy-800 font-semibold shadow-xl touch-manipulation"
              >
                Abrir aplicación
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                {deferred && (
                  <button
                    onClick={handleInstall}
                    className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-navy-800 font-semibold shadow-xl touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                    Instalar en mi celular
                  </button>
                )}
                <Link
                  href="/registro"
                  className={cn(
                    "btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold touch-manipulation",
                    deferred
                      ? "bg-white/15 text-white border border-white/35 backdrop-blur-sm"
                      : "bg-white text-navy-800 shadow-xl"
                  )}
                >
                  Crear cuenta gratis
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/15 text-white border border-white/35 backdrop-blur-sm font-semibold touch-manipulation"
                >
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy-900 text-center mb-2 animate-fade-up">
          Todo lo que necesitás cuidar
        </h2>
        <p className="text-sm text-slate-500 text-center mb-10 max-w-lg mx-auto animate-fade-up stagger-1">
          No es solo diabetes: presión, corazón, peso, colesterol, alimentación y síntomas.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                "glass-card rounded-2xl p-5 animate-fade-up",
                `stagger-${Math.min(i + 1, 5)}`
              )}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-navy-700 flex items-center justify-center mb-3 shadow-md shadow-teal-500/20">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-teal-100/80 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="font-display text-xl font-semibold text-navy-900 text-center mb-2 flex items-center justify-center gap-2">
            <Smartphone className="w-6 h-6 text-teal-600" />
            Cómo instalar en tu celular
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Escaneá el código QR o seguí los pasos según tu dispositivo
          </p>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center animate-scale-in">
              {qrUrl && (
                <Image
                  src={qrUrl}
                  alt="Código QR para descargar VitalIPS"
                  width={220}
                  height={220}
                  className="rounded-xl"
                  unoptimized
                />
              )}
              <p className="text-xs text-slate-500 mt-3">Escaneá con la cámara de tu celular</p>
              {appUrl && (
                <p className="text-xs text-teal-700 mt-1 break-all font-mono">{appUrl}</p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6 animate-scale-in stagger-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="font-semibold text-slate-800">Android</h3>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                  Abrí esta página en <strong>Chrome</strong>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                  Tocá <strong>Instalar en mi celular</strong>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                  O menú ⋮ → <strong>Instalar aplicación</strong>
                </li>
              </ol>
              {deferred && (
                <button
                  onClick={handleInstall}
                  className="btn-press mt-4 w-full py-2.5 rounded-xl bg-navy-700 text-white text-sm font-medium touch-manipulation"
                >
                  Instalar ahora
                </button>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6 animate-scale-in stagger-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Apple className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-800">iPhone / iPad</h3>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                  Abrí esta página en <strong>Safari</strong>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                  Tocá <strong>Compartir</strong>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                  Elegí <strong>Agregar a pantalla de inicio</strong>
                </li>
              </ol>
              {isIOS && !isStandalone && (
                <p className="mt-4 text-xs text-amber-800 bg-amber-50 rounded-lg p-3">
                  Estás en iPhone. Seguí los pasos de arriba para instalar la app.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-4 py-10 text-center">
        <BrandMark size="md" className="mb-4" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/registro"
            className="btn-press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-navy-700 to-teal-600 text-white font-semibold shadow-md touch-manipulation"
          >
            Crear cuenta
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="btn-press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-teal-300 text-teal-800 font-semibold touch-manipulation"
          >
            Iniciar sesión
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mb-4">
          <Link href="/privacidad" className="text-teal-700 hover:underline">
            Privacidad
          </Link>
          <Link href="/terminos" className="text-teal-700 hover:underline">
            Términos
          </Link>
          <Link href="/admin/login" className="text-slate-400 hover:underline">
            Acceso médico
          </Link>
        </nav>
        <p className="text-xs text-slate-400 mt-6 max-w-md mx-auto leading-relaxed">
          Herramienta de apoyo informativo del IPS Misiones. No reemplaza la consulta médica
          profesional.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          © {new Date().getFullYear()} Instituto de Previsión Social — Posadas, Misiones
        </p>
      </footer>
    </div>
  );
}
