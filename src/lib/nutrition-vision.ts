import type { NutritionAnalysis } from "./nutrition";

export interface FoodPhotoResult {
  name: string;
  items: string[];
  nutrition: NutritionAnalysis;
  glucoseNote: string;
  healthTip: string;
}

const VISION_MODEL = "gpt-4o";

const SYSTEM_PROMPT = `Sos un nutricionista experto en comida argentina y misionera que analiza FOTOS de platos de comida para personas con diabetes.

Mirá la foto y devolvé SOLO un JSON válido con esta forma exacta:
{
  "detected": true,
  "name": "nombre corto del plato (ej: Milanesa con puré y ensalada)",
  "items": ["milanesa de carne", "puré de papa", "ensalada de lechuga y tomate"],
  "servingSize": "porción visible en la foto (ej: 1 plato)",
  "calories": 0,
  "carbs": 0,
  "sugar": 0,
  "fat": 0,
  "saturatedFat": 0,
  "protein": 0,
  "fiber": 0,
  "sodium": 0,
  "glucoseNote": "impacto esperado en la glucosa (bajo/medio/alto) y por qué, en 1 frase clara",
  "healthTip": "un consejo práctico para una persona con diabetes sobre este plato, en 1 frase"
}

Reglas:
- Estimá las cantidades según lo que se VE en la foto (tamaño de porción real).
- carbs, sugar, fat, saturatedFat, protein, fiber en gramos. sodium en mg. calories en kcal.
- Si NO hay comida en la foto (por ejemplo una persona, un objeto, o algo borroso), devolvé {"detected": false} y nada más.
- Respondé en español rioplatense, sencillo y humano.`;

export async function analyzeFoodPhoto(imageDataUrl: string): Promise<
  | { ok: true; result: FoodPhotoResult }
  | { ok: false; reason: "no_key" | "no_food" | "error"; message: string }
> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "no_key",
      message:
        "El análisis por foto necesita la clave de IA (OPENAI_API_KEY). Mientras tanto podés escribir qué comiste y se calcula igual.",
    };
  }

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analizá esta foto de comida." },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "low" } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return { ok: false, reason: "error", message: "No se pudo analizar la foto." };
    }

    const p = JSON.parse(raw);
    if (p.detected === false) {
      return {
        ok: false,
        reason: "no_food",
        message: "No detectamos comida en la foto. Probá con una foto más clara del plato.",
      };
    }

    const nutrition: NutritionAnalysis = {
      name: p.name ?? "Plato analizado",
      servingSize: p.servingSize ?? "1 porción",
      calories: Math.round(p.calories ?? 0),
      carbs: round1(p.carbs),
      sugar: round1(p.sugar),
      fat: round1(p.fat),
      saturatedFat: round1(p.saturatedFat),
      protein: round1(p.protein),
      fiber: round1(p.fiber),
      sodium: Math.round(p.sodium ?? 0),
      source: "openai",
      confidence: "medium",
    };

    return {
      ok: true,
      result: {
        name: p.name ?? "Plato analizado",
        items: Array.isArray(p.items) ? p.items : [],
        nutrition,
        glucoseNote: p.glucoseNote ?? "",
        healthTip: p.healthTip ?? "",
      },
    };
  } catch {
    return {
      ok: false,
      reason: "error",
      message: "Hubo un problema al analizar la foto. Intentá de nuevo en un momento.",
    };
  }
}

function round1(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 10) / 10;
}
