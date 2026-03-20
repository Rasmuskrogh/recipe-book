import convert from "convert-units";
import type { UnitSystem } from "./types";
import { TO_CONVERT_UNITS, UNIT_LABELS, getTargetUnitForSystem } from "./constants";

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// convert-units känner inte till våra svenska volymenheter, så vi normaliserar
// dem till ml innan vi anropar convert-units.
const SVOLUME_TO_ML: Record<string, number> = {
  tsk: 5,
  msk: 15,
  dl: 100,
  krm: 1,
};

function pickImperialUnitForMl(mlAmount: number): string {
  // Mål: små -> tsp, större -> tbsp, ännu större -> cup.
  // Vi använder även fl oz som "mellan-stor" enhet.
  if (mlAmount < 15) return "tsp";
  if (mlAmount < 45) return "Tbs";
  if (mlAmount < 240) return "fl-oz";
  return "cup";
}

export function convertIngredient(ingredient: Ingredient, toSystem: UnitSystem): Ingredient {
  const fromUnit = ingredient.unit.trim();

  // Svenska volymenheter -> ml -> (imperial-enhet baserat på mängd) -> avrunda.
  const svMl = SVOLUME_TO_ML[fromUnit];
  if (svMl != null) {
    // Om man redan är i metric: behåll originalenheten (ingen konvertering behövs).
    if (toSystem === "metric") return ingredient;
    const mlAmount = ingredient.amount * svMl;
    const targetUnit = pickImperialUnitForMl(mlAmount);

    const value = convert(mlAmount)
      .from("ml")
      .to(targetUnit as convert.Unit);

    const rounded = Math.round(value * 10) / 10;
    const displayUnit = UNIT_LABELS[targetUnit] ?? targetUnit;
    return { name: ingredient.name, amount: rounded, unit: displayUnit };
  }

  const cuFrom = TO_CONVERT_UNITS[fromUnit] ?? fromUnit;
  const targetUnit = getTargetUnitForSystem(fromUnit, toSystem);
  if (!targetUnit) return ingredient;
  try {
    const value = convert(ingredient.amount)
      .from(cuFrom as convert.Unit)
      .to(targetUnit as convert.Unit);
    const rounded = Math.round(value * 10) / 10;
    const displayUnit = UNIT_LABELS[targetUnit] ?? targetUnit;
    return {
      name: ingredient.name,
      amount: rounded,
      unit: displayUnit,
    };
  } catch {
    return ingredient;
  }
}

export function getUnitLabel(unit: string): string {
  const cu = TO_CONVERT_UNITS[unit] ?? unit;
  return UNIT_LABELS[cu] ?? unit;
}

export { getUnitsForSystem } from "./constants";
export type { MetricUnit, ImperialUnit } from "./constants";
