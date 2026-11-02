import { obtenerClima } from "../api/weather.ts";
import { agregarCiudadInteractivo } from "./addCity.ts";
import { aviso, mostrarTarjeta } from "../presentation/output.ts";
import { pausar } from "../presentation/input.ts";
import type { Ciudad } from "../types/City.ts";
import type { Configuracion, Unidad } from "../types/Settings.ts";
import { mensajeError } from "../utils/errors.ts";

export async function climaCiudadDefault(config: Configuracion): Promise<void> {
  const ciudad = config.ciudades.find(
    (guardada) => guardada.id === config.ciudadDefaultId,
  );

  if (!ciudad) {
    aviso("No hay una ciudad default configurada.");
    await agregarCiudadInteractivo(config);
    return;
  }

  await mostrarClima(ciudad, config.unidad);
}

export async function climaTodasLasCiudades(
  config: Configuracion,
): Promise<void> {
  if (config.ciudades.length === 0) {
    aviso("No tienes ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  const resultados = await Promise.allSettled(
    config.ciudades.map((ciudad) => obtenerClima(ciudad, config.unidad)),
  );

  resultados.forEach((resultado, indice) => {
    const ciudad = config.ciudades[indice];
    if (!ciudad) {
      return;
    }

    if (resultado.status === "fulfilled") {
      mostrarTarjeta(ciudad, resultado.value);
    } else {
      aviso(
        `No se pudo obtener el clima de ${ciudad.nombre}: ${mensajeError(resultado.reason)}`,
      );
    }
  });

  await pausar();
}

async function mostrarClima(ciudad: Ciudad, unidad: Unidad): Promise<void> {
  try {
    const clima = await obtenerClima(ciudad, unidad);
    mostrarTarjeta(ciudad, clima);
  } catch (error) {
    aviso(
      `No se pudo obtener el clima de ${ciudad.nombre}: ${mensajeError(error)}`,
    );
  }

  await pausar();
}
