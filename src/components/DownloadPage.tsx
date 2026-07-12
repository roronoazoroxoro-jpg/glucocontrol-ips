"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Apple,
  Camera,
  ChevronRight,
  Download,
  HeartPulse,
  Stethoscope,
  Smartphone,
} from "lucide-react";
import { IPSLogo } from "@/components/IPSLogo";
import { BrandMark } from "@/components/BrandMark";
import { LandingTutorial } from "@/components/LandingTutorial";
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
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone);
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

  const pillars = [
    {
      icon: HeartPulse,
      title: "Seguimiento diario",
      desc: "Glucosa, presión, peso, pulso y síntomas en un solo lugar.",
    },
    {
      icon: Camera,
      title: "Alimentación inteligente",
      desc: "Foto o texto de tu comida, con nutrientes e impacto en tu salud.",
    },
    {
      icon: Stethoscope,
      title: "Visibilidad médica",
      desc: "Tu equipo IPS ve tu evolución y descarga informes clínicos.",
    },
  ];

  return (
    <div className="min-h-screen safe-bottom">
      {/* HERO — una sola composición */}
      <header className="relative min-h-[100dvh] flex flex-col overflow-hidden hero-mesh safe-top">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-20 w-[28rem] h-[28rem] rounded-full bg-teal-300/30 blur-3xl animate-float" />
          <div className="absolute top-[40%] -right-24 w-[34rem] h-[34rem] rounded-full bg-sky-400/25 blur-3xl animate-float-delayed" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-black/25 to-transparent" />
          {/* Pulso visual de marca */}
          <svg
            className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[min(92vw,720px)] opacity-25 animate-fade-in"
            viewBox="0 0 720 120"
            fill="none"
            aria-hidden
          >
            <path
              d="M0 60 H180 L210 60 L240 20 L270 100 L300 60 H420 L450 60 L480 35 L510 85 L540 60 H720"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="landing-pulse-line"
            />
          </svg>
        </div>

        <nav className="relative z-20 px-4 pt-5 flex items-center justify-between max-w-5xl mx-auto w-full animate-fade-in">
          <div className="inline-flex items-center rounded-xl bg-white/95 px-3 py-2 shadow-md shadow-black/10">
            <IPSLogo size="sm" showText />
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            <a
              href="#tutorial"
              className="text-xs font-medium text-white/85 hover:text-white transition"
            >
              Cómo funciona
            </a>
            <Link
              href="/admin/login"
              className="text-xs font-medium text-white/70 hover:text-white transition"
            >
              Acceso médico
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-20 text-center">
          <BrandMark size="xl" light className="animate-fade-up drop-shadow-sm" />
          <h1 className="sr-only">VitalIPS</h1>
          <p className="mt-6 text-white text-xl md:text-2xl max-w-lg animate-fade-up stagger-1 font-medium tracking-tight">
            Tu salud integral, todos los días.
          </p>
          <p className="mt-3 text-teal-100/85 text-sm md:text-base max-w-md animate-fade-up stagger-2 leading-relaxed">
            Seguimiento entre consultas para afiliados del Instituto de Previsión Social ·
            Posadas, Misiones.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10 w-full max-w-md animate-fade-up stagger-3">
            {isStandalone ? (
              <Link
                href="/app"
                className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-navy-900 font-semibold shadow-2xl touch-manipulation"
              >
                Abrir VitalIPS
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/registro"
                  className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-navy-900 font-semibold shadow-2xl touch-manipulation"
                >
                  Empezar gratis
                  <ChevronRight className="w-5 h-5" />
                </Link>
                {deferred ? (
                  <button
                    onClick={handleInstall}
                    className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/12 text-white border border-white/35 backdrop-blur-md font-semibold touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                    Instalar app
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/12 text-white border border-white/35 backdrop-blur-md font-semibold touch-manipulation"
                  >
                    Ya tengo cuenta
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Propósito */}
      <section className="relative px-4 py-20 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 mb-4 animate-fade-up">
            Para el día a día
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy-900 leading-tight animate-fade-up stagger-1">
            Entre consultas, tu salud sigue acompañada
          </h2>
          <p className="mt-5 text-slate-600 text-base md:text-lg leading-relaxed animate-fade-up stagger-2">
            VitalIPS no reemplaza al médico: te ayuda a registrar cómo vas y le da a tu equipo
            IPS datos reales para decidir mejor.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-14 grid md:grid-cols-3 gap-10 md:gap-8">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={cn("text-center md:text-left animate-fade-up", `stagger-${i + 1}`)}
            >
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-700 to-teal-600 items-center justify-center mb-4 shadow-lg shadow-teal-700/20">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <LandingTutorial />

      {/* Instalar */}
      <section className="px-4 py-16 md:py-20 bg-white/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy-900">
              Instalá VitalIPS en tu celular
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Funciona como app, sin pasar por la tienda.
            </p>
          </div>

          <div className="grid md:grid-cols-[220px_1fr_1fr] gap-8 items-start">
            <div className="flex flex-col items-center text-center mx-auto">
              {qrUrl && (
                <div className="rounded-2xl bg-white p-3 shadow-lg shadow-navy-900/5 border border-slate-100">
                  <Image
                    src={qrUrl}
                    alt="Código QR VitalIPS"
                    width={180}
                    height={180}
                    className="rounded-xl"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">Escaneá con la cámara</p>
              {appUrl && (
                <p className="text-[10px] text-teal-700 mt-1 break-all font-mono max-w-[200px]">
                  {appUrl}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-teal-700" />
                <h3 className="font-semibold text-navy-900">Android</h3>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <Step n={1}>Abrí esta página en Chrome</Step>
                <Step n={2}>Tocá Instalar app o menú ⋮ → Instalar</Step>
                <Step n={3}>Queda con ícono en tu pantalla de inicio</Step>
              </ol>
              {deferred && (
                <button
                  onClick={handleInstall}
                  className="btn-press mt-5 w-full py-2.5 rounded-xl bg-navy-700 text-white text-sm font-medium touch-manipulation"
                >
                  Instalar ahora
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Apple className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-navy-900">iPhone / iPad</h3>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <Step n={1}>Abrí esta página en Safari</Step>
                <Step n={2}>Tocá Compartir</Step>
                <Step n={3}>Elegí Agregar a pantalla de inicio</Step>
              </ol>
              {isIOS && !isStandalone && (
                <p className="mt-5 text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  Estás en iPhone: usá Safari y los pasos de arriba.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <footer className="px-4 py-14 border-t border-teal-100/70">
        <div className="max-w-lg mx-auto text-center">
          <BrandMark size="md" className="mb-3" />
          <p className="text-sm text-slate-500 mb-8">
            Instituto de Previsión Social · Posadas, Misiones
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/registro"
              className="btn-press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-navy-700 to-teal-600 text-white font-semibold shadow-md touch-manipulation"
            >
              Crear cuenta
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="btn-press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-teal-300 text-teal-900 font-semibold touch-manipulation"
            >
              Iniciar sesión
            </Link>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs mb-6">
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
          <p className="text-xs text-slate-400 leading-relaxed">
            Apoyo informativo del IPS. No reemplaza la consulta médica profesional.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            © {new Date().getFullYear()} Instituto de Previsión Social — Posadas, Misiones
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center shrink-0 text-xs font-bold">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
