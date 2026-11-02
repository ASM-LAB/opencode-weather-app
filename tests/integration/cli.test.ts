import { afterEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { Configuracion } from "../../src/types/Settings.ts";
import { crearDirectorioTemporal, eliminarDirectorioTemporal } from "../helpers/temporaryDirectory.ts";

let directorio: string | undefined;

afterEach(async () => {
  await eliminarDirectorioTemporal(directorio);
  directorio = undefined;
});

async function ejecutarCli(
  respuestas: Array<{ prompt: string; respuesta: string }>,
  config?: Configuracion,
): Promise<{ salida: string; codigo: number }> {
  directorio = await crearDirectorioTemporal();
  const rutaConfig = join(directorio, "config.json");
  if (config) {
    await Bun.write(rutaConfig, JSON.stringify(config));
  }

  const proceso = Bun.spawn({
    cmd: [process.execPath, "run", "src/index.ts"],
    cwd: process.cwd(),
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    timeout: 15_000,
    env: {
      ...process.env,
      WEATHER_CONFIG_PATH: rutaConfig,
      NO_COLOR: "1",
    },
  });

  let salida = "";
  let indiceRespuesta = 0;
  let posicionPrompt = 0;
  const decodificador = new TextDecoder();
  const decodificadorError = new TextDecoder();
  const leerStdout = async (): Promise<void> => {
    const lector = proceso.stdout.getReader();
    while (true) {
      const { done, value } = await lector.read();
      if (done) {
        break;
      }
      salida += decodificador.decode(value, { stream: true });
      while (indiceRespuesta < respuestas.length) {
        const respuesta = respuestas[indiceRespuesta]!;
        const posicion = salida.indexOf(respuesta.prompt, posicionPrompt);
        if (posicion === -1) {
          break;
        }
        posicionPrompt = posicion + respuesta.prompt.length;
        await proceso.stdin.write(`${respuesta.respuesta}\n`);
        await proceso.stdin.flush();
        indiceRespuesta += 1;
      }
    }
    salida += decodificador.decode();
  };
  const leerStderr = async (): Promise<void> => {
    const lector = proceso.stderr.getReader();
    while (true) {
      const { done, value } = await lector.read();
      if (done) {
        break;
      }
      salida += decodificadorError.decode(value);
    }
  };

  await Promise.all([leerStdout(), leerStderr()]);
  return { salida, codigo: await proceso.exited };
}

describe("integración del CLI", () => {
  test("muestra el menú y termina con la opción de salida", async () => {
    const resultado = await ejecutarCli([
      { prompt: "Selecciona una opción:", respuesta: "9" },
    ]);

    expect(resultado.codigo).toBe(0);
    expect(resultado.salida).toContain("WEATHER CLI");
    expect(resultado.salida).toContain("9. Salir");
    expect(resultado.salida).toContain("¡Hasta luego!");
  });

  test("rechaza una opción no válida y vuelve a mostrar el menú", async () => {
    const resultado = await ejecutarCli([
      { prompt: "Selecciona una opción:", respuesta: "0" },
      { prompt: "Selecciona una opción:", respuesta: "9" },
    ]);

    expect(resultado.codigo).toBe(0);
    expect(resultado.salida).toContain("Opción no válida");
    expect(resultado.salida.match(/WEATHER CLI/g)).toHaveLength(2);
  });

  test("guarda el cambio de unidad en la ruta aislada", async () => {
    const config: Configuracion = {
      unidad: "celsius",
      ciudadDefaultId: null,
      ciudades: [],
    };
    const resultado = await ejecutarCli([
      { prompt: "Selecciona una opción:", respuesta: "8" },
      { prompt: "Presiona Enter para continuar...", respuesta: "" },
      { prompt: "Selecciona una opción:", respuesta: "9" },
    ], config);
    const rutaConfig = join(directorio!, "config.json");
    const guardada = await Bun.file(rutaConfig).json();

    expect(resultado.codigo).toBe(0);
    expect(resultado.salida).toContain("Unidad cambiada de °C a °F");
    expect(guardada).toMatchObject({ unidad: "fahrenheit" });
  });

  test("confirma la eliminación y corrige la ciudad predeterminada", async () => {
    const config: Configuracion = {
      unidad: "celsius",
      ciudadDefaultId: 1,
      ciudades: [
        { id: 1, nombre: "Madrid", latitud: 40.4, longitud: -3.7 },
        { id: 2, nombre: "Roma", latitud: 41.9, longitud: 12.5 },
      ],
    };
    const resultado = await ejecutarCli([
      { prompt: "Selecciona una opción:", respuesta: "4" },
      { prompt: "Número de la ciudad a eliminar", respuesta: "1" },
      { prompt: "(s/n):", respuesta: "s" },
      { prompt: "Presiona Enter para continuar...", respuesta: "" },
      { prompt: "Selecciona una opción:", respuesta: "9" },
    ], config);
    const rutaConfig = join(directorio!, "config.json");
    const guardada = await Bun.file(rutaConfig).json();

    expect(resultado.codigo).toBe(0);
    expect(resultado.salida).toContain("Madrid se eliminó");
    expect(guardada).toMatchObject({
      ciudadDefaultId: 2,
      ciudades: [{ id: 2, nombre: "Roma" }],
    });
  });

  test("permite establecer otra ciudad como predeterminada", async () => {
    const config: Configuracion = {
      unidad: "celsius",
      ciudadDefaultId: 1,
      ciudades: [
        { id: 1, nombre: "Madrid", latitud: 40.4, longitud: -3.7 },
        { id: 2, nombre: "Roma", latitud: 41.9, longitud: 12.5 },
      ],
    };
    const resultado = await ejecutarCli([
      { prompt: "Selecciona una opción:", respuesta: "5" },
      { prompt: "Número de la nueva ciudad default", respuesta: "2" },
      { prompt: "Presiona Enter para continuar...", respuesta: "" },
      { prompt: "Selecciona una opción:", respuesta: "9" },
    ], config);
    const rutaConfig = join(directorio!, "config.json");
    const guardada = await Bun.file(rutaConfig).json();

    expect(resultado.codigo).toBe(0);
    expect(resultado.salida).toContain("Roma es ahora la ciudad default");
    expect(guardada).toMatchObject({ ciudadDefaultId: 2 });
  });

  test("permite cancelar el flujo de agregar ciudad sin acceder a la red", async () => {
    const resultado = await ejecutarCli([
      { prompt: "Selecciona una opción:", respuesta: "3" },
      { prompt: "Nombre de la ciudad", respuesta: "" },
      { prompt: "Selecciona una opción:", respuesta: "9" },
    ]);

    expect(resultado.codigo).toBe(0);
    expect(resultado.salida).toContain("Búsqueda cancelada.");
  });
});
