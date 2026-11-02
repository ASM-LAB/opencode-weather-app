// Persistencia de la configuración en el directorio home del usuario.

import { homedir } from "node:os";
import { join } from "node:path";
import type { Ciudad, Configuracion, Unidad } from "./tipos.ts";

const RUTA_CONFIG = join(homedir(), ".weather-cli.json");

const CONFIG_POR_DEFECTO: Configuracion = {
  unidad: "celsius",
  ciudadDefaultId: null,
  ciudades: [],
};

export function rutaConfig(): string {
  return RUTA_CONFIG;
}

export async function cargarConfig(): Promise<Configuracion> {
  const archivo = Bun.file(RUTA_CONFIG);
  if (!(await archivo.exists())) {
    return { ...CONFIG_POR_DEFECTO, ciudades: [] };
  }

  try {
    const datos = (await archivo.json()) as Partial<Configuracion>;
    return normalizarConfig(datos);
  } catch {
    // Si el archivo está corrupto, lo respaldamos y empezamos de cero.
    await respaldarConfig();
    return { ...CONFIG_POR_DEFECTO, ciudades: [] };
  }
}

export async function guardarConfig(config: Configuracion): Promise<void> {
  await Bun.write(RUTA_CONFIG, JSON.stringify(config, null, 2));
}

export function agregarCiudad(config: Configuracion, ciudad: Ciudad): boolean {
  if (config.ciudades.some((guardada) => guardada.id === ciudad.id)) {
    return false;
  }

  config.ciudades.push(ciudad);
  if (config.ciudadDefaultId === null) {
    config.ciudadDefaultId = ciudad.id;
  }
  return true;
}

export function eliminarCiudad(config: Configuracion, id: number): boolean {
  const indice = config.ciudades.findIndex((ciudad) => ciudad.id === id);
  if (indice === -1) {
    return false;
  }

  config.ciudades.splice(indice, 1);
  if (config.ciudadDefaultId === id) {
    config.ciudadDefaultId = config.ciudades[0]?.id ?? null;
  }
  return true;
}

export function establecerCiudadDefault(config: Configuracion, id: number): boolean {
  if (!config.ciudades.some((ciudad) => ciudad.id === id)) {
    return false;
  }

  config.ciudadDefaultId = id;
  return true;
}

export function cambiarUnidad(config: Configuracion): Unidad {
  config.unidad = config.unidad === "celsius" ? "fahrenheit" : "celsius";
  return config.unidad;
}

function normalizarConfig(datos: Partial<Configuracion>): Configuracion {
  const ciudades = Array.isArray(datos.ciudades)
    ? datos.ciudades.filter(esCiudad)
    : [];
  const unidad: Unidad = datos.unidad === "fahrenheit" ? "fahrenheit" : "celsius";
  const idGuardado = datos.ciudadDefaultId;
  const defaultValido =
    typeof idGuardado === "number" &&
    ciudades.some((ciudad) => ciudad.id === idGuardado);

  return {
    unidad,
    ciudadDefaultId: defaultValido ? idGuardado : (ciudades[0]?.id ?? null),
    ciudades,
  };
}

function esCiudad(valor: unknown): valor is Ciudad {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const ciudad = valor as Record<string, unknown>;
  return (
    typeof ciudad.id === "number" &&
    typeof ciudad.nombre === "string" &&
    typeof ciudad.latitud === "number" &&
    typeof ciudad.longitud === "number" &&
    (ciudad.admin1 === undefined || typeof ciudad.admin1 === "string") &&
    (ciudad.pais === undefined || typeof ciudad.pais === "string") &&
    (ciudad.zonaHoraria === undefined || typeof ciudad.zonaHoraria === "string")
  );
}

async function respaldarConfig(): Promise<void> {
  try {
    const contenido = await Bun.file(RUTA_CONFIG).text();
    await Bun.write(`${RUTA_CONFIG}.bak`, contenido);
  } catch {
    // Si no se puede respaldar, continuamos con la configuración por defecto.
  }
}
