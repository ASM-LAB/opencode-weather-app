// Punto de entrada de WEATHER CLI.

import {
  agregarCiudad,
  cambiarUnidad,
  cargarConfig,
  eliminarCiudad,
  establecerCiudadDefault,
  guardarConfig,
} from "./src/config.ts";
import { buscarCiudades, obtenerClima } from "./src/api.ts";
import {
  aviso,
  cerrarUi,
  etiquetaCiudad,
  exito,
  imprimirCiudades,
  imprimirMenu,
  mostrarTarjeta,
  pausar,
  preguntar,
} from "./src/ui.ts";
import type { Ciudad, Configuracion, Unidad } from "./src/tipos.ts";

async function main(): Promise<void> {
  try {
    const config = await cargarConfig();
    await cicloMenu(config);
  } finally {
    cerrarUi();
  }
}

async function cicloMenu(config: Configuracion): Promise<void> {
  while (true) {
    imprimirMenu(config.ciudades.length, config.unidad);
    const opcion = await preguntar("  Selecciona una opción: ");

    switch (opcion) {
      case "1":
        await climaCiudadDefault(config);
        break;
      case "2":
        await climaTodasLasCiudades(config);
        break;
      case "3":
        await agregarCiudadInteractivo(config);
        break;
      case "4":
        await eliminarCiudadInteractivo(config);
        break;
      case "5":
        await establecerDefaultInteractivo(config);
        break;
      case "8":
        await ajustes(config);
        break;
      case "9":
        console.log("\n  ¡Hasta luego!");
        return;
      default:
        aviso("Opción no válida. Elige una opción del menú.");
    }
  }
}

async function climaCiudadDefault(config: Configuracion): Promise<void> {
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

async function climaTodasLasCiudades(config: Configuracion): Promise<void> {
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

async function agregarCiudadInteractivo(config: Configuracion): Promise<void> {
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

async function eliminarCiudadInteractivo(
  config: Configuracion,
): Promise<void> {
  if (config.ciudades.length === 0) {
    aviso("No tienes ciudades guardadas.");
    return;
  }

  console.log("");
  imprimirCiudades(config.ciudades, config.ciudadDefaultId);

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

async function establecerDefaultInteractivo(
  config: Configuracion,
): Promise<void> {
  if (config.ciudades.length === 0) {
    aviso("No tienes ciudades guardadas.");
    return;
  }

  console.log("");
  imprimirCiudades(config.ciudades, config.ciudadDefaultId);

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

async function ajustes(config: Configuracion): Promise<void> {
  const anterior = config.unidad;
  const nueva = cambiarUnidad(config);
  await guardarConfig(config);

  exito(
    `Unidad cambiada de ${simboloUnidad(anterior)} a ${simboloUnidad(nueva)} (${nombreUnidad(nueva)}).`,
  );
  await pausar();
}

async function mostrarClima(
  ciudad: Ciudad,
  unidad: Unidad,
): Promise<void> {
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

async function elegirCiudad(
  ciudades: Ciudad[],
  mensaje: string,
): Promise<Ciudad | null> {
  const entrada = await preguntar(mensaje);
  if (!entrada) {
    return null;
  }

  const numero = Number(entrada);
  if (!Number.isInteger(numero) || numero < 1 || numero > ciudades.length) {
    return null;
  }

  return ciudades[numero - 1] ?? null;
}

function simboloUnidad(unidad: Unidad): string {
  return unidad === "celsius" ? "°C" : "°F";
}

function nombreUnidad(unidad: Unidad): string {
  return unidad === "celsius" ? "Celsius" : "Fahrenheit";
}

function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "error desconocido";
}

main().catch((error: unknown) => {
  console.error(`\n  Error inesperado: ${mensajeError(error)}`);
  process.exitCode = 1;
});
