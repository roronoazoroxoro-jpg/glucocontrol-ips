import type { NutritionAnalysis } from "./nutrition";
import { FOODS_DATABASE, SPANISH_TO_USDA } from "@/data/foods-database";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

function getNutrient(nutrients: { nutrientName?: string; nutrientNumber?: string; value?: number }[], names: string[]) {
  for (const n of nutrients) {
    const name = (n.nutrientName ?? "").toLowerCase();
    const num = n.nutrientNumber ?? "";
    if (names.some((x) => name.includes(x) || num === x)) {
      return n.value ?? 0;
    }
  }
  return 0;
}

function toUsdaQuery(spanish: string): string {
  const norm = spanish.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const food of FOODS_DATABASE) {
    if (food.usdaQuery && food.keywords.some((k) => norm.includes(k))) {
      return food.usdaQuery;
    }
  }
  for (const [es, en] of Object.entries(SPANISH_TO_USDA)) {
    if (norm.includes(es)) return norm.replace(es, en);
  }
  return spanish;
}

export async function analyzeWithUSDA(input: string): Promise<NutritionAnalysis | null> {
  const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";

  try {
    const query = toUsdaQuery(input);
    const res = await fetch(`${USDA_BASE}/foods/search?api_key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        pageSize: 3,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
      }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const food = data.foods?.[0];
    if (!food) return null;

    const nutrients = food.foodNutrients ?? [];
    const calories = getNutrient(nutrients, ["energy", "208"]);
    if (calories <= 0) return null;

    return {
      name: input,
      servingSize: food.servingSize
        ? `${food.servingSize} ${food.servingSizeUnit ?? "g"}`
        : "100g (USDA)",
      calories: Math.round(calories),
      carbs: Math.round(getNutrient(nutrients, ["carbohydrate", "205"]) * 10) / 10,
      sugar: Math.round(getNutrient(nutrients, ["sugars", "269", "sugar"]) * 10) / 10,
      fat: Math.round(getNutrient(nutrients, ["total lipid", "204", "fat"]) * 10) / 10,
      saturatedFat: Math.round(getNutrient(nutrients, ["fatty acids, total saturated", "606"]) * 10) / 10,
      protein: Math.round(getNutrient(nutrients, ["protein", "203"]) * 10) / 10,
      fiber: Math.round(getNutrient(nutrients, ["fiber", "291"]) * 10) / 10,
      sodium: Math.round(getNutrient(nutrients, ["sodium", "307"])),
      source: "usda",
      confidence: "high",
    };
  } catch {
    return null;
  }
}

export async function analyzeWithOpenFoodFacts(input: string): Promise<NutritionAnalysis | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(input)}&search_simple=1&action=process&json=1&page_size=3&lc=es`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const product = data.products?.find(
      (p: { nutriments?: { "energy-kcal_100g"?: number } }) =>
        p.nutriments?.["energy-kcal_100g"] != null
    );
    if (!product?.nutriments) return null;

    const n = product.nutriments;
    const factor = 1.5; // ~150g porción típica desde valores por 100g

    const calories = Math.round((n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0) * factor);
    if (calories <= 0) return null;

    return {
      name: input,
      servingSize: product.serving_size ?? "1 porción (~150g)",
      calories,
      carbs: Math.round((n.carbohydrates_100g ?? 0) * factor * 10) / 10,
      sugar: Math.round((n.sugars_100g ?? 0) * factor * 10) / 10,
      fat: Math.round((n.fat_100g ?? 0) * factor * 10) / 10,
      saturatedFat: Math.round((n["saturated-fat_100g"] ?? 0) * factor * 10) / 10,
      protein: Math.round((n.proteins_100g ?? 0) * factor * 10) / 10,
      fiber: Math.round((n.fiber_100g ?? 0) * factor * 10) / 10,
      sodium: Math.round((n.sodium_100g ?? 0) * factor * 1000),
      source: "openfoodfacts",
      confidence: "medium",
    };
  } catch {
    return null;
  }
}
