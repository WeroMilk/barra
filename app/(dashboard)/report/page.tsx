"use client";

import { useState, useEffect } from "react";
import { Download, TrendingUp } from "lucide-react";
import { getSalesStats, buildReportText, type SalesStats } from "@/lib/salesReport";

export default function ReportPage() {
  const [stats, setStats] = useState<SalesStats | null>(null);

  useEffect(() => {
    setStats(getSalesStats());
  }, []);

  const handleDownload = () => {
    if (!stats) return;
    const text = buildReportText(stats);
    const name = `reporte-ventas-${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-apple-text2 text-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <h2 className="text-lg font-semibold text-apple-text">Reporte de ventas</h2>
        <p className="text-xs text-apple-text2">Ventas del día, semana, mes y lo más vendido</p>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center p-4 gap-3 max-w-lg mx-auto w-full">
        {/* Períodos: Hoy, Semana, Mes */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          <div className="bg-apple-surface rounded-2xl border border-apple-border p-3 text-center">
            <p className="text-[10px] sm:text-xs text-apple-text2 uppercase tracking-wide">{stats.dayLabel}</p>
            <p className="text-lg sm:text-xl font-semibold text-apple-accent mt-0.5">
              {stats.dayTotal.toFixed(1)}
            </p>
            <p className="text-[10px] text-apple-text2">ventas</p>
          </div>
          <div className="bg-apple-surface rounded-2xl border border-apple-border p-3 text-center">
            <p className="text-[10px] sm:text-xs text-apple-text2 uppercase tracking-wide">{stats.weekLabel}</p>
            <p className="text-lg sm:text-xl font-semibold text-apple-accent mt-0.5">
              {stats.weekTotal.toFixed(1)}
            </p>
            <p className="text-[10px] text-apple-text2">ventas</p>
          </div>
          <div className="bg-apple-surface rounded-2xl border border-apple-border p-3 text-center">
            <p className="text-[10px] sm:text-xs text-apple-text2 uppercase tracking-wide">{stats.monthLabel}</p>
            <p className="text-lg sm:text-xl font-semibold text-apple-accent mt-0.5">
              {stats.monthTotal.toFixed(1)}
            </p>
            <p className="text-[10px] text-apple-text2">ventas</p>
          </div>
        </div>

        {/* Lo más vendido */}
        <div className="flex-1 min-h-0 flex flex-col bg-apple-surface rounded-2xl border border-apple-border overflow-hidden flex-shrink-0">
          <div className="flex-shrink-0 flex items-center gap-2 p-3 border-b border-apple-border/50">
            <TrendingUp className="w-4 h-4 text-apple-accent flex-shrink-0" />
            <h3 className="font-semibold text-apple-text text-sm">Lo más vendido</h3>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-3">
            {stats.topProducts.length === 0 ? (
              <p className="text-xs text-apple-text2 text-center py-4">Importa ventas para ver estadísticas</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.topProducts.map((p, i) => (
                  <li
                    key={`${p.name}-${i}`}
                    className="flex items-center justify-between gap-2 text-xs py-1 border-b border-apple-border/40 last:border-0"
                  >
                    <span className="font-medium text-apple-text truncate">{p.name}</span>
                    <span className="text-apple-accent font-semibold shrink-0">
                      {p.quantity.toFixed(1)} {p.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Descargar reporte */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex-shrink-0 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-apple-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4 flex-shrink-0" />
          Descargar reporte .txt
        </button>
      </div>
    </div>
  );
}
