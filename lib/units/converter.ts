import convert from "convert-units";
import type { UnitSystem } from "./types";
import { TO_CONVERT_UNITS, UNIT_LABELS, getTargetUnitForSystem } from "./constants";

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export function convertIngredient(ingredient: Ingredient, toSystem: UnitSystem): Ingredient {
  const fromUnit = ingredient.unit.trim();
  const cuFrom = TO_CONVERT_UNITS[fromUnit] ?? fromUnit;
  const targetUnit = getTargetUnitForSystem(fromUnit, toSystem);
  if (!targetUnit) return ingredient;
  try {
    const value = convert(ingredient.amount).from(cuFrom).to(targetUnit);
    const rounded = Math.round(value * 100) / 100;
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
