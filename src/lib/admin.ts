import { NextResponse } from "next/server";
import { getSessionUser } from "./auth";
import { getGlucoseStatus } from "./recommendations";
import { computeStats, getPeriodRange, type Period } from "./stats";

export type UserRole = "patient" | "doctor" | "admin";

export function isStaffRole(role: string): role is "doctor" | "admin" {
  return role === "doctor" || role === "admin";
}

export async function getStaffUser() {
  const user = await getSessionUser();
  if (!user || !isStaffRole(user.role)) return null;
  return user;
}

export function staffUnauthorizedResponse() {
  return NextResponse.json({ error: "Acceso solo para personal médico" }, { status: 403 });
}

export function sanitizeStaffUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function sanitizePatientSummary(user: {
  id: string;
  email: string;
  name: string;
  diabetesType: string;
  targetMin: number;
  targetMax: number;
  doctorName: string | null;
  medications: string | null;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    diabetesType: user.diabetesType,
    targetMin: user.targetMin,
    targetMax: user.targetMax,
    doctorName: user.doctorName,
    medications: user.medications,
    profileComplete: user.profileComplete,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function glucoseStatusLabel(value: number, targetMin: number, targetMax: number) {
  const status = getGlucoseStatus(value);
  const labels: Record<string, string> = {
    critico_bajo: "Crítico bajo",
    bajo: "Bajo",
    normal: "En rango",
    elevado: "Elevado",
    alto: "Alto",
    critico_alto: "Crítico alto",
  };
  const inTarget = value >= targetMin && value <= targetMax;
  return {
    status,
    label: labels[status] ?? status,
    inTarget,
    alert: status === "critico_bajo" || status === "critico_alto" || status === "alto",
  };
}

export { computeStats, getPeriodRange, type Period };
