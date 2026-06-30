import OpenAI from "openai";
import { prisma } from "./db";
import { analyzeGlucose, buildRecommendationSummary } from "./recommendations";

const SYSTEM_PROMPT = `Eres GlucoControl AI, un asistente empático y profesional para personas con diabetes.
REGLAS:
- Habla siempre en español, de forma cálida y clara.
- Usa el nombre del usuario cuando lo sepas.
- NUNCA diagnostiques ni cambies tratamientos médicos.
- Basa tus consejos en la glucosa actual y el historial de comidas.
- Sé breve (2-4 oraciones) salvo que pidan más detalle.
- Si la glucosa es crítica (<54 o >250), recomienda buscar ayuda médica.
- Recuerda que eres apoyo informativo, no reemplazas al médico.`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function getUserContext() {
  const user = await prisma.user.findFirst();
  const latestGlucose = await prisma.glucoseReading.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const recentMeals = await prisma.mealEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { user, latestGlucose, recentMeals };
}

function fallbackResponse(
  userMessage: string,
  userName: string,
  glucose: number | null,
  recentMeals: { name: string; carbs: number }[]
): string {
  const name = userName || "amigo/a";
  const lower = userMessage.toLowerCase();

  if (glucose === null) {
    return `${name}, aún no tengo un registro de glucosa. Registra tu nivel actual en el panel para darte recomendaciones personalizadas.`;
  }

  const ctx = {
    glucose,
    userName: name,
    diabetesType: "tipo2",
    targetMin: 70,
    targetMax: 140,
    recentMeals,
  };

  if (
    lower.includes("comí") ||
    lower.includes("comi") ||
    lower.includes("desayun") ||
    lower.includes("almorc") ||
    lower.includes("cen")
  ) {
    return `${name}, gracias por contarme. Con tu glucosa en ${glucose} mg/dL, ${analyzeGlucose(ctx).message} ¿Quieres que registre eso en tu historial?`;
  }

  if (lower.includes("puedo comer") || lower.includes("qué como") || lower.includes("que como")) {
    return buildRecommendationSummary(ctx);
  }

  if (lower.includes("hola") || lower.includes("buenos")) {
    const analysis = analyzeGlucose(ctx);
    return `¡Hola ${name}! Tu última glucosa es ${glucose} mg/dL (${analysis.label}). ${analysis.message} ¿En qué más puedo ayudarte hoy?`;
  }

  return buildRecommendationSummary(ctx);
}

export async function generateChatResponse(userMessage: string): Promise<string> {
  const { user, latestGlucose, recentMeals } = await getUserContext();
  const userName = user?.name ?? "Usuario";
  const glucose = latestGlucose?.value ?? null;
  const meals = recentMeals.map((m) => ({ name: m.name, carbs: m.carbs }));

  const openai = getOpenAIClient();
  if (!openai) {
    return fallbackResponse(userMessage, userName, glucose, meals);
  }

  const glucoseInfo = glucose
    ? `Glucosa actual: ${glucose} mg/dL. Estado: ${analyzeGlucose({ glucose, userName, diabetesType: user?.diabetesType ?? "tipo2", targetMin: user?.targetMin ?? 70, targetMax: user?.targetMax ?? 140 }).label}.`
    : "Sin registro de glucosa reciente.";

  const mealsInfo =
    meals.length > 0
      ? `Comidas recientes: ${meals.map((m) => `${m.name} (${m.carbs}g carbohidratos)`).join(", ")}.`
      : "Sin comidas registradas recientemente.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Usuario: ${userName}. Tipo diabetes: ${user?.diabetesType ?? "tipo2"}. ${glucoseInfo} ${mealsInfo}`,
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content ??
      fallbackResponse(userMessage, userName, glucose, meals)
    );
  } catch {
    return fallbackResponse(userMessage, userName, glucose, meals);
  }
}

export async function generateVoiceGreeting(): Promise<string> {
  const { user, latestGlucose, recentMeals } = await getUserContext();
  const userName = user?.name ?? "Usuario";

  if (!latestGlucose) {
    return `Hola ${userName}, soy tu asistente GlucoControl. Registra tu glucosa para que pueda ayudarte con recomendaciones personalizadas.`;
  }

  const ctx = {
    glucose: latestGlucose.value,
    userName,
    diabetesType: user?.diabetesType ?? "tipo2",
    targetMin: user?.targetMin ?? 70,
    targetMax: user?.targetMax ?? 140,
    recentMeals: recentMeals.map((m) => ({ name: m.name, carbs: m.carbs })),
  };

  const analysis = analyzeGlucose(ctx);
  return `Hola ${userName}. Tu glucosa está en ${latestGlucose.value} miligramos por decilitro, ${analysis.label.toLowerCase()}. ${analysis.message}`;
}
