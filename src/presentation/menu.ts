import { cyan } from "../utils/colors.ts";
import { SEPARADOR } from "../utils/constants.ts";
import type { Unidad } from "../types/Settings.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import { preguntar } from "./input.ts";

export function imprimirMenu(cantidadCiudades: number, unidad: Unidad): void {
  const simboloUnidad = unidad === "celsius" ? "°C" : "°F";
  const lineas = [
    SEPARADOR,
    "         WEATHER CLI",
    SEPARADOR,
    "  1. Clima de ciudad default",
    `  2. Clima de todas las ciudades (${cantidadCiudades})`,
    "  3. Buscar y agregar ciudad",
    "  4. Eliminar ciudad",
    "  5. Establecer ciudad default",
    `  8. Ajustes (${simboloUnidad})`,
    "  9. Salir",
    SEPARADOR,
  ];

  console.log(cyan(lineas.join("\n")));
}

export async function seleccionarOpcion(): Promise<string> {
  return preguntar(cyan("  Selecciona una opción: "));
}

export function esOpcionMenu(opcion: string): opcion is MenuOption {
  return ["1", "2", "3", "4", "5", "8", "9"].includes(opcion);
}
