import { analyzeNutrition, type NutritionAnalysis } from "./nutrition";
import type { FoodPhotoResult } from "./nutrition-vision";

export function buildGlucoseNotes(n: NutritionAnalysis): { glucoseNote: string; healthTip: string } {
  const carbs = n.carbs ?? 0;
  const sugar = n.sugar ?? 0;
  let impacto: string;
  if (carbs >= 45 || sugar >= 20) {
    impacto =
      "Impacto ALTO en la glucosa: tiene bastantes carbohidratos/azúcares. Controlá la porción y medí tu glucosa después.";
  } else if (carbs >= 20 || sugar >= 8) {
    impacto =
      "Impacto MEDIO en la glucosa por sus carbohidratos. Acompañalo con proteína o fibra para amortiguar la subida.";
  } else {
    impacto = "Impacto BAJO en la glucosa: pocos carbohidratos. Buena opción para mantener niveles estables.";
  }
  const tip =
    n.fiber >= 4
      ? "Buena cantidad de fibra: ayuda a que la glucosa suba más lento."
      : "Sumá una porción de verduras o fibra para equilibrar el plato.";
  return { glucoseNote: impacto, healthTip: tip };
}

export async function enrichPhotoFromDetection(
  name: string,
  items: string[],
  mealType: string,
  candidates?: string[]
): Promise<FoodPhotoResult | null> {
  const queries = [
    name,
    ...(candidates ?? []),
    items.join(" con "),
    ...items,
  ]
    .map((q) => q?.trim())
    .filter(Boolean)
    .filter((q, i, arr) => arr.indexOf(q) === i)
    .slice(0, 5);

  let best: { nutrition: NutritionAnalysis; query: string } | null = null;

  for (const query of queries) {
    try {
      const nutrition = await analyzeNutrition(query, mealType);
      if (
        !best ||
        nutrition.confidence === "high" ||
        (nutrition.confidence === "medium" && best.nutrition.confidence === "low")
      ) {
        best = { nutrition, query };
        if (nutrition.confidence === "high") break;
      }
    } catch {
      continue;
    }
  }

  if (!best) return null;

  const notes = buildGlucoseNotes(best.nutrition);
  return {
    name: name || best.nutrition.name,
    items: items.length ? items : [best.nutrition.name],
    nutrition: { ...best.nutrition, name: name || best.nutrition.name },
    glucoseNote: notes.glucoseNote,
    healthTip: notes.healthTip,
  };
}
