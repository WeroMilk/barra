"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Wine, Bell, Settings, FileSpreadsheet, DollarSign, Package, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "@/components/Auth/LogoutButton";
import { demoAuth } from "@/lib/demoAuth";

interface DashboardHeaderProps {
  leftContent?: React.ReactNode;
  notificationsCount?: number;
}

const NAV_ITEMS = [
  { href: "/bar", icon: Wine, label: "Inventario" },
  { href: "/movements", icon: Bell, label: "Movimientos" },
  { href: "/import-sales", icon: FileSpreadsheet, label: "Importar ventas" },
  { href: "/report", icon: DollarSign, label: "Reporte de ventas" },
  { href: "/import-order", icon: Package, label: "Importar pedido" },
  { href: "/config", icon: Settings, label: "Configuraciones" },
] as const;

export default function DashboardHeader({ leftContent, notificationsCount = 0 }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (path: string) =>
    pathname === path ? "text-apple-accent" : "text-apple-text2 hover:text-apple-text";

  return (
    <>
      <div className="bg-apple-surface border-b border-apple-border pl-2 pr-3 py-1.5 sm:pl-3 sm:pr-4 sm:py-2 flex-shrink-0 z-20 safe-area-x">
        <div className="flex items-center h-full relative min-h-[44px] sm:min-h-0">
          {/* Centro: título (siempre visible) */}
          <div className="flex-1 flex items-center justify-center min-w-0 max-w-3xl mx-auto">
            <div className="text-center truncate w-full">
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-apple-accent leading-tight">MiBarra</h1>
              <p className="text-[9px] sm:text-[10px] text-apple-text2 leading-tight truncate max-w-[120px] sm:max-w-none mx-auto">
                {demoAuth.getCurrentUser()?.barName || "Mi Bar"}
              </p>
            </div>
          </div>

          {/* Móvil: solo hamburguesa a la izquierda */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:hidden">
            {leftContent}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="touch-target-min flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl text-apple-text hover:bg-apple-bg active:bg-apple-bg/80 transition-colors duration-200"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            </button>
          </div>

          {/* Desktop: todos los iconos a la izquierda */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 lg:gap-1">
            {leftContent}
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`touch-target-min flex items-center justify-center min-w-[36px] min-h-[36px] lg:min-w-[40px] lg:min-h-[40px] p-1.5 rounded-lg transition-colors ${linkClass(href)}`}
                title={label}
                aria-label={label}
              >
                <span className="relative inline-flex">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {href === "/movements" && notificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center text-[8px] font-bold text-white bg-red-500 rounded-full">
                      {notificationsCount > 99 ? "99+" : notificationsCount}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>

          {/* Desktop: solo Salir a la derecha */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Menú hamburguesa móvil: overlay + panel lateral estilo Apple */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[min(100vw-56px,320px)] max-w-full bg-apple-surface border-l border-apple-border shadow-2xl z-40 flex flex-col md:hidden"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-apple-border/60">
                <span className="text-sm font-semibold text-apple-text">Menú</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-apple-text2 hover:bg-apple-bg active:bg-apple-bg/80 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-2" aria-label="Navegación principal">
                <ul className="px-2 space-y-0.5">
                  {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-150 ${
                            isActive ? "bg-apple-accent/10 text-apple-accent" : "text-apple-text hover:bg-apple-bg active:bg-apple-bg/80"
                          }`}
                        >
                          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-apple-bg/80">
                            <Icon className="w-5 h-5" strokeWidth={2} />
                          </span>
                          <span className="font-medium text-[15px]">{label}</span>
                          {href === "/movements" && notificationsCount > 0 && (
                            <span className="ml-auto min-w-[22px] h-[22px] px-1.5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                              {notificationsCount > 99 ? "99+" : notificationsCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="flex-shrink-0 p-3 pt-2 border-t border-apple-border/60">
                <LogoutButton className="!min-h-[48px] w-full justify-center rounded-xl" showText alwaysShowText />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
