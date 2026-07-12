export const HEALTH_CONDITIONS = [
  { id: "diabetes", label: "Diabetes", desc: "Tipo 1, 2, gestacional o prediabetes" },
  { id: "hypertension", label: "Hipertensión", desc: "Presión arterial elevada" },
  { id: "obesity", label: "Sobrepeso / obesidad", desc: "Control de peso e IMC" },
  { id: "cardiac", label: "Cardiopatía / riesgo cardíaco", desc: "Corazón, taquicardia, antecedentes" },
  { id: "dyslipidemia", label: "Colesterol / triglicéridos", desc: "Lípidos en sangre" },
  { id: "prevention", label: "Prevención / chequeo general", desc: "Sin diagnóstico, quiero cuidarme" },
] as const;

export type HealthConditionId = (typeof HEALTH_CONDITIONS)[number]["id"];

export const SYMPTOM_TYPES = [
  { id: "mareos", label: "Mareos / vértigo" },
  { id: "dolor_pecho", label: "Dolor o presión en el pecho" },
  { id: "falta_aire", label: "Falta de aire" },
  { id: "palpitaciones", label: "Palpitaciones" },
  { id: "edema", label: "Hinchazón en piernas" },
  { id: "dolor_cabeza", label: "Dolor de cabeza intenso" },
  { id: "vision_borrosa", label: "Visión borrosa" },
  { id: "fatiga", label: "Fatiga extrema" },
  { id: "otro", label: "Otro síntoma" },
] as const;

export function parseConditions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function hasCondition(conditions: string[], id: HealthConditionId | string): boolean {
  return conditions.includes(id);
}

export function computeBMI(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm || heightCm < 80) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi: number): { label: string; level: "bajo" | "normal" | "sobrepeso" | "obesidad" | "obesidad_severa" } {
  if (bmi < 18.5) return { label: "Bajo peso", level: "bajo" };
  if (bmi < 25) return { label: "Peso normal", level: "normal" };
  if (bmi < 30) return { label: "Sobrepeso", level: "sobrepeso" };
  if (bmi < 35) return { label: "Obesidad", level: "obesidad" };
  return { label: "Obesidad severa", level: "obesidad_severa" };
}

export type BpStatus = "baja" | "normal" | "elevada" | "alta_1" | "alta_2" | "crisis";

export function getBpStatus(systolic: number, diastolic: number): {
  status: BpStatus;
  label: string;
  alert: boolean;
  color: string;
} {
  if (systolic >= 180 || diastolic >= 120) {
    return { status: "crisis", label: "Crisis hipertensiva", alert: true, color: "#dc2626" };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { status: "alta_2", label: "Hipertensión grado 2", alert: true, color: "#ea580c" };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { status: "alta_1", label: "Hipertensión grado 1", alert: true, color: "#f59e0b" };
  }
  if (systolic >= 120 && diastolic < 80) {
    return { status: "elevada", label: "Presión elevada", alert: false, color: "#eab308" };
  }
  if (systolic < 90 || diastolic < 60) {
    return { status: "baja", label: "Presión baja", alert: true, color: "#3b82f6" };
  }
  return { status: "normal", label: "Presión normal", alert: false, color: "#10b981" };
}

export function getHrStatus(bpm: number, context = "reposo"): {
  label: string;
  alert: boolean;
} {
  if (context === "ejercicio") {
    if (bpm > 180) return { label: "Muy elevada en ejercicio", alert: true };
    if (bpm < 80) return { label: "Baja para ejercicio", alert: false };
    return { label: "En ejercicio", alert: false };
  }
  if (bpm < 50) return { label: "Bradicardia", alert: true };
  if (bpm > 100) return { label: "Taquicardia en reposo", alert: true };
  if (bpm > 90) return { label: "Elevada en reposo", alert: false };
  return { label: "Normal en reposo", alert: false };
}

export function getCholesterolStatus(lab: {
  total?: number | null;
  ldl?: number | null;
  hdl?: number | null;
  triglycerides?: number | null;
}): { label: string; alert: boolean } {
  const alerts: string[] = [];
  if (lab.ldl != null && lab.ldl >= 160) alerts.push("LDL alto");
  else if (lab.ldl != null && lab.ldl >= 130) alerts.push("LDL borderline");
  if (lab.hdl != null && lab.hdl < 40) alerts.push("HDL bajo");
  if (lab.triglycerides != null && lab.triglycerides >= 200) alerts.push("Triglicéridos altos");
  if (lab.total != null && lab.total >= 240) alerts.push("Colesterol total alto");
  if (alerts.length) return { label: alerts.join(" · "), alert: true };
  return { label: "Lípidos en rango aceptable", alert: false };
}

export function conditionLabels(conditions: string[]): string {
  return conditions
    .map((id) => HEALTH_CONDITIONS.find((c) => c.id === id)?.label ?? id)
    .join(", ");
}
