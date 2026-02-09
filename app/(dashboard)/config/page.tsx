"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { employeeAuth } from "@/lib/employeeAuth";
import type { Employee } from "@/lib/employeeAuth";
import { movementsService, notificationsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";
import { loadBarBottles } from "@/lib/barStorage";
import { buildOrderReport } from "@/lib/orderReport";
import { Lock, Package, ShoppingCart, Download, MessageCircle } from "lucide-react";
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

  const handlePasswordChange = (emp: Employee, newPassword: string) => {
    const trimmed = newPassword.trim();
    if (!trimmed) {
      alert("La contraseña no puede estar vacía.");
      return;
    }
    const previousPassword = emp.password;
    if (trimmed === previousPassword) {
      setEditingPassword((prev) => {
        const next = { ...prev };
        delete next[emp.id];
        return next;
      });
      return;
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
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4 py-3 sm:py-4">
        <div className="w-full max-w-xl flex flex-col gap-4 sm:gap-5 flex-shrink-0">
          <div className="flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-apple-text">Configuraciones</h2>
            <p className="text-xs sm:text-sm text-apple-text2 mt-0.5">Ajustes del bar y contraseñas de empleados.</p>
          </div>

          {/* Contraseña de empleado */}
          <section className="bg-apple-surface rounded-2xl border border-apple-border p-4 sm:p-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-sm sm:text-base">Contraseña de empleado</h3>
            </div>
            <p className="text-xs sm:text-sm text-apple-text2 mb-3 leading-snug">
              Cada empleado tiene contraseña. Puedes editarla aquí; en MiBarra queda registrado en Movimientos quién realizó cada cambio.
            </p>
            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="px-3 py-3 bg-apple-bg rounded-xl border border-apple-border space-y-2">
                  <span className="text-sm font-medium text-apple-text block">{emp.label}</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editingPassword[emp.id] ?? emp.password}
                      onChange={(e) =>
                        setEditingPassword((prev) => ({ ...prev, [emp.id]: e.target.value }))
                      }
                      placeholder="Contraseña"
                      className="flex-1 min-w-0 px-3 py-2 bg-apple-surface border border-apple-border rounded-lg text-sm font-mono text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasswordChange(emp, editingPassword[emp.id] ?? emp.password)}
                      className="px-3 py-2 bg-apple-accent text-white text-sm font-medium rounded-lg hover:opacity-90 flex-shrink-0"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mt-3 w-full px-4 py-2.5 text-sm bg-apple-accent text-white rounded-xl hover:opacity-90 font-medium"
            >
              {showPassword ? "Ocultar contraseñas" : "Ver contraseñas"}
            </button>
          </section>

          {/* Generar pedido */}
          <section className="bg-apple-surface rounded-2xl border border-apple-border p-4 sm:p-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-sm sm:text-base">Generar pedido</h3>
            </div>
            <p className="text-xs sm:text-sm text-apple-text2 mb-3 leading-snug">
              Genera un texto con lo que falta por pedir (unidades) y las botellas por debajo del 25%. Envíalo por WhatsApp al encargado de compras para mantener la barra surtida.
            </p>
            <button
              type="button"
              onClick={handleGenerateOrder}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              Generar pedido
            </button>
          </section>

          {/* Mi inventario */}
          <section className="bg-apple-surface rounded-2xl border border-apple-border p-4 sm:p-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-sm sm:text-base">Mi inventario</h3>
            </div>
            <p className="text-xs sm:text-sm text-apple-text2 mb-3 leading-snug">
              Las bebidas que elijas aparecen en Mi Barra. Añade o quita botellas cuando quieras.
            </p>
            <Link
              href="/select-bottles"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <Package className="w-4 h-4" />
              Selecciona tu inventario
            </Link>
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
