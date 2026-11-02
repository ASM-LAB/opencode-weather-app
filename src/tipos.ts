// Tipos compartidos por la aplicación.

export type Unidad = "celsius" | "fahrenheit";

export interface Ciudad {
  id: number;
  nombre: string;
  admin1?: string;
  pais?: string;
  latitud: number;
  longitud: number;
  zonaHoraria?: string;
}

export interface Configuracion {
  unidad: Unidad;
  ciudadDefaultId: number | null;
  ciudades: Ciudad[];
}

// Respuesta cruda de la Geocoding API de OpenMeteo.
export interface ResultadoGeocoding {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface PronosticoDiario {
  fecha: string;
  codigoClima: number | null;
  maxima: number | null;
  minima: number | null;
}

// Datos actuales y pronóstico ya normalizados y listos para mostrar.
export interface Clima {
  temperatura: number;
  sensacion: number;
  humedad: number | null;
  viento: number | null;
  direccionViento: number | null;
  codigoClima: number;
  hora: string;
  maxima: number | null;
  minima: number | null;
  unidadTemperatura: string;
  unidadViento: string;
  pronostico: PronosticoDiario[];
}

// Respuesta cruda de la Forecast API de OpenMeteo.
export interface ClimaActualRespuesta {
  time?: string;
  temperature_2m?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  weather_code?: number;
  is_day?: number;
}

export interface RespuestaForecast {
  timezone?: string;
  current_units?: Record<string, string>;
  current?: ClimaActualRespuesta;
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
  };
}
