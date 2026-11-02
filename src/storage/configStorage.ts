import { homedir } from "node:os";
import { join } from "node:path";
import type { Ciudad } from "../types/City.ts";
import type { Configuracion, Unidad } from "../types/Settings.ts";

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
