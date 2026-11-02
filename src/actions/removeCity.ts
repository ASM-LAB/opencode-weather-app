import { eliminarCiudad } from "../storage/citiesStorage.ts";
import { guardarConfig } from "../storage/configStorage.ts";
import { aviso, etiquetaCiudad, exito } from "../presentation/output.ts";
import { elegirCiudad, pausar, preguntar } from "../presentation/input.ts";
import { listarCiudades } from "./listCities.ts";
import type { Configuracion } from "../types/Settings.ts";

export async function eliminarCiudadInteractivo(
  config: Configuracion,
): Promise<void> {
  if (config.ciudades.length === 0) {
    aviso("No tienes ciudades guardadas.");
    return;
  }

  console.log("");
  listarCiudades(config);

  const ciudad = await elegirCiudad(
    config.ciudades,
    "\n  Número de la ciudad a eliminar (Enter para cancelar): ",
  );
  if (!ciudad) {
    aviso("Eliminación cancelada.");
    return;
  }

  const confirmacion = await preguntar(
    `  ¿Eliminar ${etiquetaCiudad(ciudad)}? (s/n): `,
  );
  if (confirmacion.toLowerCase() !== "s") {
    aviso("Eliminación cancelada.");
    return;
  }

  eliminarCiudad(config, ciudad.id);
  await guardarConfig(config);
  exito(`${ciudad.nombre} se eliminó de tus ciudades.`);
  await pausar();
}
