"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-teal-600" />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-slate-200/70 animate-pulse",
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
