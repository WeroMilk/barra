"use client";

import { useState, useCallback } from "react";
import { Package, Upload, CheckCircle, AlertCircle, Download } from "lucide-react";
import { loadBarBottles, saveBarBottles } from "@/lib/barStorage";
import { applyOrderToInventory, sheetToOrderRows } from "@/lib/orderImport";
import { setLastInventoryUpdate } from "@/lib/inventoryUpdate";
import { movementsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";

export default function ImportOrderPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [appliedCount, setAppliedCount] = useState(0);
  const [unmatchedCount, setUnmatchedCount] = useState(0);
  const [detailRows, setDetailRows] = useState<string[]>([]);

  const processFile = useCallback(async (file: File) => {
    setStatus("loading");
    setMessage("");
    setDetailRows([]);

    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setStatus("error");
        setMessage("El archivo no tiene hojas.");
        return;
      }
      const sheet = workbook.Sheets[firstSheetName];
      const json: { [key: string]: unknown }[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const orderRows = sheetToOrderRows(json);
      if (orderRows.length === 0) {
        setStatus("success");
        setMessage("Archivo leído. No se encontraron filas de pedido (revisa columnas 'producto/nombre' y 'cantidad').");
        return;
      }

      const bottles = loadBarBottles();
      if (bottles.length === 0) {
        setStatus("error");
        setMessage("No hay inventario. Configura las botellas en Configuración → Selecciona tu inventario.");
        return;
      }

      const result = applyOrderToInventory(bottles, orderRows);
      saveBarBottles(result.updatedBottles);

      const now = new Date();
      const dateStr = now.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastInventoryUpdate(dateStr);

      movementsService.add({
        type: "order_import",
        bottleId: "_",
        bottleName: "Importar pedido",
        newValue: result.applied.length,
        userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
        description: `${result.applied.length} líneas sumadas al inventario`,
      });

      setAppliedCount(result.applied.length);
      setUnmatchedCount(result.unmatched.length);
      setDetailRows(
        result.applied.slice(0, 15).map((a) => `${a.bottleName}: +${a.added.toFixed(a.unit === "oz" ? 1 : 0)} ${a.unit}`)
      );
      if (result.unmatched.length > 0) {
        setDetailRows((prev) => [...prev, `Sin match: ${result.unmatched.slice(0, 5).join(", ")}${result.unmatched.length > 5 ? "…" : ""}`]);
      }

      setStatus("success");
      setMessage(
        `Pedido aplicado. ${result.applied.length} líneas sumadas al inventario.${result.unmatched.length > 0 ? ` ${result.unmatched.length} productos sin coincidencia.` : ""}`
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al leer el archivo. ¿Es un Excel o CSV válido?");
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-apple-surface border border-apple-border">
            <Package className="w-8 h-8 text-apple-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-apple-text">Importar pedido</h2>
            <p className="text-sm text-apple-text2">
              Sube un Excel o CSV con el pedido para sumar todo al inventario de un solo jalón.
            </p>
          </div>
        </div>

        <div className="bg-apple-surface rounded-xl border border-apple-border p-4 space-y-4">
          <p className="text-sm text-apple-text2">
            Descarga la plantilla, complétala con los nombres de tus productos (igual que en el inventario) y la cantidad a sumar. Luego súbela aquí.
          </p>
          <a
            href="/plantilla-pedido.csv"
            download="plantilla-pedido.csv"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-apple-accent text-white rounded-xl hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Download className="w-5 h-5 flex-shrink-0" />
            Descargar plantilla (CSV)
          </a>
          <p className="text-xs text-apple-text2">
            Licores: cantidad en oz. Cerveza: cantidad en unidades. Puedes abrir el CSV en Excel, llenarlo y guardar como .xlsx si prefieres.
          </p>
          <label className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-apple-border rounded-xl hover:bg-apple-bg transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-apple-text2" />
            <span className="text-sm font-medium text-apple-text">Elegir archivo Excel o CSV</span>
            <span className="text-xs text-apple-text2">.xlsx, .xls o .csv</span>
            <input
              id="import-order-file"
              name="orderFile"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={onInputChange}
              className="hidden"
            />
          </label>
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 text-apple-text2">
            <span className="inline-block w-4 h-4 border-2 border-apple-accent border-t-transparent rounded-full animate-spin" />
            Leyendo archivo…
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Listo</span>
            </div>
            <p className="text-sm text-green-700">{message}</p>
            {detailRows.length > 0 && (
              <ul className="text-xs text-green-700 list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                {detailRows.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <h3 className="font-semibold text-apple-text text-sm mb-1">Formato del archivo</h3>
          <p className="text-xs text-apple-text">
            La plantilla tiene las columnas <strong>Producto</strong> y <strong>Cantidad</strong>. Escribe el nombre del producto exactamente como aparece en tu inventario (Barra). Para licores usa cantidad en oz; para cerveza, en unidades.
          </p>
        </div>
      </div>
    </div>
  );
}
