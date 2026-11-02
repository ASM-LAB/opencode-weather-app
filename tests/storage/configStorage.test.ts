import { afterEach, describe, expect, test } from "bun:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cargarConfig, guardarConfig, rutaConfig } from "../../src/storage/configStorage.ts";
import type { Configuracion } from "../../src/types/Settings.ts";
import { crearDirectorioTemporal, eliminarDirectorioTemporal } from "../helpers/temporaryDirectory.ts";

let directorio: string | undefined;

afterEach(async () => {
  await eliminarDirectorioTemporal(directorio);
  directorio = undefined;
});

async function crearRutaConfig(): Promise<string> {
  directorio = await crearDirectorioTemporal();
  return join(directorio, "config.json");
}

describe("persistencia de configuración", () => {
  test("devuelve los valores predeterminados si no existe el archivo", async () => {
    const ruta = await crearRutaConfig();

    expect(await cargarConfig(ruta)).toEqual({
      unidad: "celsius",
      ciudadDefaultId: null,
      ciudades: [],
    });
  });

  test("guarda y carga una configuración", async () => {
    const ruta = await crearRutaConfig();
    const config: Configuracion = {
      unidad: "fahrenheit",
      ciudadDefaultId: 7,
      ciudades: [{ id: 7, nombre: "Lisboa", latitud: 38.7, longitud: -9.1 }],
    };

    await guardarConfig(config, ruta);

    expect(await cargarConfig(ruta)).toEqual(config);
  });

  test("normaliza unidad y ciudad predeterminada inválidas", async () => {
    const ruta = await crearRutaConfig();
    await writeFile(ruta, JSON.stringify({
      unidad: "kelvin",
      ciudadDefaultId: 44,
      ciudades: [
        { id: 7, nombre: "Lisboa", latitud: 38.7, longitud: -9.1 },
        { id: "inválido", nombre: "No válida", latitud: 0, longitud: 0 },
      ],
    }));

    expect(await cargarConfig(ruta)).toEqual({
      unidad: "celsius",
      ciudadDefaultId: 7,
      ciudades: [{ id: 7, nombre: "Lisboa", latitud: 38.7, longitud: -9.1 }],
    });
  });

  test("usa una configuración vacía y crea respaldo ante JSON corrupto", async () => {
    const ruta = await crearRutaConfig();
    await writeFile(ruta, "{ configuración inválida");

    expect(await cargarConfig(ruta)).toEqual({
      unidad: "celsius",
      ciudadDefaultId: null,
      ciudades: [],
    });
    expect(await Bun.file(`${ruta}.bak`).text()).toBe("{ configuración inválida");
  });

  test("permite consultar explícitamente la ruta de configuración", async () => {
    const ruta = await crearRutaConfig();

    expect(rutaConfig(ruta)).toBe(ruta);
  });
});
