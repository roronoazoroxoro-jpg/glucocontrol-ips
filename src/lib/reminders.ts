export interface Medication {
  name: string;
  times: string[];
}

export interface ReminderSettings {
  notificationsEnabled: boolean;
  glucoseIntervalHours: number;
  mealTimes: string[];
  medications: Medication[];
}

export const DEFAULT_REMINDERS: ReminderSettings = {
  notificationsEnabled: true,
  glucoseIntervalHours: 4,
  mealTimes: ["07:30", "12:30", "20:00"],
  medications: [],
};

export type ReminderType = "glucose" | "meal" | "medication";

export interface DueReminder {
  id: string;
  type: ReminderType;
  title: string;
  body: string;
  time: string;
}

export function parseMedications(json: string | null | undefined): Medication[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseMealTimes(json: string | null | undefined): string[] {
  if (!json) return DEFAULT_REMINDERS.mealTimes;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : DEFAULT_REMINDERS.mealTimes;
  } catch {
    return DEFAULT_REMINDERS.mealTimes;
  }
}

export function getReminderSettings(user: {
  notificationsEnabled?: boolean;
  glucoseIntervalHours?: number;
  mealTimes?: string | null;
  medications?: string | null;
}): ReminderSettings {
  return {
    notificationsEnabled: user.notificationsEnabled ?? true,
    glucoseIntervalHours: user.glucoseIntervalHours ?? 4,
    mealTimes: parseMealTimes(user.mealTimes),
    medications: parseMedications(user.medications),
  };
}

function isTimeMatch(now: Date, timeStr: string, windowMinutes = 1): boolean {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return false;
  const target = h * 60 + m;
  const current = now.getHours() * 60 + now.getMinutes();
  return Math.abs(current - target) <= windowMinutes;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDueReminders(
  settings: ReminderSettings,
  lastGlucoseAt: Date | null,
  doctorName?: string | null
): DueReminder[] {
  if (!settings.notificationsEnabled) return [];

  const now = new Date();
  const due: DueReminder[] = [];
  const doctorNote = doctorName
    ? ` Recuerde consultar con ${doctorName} si tiene dudas.`
    : " Consulte con su médico asignado si tiene dudas.";

  for (const mealTime of settings.mealTimes) {
    if (isTimeMatch(now, mealTime)) {
      due.push({
        id: `meal-${mealTime}-${todayKey()}`,
        type: "meal",
        title: "🍽️ Hora de comer",
        body: `Es hora de registrar tu comida.${doctorNote}`,
        time: mealTime,
      });
    }
  }

  for (const med of settings.medications) {
    for (const t of med.times) {
      if (isTimeMatch(now, t)) {
        due.push({
          id: `med-${med.name}-${t}-${todayKey()}`,
          type: "medication",
          title: "💊 Tomar medicación",
          body: `${med.name} — es hora de tomar tu medicación.${doctorNote}`,
          time: t,
        });
      }
    }
  }

  if (lastGlucoseAt) {
    const hoursSince =
      (now.getTime() - lastGlucoseAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince >= settings.glucoseIntervalHours) {
      due.push({
        id: `glucose-overdue-${todayKey()}`,
        type: "glucose",
        title: "🩸 Medir glucosa",
        body: `Han pasado ${Math.floor(hoursSince)} horas desde su última medición. Registre su glucosa ahora.${doctorNote}`,
        time: now.toTimeString().slice(0, 5),
      });
    }
  } else if (now.getHours() >= 7 && now.getHours() <= 22) {
    due.push({
      id: `glucose-first-${todayKey()}`,
      type: "glucose",
      title: "🩸 Medir glucosa",
      body: `Aún no registró su glucosa hoy. Tome su medición.${doctorNote}`,
      time: now.toTimeString().slice(0, 5),
    });
  }

  return due;
}

export function wasReminderShown(id: string): boolean {
  if (typeof window === "undefined") return true;
  const shown = JSON.parse(localStorage.getItem("reminders-shown") ?? "{}");
  return !!shown[id];
}

export function markReminderShown(id: string): void {
  if (typeof window === "undefined") return;
  const shown = JSON.parse(localStorage.getItem("reminders-shown") ?? "{}");
  shown[id] = Date.now();
  const keys = Object.keys(shown);
  if (keys.length > 100) {
    keys.slice(0, 50).forEach((k) => delete shown[k]);
  }
  localStorage.setItem("reminders-shown", JSON.stringify(shown));
}

export async function showReminderNotification(
  reminder: DueReminder
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (wasReminderShown(reminder.id)) return;

  const options: NotificationOptions = {
    body: reminder.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: reminder.id,
    requireInteraction: true,
    data: { url: "/app", type: reminder.type },
  };

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(reminder.title, options);
  } else {
    new Notification(reminder.title, options);
  }

  markReminderShown(reminder.id);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}
