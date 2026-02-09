/**
 * Genera una plantilla Excel (.xlsx) con:
 * - Columna A "Producto": lista desplegable con las bebidas del inventario.
 * - Columna B "Cantidad": solo números enteros (sin decimales).
 */

import type { Bottle } from "./types";

const MAX_DATA_ROWS = 500;
const LIST_SHEET_NAME = "ListaProductos";
const MAIN_SHEET_NAME = "Datos";

export async function buildSalesOrderExcelTemplate(bottles: Bottle[]): Promise<Blob> {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "MiBarra";

  // Hoja principal primero: Producto y Cantidad
  const sheet = wb.addWorksheet(MAIN_SHEET_NAME);
  sheet.getColumn(1).width = 32;
  sheet.getColumn(2).width = 12;

  // Hoja oculta con los nombres de las botellas (origen del desplegable)
  const listSheet = wb.addWorksheet(LIST_SHEET_NAME, { state: "hidden" });
  listSheet.getColumn(1).width = 35;
  bottles.forEach((b, i) => {
    listSheet.getCell(i + 1, 1).value = b.name;
  });
  const lastListRow = Math.max(1, bottles.length);
  const listRange = `'${LIST_SHEET_NAME}'!$A$1:$A$${lastListRow}`;

  sheet.getCell(1, 1).value = "Producto";
  sheet.getCell(1, 2).value = "Cantidad";
  sheet.getRow(1).font = { bold: true };

  // Filas de datos con validación (ejemplo vacío + espacio para muchas filas)
  for (let row = 2; row <= MAX_DATA_ROWS + 1; row++) {
    // Columna A: lista desplegable con bebidas del inventario
    const cellA = sheet.getCell(row, 1);
    cellA.dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [listRange],
      showInputMessage: true,
      promptTitle: "Producto",
      prompt: "Elige una bebida de tu inventario.",
      showErrorMessage: true,
      errorTitle: "Producto no válido",
      error: "Selecciona un producto de la lista.",
    };

    // Columna B: solo números enteros (>= 0)
    const cellB = sheet.getCell(row, 2);
    cellB.dataValidation = {
      type: "whole",
      allowBlank: true,
      operator: "greaterThanOrEqual",
      formulae: [0],
      showInputMessage: true,
      promptTitle: "Cantidad",
      prompt: "Solo números enteros (ej: 1, 2, 24). Sin decimales.",
      showErrorMessage: true,
      errorTitle: "Solo enteros",
      error: "Escribe un número entero (sin decimales).",
    };
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Descarga la plantilla generada con el inventario actual.
 * Debe llamarse desde el cliente (usa bottles del inventario en localStorage).
 */
export function downloadSalesOrderTemplate(blob: Blob, filename: string = "plantilla-ventas-pedido.xlsx") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
