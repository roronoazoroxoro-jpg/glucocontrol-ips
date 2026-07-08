import { analyzeNutrition, type NutritionAnalysis } from "./nutrition";
import { buildGlucoseNotes } from "./food-photo-enrich";

export interface FoodPhotoResult {
  name: string;
  items: string[];
  nutrition: NutritionAnalysis;
  glucoseNote: string;
  healthTip: string;
  engine?: "gemini" | "openai" | "huggingface" | "device";
}

const OPENAI_VISION_MODEL = "gpt-4o";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
const HF_CAPTION_MODEL = "Salesforce/blip-image-captioning-large";

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

type VisionResult =
  | { ok: true; result: FoodPhotoResult }
  | { ok: false; reason: "no_key" | "no_food" | "error"; message: string };

export async function analyzeFoodPhoto(imageDataUrl: string): Promise<VisionResult> {
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const hasOpenAI = !!process.env.OPENAI_API_KEY?.trim();
  const hasHF = !!(process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY);

  // Prioridad: Gemini (gratis) → OpenAI → Hugging Face (caption + nutrición)
  if (hasGemini) {
    const r = await analyzeWithGeminiVision(imageDataUrl);
    if (r.ok || r.reason === "no_food") return r;
  }
  if (hasOpenAI) {
    const r = await analyzeWithOpenAIVision(imageDataUrl);
    if (r.ok || r.reason === "no_food") return r;
  }
  if (hasHF) {
    const r = await analyzeWithHuggingFaceVision(imageDataUrl);
    if (r.ok || r.reason === "no_food") return r;
  }

  if (!hasGemini && !hasOpenAI && !hasHF) {
    return {
      ok: false,
      reason: "no_key",
      message: "Usando análisis inteligente en tu celular.",
    };
  }

  return {
    ok: false,
    reason: "error",
    message: "No se pudo analizar en el servidor. Se usará tu celular.",
  };
}

function buildResult(
  p: Record<string, unknown>,
  source: NutritionAnalysis["source"],
  engine: FoodPhotoResult["engine"]
): VisionResult {
  if (p.detected === false) {
    return {
      ok: false,
      reason: "no_food",
      message: "No detectamos comida en la foto. Probá con una foto más clara del plato.",
    };
  }

  const name = (p.name as string) ?? "Plato analizado";
  const nutrition: NutritionAnalysis = {
    name,
    servingSize: (p.servingSize as string) ?? "1 porción",
    calories: Math.round((p.calories as number) ?? 0),
    carbs: round1(p.carbs),
    sugar: round1(p.sugar),
    fat: round1(p.fat),
    saturatedFat: round1(p.saturatedFat),
    protein: round1(p.protein),
    fiber: round1(p.fiber),
    sodium: Math.round((p.sodium as number) ?? 0),
    source,
    confidence: "medium",
  };

  return {
    ok: true,
    result: {
      name,
      items: Array.isArray(p.items) ? (p.items as string[]) : [],
      nutrition,
      glucoseNote: (p.glucoseNote as string) ?? buildGlucoseNotes(nutrition).glucoseNote,
      healthTip: (p.healthTip as string) ?? buildGlucoseNotes(nutrition).healthTip,
      engine,
    },
  };
}

function parseImageDataUrl(imageDataUrl: string) {
  const match = imageDataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

async function analyzeWithOpenAIVision(imageDataUrl: string): Promise<VisionResult> {
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: OPENAI_VISION_MODEL,
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
    if (!raw) return { ok: false, reason: "error", message: "No se pudo analizar la foto." };
    return buildResult(JSON.parse(raw), "openai", "openai");
  } catch {
    return { ok: false, reason: "error", message: "Error con OpenAI." };
  }
}

async function analyzeWithGeminiVision(imageDataUrl: string): Promise<VisionResult> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const parsed = parseImageDataUrl(imageDataUrl);
  if (!parsed) return { ok: false, reason: "error", message: "Imagen inválida." };

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        parts: [
          { text: "Analizá esta foto de comida y devolvé solo el JSON." },
          { inline_data: { mime_type: parsed.mimeType, data: parsed.base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  });

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body }
      );
      if (res.status === 404) continue;
      if (!res.ok) continue;

      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) continue;
      return buildResult(JSON.parse(raw), "gemini", "gemini");
    } catch {
      continue;
    }
  }

  return { ok: false, reason: "error", message: "Gemini no disponible." };
}

async function analyzeWithHuggingFaceVision(imageDataUrl: string): Promise<VisionResult> {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  const parsed = parseImageDataUrl(imageDataUrl);
  if (!parsed || !token) return { ok: false, reason: "error", message: "HF no configurado." };

  try {
    const imageBytes = Buffer.from(parsed.base64, "base64");
    const res = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_CAPTION_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBytes,
      }
    );

    if (!res.ok) return { ok: false, reason: "error", message: "HF error." };

    const data = await res.json();
    const caption: string =
      Array.isArray(data) && data[0]?.generated_text
        ? String(data[0].generated_text)
        : typeof data?.generated_text === "string"
          ? data.generated_text
          : "";

    if (!caption || caption.length < 3) {
      return { ok: false, reason: "no_food", message: "No se detectó comida en la foto." };
    }

    const nutrition = await analyzeNutrition(caption, "comida");
    const notes = buildGlucoseNotes(nutrition);

    return {
      ok: true,
      result: {
        name: nutrition.name,
        items: caption.split(/,| and | con /i).map((s) => s.trim()).filter(Boolean).slice(0, 4),
        nutrition,
        glucoseNote: notes.glucoseNote,
        healthTip: notes.healthTip,
        engine: "huggingface",
      },
    };
  } catch {
    return { ok: false, reason: "error", message: "Error con Hugging Face." };
  }
}

function round1(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 10) / 10;
}
