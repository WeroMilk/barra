"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Wine, Bell, Settings, FileSpreadsheet, Package } from "lucide-react";
import LogoutButton from "@/components/Auth/LogoutButton";
import { demoAuth } from "@/lib/demoAuth";

interface DashboardHeaderProps {
  /** Contenido extra a la izquierda (ej. ordenar, etc.) */
  leftContent?: React.ReactNode;
  /** Badge para notificaciones en Movimientos */
  notificationsCount?: number;
}

export default function DashboardHeader({ leftContent, notificationsCount = 0 }: DashboardHeaderProps) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `p-1.5 rounded-md transition-colors ${
      pathname === path
        ? "text-apple-accent bg-apple-accent/10"
        : "text-apple-text2 hover:bg-apple-bg hover:text-apple-text"
    }`;

  return (
    <div className="bg-apple-surface border-b border-apple-border pl-2 pr-3 py-1.5 sm:pl-3 sm:pr-4 sm:py-2 flex-shrink-0 z-20 safe-area-x">
      <div className="flex items-center h-full relative min-h-[44px] sm:min-h-0">
        <div className="flex-1 flex items-center justify-center min-w-0 max-w-3xl mx-auto">
          <div className="text-center truncate w-full">
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-apple-accent leading-tight">MiBarra</h1>
            <p className="text-[9px] sm:text-[10px] text-apple-text2 leading-tight truncate max-w-[120px] sm:max-w-none mx-auto">
              {demoAuth.getCurrentUser()?.barName || "Mi Bar"}
            </p>
          </div>
        </div>
        {/* Izquierda: Inventario, Movimientos, Importar ventas */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          {leftContent}
          <Link href="/bar" className={`touch-target-min flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-1.5 rounded-md ${linkClass("/bar")}`} title="Inventario" aria-label="Inventario">
            <Wine className="w-4 h-4 flex-shrink-0" />
          </Link>
          <Link href="/movements" className={`touch-target-min relative flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-1.5 rounded-md ${linkClass("/movements")}`} title="Movimientos" aria-label="Movimientos">
            <Bell className="w-4 h-4 flex-shrink-0" />
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] sm:min-w-[18px] sm:h-[18px] px-0.5 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white bg-red-500 rounded-full">
                {notificationsCount > 99 ? "99+" : notificationsCount}
              </span>
            )}
          </Link>
          <Link href="/import-sales" className={`touch-target-min flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-1.5 rounded-md ${linkClass("/import-sales")}`} title="Importar ventas" aria-label="Importar ventas">
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
          </Link>
        </div>
        {/* Derecha (móvil y desktop): Importar pedido, Configuración, Salir */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          <Link href="/import-order" className={`touch-target-min flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-1.5 rounded-md ${linkClass("/import-order")}`} title="Importar pedido" aria-label="Importar pedido">
            <Package className="w-4 h-4 flex-shrink-0" />
          </Link>
          <Link href="/config" className={`touch-target-min flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-1.5 rounded-md ${linkClass("/config")}`} title="Configuraciones" aria-label="Configuraciones">
            <Settings className="w-4 h-4 flex-shrink-0" />
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
