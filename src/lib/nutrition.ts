import { FOODS_DATABASE, type FoodEntry } from "@/data/foods-database";
import { parseSpanishQuantity, scaleNutrition } from "./nutrition-parser";
import { analyzeWithOpenFoodFacts, analyzeWithUSDA } from "./nutrition-providers";
import { prisma } from "./db";

export interface NutritionAnalysis {
  name: string;
  servingSize: string;
  calories: number;
  carbs: number;
  sugar: number;
  fat: number;
  saturatedFat: number;
  protein: number;
  fiber: number;
  sodium: number;
  source: "local" | "edamam" | "openai" | "usda" | "openfoodfacts" | "estimate" | "cache";
  confidence: "high" | "medium" | "low";
}

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 };

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function roundNutrition(n: Omit<NutritionAnalysis, "name" | "servingSize" | "source" | "confidence">) {
  return {
    calories: Math.round(n.calories),
    carbs: Math.round(n.carbs * 10) / 10,
    sugar: Math.round(n.sugar * 10) / 10,
    fat: Math.round(n.fat * 10) / 10,
    saturatedFat: Math.round(n.saturatedFat * 10) / 10,
    protein: Math.round(n.protein * 10) / 10,
    fiber: Math.round(n.fiber * 10) / 10,
    sodium: Math.round(n.sodium),
  };
}

function applyMultiplier(analysis: NutritionAnalysis, multiplier: number, servingNote: string): NutritionAnalysis {
  if (multiplier === 1) return { ...analysis, servingSize: servingNote || analysis.servingSize };
  const scaled = scaleNutrition(
    {
      calories: analysis.calories,
      carbs: analysis.carbs,
      sugar: analysis.sugar,
      fat: analysis.fat,
      saturatedFat: analysis.saturatedFat,
      protein: analysis.protein,
      fiber: analysis.fiber,
      sodium: analysis.sodium,
    },
    multiplier
  );
  return {
    ...analysis,
    ...roundNutrition(scaled),
    servingSize: servingNote,
  };
}

function matchLocalFood(input: string): FoodEntry | null {
  const norm = normalize(input);
  let best: { food: FoodEntry; score: number } | null = null;

  for (const food of FOODS_DATABASE) {
    for (const kw of food.keywords) {
      const nkw = normalize(kw);
      if (norm.includes(nkw) || nkw.includes(norm)) {
        const score = nkw.length * 10 + (norm === nkw ? 100 : 0);
        if (!best || score > best.score) best = { food, score };
      }
    }
  }
  return best?.food ?? null;
}

function combineFoods(foods: FoodEntry[], originalName: string, multiplier: number, servingNote: string): NutritionAnalysis {
  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      carbs: acc.carbs + f.carbs,
      sugar: acc.sugar + f.sugar,
      fat: acc.fat + f.fat,
      saturatedFat: acc.saturatedFat + f.saturatedFat,
      protein: acc.protein + f.protein,
      fiber: acc.fiber + f.fiber,
      sodium: acc.sodium + f.sodium,
    }),
    { calories: 0, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 0 }
  );

  const base: NutritionAnalysis = {
    name: originalName,
    servingSize: servingNote || foods.map((f) => f.serving).join(" + "),
    ...roundNutrition(totals),
    source: "local",
    confidence: foods.length === 1 ? "high" : "medium",
  };

  return applyMultiplier(base, multiplier, servingNote);
}

function analyzeLocal(input: string, multiplier: number, servingNote: string): NutritionAnalysis | null {
  const norm = normalize(input);
  const separators = /\s*(?:con|y|\+|,|\/|&|\be\b)\s*/;
  const parts = norm.split(separators).filter(Boolean);
  const matched: FoodEntry[] = [];

  for (const part of parts) {
    const food = matchLocalFood(part.trim());
    if (food && !matched.some((m) => m.keywords[0] === food.keywords[0])) matched.push(food);
  }

  if (matched.length === 0) {
    const single = matchLocalFood(norm);
    if (single) return combineFoods([single], input, multiplier, servingNote);
    return null;
  }

  return combineFoods(matched, input, multiplier, servingNote);
}

function estimateFromKeywords(input: string, multiplier: number, servingNote: string): NutritionAnalysis {
  const norm = normalize(input);
  let base = { calories: 200, carbs: 25, sugar: 5, fat: 8, saturatedFat: 2, protein: 10, fiber: 2, sodium: 300 };

  if (/agua|te|té|mate|infusion/.test(norm)) {
    base = { calories: 5, carbs: 1, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 5 };
  } else if (/dulce|azucar|azúcar|postre|torta|helado|golosina|alfajor/.test(norm)) {
    base = { calories: 280, carbs: 40, sugar: 30, fat: 12, saturatedFat: 5, protein: 3, fiber: 1, sodium: 80 };
  } else if (/bebida|gaseosa|jugo|refresco/.test(norm)) {
    base = { calories: 120, carbs: 30, sugar: 28, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 40 };
  } else if (/carne|pollo|pescado|huevo|proteina|milanesa|asado/.test(norm)) {
    base = { calories: 250, carbs: 5, sugar: 1, fat: 12, saturatedFat: 3, protein: 28, fiber: 0, sodium: 200 };
  } else if (/verdura|ensalada|vegetal|brocoli|lechuga/.test(norm)) {
    base = { calories: 80, carbs: 10, sugar: 4, fat: 3, saturatedFat: 0.5, protein: 4, fiber: 4, sodium: 150 };
  }

  return applyMultiplier(
    {
      name: input,
      servingSize: servingNote || "1 porción estimada",
      ...roundNutrition(base),
      source: "estimate",
      confidence: "low",
    },
    multiplier,
    servingNote
  );
}

async function getFromCache(key: string): Promise<NutritionAnalysis | null> {
  try {
    const cached = await prisma.nutritionCache.findUnique({ where: { query: key } });
    if (!cached) return null;
    const age = Date.now() - cached.createdAt.getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) return null;
    return { ...JSON.parse(cached.result), source: "cache" as const };
  } catch {
    return null;
  }
}

async function saveToCache(key: string, result: NutritionAnalysis): Promise<void> {
  try {
    await prisma.nutritionCache.upsert({
      where: { query: key },
      create: { query: key, result: JSON.stringify(result) },
      update: { result: JSON.stringify(result), createdAt: new Date() },
    });
  } catch {
    // ignore cache errors
  }
}

async function analyzeWithEdamam(input: string): Promise<NutritionAnalysis | null> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;
  if (!appId || !appKey) return null;

  try {
    const res = await fetch(
      `https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input, ingr: [input] }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const t = data.totalNutrients ?? {};
    const get = (key: string) => Math.round((t[key]?.quantity ?? 0) * 10) / 10;

    return {
      name: input,
      servingSize: data.yield ? `${data.yield} porción(es)` : "1 porción",
      calories: Math.round(data.calories ?? get("ENERC_KCAL")),
      carbs: get("CHOCDF"),
      sugar: get("SUGAR"),
      fat: get("FAT"),
      saturatedFat: get("FASAT"),
      protein: get("PROCNT"),
      fiber: get("FIBTG"),
      sodium: Math.round(get("NA")),
      source: "edamam",
      confidence: "high",
    };
  } catch {
    return null;
  }
}

async function analyzeWithOpenAI(input: string, mealType: string): Promise<NutritionAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Nutricionista experto en comida argentina/misionera. Devuelve JSON preciso para la porción descrita.
{"servingSize":"...","calories":0,"carbs":0,"sugar":0,"fat":0,"saturatedFat":0,"protein":0,"fiber":0,"sodium":0}
Carbohidratos/azúcares/grasas/proteína/fibra en gramos. Sodio en mg. Calorías en kcal.`,
        },
        { role: "user", content: `Tipo: ${mealType}. Comida: "${input}"` },
      ],
      max_tokens: 250,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const p = JSON.parse(raw);

    return {
      name: input,
      servingSize: p.servingSize ?? "1 porción",
      calories: Math.round(p.calories ?? 0),
      carbs: p.carbs ?? 0,
      sugar: p.sugar ?? 0,
      fat: p.fat ?? 0,
      saturatedFat: p.saturatedFat ?? 0,
      protein: p.protein ?? 0,
      fiber: p.fiber ?? 0,
      sodium: Math.round(p.sodium ?? 0),
      source: "openai",
      confidence: "high",
    };
  } catch {
    return null;
  }
}

function pickBest(results: (NutritionAnalysis | null)[]): NutritionAnalysis | null {
  const valid = results.filter((r): r is NutritionAnalysis => r != null && r.calories >= 0);
  if (valid.length === 0) return null;
  return valid.sort(
    (a, b) => CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence]
  )[0];
}

export async function analyzeNutrition(
  foodName: string,
  mealType = "comida"
): Promise<NutritionAnalysis> {
  const trimmed = foodName.trim();
  if (!trimmed) throw new Error("Nombre de comida vacío");

  const { multiplier, cleanedText, servingNote } = parseSpanishQuantity(trimmed);
  const cacheKey = normalize(`${cleanedText}|${mealType}|${multiplier}`);

  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const local = analyzeLocal(cleanedText, multiplier, servingNote);

  const [edamam, usda, off, openai] = await Promise.all([
    analyzeWithEdamam(cleanedText),
    analyzeWithUSDA(cleanedText),
    analyzeWithOpenFoodFacts(cleanedText),
    analyzeWithOpenAI(cleanedText, mealType),
  ]);

  const remote = pickBest([edamam, openai, usda, off, local]);
  let result: NutritionAnalysis;

  if (remote) {
    result = applyMultiplier(remote, multiplier, servingNote);
    if (local && local.confidence === "high" && remote.confidence !== "high") {
      result = local;
    } else if (local && remote.source === "usda") {
      result = {
        ...result,
        calories: Math.round((result.calories + local.calories) / 2),
        carbs: Math.round(((result.carbs + local.carbs) / 2) * 10) / 10,
        sugar: Math.round(((result.sugar + local.sugar) / 2) * 10) / 10,
        fat: Math.round(((result.fat + local.fat) / 2) * 10) / 10,
        confidence: "high",
        source: "local",
      };
    }
  } else if (local) {
    result = local;
  } else {
    result = estimateFromKeywords(cleanedText, multiplier, servingNote);
  }

  await saveToCache(cacheKey, result);
  return result;
}

export function formatNutritionSummary(n: NutritionAnalysis): string {
  return `${n.calories} kcal · ${n.carbs}g carbohidratos · ${n.sugar}g azúcares · ${n.fat}g grasas · ${n.protein}g proteínas`;
}

export function getSourceLabel(source: NutritionAnalysis["source"]): string {
  const labels: Record<NutritionAnalysis["source"], string> = {
    local: "Base IPS Argentina",
    edamam: "Edamam Nutrición",
    openai: "IA Nutricional",
    usda: "USDA FoodData",
    openfoodfacts: "Open Food Facts",
    estimate: "Estimación",
    cache: "Análisis guardado",
  };
  return labels[source] ?? source;
}
