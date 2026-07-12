import Link from "next/link";
import { IPSLogo } from "@/components/IPSLogo";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Términos de Uso — VitalIPS",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 safe-top">
        <Link href="/" className="text-sm text-emerald-700 hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <IPSLogo size="md" className="mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Términos de Uso</h1>
        <p className="text-sm text-slate-500 mb-8">Última actualización: julio 2026</p>

        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Al usar VitalIPS usted acepta estos términos. Si no está de acuerdo, no
            utilice la aplicación.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Naturaleza del servicio</h2>
          <p>
            VitalIPS es una <strong>herramienta de apoyo informativo</strong> del
            Instituto de Previsión Social de Misiones. <strong>No es un dispositivo médico</strong>{" "}
            ni reemplaza la consulta, diagnóstico o tratamiento de un profesional de la salud.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Responsabilidad del usuario</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Consultar siempre con su médico asignado antes de cambiar medicación o dieta.</li>
            <li>Ante glucosa muy alta o muy baja, buscar atención médica inmediata.</li>
            <li>Mantener la confidencialidad de su contraseña.</li>
            <li>Proporcionar información veraz en su perfil.</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Inteligencia artificial</h2>
          <p>
            Las respuestas de la IA son orientativas y pueden contener errores. No constituyen
            consejo médico. Las recomendaciones nutricionales automáticas son estimaciones.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Limitación de responsabilidad</h2>
          <p>
            El IPS Misiones no se responsabiliza por decisiones tomadas exclusivamente con base
            en la app sin supervisión médica. El servicio se ofrece &quot;tal cual&quot; sin
            garantías de disponibilidad ininterrumpida.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Cuenta y uso</h2>
          <p>
            Debe ser mayor de 18 años o contar con autorización de un tutor. Nos reservamos el
            derecho de suspender cuentas que violen estos términos.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
