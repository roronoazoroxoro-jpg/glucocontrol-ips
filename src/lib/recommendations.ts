export type GlucoseStatus =
  | "critico_bajo"
  | "bajo"
  | "normal"
  | "elevado"
  | "alto"
  | "critico_alto";

export interface GlucoseAnalysis {
  status: GlucoseStatus;
  label: string;
  color: string;
  bgColor: string;
  message: string;
  foods: string[];
  drinks: string[];
  avoid: string[];
  urgency: "none" | "moderate" | "high" | "emergency";
}

export interface RecommendationContext {
  glucose: number;
  userName: string;
  diabetesType: string;
  targetMin: number;
  targetMax: number;
  recentMeals?: { name: string; carbs: number }[];
  trend?: "subiendo" | "bajando" | "estable";
}

export function getGlucoseStatus(value: number): GlucoseStatus {
  if (value < 54) return "critico_bajo";
  if (value < 70) return "bajo";
  if (value <= 140) return "normal";
  if (value <= 180) return "elevado";
  if (value <= 250) return "alto";
  return "critico_alto";
}

export function analyzeGlucose(ctx: RecommendationContext): GlucoseAnalysis {
  const status = getGlucoseStatus(ctx.glucose);

  const profiles: Record<GlucoseStatus, Omit<GlucoseAnalysis, "status">> = {
    critico_bajo: {
      label: "Hipoglucemia severa",
      color: "text-red-700",
      bgColor: "bg-red-100 border-red-300",
      message: `${ctx.userName}, tu glucosa está muy baja. Actúa de inmediato.`,
      foods: ["Glucosa en tabletas (15g)", "Miel", "Uvas pasas"],
      drinks: ["Jugo de naranja", "Refresco regular (no diet)", "Leche con azúcar"],
      avoid: ["Insulina", "Ejercicio intenso", "Alcohol"],
      urgency: "emergency",
    },
    bajo: {
      label: "Glucosa baja",
      color: "text-orange-700",
      bgColor: "bg-orange-100 border-orange-300",
      message: `${ctx.userName}, tu glucosa está por debajo del rango ideal. Come algo con carbohidratos de absorción rápida.`,
      foods: ["Pan blanco", "Galletas", "Fruta madura (plátano, mango)"],
      drinks: ["Jugo de manzana", "Agua con miel", "Bebida deportiva"],
      avoid: ["Café solo", "Ejercicio", "Comidas bajas en carbohidratos"],
      urgency: "high",
    },
    normal: {
      label: "En rango",
      color: "text-emerald-700",
      bgColor: "bg-emerald-100 border-emerald-300",
      message: `${ctx.userName}, excelente. Tu glucosa está en un rango saludable. Puedes comer con normalidad.`,
      foods: [
        "Proteína magra (pollo, pescado, huevo)",
        "Verduras no almidonadas",
        "Granos integrales en porción moderada",
        "Legumbres",
      ],
      drinks: ["Agua", "Té sin azúcar", "Infusiones", "Leche descremada"],
      avoid: ["Azúcares refinados en exceso", "Bebidas azucaradas"],
      urgency: "none",
    },
    elevado: {
      label: "Ligeramente elevada",
      color: "text-amber-700",
      bgColor: "bg-amber-100 border-amber-300",
      message: `${ctx.userName}, tu glucosa está un poco alta. Opta por alimentos de bajo índice glucémico.`,
      foods: [
        "Ensalada con proteína",
        "Verduras al vapor",
        "Quinoa o arroz integral (porción pequeña)",
        "Nueces y almendras",
      ],
      drinks: ["Agua con limón", "Té verde", "Agua de coco sin azúcar"],
      avoid: ["Pan blanco", "Pasta", "Dulces", "Jugos procesados"],
      urgency: "moderate",
    },
    alto: {
      label: "Glucosa alta",
      color: "text-orange-800",
      bgColor: "bg-orange-100 border-orange-400",
      message: `${ctx.userName}, tu glucosa está elevada. Elige comidas ligeras y evita carbohidratos simples.`,
      foods: [
        "Sopa de verduras",
        "Pescado a la plancha",
        "Espinacas y brócoli",
        "Aguacate",
      ],
      drinks: ["Agua abundante", "Té de canela", "Infusiones"],
      avoid: ["Arroz blanco", "Papa", "Fruta en exceso", "Alcohol"],
      urgency: "high",
    },
    critico_alto: {
      label: "Glucosa muy alta",
      color: "text-red-800",
      bgColor: "bg-red-100 border-red-400",
      message: `${ctx.userName}, tu glucosa está muy elevada. Hidrátate, evita comer carbohidratos y consulta a tu médico si persiste.`,
      foods: ["Solo proteína magra si tienes hambre", "Verduras crudas"],
      drinks: ["Agua (2-3 vasos)", "Té sin azúcar"],
      avoid: ["Todo tipo de azúcar", "Frutas", "Cereales", "Alcohol"],
      urgency: "emergency",
    },
  };

  return { status, ...profiles[status] };
}

export function buildRecommendationSummary(ctx: RecommendationContext): string {
  const analysis = analyzeGlucose(ctx);
  const mealNote =
    ctx.recentMeals && ctx.recentMeals.length > 0
      ? ` Has registrado: ${ctx.recentMeals.map((m) => m.name).join(", ")}.`
      : "";

  return `${analysis.message} Puedes comer: ${analysis.foods.slice(0, 3).join(", ")}. Beber: ${analysis.drinks.slice(0, 2).join(", ")}. Evitar: ${analysis.avoid.slice(0, 2).join(", ")}.${mealNote}`;
}
