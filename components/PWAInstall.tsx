"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAInstall() {
  const [installAvailable, setInstallAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallAvailable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || "serviceWorker" in navigator === false) return;
    window.navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstallAvailable(false);
    setDeferredPrompt(null);
  };

  if (!installAvailable || installed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 safe-area-bottom safe-area-right">
    <button
      type="button"
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-apple-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all shadow"
      aria-label="Instalar aplicación"
    >
      <Download className="w-4 h-4 flex-shrink-0" />
      Instalar
    </button>
    </div>
  );
}
