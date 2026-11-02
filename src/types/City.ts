export interface City {
  id: number;
  nombre: string;
  admin1?: string;
  pais?: string;
  latitud: number;
  longitud: number;
  zonaHoraria?: string;
}

export type Ciudad = City;

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export type ResultadoGeocoding = GeocodingResult;
