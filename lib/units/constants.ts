import type { UnitSystem } from "./types";

export const METRIC_UNITS = ["ml", "dl", "l", "tsk", "msk", "g", "kg"] as const;

export const IMPERIAL_UNITS = ["tsp", "tbsp", "cup", "fl oz", "oz", "lb"] as const;

export type MetricUnit = (typeof METRIC_UNITS)[number];
export type ImperialUnit = (typeof IMPERIAL_UNITS)[number];

/** Map our form units to convert-units package unit names */
export const TO_CONVERT_UNITS: Record<string, string> = {
  ml: "ml",
  dl: "dl",
  l: "l",
  tsk: "tsk",
  msk: "msk",
  g: "g",
  kg: "kg",
  tsp: "tsp",
  tbsp: "Tbs",
  cup: "cup",
  "fl oz": "fl-oz",
  oz: "oz",
  lb: "lb",
};

/** Convert-units unit -> our display label */
export const UNIT_LABELS: Record<string, string> = {
  ml: "ml",
  dl: "dl",
  l: "l",
  tsk: "tsk",
  msk: "msk",
  g: "g",
  kg: "kg",
  tsp: "tsp",
  Tbs: "tbsp",
  cup: "cup",
  "fl-oz": "fl oz",
  oz: "oz",
  lb: "lb",
};

/** Metric unit -> default imperial unit for conversion (volume or mass) */
const METRIC_TO_IMPERIAL: Record<string, string> = {
  tsk: "tsp",
  msk: "Tbs",
  ml: "fl-oz",
  dl: "cup",
  l: "cup",
  g: "oz",
  kg: "lb",
};

/** Imperial unit -> default metric unit for conversion */
const IMPERIAL_TO_METRIC: Record<string, string> = {
  tsp: "tsk",
  Tbs: "msk",
  tbsp: "msk",
  "fl-oz": "ml",
  cup: "dl",
  oz: "g",
  lb: "kg",
};

export function getUnitsForSystem(system: UnitSystem): readonly string[] {
  return system === "metric" ? METRIC_UNITS : [...IMPERIAL_UNITS];
}

export function getTargetUnitForSystem(fromUnit: string, toSystem: UnitSystem): string | null {
  const cu = TO_CONVERT_UNITS[fromUnit] ?? fromUnit;
  const isImperial =
    IMPERIAL_UNITS.includes(fromUnit as ImperialUnit) || ["tsp", "Tbs", "cup", "fl-oz", "oz", "lb"].includes(cu);
  const isMetric =
    METRIC_UNITS.includes(fromUnit as MetricUnit) || ["ml", "dl", "l", "tsk", "msk", "g", "kg"].includes(cu);
  if (toSystem === "imperial") {
    if (isImperial) return cu;
    return METRIC_TO_IMPERIAL[fromUnit] ?? METRIC_TO_IMPERIAL[cu] ?? null;
  } else {
    if (isMetric) return cu;
    return IMPERIAL_TO_METRIC[cu] ?? IMPERIAL_TO_METRIC[fromUnit] ?? null;
  }
}
