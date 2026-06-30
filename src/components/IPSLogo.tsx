"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface IPSLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = {
  sm: { w: 100, h: 32 },
  md: { w: 140, h: 44 },
  lg: { w: 180, h: 56 },
};

export function IPSLogo({ className, size = "md", showText = false }: IPSLogoProps) {
  const { w, h } = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Image
        src="/branding/ips-logo.svg"
        alt="Instituto de Previsión Social de Misiones — Posadas"
        width={w}
        height={h}
        priority
        className="h-auto w-auto max-w-[180px] object-contain"
        style={{ maxHeight: h }}
      />
      {showText && (
        <p className="text-[10px] text-slate-500 text-center leading-tight">
          Instituto de Previsión Social · Posadas, Misiones
        </p>
      )}
    </div>
  );
}
