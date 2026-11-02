import { obtenerJson } from "./client.ts";
import type { Ciudad, ResultadoGeocoding } from "../types/City.ts";

const URL_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";

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
