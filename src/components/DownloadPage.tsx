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

  return (
    <div className="min-h-screen safe-bottom bg-[#eef6f8]">
      {/* HERO full-bleed con imagen real */}
      <header className="relative min-h-[100dvh] flex flex-col overflow-hidden safe-top">
        <Image
          src="/landing/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] landing-hero-img"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/75 via-navy-900/55 to-navy-900/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 via-transparent to-teal-900/35" />

        <nav className="relative z-20 px-4 pt-5 flex items-center justify-between max-w-6xl mx-auto w-full animate-fade-in">
          <div className="inline-flex items-center rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-black/20 ring-1 ring-white/60">
            <IPSLogo size="sm" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#tutorial"
              className="text-xs font-semibold text-white/95 hover:text-white transition px-3 py-2 rounded-full hover:bg-white/10"
            >
              Cómo funciona
            </a>
            <Link
              href="/admin/login"
              className="text-xs font-medium text-white/80 hover:text-white transition px-3 py-2 rounded-full border border-white/25 hover:bg-white/10"
            >
              Acceso médico
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-24 text-center">
          <BrandMark size="xl" light className="animate-fade-up drop-shadow-lg" />
          <h1 className="sr-only">VitalIPS</h1>
          <p className="mt-6 text-white text-xl md:text-2xl max-w-lg animate-fade-up stagger-1 font-medium tracking-tight drop-shadow-md">
            Tu salud integral, todos los días.
          </p>
          <p className="mt-3 text-teal-50/90 text-sm md:text-base max-w-md animate-fade-up stagger-2 leading-relaxed">
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
                    className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/15 text-white border border-white/40 backdrop-blur-md font-semibold touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                    Instalar app
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/15 text-white border border-white/40 backdrop-blur-md font-semibold touch-manipulation"
                  >
                    Ya tengo cuenta
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#eef6f8] to-transparent z-10 pointer-events-none" />
      </header>

      {/* Producto en mano + pilares con foto */}
      <section className="relative px-4 -mt-6 md:-mt-16 pb-16 md:pb-24 z-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-end">
          <div className="relative mx-auto w-full max-w-[280px] md:max-w-[320px] animate-fade-up">
            <div className="absolute -inset-8 rounded-full bg-teal-400/25 blur-3xl pointer-events-none" />
            <Image
              src="/landing/phone.webp"
              alt="Vista de VitalIPS en el celular"
              width={640}
              height={860}
              className="relative w-full h-auto drop-shadow-2xl"
              priority
            />
          </div>

          <div className="pb-2">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 mb-3">
              Para el día a día
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy-900 leading-tight">
              Entre consultas, tu salud sigue acompañada
            </h2>
            <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
              VitalIPS no reemplaza al médico: te ayuda a registrar cómo vas y le da a tu equipo
              IPS datos reales para decidir mejor.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: HeartPulse,
                  title: "Seguimiento diario",
                  desc: "Glucosa, presión, peso, pulso y síntomas.",
                },
                {
                  icon: Camera,
                  title: "Comida inteligente",
                  desc: "Foto del plato y nutrientes estimados.",
                },
                {
                  icon: Stethoscope,
                  title: "Visibilidad médica",
                  desc: "Tu equipo IPS ve evolución e informes.",
                },
              ].map((p) => (
                <div key={p.title}>
                  <div className="inline-flex w-11 h-11 rounded-2xl bg-gradient-to-br from-navy-700 to-teal-600 items-center justify-center mb-3 shadow-lg shadow-teal-700/20">
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-navy-900 mb-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Galería narrativa — imágenes grandes */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5 md:gap-6">
          <figure className="relative group overflow-hidden rounded-[1.75rem] min-h-[280px] md:min-h-[360px]">
            <Image
              src="/landing/vitals.webp"
              alt="Registro de presión arterial en casa"
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-transparent flex flex-col justify-end p-6 md:p-8">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-teal-200 mb-2">
                Signos vitales
              </p>
              <h3 className="font-display text-2xl font-semibold text-white leading-tight">
                Glucosa, presión y peso, cuando los medís
              </h3>
              <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
                Registrá en segundos y mirá cómo vas a lo largo de los días.
              </p>
            </figcaption>
          </figure>

          <figure className="relative group overflow-hidden rounded-[1.75rem] min-h-[280px] md:min-h-[360px]">
            <Image
              src="/landing/food.webp"
              alt="Foto de comida para análisis nutricional"
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-transparent flex flex-col justify-end p-6 md:p-8">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-teal-200 mb-2">
                Alimentación
              </p>
              <h3 className="font-display text-2xl font-semibold text-white leading-tight">
                Sacá una foto de tu plato
              </h3>
              <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
                La app estima nutrientes e impacto en tu salud.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Médico al tanto — foto dominante */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-[2rem] min-h-[420px] md:min-h-[480px]">
          <Image
            src="/landing/doctor.webp"
            alt="Médico revisando la evolución del paciente"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/92 via-navy-900/70 to-navy-900/25" />
          <div className="relative z-10 max-w-xl px-6 py-12 md:px-12 md:py-16">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-teal-200 mb-3">
              Cuidado en equipo
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight">
              Vos registrás.
              <br />
              Tu médico ve.
            </h2>
            <p className="mt-4 text-teal-50/90 text-base leading-relaxed">
              El equipo del IPS puede revisar tu ficha, alertas e informes. Así el cuidado no
              empieza de cero en cada consulta: llega con tu historia real.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-white/90">
              <li className="flex gap-2">
                <span className="text-teal-300">▸</span> Panel médico con pacientes y alertas
              </li>
              <li className="flex gap-2">
                <span className="text-teal-300">▸</span> Historial de signos vitales y comidas
              </li>
              <li className="flex gap-2">
                <span className="text-teal-300">▸</span> Informes listos para la consulta
              </li>
            </ul>
            <a
              href="#tutorial"
              className="btn-press mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white border-b border-white/40 pb-0.5 hover:border-white transition"
            >
              Ver cómo funciona
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <LandingTutorial />

      {/* Instalar */}
      <section className="px-4 py-16 md:py-20 bg-white/50">
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
