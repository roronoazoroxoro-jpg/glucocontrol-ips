"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatDateShort } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

interface BpChartProps {
  readings: { systolic: number; diastolic: number; createdAt: string }[];
  targetSys?: number;
  targetDia?: number;
}

export function BpChart({ readings, targetSys = 130, targetDia = 80 }: BpChartProps) {
  const data = [...readings]
    .slice()
    .reverse()
    .map((r) => ({
      time: formatDateShort(r.createdAt),
      sistólica: r.systolic,
      diastólica: r.diastolic,
    }));

  if (data.length === 0) {
    return (
      <EmptyState
        title="Sin registros de presión"
        description="Registrá tu presión para ver la tendencia acá."
        className="h-64"
      />
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-up">
      <h3 className="font-display font-semibold text-navy-900 mb-4">Tendencia de presión</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis domain={[40, 200]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
          />
          <ReferenceLine y={targetSys} stroke="#f97316" strokeDasharray="4 4" />
          <ReferenceLine y={targetDia} stroke="#fb923c" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="sistólica"
            stroke="#e11d48"
            strokeWidth={2.5}
            dot={{ fill: "#e11d48", r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="diastólica"
            stroke="#0f766e"
            strokeWidth={2.5}
            dot={{ fill: "#0f766e", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface WeightChartProps {
  entries: { weightKg: number; createdAt: string }[];
  heightCm?: number | null;
}

export function WeightChart({ entries }: WeightChartProps) {
  const data = [...entries]
    .slice()
    .reverse()
    .map((e) => ({
      time: formatDateShort(e.createdAt),
      peso: Math.round(e.weightKg * 10) / 10,
    }));

  if (data.length === 0) {
    return (
      <EmptyState
        title="Sin registros de peso"
        description="Cargá tu peso para seguir el IMC y la evolución."
        className="h-64"
      />
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-up">
      <h3 className="font-display font-semibold text-navy-900 mb-4">Tendencia de peso</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
            formatter={(value: number) => [`${value} kg`, "Peso"]}
          />
          <Line
            type="monotone"
            dataKey="peso"
            stroke="#d97706"
            strokeWidth={2.5}
            dot={{ fill: "#d97706", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
