"use client";

import Link from "next/link";
import { IPSLogo } from "./IPSLogo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-sm mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 text-center space-y-3">
        <IPSLogo size="sm" />
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          VitalIPS — Instituto de Previsión Social de Misiones, Posadas.
          Herramienta de apoyo. No reemplaza la consulta médica profesional.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <Link href="/privacidad" className="text-emerald-700 hover:underline">
            Privacidad
          </Link>
          <Link href="/terminos" className="text-emerald-700 hover:underline">
            Términos
          </Link>
          <Link href="/app" className="text-emerald-700 hover:underline">
            Abrir app
          </Link>
          <a href="mailto:soporte@ipsmisiones.gov.ar" className="text-emerald-700 hover:underline">
            Contacto
          </a>
        </nav>
        <p className="text-[10px] text-slate-400">© {new Date().getFullYear()} IPS Misiones</p>
      </div>
    </footer>
  );
}
