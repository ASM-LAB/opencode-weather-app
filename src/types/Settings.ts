import type { Ciudad } from "./City.ts";

export type TemperatureUnit = "celsius" | "fahrenheit";
export type Unidad = TemperatureUnit;

export interface Configuracion {
  unidad: Unidad;
  ciudadDefaultId: number | null;
  ciudades: Ciudad[];
}
