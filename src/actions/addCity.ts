import { buscarCiudades } from "../api/geocoding.ts";
import { agregarCiudad } from "../storage/citiesStorage.ts";
import { guardarConfig } from "../storage/configStorage.ts";
import { aviso, etiquetaCiudad, exito } from "../presentation/output.ts";
import { elegirCiudad, pausar, preguntar } from "../presentation/input.ts";
import type { Configuracion } from "../types/Settings.ts";
import { mensajeError } from "../utils/errors.ts";

export async function agregarCiudadInteractivo(
  config: Configuracion,
): Promise<void> {
  const nombre = await preguntar(
    "  Nombre de la ciudad (Enter para cancelar): ",
  );
  if (!nombre) {
    aviso("Búsqueda cancelada.");
    return;
  }

  try {
    console.log("\n  Buscando ciudades...");
    const resultados = await buscarCiudades(nombre);

    if (resultados.length === 0) {
      aviso("No se encontraron ciudades con ese nombre.");
      return;
    }

    console.log("");
    resultados.forEach((ciudad, indice) => {
      console.log(`  ${indice + 1}. ${etiquetaCiudad(ciudad)}`);
    });

    const ciudad = await elegirCiudad(
      resultados,
      "\n  Elige un número (Enter para cancelar): ",
    );
    if (!ciudad) {
      aviso("Selección cancelada.");
      return;
    }

    if (!agregarCiudad(config, ciudad)) {
      aviso(`${etiquetaCiudad(ciudad)} ya está en tu lista.`);
      return;
    }

    await guardarConfig(config);
    exito(`${etiquetaCiudad(ciudad)} se agregó a tus ciudades.`);
  } catch (error) {
    aviso(`No se pudo buscar la ciudad: ${mensajeError(error)}`);
  }

  await pausar();
}
