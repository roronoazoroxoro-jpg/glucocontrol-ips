"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);

    setIsStandalone(!!standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const dismissedBefore = localStorage.getItem("pwa-install-dismissed");
    if (dismissedBefore) setDismissed(true);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  }

  if (isStandalone || dismissed) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-24 md:max-w-sm">
        <div className="glass-card rounded-2xl p-4 shadow-lg border border-teal-200">
          <div className="flex justify-between items-start gap-2 mb-2">
            <p className="text-sm font-semibold text-slate-800">Instalar en iPhone</p>
            <button onClick={handleDismiss} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toca <strong>Compartir</strong> en Safari y luego{" "}
            <strong>Agregar a pantalla de inicio</strong> para instalar VitalIPS.
          </p>
        </div>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-24 md:max-w-sm">
      <div className="glass-card rounded-2xl p-4 shadow-lg border border-teal-200">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Instalar VitalIPS</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Acceso rápido desde tu celular, como una app
            </p>
          </div>
          <button onClick={handleDismiss} className="p-1 hover:bg-slate-100 rounded-lg shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-navy-800 to-teal-700 text-white text-sm font-medium hover:bg-navy-800 transition"
        >
          <Download className="w-4 h-4" />
          Instalar aplicación
        </button>
      </div>
    </div>
  );
}
