export interface DailyForecast {
  fecha: string;
  codigoClima: number | null;
  maxima: number | null;
  minima: number | null;
}

export type PronosticoDiario = DailyForecast;

export interface Weather {
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
  pronostico: DailyForecast[];
}

export type Clima = Weather;

export interface CurrentWeatherResponse {
  time?: string;
  temperature_2m?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  weather_code?: number;
  is_day?: number;
}

export interface ForecastResponse {
  timezone?: string;
  current_units?: Record<string, string>;
  current?: CurrentWeatherResponse;
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
  };
}

export type RespuestaForecast = ForecastResponse;
