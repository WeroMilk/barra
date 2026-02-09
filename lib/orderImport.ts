/**
 * Lectura del Excel/CSV de pedido y suma al inventario (añadir stock).
 */

import { Bottle } from "./types";
import { isMeasuredInUnits } from "./measurementRules";

const ML_TO_OZ = 0.033814;

export interface OrderRow {
  productName: string;
  quantityToAdd: number;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Encuentra la botella que coincide con el producto.
 * Acepta "Nombre 750 ml" (de la plantilla Excel) y hace match por nombre + size.
 */
function findMatchingBottle(productName: string, bottles: Bottle[]): Bottle | null {
  const norm = normalizeName(productName);
  if (!norm) return null;
  const mlSuffix = /^(.+?)\s+(\d+)\s*ml$/i.exec(norm);
  if (mlSuffix) {
    const namePart = mlSuffix[1].trim();
    const sizeMl = parseInt(mlSuffix[2], 10);
    const byNameAndSize = bottles.find(
      (b) => normalizeName(b.name) === namePart && b.size === sizeMl
    );
    if (byNameAndSize) return byNameAndSize;
  }
  const exact = bottles.find((b) => normalizeName(b.name) === norm);
  if (exact) return exact;
  for (const b of bottles) {
    if (norm.includes(normalizeName(b.name)) || normalizeName(b.name).includes(norm)) return b;
  }
  return null;
}

export interface ApplyOrderResult {
  updatedBottles: Bottle[];
  applied: { bottleName: string; added: number; unit: "oz" | "units" }[];
  unmatched: string[];
}

/**
 * Aplica el pedido al inventario: suma cantidad por cada fila.
 * Licores: quantityToAdd = oz a sumar.
 * Cerveza: quantityToAdd = unidades a sumar.
 */
export function applyOrderToInventory(bottles: Bottle[], rows: OrderRow[]): ApplyOrderResult {
  const updated = bottles.map((b) => ({ ...b }));
  const applied: ApplyOrderResult["applied"] = [];
  const unmatched: string[] = [];

  for (const row of rows) {
    const bottle = findMatchingBottle(row.productName, updated);
    if (!bottle) {
      unmatched.push(row.productName);
      continue;
    }
    const index = updated.findIndex((b) => b.id === bottle.id);
    if (index === -1) continue;

    const b = updated[index];
    const useUnits = isMeasuredInUnits(b.category);
    const toAdd = Math.max(0, row.quantityToAdd);

    if (useUnits) {
      const capacity = b.sizeUnits ?? 100;
      const current = b.currentUnits ?? 0;
      const newUnits = Math.min(capacity, current + Math.round(toAdd));
      updated[index] = {
        ...b,
        currentUnits: newUnits,
        currentOz: capacity > 0 ? (newUnits / capacity) * b.size : 0,
      };
      applied.push({ bottleName: b.name, added: newUnits - current, unit: "units" });
    } else {
      const currentOzMl = b.currentOz;
      const addMl = toAdd / ML_TO_OZ; // toAdd en oz -> ml
      const newCurrentOzMl = currentOzMl + addMl;
      const sizeMl = b.size;
      const capped = Math.min(sizeMl, Math.max(0, newCurrentOzMl));
      updated[index] = { ...b, currentOz: capped };
      applied.push({ bottleName: b.name, added: toAdd, unit: "oz" });
    }
  }

  return { updatedBottles: updated, applied, unmatched };
}

/**
 * Convierte la primera hoja del Excel en filas de pedido (producto, cantidad a sumar).
 */
export function sheetToOrderRows(firstSheet: { [key: string]: unknown }[]): OrderRow[] {
  if (!firstSheet || firstSheet.length === 0) return [];
  const rows: OrderRow[] = [];
  const headers = Object.keys(firstSheet[0] || {}).map((h) => String(h).toLowerCase());

  const nameKey = headers.find((h) => /producto|nombre|item|articulo|descripcion|name|product|pedido/.test(h)) ?? headers[0];
  const qtyKey =
    headers.find((h) => /cantidad|sumar|agregar|entrada|qty|quantity|unidades|añadir|anadir/.test(h)) ?? headers[Math.min(1, headers.length - 1)];

  for (const row of firstSheet) {
    const rawName = row[nameKey] ?? row[Object.keys(row)[0]];
    const rawQty = row[qtyKey] ?? row[Object.keys(row)[1]];
    const name = typeof rawName === "string" ? rawName.trim() : String(rawName ?? "").trim();
    const qty = typeof rawQty === "number" ? rawQty : parseFloat(String(rawQty ?? "0").replace(",", "."));
    if (name && !Number.isNaN(qty) && qty >= 0) {
      rows.push({ productName: name, quantityToAdd: qty });
    }
  }
  return rows;
}
