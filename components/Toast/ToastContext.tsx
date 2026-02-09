"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error";

export interface ToastOptions {
  title: string;
  message: string;
  details?: string[];
  type?: ToastType;
  /** Duración en ms; 0 = no auto-cerrar. Por defecto 5000 */
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: number;
  type: ToastType;
}

const ToastContext = createContext<{
  show: (opts: ToastOptions) => void;
} | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((opts: ToastOptions) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = ++toastId;
    const type = opts.type ?? "success";
    const duration = opts.duration ?? 5000;

    setToast({
      id,
      title: opts.title,
      message: opts.message,
      details: opts.details,
      type,
    });

    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setToast((t) => (t?.id === id ? null : t));
        timeoutRef.current = null;
      }, duration);
    }
  }, []);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed left-4 right-4 top-4 z-[100] mx-auto max-w-md md:left-6 md:right-auto md:max-w-sm"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            role="alert"
            aria-live="polite"
          >
            <div
              className={`flex gap-3 rounded-2xl border shadow-lg overflow-hidden ${
                toast.type === "success"
                  ? "border-emerald-200/80 bg-white dark:bg-gray-900"
                  : "border-red-200/80 bg-white dark:bg-gray-900"
              }`}
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center w-12 ${
                  toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 py-3 pr-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-apple-text text-sm">{toast.title}</p>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="flex-shrink-0 p-1 rounded-lg text-apple-text2 hover:bg-apple-bg transition-colors touch-manipulation"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-sm mt-0.5 ${toast.type === "success" ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"}`}>
                  {toast.message}
                </p>
                {toast.details && toast.details.length > 0 && (
                  <ul className="mt-2 space-y-0.5 max-h-28 overflow-y-auto text-xs text-apple-text2 list-disc list-inside">
                    {toast.details.slice(0, 8).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                    {toast.details.length > 8 && (
                      <li>+{toast.details.length - 8} más</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
