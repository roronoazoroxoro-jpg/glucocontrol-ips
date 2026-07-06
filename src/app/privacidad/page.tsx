import Link from "next/link";
import { IPSLogo } from "@/components/IPSLogo";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Política de Privacidad — GlucoControl IPS",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 safe-top">
        <Link href="/" className="text-sm text-emerald-700 hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <IPSLogo size="md" className="mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Política de Privacidad</h1>
        <p className="text-sm text-slate-500 mb-8">Última actualización: julio 2026</p>

        <div className="prose prose-sm prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
          <p>
            GlucoControl IPS es operado en el marco del Instituto de Previsión Social de
            Misiones (IPSM), Posadas. Esta política describe cómo tratamos sus datos de salud
            y personales.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Datos que recopilamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email y contraseña (cuenta de acceso)</li>
            <li>Nombre, tipo de diabetes y médico asignado</li>
            <li>Registros de glucosa, comidas y medicación</li>
            <li>Mensajes del chat con la asistente IA</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Uso de los datos</h2>
          <p>
            Los datos se utilizan exclusivamente para brindarle seguimiento personalizado de
            diabetes, recordatorios y recomendaciones orientativas. No vendemos ni compartimos
            sus datos con terceros con fines comerciales.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Almacenamiento y seguridad</h2>
          <p>
            Los datos se almacenan en servidores seguros (Turso/Vercel) con cifrado en tránsito
            (HTTPS). Las contraseñas se guardan con hash irreversible. Usted puede solicitar la
            eliminación de su cuenta contactando al IPS.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Sus derechos</h2>
          <p>
            Puede acceder, corregir o exportar su información desde la app (Perfil → Exportar
            informe). Para eliminar su cuenta, escriba a soporte del IPS Misiones.
          </p>

          <h2 className="text-lg font-semibold text-slate-800 pt-2">Contacto</h2>
          <p>
            Instituto de Previsión Social de Misiones — Posadas, Argentina.
            <br />
            Email: soporte@ipsmisiones.gov.ar
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
