import type { Ciudad } from "../types/City.ts";
import type { Configuracion } from "../types/Settings.ts";

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
