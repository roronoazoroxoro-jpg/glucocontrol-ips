"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface IPSLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Subtítulo institucional (evitar en headers compactos) */
  showText?: boolean;
  /** Fondo claro del logo sobre hero oscuro / fondo claro de página */
  onDark?: boolean;
}

const sizes = {
  sm: { w: 118, h: 38 },
  md: { w: 156, h: 50 },
  lg: { w: 200, h: 64 },
};

export function IPSLogo({
  className,
  size = "md",
  showText = false,
  onDark = false,
}: IPSLogoProps) {
  const { w, h } = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", showText ? "gap-2" : "gap-0", className)}>
      <div
        className={cn(
          "inline-flex items-center justify-center",
          onDark && "rounded-xl bg-white px-3 py-2 shadow-sm shadow-black/10"
        )}
      >
        <Image
          src="/branding/ips-logo.svg"
          alt="Instituto de Previsión Social de Misiones"
          width={w}
          height={h}
          priority
          className="object-contain object-center"
          style={{ width: w, height: "auto", maxHeight: h }}
        />
      </div>
      {showText && (
        <p
          className={cn(
            "text-[11px] text-center leading-snug max-w-[220px] font-medium tracking-wide",
            onDark ? "text-white/75" : "text-slate-500"
          )}
        >
          Posadas, Misiones
        </p>
      )}
    </div>
  );
}
