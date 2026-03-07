import { useState, useCallback } from "react";
import type { UnitSystem } from "@/lib/units/types";

export function useUnitConverter(initialSystem: UnitSystem = "metric") {
  const [system, setSystem] = useState<UnitSystem>(initialSystem);

  const toggle = useCallback(() => {
    setSystem((s) => (s === "metric" ? "imperial" : "metric"));
  }, []);

  return { system, setSystem, toggle };
}
