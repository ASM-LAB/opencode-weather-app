import { imprimirCiudades } from "../presentation/output.ts";
import type { Configuracion } from "../types/Settings.ts";

export function listarCiudades(config: Configuracion): void {
  imprimirCiudades(config.ciudades, config.ciudadDefaultId);
}
