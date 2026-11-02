// Cliente de las APIs de OpenMeteo: geocodificación, clima actual y pronóstico.

import type {
  Ciudad,
  Clima,
  RespuestaForecast,
  ResultadoGeocoding,
  Unidad,
} from "./tipos.ts";

const TIMEOUT_MS = 10_000;
const URL_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";
const URL_FORECAST = "https://api.open-meteo.com/v1/forecast";

interface RespuestaGeocoding {
  results?: ResultadoGeocoding[];
}

export async function buscarCiudades(nombre: string): Promise<Ciudad[]> {
  const parametros = new URLSearchParams({
    name: nombre.trim(),
    count: "5",
    language: "es",
    format: "json",
  });
  const datos = await obtenerJson<RespuestaGeocoding>(
    `${URL_GEOCODING}?${parametros.toString()}`,
  );

  return (datos.results ?? []).map((resultado) => ({
    id: resultado.id,
    nombre: resultado.name,
    admin1: resultado.admin1,
    pais: resultado.country,
    latitud: resultado.latitude,
    longitud: resultado.longitude,
    zonaHoraria: resultado.timezone,
  }));
}

export async function obtenerClima(
  ciudad: Ciudad,
  unidad: Unidad,
): Promise<Clima> {
  const parametros = new URLSearchParams({
    latitude: String(ciudad.latitud),
    longitude: String(ciudad.longitud),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "weather_code",
      "is_day",
    ].join(","),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "8",
    timezone: "auto",
    temperature_unit: unidad,
    wind_speed_unit: "kmh",
  });
  const datos = await obtenerJson<RespuestaForecast>(
    `${URL_FORECAST}?${parametros.toString()}`,
  );

  const actual = datos.current;
  if (!actual || typeof actual.temperature_2m !== "number") {
    throw new Error("OpenMeteo no devolvió la temperatura actual.");
  }

  const unidadTemperatura =
    datos.current_units?.temperature_2m ??
    (unidad === "celsius" ? "°C" : "°F");

  return {
    temperatura: actual.temperature_2m,
    sensacion: actual.apparent_temperature ?? actual.temperature_2m,
    humedad: actual.relative_humidity_2m ?? null,
    viento: actual.wind_speed_10m ?? null,
    direccionViento: actual.wind_direction_10m ?? null,
    codigoClima: actual.weather_code ?? 0,
    hora: actual.time ?? "",
    maxima: datos.daily?.temperature_2m_max?.[0] ?? null,
    minima: datos.daily?.temperature_2m_min?.[0] ?? null,
    unidadTemperatura,
    unidadViento: datos.current_units?.wind_speed_10m ?? "km/h",
    // El primer día corresponde a hoy en la zona horaria de la ciudad.
    pronostico: (datos.daily?.time ?? []).slice(1, 8).map((fecha, indice) => ({
      fecha,
      codigoClima: datos.daily?.weather_code?.[indice + 1] ?? null,
      maxima: datos.daily?.temperature_2m_max?.[indice + 1] ?? null,
      minima: datos.daily?.temperature_2m_min?.[indice + 1] ?? null,
    })),
  };
}

async function obtenerJson<T>(url: string): Promise<T> {
  const respuesta = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!respuesta.ok) {
    throw new Error(`OpenMeteo respondió con estado ${respuesta.status}.`);
  }

  return (await respuesta.json()) as T;
}
