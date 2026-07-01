"use client";

import { useEffect, useRef, useState } from "react";
import {
  getDueReminders,
  getReminderSettings,
  showReminderNotification,
  requestNotificationPermission,
  type DueReminder,
} from "@/lib/reminders";

interface NotificationSchedulerProps {
  enabled?: boolean;
}

export function NotificationScheduler({ enabled = true }: NotificationSchedulerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    async function checkReminders() {
      try {
        const res = await fetch("/api/reminders");
        const data = await res.json();
        if (!data.settings?.notificationsEnabled) return;

        const settings = getReminderSettings({
          notificationsEnabled: data.settings.notificationsEnabled,
          glucoseIntervalHours: data.settings.glucoseIntervalHours,
          mealTimes: JSON.stringify(data.settings.mealTimes),
          medications: JSON.stringify(data.settings.medications),
        });

        const lastGlucoseAt = data.lastGlucoseAt ? new Date(data.lastGlucoseAt) : null;
        const due = getDueReminders(settings, lastGlucoseAt, data.doctorName);

        for (const reminder of due) {
          await showReminderNotification(reminder);
        }
      } catch {
        // silent
      }
    }

    requestNotificationPermission();
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 30_000);

    function onVisibility() {
      if (document.visibilityState === "visible") checkReminders();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return null;
}

export function UpcomingRemindersBanner() {
  const [upcoming, setUpcoming] = useState<DueReminder[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      if (!data.settings) return;

      const settings = getReminderSettings({
        notificationsEnabled: data.settings.notificationsEnabled,
        glucoseIntervalHours: data.settings.glucoseIntervalHours,
        mealTimes: JSON.stringify(data.settings.mealTimes),
        medications: JSON.stringify(data.settings.medications),
      });

      const now = new Date();
      const items: DueReminder[] = [];

      for (const t of settings.mealTimes) {
        const [h, m] = t.split(":").map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);
        const diff = (target.getTime() - now.getTime()) / 60000;
        if (diff >= 0 && diff <= 60) {
          items.push({
            id: `upcoming-meal-${t}`,
            type: "meal",
            title: "Próxima comida",
            body: `Comida programada a las ${t}`,
            time: t,
          });
        }
      }

      for (const med of settings.medications) {
        for (const t of med.times) {
          const [h, m] = t.split(":").map(Number);
          const target = new Date();
          target.setHours(h, m, 0, 0);
          const diff = (target.getTime() - now.getTime()) / 60000;
          if (diff >= 0 && diff <= 60) {
            items.push({
              id: `upcoming-med-${med.name}-${t}`,
              type: "medication",
              title: "Próxima medicación",
              body: `${med.name} a las ${t}`,
              time: t,
            });
          }
        }
      }

      setUpcoming(items.slice(0, 3));
    }
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-2">
      {upcoming.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm"
        >
          <span className="text-lg">{r.type === "medication" ? "💊" : "🍽️"}</span>
          <div>
            <p className="font-medium text-blue-900">{r.title}</p>
            <p className="text-blue-700 text-xs">{r.body}</p>
          </div>
          <span className="ml-auto text-xs font-mono text-blue-600">{r.time}</span>
        </div>
      ))}
    </div>
  );
}
