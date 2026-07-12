import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl md:text-5xl",
  xl: "text-5xl md:text-6xl",
};

export function BrandMark({ className, size = "md", light }: BrandMarkProps) {
  if (light) {
    return (
      <span className={cn("font-display font-semibold tracking-tight leading-none text-white", sizes[size], className)}>
        Vital<span className="text-teal-200">IPS</span>
      </span>
    );
  }

  return (
    <span className={cn("brand-wordmark inline-block leading-none", sizes[size], className)}>
      VitalIPS
    </span>
  );
}
