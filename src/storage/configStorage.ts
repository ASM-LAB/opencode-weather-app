import { homedir } from "node:os";
import { join } from "node:path";
import type { Ciudad } from "../types/City.ts";
import type { Configuracion, Unidad } from "../types/Settings.ts";

const RUTA_CONFIG =
  process.env.WEATHER_CONFIG_PATH ?? join(homedir(), ".weather-cli.json");

const CONFIG_POR_DEFECTO: Configuracion = {
  unidad: "celsius",
  ciudadDefaultId: null,
  ciudades: [],
};

export function rutaConfig(ruta = RUTA_CONFIG): string {
  return ruta;
}

export async function cargarConfig(ruta = RUTA_CONFIG): Promise<Configuracion> {
  const archivo = Bun.file(ruta);
  if (!(await archivo.exists())) {
    return { ...CONFIG_POR_DEFECTO, ciudades: [] };
  }

  try {
    const datos = (await archivo.json()) as Partial<Configuracion>;
    return normalizarConfig(datos);
  } catch {
    // Si el archivo está corrupto, lo respaldamos y empezamos de cero.
    await respaldarConfig(ruta);
    return { ...CONFIG_POR_DEFECTO, ciudades: [] };
  }
}

export async function guardarConfig(
  config: Configuracion,
  ruta = RUTA_CONFIG,
): Promise<void> {
  await Bun.write(ruta, JSON.stringify(config, null, 2));
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

async function respaldarConfig(ruta: string): Promise<void> {
  try {
    const contenido = await Bun.file(ruta).text();
    await Bun.write(`${ruta}.bak`, contenido);
  } catch {
    // Si no se puede respaldar, continuamos con la configuración por defecto.
  }
}
