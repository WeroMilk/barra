"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { employeeAuth } from "@/lib/employeeAuth";
import type { Employee } from "@/lib/employeeAuth";
import { movementsService, notificationsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";
import { loadBarBottles } from "@/lib/barStorage";
import { buildOrderReport } from "@/lib/orderReport";
import { Lock, Package, ShoppingCart, Download, MessageCircle, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_RECIPIENTS = [
  { label: "6623501632 - Encargado de Compras", value: "6623501632 - Encargado de Compras" },
];

function extractPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("52") ? digits : "52" + digits;
}

export default function ConfigPage() {
  const [employees, setEmployees] = useState<Employee[]>(() => employeeAuth.getEmployees());
  const [showPassword, setShowPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Record<string, string>>({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [savingEmployeeId, setSavingEmployeeId] = useState<string | null>(null);
  const [savedEmployeeId, setSavedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(employeeAuth.getEmployees());
  }, []);
  const [orderReportText, setOrderReportText] = useState("");
  const [orderRecipient, setOrderRecipient] = useState(WHATSAPP_RECIPIENTS[0]?.value ?? "");

  const handleGenerateOrder = () => {
    const bottles = loadBarBottles();
    if (bottles.length === 0) {
      alert("No hay botellas en tu inventario. Añade botellas en Mi inventario primero.");
      return;
    }
    const { text } = buildOrderReport(bottles);
    setOrderReportText(text);
    setOrderRecipient(WHATSAPP_RECIPIENTS[0]?.value ?? "");
    setShowOrderModal(true);
  };

  const handleDownloadOrder = () => {
    const name = `pedido-mibarra-${new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}.txt`;
    const blob = new Blob([orderReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendWhatsApp = () => {
    const phone = extractPhone(orderRecipient);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(orderReportText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowOrderModal(false);
  };

  const handlePasswordChange = (emp: Employee, newPassword: string): boolean => {
    const trimmed = newPassword.trim();
    if (!trimmed) {
      alert("La contraseña no puede estar vacía.");
      return false;
    }
    const previousPassword = emp.password;
    if (trimmed === previousPassword) {
      setEditingPassword((prev) => {
        const next = { ...prev };
        delete next[emp.id];
        return next;
      });
      return false;
    }
    employeeAuth.setEmployeePassword(emp.id, trimmed);
    setEmployees(employeeAuth.getEmployees());
    setEditingPassword((prev) => {
      const next = { ...prev };
      delete next[emp.id];
      return next;
    });
    movementsService.add({
      type: "employee_password_change",
      bottleId: "_",
      bottleName: "Configuración",
      newValue: 0,
      userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
      description: `Contraseña de «${emp.label}» actualizada`,
    });
    notificationsService.incrementUnread();
    return true;
  };

  const onSavePassword = (emp: Employee) => {
    const newPassword = editingPassword[emp.id] ?? emp.password;
    setSavingEmployeeId(emp.id);
    setTimeout(() => {
      const didSave = handlePasswordChange(emp, newPassword);
      setSavingEmployeeId(null);
      if (didSave) {
        setSavedEmployeeId(emp.id);
        setTimeout(() => setSavedEmployeeId(null), 1800);
      }
    }, 280);
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-apple-bg">
      <header className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-apple-border/60">
        <h1 className="text-xl sm:text-2xl font-semibold text-apple-text tracking-tight">Configuraciones</h1>
        <p className="text-sm text-apple-text2 mt-1">Ajustes del bar, contraseñas y pedidos.</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Contraseña de empleado */}
          <section className="flex flex-col flex-shrink-0 lg:flex-1 bg-apple-surface rounded-2xl border border-apple-border shadow-sm overflow-hidden">
            <div className="flex-shrink-0 px-4 sm:px-5 py-4 border-b border-apple-border/60 bg-apple-surface">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-apple-accent/10">
                  <Lock className="w-4 h-4 text-apple-accent" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-apple-text">Contraseña de empleado</h2>
                  <p className="text-xs text-apple-text2 mt-0.5">Edita contraseñas; se registra en Movimientos.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-5 space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="rounded-xl border border-apple-border bg-apple-bg/50 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <label htmlFor={`employee-password-${emp.id}`} className="block text-xs font-medium text-apple-text sm:text-sm">{emp.label}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id={`employee-password-${emp.id}`}
                      name={`employee-password-${emp.id}`}
                      type={showPassword ? "text" : "password"}
                      value={editingPassword[emp.id] ?? emp.password}
                      onChange={(e) =>
                        setEditingPassword((prev) => ({ ...prev, [emp.id]: e.target.value }))
                      }
                      placeholder="Contraseña"
                      className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 bg-apple-surface border border-apple-border rounded-xl text-sm font-mono text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => onSavePassword(emp)}
                      disabled={savingEmployeeId !== null}
                      className="shrink-0 px-4 py-2.5 sm:py-2 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0"
                    >
                      {savingEmployeeId === emp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      ) : savedEmployeeId === emp.id ? (
                        <><Check className="w-4 h-4" aria-hidden /> Guardado</>
                      ) : (
                        "Guardar"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 p-4 sm:p-5 pt-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-full px-4 py-2.5 sm:py-2 text-sm font-medium rounded-xl border border-apple-border text-apple-text bg-apple-surface hover:bg-apple-bg transition-colors"
              >
                {showPassword ? "Ocultar contraseñas" : "Ver contraseñas"}
              </button>
            </div>
          </section>

          {/* Generar pedido */}
          <section className="flex flex-col flex-shrink-0 lg:flex-1 bg-apple-surface rounded-2xl border border-apple-border shadow-sm overflow-hidden">
            <div className="flex-shrink-0 px-4 sm:px-5 py-4 border-b border-apple-border/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-apple-accent/10">
                  <ShoppingCart className="w-4 h-4 text-apple-accent" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-apple-text">Generar pedido</h2>
                  <p className="text-xs text-apple-text2 mt-0.5">Faltantes y botellas bajo 25%. Envíalo por WhatsApp.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
              <button
                type="button"
                onClick={handleGenerateOrder}
                className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-5 py-3.5 sm:py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                Generar pedido
              </button>
            </div>
          </section>

          {/* Mi inventario */}
          <section className="flex flex-col flex-shrink-0 lg:flex-1 bg-apple-surface rounded-2xl border border-apple-border shadow-sm overflow-hidden">
            <div className="flex-shrink-0 px-4 sm:px-5 py-4 border-b border-apple-border/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-apple-accent/10">
                  <Package className="w-4 h-4 text-apple-accent" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-apple-text">Mi inventario</h2>
                  <p className="text-xs text-apple-text2 mt-0.5">Bebidas en tu barra. Añade o quita botellas.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
              <Link
                href="/select-bottles"
                className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-5 py-3.5 sm:py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                <Package className="w-4 h-4 shrink-0" />
                Selecciona tu inventario
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Modal Generar pedido */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-apple-surface rounded-2xl border border-apple-border shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
            >
              <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-apple-border/60 flex-shrink-0">
                <h3 className="text-lg font-semibold text-apple-text">Generar pedido</h3>
                <p className="text-sm text-apple-text2 mt-1">Vista previa. Descarga o envía por WhatsApp.</p>
              </div>
              <div className="px-5 py-4 sm:px-6 sm:py-5 flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
                <div>
                  <label htmlFor="order-recipient" className="block text-sm font-medium text-apple-text mb-1.5">
                    ¿A quién enviarlo?
                  </label>
                  <select
                    id="order-recipient"
                    name="orderRecipient"
                    value={orderRecipient}
                    onChange={(e) => setOrderRecipient(e.target.value)}
                    className="w-full px-3 py-2.5 bg-apple-bg border border-apple-border rounded-xl text-sm text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent"
                  >
                    {WHATSAPP_RECIPIENTS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <label htmlFor="order-report-preview" className="block text-sm font-medium text-apple-text mb-1.5">Vista previa</label>
                  <textarea
                    id="order-report-preview"
                    name="orderReportPreview"
                    readOnly
                    value={orderReportText}
                    rows={10}
                    className="w-full px-3 py-2.5 bg-apple-bg border border-apple-border rounded-xl text-sm text-apple-text font-mono resize-none flex-1 min-h-[120px]"
                  />
                </div>
              </div>
              <div className="px-5 py-4 sm:px-6 sm:py-5 border-t border-apple-border/60 flex flex-wrap gap-2 sm:gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-apple-border text-apple-text text-sm font-medium hover:bg-apple-bg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleDownloadOrder}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-apple-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Descargar .txt
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  Enviar por WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
