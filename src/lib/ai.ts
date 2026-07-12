import OpenAI from "openai";
import { prisma } from "./db";
import { analyzeGlucose, buildRecommendationSummary } from "./recommendations";
import { getReminderSettings, parseMedications } from "./reminders";
import { formatNutritionSummary } from "./nutrition";

const MEDICAL_FOOTER =
  "⚕️ Recuerde: esto es orientación general. Consulte siempre con su médico asignado antes de cambiar su dieta o medicación.";

function buildSystemPrompt(doctorName: string | null, medications: { name: string; times: string[] }[]) {
  const doctorRef = doctorName
    ? `El médico asignado del paciente es: Dr/a. ${doctorName}. Menciónelo cuando sea relevante.`
    : "El paciente debe consultar con su médico asignado del IPS Misiones.";

  const medInfo =
    medications.length > 0
      ? `Medicamentos del paciente: ${medications.map((m) => `${m.name} (${m.times.join(", ")})`).join("; ")}. Recuerde amablemente tomar las pastillas cuando corresponda.`
      : "Si el paciente menciona medicación, recuérdale seguir las indicaciones de su médico.";

  return `Eres VitalIPS AI del IPS Misiones (Posadas). Asistente empático de salud integral (diabetes, presión, peso, corazón, colesterol y hábitos).
No reemplazás al médico. Respondé en español rioplatense, claro y breve.

REGLAS OBLIGATORIAS:
- Habla SIEMPRE en español argentino, cálido y claro. Usa el nombre del paciente.
- NUNCA diagnostiques, recetes ni cambies tratamientos médicos.
- SIEMPRE termina recordando consultar con su médico asignado.
- Recuerda tomar medicación/pastillas según lo indicado por su médico.
- Basa consejos en glucosa, presión, peso, comidas recientes y perfil del paciente.
- Si glucosa <54 o >250, o presión en crisis (≥180/120), o dolor de pecho: urge buscar atención médica inmediata.
- Responde de forma útil y concreta (3-5 oraciones). No seas evasivo.
- ${doctorRef}
- ${medInfo}
- Eres apoyo informativo del IPS, NO reemplazas al equipo médico.`;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function getUserContext(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const latestGlucose = await prisma.glucoseReading.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const recentMeals = await prisma.mealEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { user, latestGlucose, recentMeals };
}

function appendMedicalReminder(
  response: string,
  doctorName: string | null,
  medications: { name: string; times: string[] }[]
): string {
  if (response.includes("médico") || response.includes("medico")) {
    return response;
  }
  const doctor = doctorName ? ` su médico ${doctorName}` : " su médico asignado";
  let extra = `\n\n⚕️ Consulte con${doctor} para decisiones sobre su tratamiento.`;
  if (medications.length > 0 && !response.toLowerCase().includes("pastilla") && !response.toLowerCase().includes("medic")) {
    extra += ` No olvide tomar: ${medications.map((m) => m.name).join(", ")}.`;
  }
  return response + extra;
}

function fallbackResponse(
  userMessage: string,
  userName: string,
  glucose: number | null,
  recentMeals: {
    name: string;
    carbs: number;
    sugar?: number | null;
    fat?: number | null;
    calories?: number | null;
  }[],
  doctorName: string | null,
  medications: { name: string; times: string[] }[]
): string {
  const name = userName || "amigo/a";
  const lower = userMessage.toLowerCase();
  const doctor = doctorName ? `Dr/a. ${doctorName}` : "su médico asignado del IPS";

  if (glucose === null) {
    return `${name}, aún no tengo un registro de glucosa. Registre su nivel en el panel para recomendaciones personalizadas. Consulte con ${doctor} sobre sus metas de glucosa.\n\n${MEDICAL_FOOTER}`;
  }

  const ctx = {
    glucose,
    userName: name,
    diabetesType: "tipo2",
    targetMin: 70,
    targetMax: 140,
    recentMeals: recentMeals.map((m) => ({ name: m.name, carbs: m.carbs })),
  };

  if (lower.includes("pastilla") || lower.includes("medic") || lower.includes("tomar")) {
    if (medications.length > 0) {
      const list = medications.map((m) => `${m.name} a las ${m.times.join(", ")}`).join("; ");
      return `${name}, sus medicamentos registrados son: ${list}. Siga las indicaciones de ${doctor}. Si tiene dudas sobre horarios o dosis, consulte directamente con su médico.\n\n${MEDICAL_FOOTER}`;
    }
    return `${name}, configure sus medicamentos en el perfil para que pueda recordárselos. ${doctor} le indicará la dosis y horarios correctos.\n\n${MEDICAL_FOOTER}`;
  }

  if (
    lower.includes("comí") ||
    lower.includes("comi") ||
    lower.includes("desayun") ||
    lower.includes("almorc") ||
    lower.includes("cen")
  ) {
    const lastMeal = recentMeals[0];
    const nutritionNote = lastMeal
      ? ` Analicé "${lastMeal.name}": ${lastMeal.carbs}g carbohidratos${lastMeal.sugar != null ? `, ${lastMeal.sugar}g azúcares` : ""}${lastMeal.fat != null ? `, ${lastMeal.fat}g grasas` : ""}.`
      : "";
    return `${name}, gracias por contarme.${nutritionNote} Con glucosa en ${glucose} mg/dL: ${analyzeGlucose(ctx).message} Consulte con ${doctor} si necesita ajustar su plan.\n\n${MEDICAL_FOOTER}`;
  }

  if (
    lower.includes("puedo comer") ||
    lower.includes("qué como") ||
    lower.includes("que como") ||
    lower.includes("puedo tomar")
  ) {
    return `${buildRecommendationSummary(ctx)}\n\nConsulte con ${doctor} antes de cambios importantes en su alimentación.\n\n${MEDICAL_FOOTER}`;
  }

  if (lower.includes("hola") || lower.includes("buenos") || lower.includes("buenas")) {
    const analysis = analyzeGlucose(ctx);
    const medReminder =
      medications.length > 0
        ? ` Recuerde tomar: ${medications.map((m) => m.name).join(", ")}.`
        : "";
    return `¡Hola ${name}! Su glucosa es ${glucose} mg/dL (${analysis.label}). ${analysis.message}${medReminder} ¿En qué más puedo ayudarle?\n\n${MEDICAL_FOOTER}`;
  }

  if (lower.includes("carbohidrato") || lower.includes("grasa") || lower.includes("azucar") || lower.includes("azúcar")) {
    if (recentMeals.length > 0) {
      const m = recentMeals[0];
      return `${name}, su última comida "${m.name}" tiene aproximadamente ${m.carbs}g carbohidratos, ${m.sugar ?? "?"}g azúcares y ${m.fat ?? "?"}g grasas (${m.calories ?? "?"} kcal). Los valores se calculan automáticamente. Consulte con ${doctor} para interpretar estos datos.\n\n${MEDICAL_FOOTER}`;
    }
  }

  return `${buildRecommendationSummary(ctx)}\n\n${MEDICAL_FOOTER}`;
}

export async function generateChatResponse(userMessage: string, userId: string): Promise<string> {
  const { user, latestGlucose, recentMeals } = await getUserContext(userId);
  const userName = user?.name ?? "Usuario";
  const glucose = latestGlucose?.value ?? null;
  const doctorName = user?.doctorName ?? null;
  const medications = parseMedications(user?.medications);
  const meals = recentMeals.map((m) => ({
    name: m.name,
    carbs: m.carbs,
    sugar: m.sugar,
    fat: m.fat,
    calories: m.calories,
  }));

  const openai = getOpenAIClient();
  if (!openai) {
    return fallbackResponse(userMessage, userName, glucose, meals, doctorName, medications);
  }

  const glucoseInfo = glucose
    ? `Glucosa: ${glucose} mg/dL (${analyzeGlucose({ glucose, userName, diabetesType: user?.diabetesType ?? "tipo2", targetMin: user?.targetMin ?? 70, targetMax: user?.targetMax ?? 140 }).label}).`
    : "Sin glucosa registrada.";

  const mealsInfo =
    meals.length > 0
      ? `Comidas: ${recentMeals.map((m) => `${m.name} — ${formatNutritionSummary({ name: m.name, servingSize: "", calories: m.calories ?? 0, carbs: m.carbs, sugar: m.sugar ?? 0, fat: m.fat ?? 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 0, source: "local", confidence: "high" })}`).join(" | ")}.`
      : "Sin comidas recientes.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(doctorName, medications) },
        {
          role: "system",
          content: `Paciente: ${userName}. Diabetes: ${user?.diabetesType ?? "tipo2"}. ${glucoseInfo} ${mealsInfo}`,
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 400,
      temperature: 0.6,
    });

    const raw =
      completion.choices[0]?.message?.content ??
      fallbackResponse(userMessage, userName, glucose, meals, doctorName, medications);

    return appendMedicalReminder(raw, doctorName, medications);
  } catch {
    return fallbackResponse(userMessage, userName, glucose, meals, doctorName, medications);
  }
}

export async function generateVoiceGreeting(userId: string): Promise<string> {
  const { user, latestGlucose, recentMeals } = await getUserContext(userId);
  const userName = user?.name ?? "Usuario";
  const doctorName = user?.doctorName;
  const medications = parseMedications(user?.medications);

  const medPart =
    medications.length > 0
      ? ` Recuerde tomar ${medications.map((m) => m.name).join(" y ")} según lo indicó su médico.`
      : "";

  const doctorPart = doctorName
    ? ` Cualquier duda, consulte con ${doctorName}.`
    : " Consulte con su médico asignado si tiene dudas.";

  if (!latestGlucose) {
    return `Hola ${userName}, soy VitalIPS del IPS Misiones. Registrá tu glucosa, presión o peso para recibir recomendaciones personalizadas.${medPart}${doctorPart}`;
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
  return `Hola ${userName}. Su glucosa está en ${latestGlucose.value} miligramos por decilitro, ${analysis.label.toLowerCase()}. ${analysis.message}${medPart}${doctorPart}`;
}
