import { establecerCiudadDefault } from "../storage/citiesStorage.ts";
import { guardarConfig } from "../storage/configStorage.ts";
import { aviso, etiquetaCiudad, exito } from "../presentation/output.ts";
import { elegirCiudad, pausar } from "../presentation/input.ts";
import { listarCiudades } from "./listCities.ts";
import type { Configuracion } from "../types/Settings.ts";

export async function establecerDefaultInteractivo(
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
    "\n  Número de la nueva ciudad default (Enter para cancelar): ",
  );
  if (!ciudad) {
    aviso("Selección cancelada.");
    return;
  }

  establecerCiudadDefault(config, ciudad.id);
  await guardarConfig(config);
  exito(`${etiquetaCiudad(ciudad)} es ahora la ciudad default.`);
  await pausar();
}
