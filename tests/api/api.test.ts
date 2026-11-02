import { afterEach, describe, expect, test } from "bun:test";
import { obtenerJson } from "../../src/api/client.ts";
import { buscarCiudades } from "../../src/api/geocoding.ts";
import { obtenerClima } from "../../src/api/weather.ts";
import type { Ciudad } from "../../src/types/City.ts";

const fetchOriginal = globalThis.fetch;

function simularFetch(
  respuesta: (input: Request | string | URL, init?: RequestInit) => Promise<Response>,
): void {
  globalThis.fetch = Object.assign(respuesta, {
    preconnect: fetchOriginal.preconnect,
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe("cliente HTTP", () => {
  test("devuelve JSON de una respuesta correcta", async () => {
    simularFetch(async () => Response.json({ correcto: true }));

    await expect(obtenerJson<{ correcto: boolean }>("https://ejemplo.test"))
      .resolves.toEqual({ correcto: true });
  });

  test("rechaza respuestas HTTP fallidas con el estado", async () => {
    simularFetch(async () => new Response("fallo", { status: 503 }));

    await expect(obtenerJson("https://ejemplo.test"))
      .rejects.toThrow("OpenMeteo respondió con estado 503.");
  });

  test("propaga errores de red", async () => {
    simularFetch(async () => {
      throw new Error("sin conexión");
    });

    await expect(obtenerJson("https://ejemplo.test")).rejects.toThrow("sin conexión");
  });
});

describe("geocodificación", () => {
  test("limpia la búsqueda, configura idioma y transforma resultados", async () => {
    let urlSolicitada = "";
    simularFetch(async (input) => {
      urlSolicitada = String(input);
      return Response.json({
        results: [{
          id: 2643743,
          name: "Londres",
          latitude: 51.5,
          longitude: -0.1,
          country: "Reino Unido",
          admin1: "Inglaterra",
          timezone: "Europe/London",
        }],
      });
    });

    expect(await buscarCiudades("  Londres ")).toEqual([{
      id: 2643743,
      nombre: "Londres",
      admin1: "Inglaterra",
      pais: "Reino Unido",
      latitud: 51.5,
      longitud: -0.1,
      zonaHoraria: "Europe/London",
    }]);
    const parametros = new URL(urlSolicitada).searchParams;
    expect(parametros.get("name")).toBe("Londres");
    expect(parametros.get("count")).toBe("5");
    expect(parametros.get("language")).toBe("es");
  });

  test("devuelve una lista vacía si no hay resultados", async () => {
    simularFetch(async () => Response.json({}));

    expect(await buscarCiudades("ciudad inexistente")).toEqual([]);
  });
});

describe("pronóstico meteorológico", () => {
  const ciudad: Ciudad = {
    id: 1,
    nombre: "Madrid",
    latitud: 40.4,
    longitud: -3.7,
  };

  test("transforma clima actual y pronóstico de los siete días siguientes", async () => {
    let urlSolicitada = "";
    simularFetch(async (input) => {
      urlSolicitada = String(input);
      return Response.json({
        current_units: { temperature_2m: "°C", wind_speed_10m: "km/h" },
        current: {
          time: "2026-11-02T10:00",
          temperature_2m: 18.2,
          apparent_temperature: 17.1,
          relative_humidity_2m: 55,
          wind_speed_10m: 12.4,
          wind_direction_10m: 180,
          weather_code: 3,
        },
        daily: {
          time: ["2026-11-02", "2026-11-03", "2026-11-04"],
          weather_code: [3, 61, 0],
          temperature_2m_max: [20, 19, 21],
          temperature_2m_min: [10, 9, 11],
        },
      });
    });

    const clima = await obtenerClima(ciudad, "celsius");

    expect(clima).toEqual({
      temperatura: 18.2,
      sensacion: 17.1,
      humedad: 55,
      viento: 12.4,
      direccionViento: 180,
      codigoClima: 3,
      hora: "2026-11-02T10:00",
      maxima: 20,
      minima: 10,
      unidadTemperatura: "°C",
      unidadViento: "km/h",
      pronostico: [
        { fecha: "2026-11-03", codigoClima: 61, maxima: 19, minima: 9 },
        { fecha: "2026-11-04", codigoClima: 0, maxima: 21, minima: 11 },
      ],
    });
    const parametros = new URL(urlSolicitada).searchParams;
    expect(parametros.get("latitude")).toBe("40.4");
    expect(parametros.get("longitude")).toBe("-3.7");
    expect(parametros.get("temperature_unit")).toBe("celsius");
    expect(parametros.get("forecast_days")).toBe("8");
  });

  test("usa valores alternativos cuando faltan campos opcionales", async () => {
    simularFetch(async () => Response.json({ current: { temperature_2m: 5 } }));

    expect(await obtenerClima(ciudad, "fahrenheit")).toEqual({
      temperatura: 5,
      sensacion: 5,
      humedad: null,
      viento: null,
      direccionViento: null,
      codigoClima: 0,
      hora: "",
      maxima: null,
      minima: null,
      unidadTemperatura: "°F",
      unidadViento: "km/h",
      pronostico: [],
    });
  });

  test("falla si la temperatura actual no está disponible", async () => {
    simularFetch(async () => Response.json({ current: { weather_code: 0 } }));

    await expect(obtenerClima(ciudad, "celsius"))
      .rejects.toThrow("OpenMeteo no devolvió la temperatura actual.");
  });
});
