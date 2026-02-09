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
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <h2 className="text-lg font-semibold text-apple-text">Configuraciones</h2>
        <p className="text-xs text-apple-text2">Ajustes del bar y contraseñas de empleados.</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 p-4 pt-2 overflow-hidden">
        {/* Contraseña de empleado */}
        <section className="flex flex-col min-h-0 bg-apple-surface rounded-2xl border border-apple-border overflow-hidden flex-1">
          <div className="flex-shrink-0 p-3 border-b border-apple-border/50">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-sm">Contraseña de empleado</h3>
            </div>
            <p className="text-xs text-apple-text2 mt-1 leading-snug">
              Edita contraseñas; queda registrado en Movimientos.
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
            {employees.map((emp) => (
              <div key={emp.id} className="px-3 py-2 bg-apple-bg rounded-xl border border-apple-border space-y-1.5">
                <span className="text-xs font-medium text-apple-text block">{emp.label}</span>
                <div className="flex flex-col sm:flex-row gap-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editingPassword[emp.id] ?? emp.password}
                    onChange={(e) =>
                      setEditingPassword((prev) => ({ ...prev, [emp.id]: e.target.value }))
                    }
                    placeholder="Contraseña"
                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-apple-surface border border-apple-border rounded-lg text-xs font-mono text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent"
                  />
                  <button
                    type="button"
                    onClick={() => onSavePassword(emp)}
                    disabled={savingEmployeeId !== null}
                    className="min-w-[72px] px-2.5 py-1.5 bg-apple-accent text-white text-xs font-medium rounded-lg hover:opacity-90 flex-shrink-0 inline-flex items-center justify-center gap-1.5 disabled:opacity-90 disabled:cursor-wait"
                  >
                    {savingEmployeeId === emp.id ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin flex-shrink-0" aria-hidden />
                    ) : savedEmployeeId === emp.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white flex-shrink-0" aria-hidden />
                        Guardado
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-shrink-0 p-3 pt-0">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="w-full px-3 py-2 text-xs bg-apple-accent text-white rounded-xl hover:opacity-90 font-medium"
            >
              {showPassword ? "Ocultar contraseñas" : "Ver contraseñas"}
            </button>
          </div>
        </section>

        {/* Generar pedido */}
        <section className="flex flex-col min-h-0 bg-apple-surface rounded-2xl border border-apple-border overflow-hidden flex-1">
          <div className="flex-shrink-0 p-3 border-b border-apple-border/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-sm">Generar pedido</h3>
            </div>
            <p className="text-xs text-apple-text2 mt-1 leading-snug">
              Texto con lo que falta por pedir y botellas bajo 25%. Envíalo por WhatsApp.
            </p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={handleGenerateOrder}
              className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-4 py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              Generar pedido
            </button>
          </div>
        </section>

        {/* Mi inventario */}
        <section className="flex flex-col min-h-0 bg-apple-surface rounded-2xl border border-apple-border overflow-hidden flex-1">
          <div className="flex-shrink-0 p-3 border-b border-apple-border/50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-sm">Mi inventario</h3>
            </div>
            <p className="text-xs text-apple-text2 mt-1 leading-snug">
              Las bebidas que elijas aparecen en Mi Barra. Añade o quita botellas.
            </p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <Link
              href="/select-bottles"
              className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-4 py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <Package className="w-4 h-4" />
              Selecciona tu inventario
            </Link>
          </div>
        </section>
      </div>

      {/* Modal Generar pedido */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-apple-surface rounded-2xl border border-apple-border shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-apple-border flex-shrink-0">
                <h3 className="text-lg font-semibold text-apple-text">Generar pedido</h3>
                <p className="text-xs text-apple-text2 mt-0.5">Vista previa del texto. Descárgalo o envíalo por WhatsApp.</p>
              </div>
              <div className="p-4 flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
                <label className="text-xs font-medium text-apple-text">
                  ¿A quién enviarlo?
                </label>
                <select
                  id="order-recipient"
                  name="orderRecipient"
                  value={orderRecipient}
                  onChange={(e) => setOrderRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-accent"
                >
                  {WHATSAPP_RECIPIENTS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <label className="text-xs font-medium text-apple-text">
                  Vista previa
                </label>
                <textarea
                  readOnly
                  value={orderReportText}
                  rows={12}
                  className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-xl text-xs sm:text-sm text-apple-text font-mono resize-none"
                />
              </div>
              <div className="p-4 border-t border-apple-border flex flex-wrap gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-apple-border text-apple-text text-sm font-medium hover:bg-apple-bg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleDownloadOrder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-apple-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Descargar .txt
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
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
