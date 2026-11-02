import type { Configuracion, Unidad } from "../types/Settings.ts";

export function cambiarUnidad(config: Configuracion): Unidad {
  config.unidad = config.unidad === "celsius" ? "fahrenheit" : "celsius";
  return config.unidad;
}
