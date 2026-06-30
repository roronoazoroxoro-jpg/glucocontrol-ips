import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";

export type Period = "day" | "week" | "month";

export function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();

  switch (period) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

export function getChartDays(days: number): Date[] {
  return Array.from({ length: days }, (_, i) => subDays(new Date(), days - 1 - i));
}

export interface StatsSummary {
  avgGlucose: number | null;
  minGlucose: number | null;
  maxGlucose: number | null;
  totalMeals: number;
  totalCarbs: number;
  readingsCount: number;
  inRangePercent: number | null;
}

export function computeStats(
  readings: { value: number }[],
  meals: { carbs: number }[],
  targetMin = 70,
  targetMax = 140
): StatsSummary {
  const values = readings.map((r) => r.value);

  const avgGlucose =
    values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null;

  const inRange =
    values.length > 0
      ? Math.round(
          (values.filter((v) => v >= targetMin && v <= targetMax).length / values.length) * 100
        )
      : null;

  return {
    avgGlucose,
    minGlucose: values.length > 0 ? Math.min(...values) : null,
    maxGlucose: values.length > 0 ? Math.max(...values) : null,
    totalMeals: meals.length,
    totalCarbs: Math.round(meals.reduce((a, m) => a + m.carbs, 0)),
    readingsCount: readings.length,
    inRangePercent: inRange,
  };
}
