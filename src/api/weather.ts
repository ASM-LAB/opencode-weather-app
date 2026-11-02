import { obtenerJson } from "./client.ts";
import type { Ciudad } from "../types/City.ts";
import type { Clima, RespuestaForecast } from "../types/Weather.ts";
import type { Unidad } from "../types/Settings.ts";

const URL_FORECAST = "https://api.open-meteo.com/v1/forecast";

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
