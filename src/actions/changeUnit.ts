import { cambiarUnidad } from "../storage/settingsStorage.ts";
import { guardarConfig } from "../storage/configStorage.ts";
import { exito } from "../presentation/output.ts";
import { pausar } from "../presentation/input.ts";
import type { Configuracion, Unidad } from "../types/Settings.ts";

export async function cambiarUnidadInteractivo(
  config: Configuracion,
): Promise<void> {
  const anterior = config.unidad;
  const nueva = cambiarUnidad(config);
  await guardarConfig(config);

  exito(
    `Unidad cambiada de ${simboloUnidad(anterior)} a ${simboloUnidad(nueva)} (${nombreUnidad(nueva)}).`,
  );
  await pausar();
}

function simboloUnidad(unidad: Unidad): string {
  return unidad === "celsius" ? "°C" : "°F";
}

function nombreUnidad(unidad: Unidad): string {
  return unidad === "celsius" ? "Celsius" : "Fahrenheit";
}
