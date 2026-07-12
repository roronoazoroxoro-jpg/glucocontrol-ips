"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Camera,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Droplets,
  FileDown,
  HeartPulse,
  Lock,
  Mic,
  Scale,
  ShieldCheck,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type GuideId = "cuenta" | "usar" | "medico";

interface GuideStep {
  label: string;
  title: string;
  desc: string;
  tip?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GUIDES: Record<
  GuideId,
  { eyebrow: string; title: string; subtitle: string; steps: GuideStep[]; cta?: { href: string; label: string } }
> = {
  cuenta: {
    eyebrow: "Empezá en minutos",
    title: "Cómo crear tu cuenta",
    subtitle:
      "Registro simple y seguro. En pocos pasos quedás listo para cuidar tu salud con VitalIPS.",
    cta: { href: "/registro", label: "Crear mi cuenta ahora" },
    steps: [
      {
        label: "Registro",
        title: "Creá tu cuenta gratis",
        desc: "Entrá a Crear cuenta, escribí tu nombre, correo y una contraseña. Aceptá los términos para continuar.",
        tip: "Usá un correo que mires seguido: ahí van avisos importantes.",
        icon: UserPlus,
      },
      {
        label: "Perfil",
        title: "Contanos tu salud",
        desc: "Completá tu perfil: condiciones (diabetes, hipertensión, peso, corazón, colesterol) y datos básicos. La app se adapta a vos.",
        tip: "Podés marcar varias condiciones a la vez.",
        icon: ClipboardList,
      },
      {
        label: "App",
        title: "Instalá en tu celular",
        desc: "Agregá VitalIPS a la pantalla de inicio. Así la abrís como una app, sin buscarla en el navegador.",
        tip: "En Android: Instalar. En iPhone: Safari → Compartir → Agregar a inicio.",
        icon: Lock,
      },
      {
        label: "Listo",
        title: "Empezá a registrar",
        desc: "Ya podés cargar glucosa, presión, peso, comidas y síntomas. Tu historial queda guardado para vos y tu equipo médico.",
        icon: ShieldCheck,
      },
    ],
  },
  usar: {
    eyebrow: "Día a día",
    title: "Cómo usar VitalIPS",
    subtitle:
      "Todo lo que necesitás entre consultas: signos vitales, comida, voz y orientación con IA.",
    steps: [
      {
        label: "Vitales",
        title: "Registrá tus signos",
        desc: "Cargá glucosa, presión arterial, pulso, peso e IMC. Ves tendencias y alertas claras cuando algo sale de rango.",
        icon: Droplets,
      },
      {
        label: "Comida",
        title: "Foto o texto de tu plato",
        desc: "Sacá una foto de la comida o describila. La app estima nutrientes e impacto en tu salud.",
        tip: "Cuanto más clara la foto, mejor la estimación.",
        icon: Camera,
      },
      {
        label: "Voz e IA",
        title: "Hablá o preguntá",
        desc: "Registrá datos por voz y consultá al asistente según tu perfil. Orientación práctica, no diagnóstico.",
        icon: Mic,
      },
      {
        label: "Informe",
        title: "Exportá tu evolución",
        desc: "Descargá un informe para llevar a la consulta o compartirlo con tu médico IPS cuando lo pida.",
        icon: FileDown,
      },
    ],
  },
  medico: {
    eyebrow: "Cuidado compartido",
    title: "Tu médico está al tanto",
    subtitle:
      "VitalIPS conecta tu día a día con el equipo de salud del IPS. No estás solo: tu evolución llega a quien te atiende.",
    steps: [
      {
        label: "Panel",
        title: "Visibilidad en tiempo real",
        desc: "Los profesionales del IPS pueden ver tu ficha, registros recientes y alertas desde el panel médico.",
        icon: Stethoscope,
      },
      {
        label: "Alertas",
        title: "Señales a tiempo",
        desc: "Valores fuera de rango o síntomas importantes quedan visibles para un seguimiento más oportuno.",
        tip: "Ante una emergencia, llamá a tu servicio de urgencias. La app no reemplaza atención inmediata.",
        icon: HeartPulse,
      },
      {
        label: "Consulta",
        title: "Mejores decisiones juntos",
        desc: "En el consultorio, el médico ya tiene tu historial de glucosa, presión, peso y comidas. Menos memoria, más datos.",
        icon: Activity,
      },
      {
        label: "Privacidad",
        title: "Datos protegidos",
        desc: "Tu información es de uso sanitario del IPS. Vos controlás qué registrás; el acceso médico es para tu cuidado.",
        icon: ShieldCheck,
      },
    ],
  },
};

const FAQ = [
  {
    q: "¿VitalIPS reemplaza a Alegramed o a la consulta médica?",
    a: "No. Alegramed se enfoca en turnos, teleconsulta y recetas. VitalIPS es el seguimiento diario entre consultas (glucosa, presión, peso, comida). Se complementan: el médico te atiende y, entre medio, vos registrás cómo vas.",
  },
  {
    q: "¿Mi médico del IPS ve lo que cargo?",
    a: "Sí. El equipo médico autorizado puede ver tu evolución, alertas e informes desde el panel profesional. Así el cuidado es más continuo y basado en datos reales.",
  },
  {
    q: "¿Qué puedo registrar?",
    a: "Glucosa, presión arterial, frecuencia cardíaca, peso e IMC, colesterol, síntomas, comidas (foto o texto) y notas. También tenés asistente con IA y control por voz.",
  },
  {
    q: "¿Es gratis y para quién es?",
    a: "Es una herramienta del Instituto de Previsión Social de Misiones (Posadas) pensada para afiliados que necesitan seguimiento crónico o de salud integral.",
  },
  {
    q: "¿Cómo exporto un informe para la consulta?",
    a: "Desde Perfil → Exportar informe. Generás un documento con tu historial para llevarlo o enviarlo a tu médico.",
  },
  {
    q: "¿Funciona sin instalar desde la tienda?",
    a: "Sí. Abrís VitalIPS en el celular y la agregás a la pantalla de inicio (PWA). Queda con ícono como una app normal.",
  },
];

const TABS: { id: GuideId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cuenta", label: "Crear cuenta", icon: UserPlus },
  { id: "usar", label: "Usar la app", icon: Scale },
  { id: "medico", label: "Tu médico", icon: Stethoscope },
];

export function LandingTutorial() {
  const [guide, setGuide] = useState<GuideId>("cuenta");
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const current = GUIDES[guide];
  const active = current.steps[step];

  function selectGuide(id: GuideId) {
    setGuide(id);
    setStep(0);
  }

  return (
    <div id="tutorial" className="scroll-mt-6">
      {/* Intro */}
      <section className="px-4 pt-20 pb-8 md:pt-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-teal-700 mb-4">
            Tutorial
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy-900 leading-tight">
            Cómo funciona VitalIPS
          </h2>
          <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
            Paso a paso, claro y sin vueltas: registrate, usá la app y sabé que tu equipo médico
            acompaña tu cuidado.
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto mt-10 flex p-1.5 rounded-2xl bg-white/70 border border-teal-100/80 shadow-sm backdrop-blur-sm">
          {TABS.map((t) => {
            const on = guide === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectGuide(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-300 touch-manipulation",
                  on
                    ? "bg-gradient-to-r from-navy-800 to-teal-700 text-white shadow-md"
                    : "text-slate-600 hover:text-navy-800"
                )}
              >
                <t.icon className="w-4 h-4 hidden sm:block" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive steps */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-teal-700 mb-2">
              {current.eyebrow}
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-navy-900">
              {current.title}
            </h3>
            <p className="mt-3 text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
              {current.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-start">
            {/* Step list */}
            <ol className="relative space-y-0">
              <div
                className="absolute left-[1.35rem] top-6 bottom-6 w-px bg-gradient-to-b from-teal-300 via-navy-300 to-teal-200 hidden sm:block"
                aria-hidden
              />
              {current.steps.map((s, i) => {
                const on = i === step;
                const done = i < step;
                return (
                  <li key={s.label}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      className={cn(
                        "w-full text-left flex gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl transition-all duration-300 touch-manipulation group",
                        on ? "bg-white/90 shadow-lg shadow-navy-900/5 border border-teal-100" : "hover:bg-white/50 border border-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-display text-sm font-semibold transition-all duration-300",
                          on
                            ? "bg-gradient-to-br from-navy-800 to-teal-600 text-white shadow-lg shadow-teal-700/25 scale-105"
                            : done
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-800"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 pt-1.5 pb-1">
                        <span
                          className={cn(
                            "block text-[11px] font-bold tracking-[0.16em] uppercase mb-0.5",
                            on ? "text-teal-700" : "text-slate-400"
                          )}
                        >
                          {s.label}
                        </span>
                        <span
                          className={cn(
                            "block font-semibold leading-snug",
                            on ? "text-navy-900" : "text-slate-700"
                          )}
                        >
                          {s.title}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Detail panel */}
            <div
              key={`${guide}-${step}`}
              className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800 text-white p-7 md:p-9 shadow-2xl shadow-navy-900/25 animate-scale-in"
            >
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-sky-400/15 blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <active.icon className="w-6 h-6 text-teal-200" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-teal-200/90">
                      Paso {String(step + 1).padStart(2, "0")} · {active.label}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {step + 1} de {current.steps.length}
                    </p>
                  </div>
                </div>

                <h4 className="font-display text-2xl md:text-3xl font-semibold leading-tight mb-4">
                  {active.title}
                </h4>
                <p className="text-teal-50/90 text-base leading-relaxed">{active.desc}</p>

                {active.tip && (
                  <p className="mt-5 text-sm text-teal-100/90 border-l-2 border-teal-300/50 pl-4 leading-relaxed">
                    {active.tip}
                  </p>
                )}

                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="btn-press px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 border border-white/20 disabled:opacity-35 touch-manipulation"
                  >
                    Anterior
                  </button>
                  {step < current.steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
                      className="btn-press flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-navy-900 touch-manipulation"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : current.cta ? (
                    <Link
                      href={current.cta.href}
                      className="btn-press flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-navy-900 touch-manipulation"
                    >
                      {current.cta.label}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectGuide(guide === "medico" ? "cuenta" : "medico")}
                      className="btn-press flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-navy-900 touch-manipulation"
                    >
                      {guide === "usar" ? "Ver: tu médico" : "Volver al inicio"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Progress dots */}
                <div className="mt-6 flex justify-center gap-2">
                  {current.steps.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ir al paso ${i + 1}`}
                      onClick={() => setStep(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300 touch-manipulation",
                        i === step ? "w-8 bg-white" : "w-1.5 bg-white/35 hover:bg-white/55"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor spotlight */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f6f4] via-[#eef4f9] to-[#e6f0f8]" />
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-teal-300/40 blur-3xl" />
          <div className="absolute bottom-0 right-[5%] w-72 h-72 rounded-full bg-sky-300/30 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 mb-3">
                Cuidado en equipo
              </p>
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-navy-900 leading-tight">
                Vos registrás.
                <br />
                <span className="gradient-text">Tu médico ve.</span>
              </h3>
              <p className="mt-5 text-slate-600 leading-relaxed">
                Cada registro suma a tu ficha clínica digital. El profesional del IPS puede
                revisar tendencias, alertas e informes — para decidir con más información y
                acompañarte mejor entre consultas.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Panel médico con pacientes y alertas",
                  "Historial de signos vitales y comidas",
                  "Informes listos para la consulta",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-teal-400/30 to-navy-600/20 blur-xl" />
              <div className="relative rounded-[1.75rem] bg-white/90 border border-white p-6 md:p-8 shadow-xl shadow-navy-900/8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-800 to-teal-600 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 live-dot border-2 border-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">Equipo IPS conectado</p>
                    <p className="text-xs text-slate-500">Seguimiento activo · en vivo</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Glucosa reciente", value: "Visible", tone: "text-teal-700" },
                    { label: "Presión / pulso", value: "En ficha", tone: "text-navy-700" },
                    { label: "Alertas", value: "Priorizadas", tone: "text-coral-600" },
                    { label: "Informe clínico", value: "Exportable", tone: "text-teal-700" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-sm text-slate-600">{row.label}</span>
                      <span className={cn("text-sm font-semibold", row.tone)}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs text-slate-500 leading-relaxed">
                  Transparencia total: sabés que tus datos sirven para un mejor cuidado, no para
                  quedarse guardados sin uso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 mb-3">
              Preguntas frecuentes
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-navy-900">
              Todo lo que necesitás saber
            </h3>
          </div>

          <div className="space-y-2">
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={item.q}
                  className={cn(
                    "rounded-2xl border transition-colors duration-300",
                    open
                      ? "bg-white border-teal-200 shadow-sm"
                      : "bg-white/50 border-transparent hover:border-teal-100"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left touch-manipulation"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-navy-900 text-sm md:text-base leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-teal-700 shrink-0 mt-0.5 transition-transform duration-300",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/registro"
              className="btn-press inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-navy-800 to-teal-700 text-white font-semibold shadow-lg shadow-teal-800/20 touch-manipulation"
            >
              Empezar mi seguimiento
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
