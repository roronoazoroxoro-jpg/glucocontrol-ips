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

interface GlucoseChartProps {
  readings: { value: number; createdAt: string }[];
  targetMin?: number;
  targetMax?: number;
}

export function GlucoseChart({ readings, targetMin = 70, targetMax = 140 }: GlucoseChartProps) {
  const data = readings.map((r) => ({
    time: formatDateShort(r.createdAt),
    glucosa: r.value,
    full: r.createdAt,
  }));

  if (data.length === 0) {
    return (
      <EmptyState
        title="Sin datos de glucosa"
        description="Registrá tu glucosa para ver la tendencia en este periodo."
        className="h-64"
      />
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-semibold text-slate-800 mb-4">Tendencia de glucosa</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis domain={[40, 300]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
            }}
            formatter={(value: number) => [`${value} mg/dL`, "Glucosa"]}
          />
          <ReferenceLine y={targetMin} stroke="#f97316" strokeDasharray="4 4" label="" />
          <ReferenceLine y={targetMax} stroke="#f97316" strokeDasharray="4 4" label="" />
          <Line
            type="monotone"
            dataKey="glucosa"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
