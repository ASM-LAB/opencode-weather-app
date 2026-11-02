import { rojo, verde } from "../utils/colors.ts";
import { LINEA } from "../utils/constants.ts";
import {
  descripcionClima,
  direccionViento,
  formatearFecha,
  formatearTemperatura,
} from "../utils/format.ts";
import type { Ciudad } from "../types/City.ts";
import type { Clima } from "../types/Weather.ts";

export function imprimirCiudades(
  ciudades: Ciudad[],
  ciudadDefaultId: number | null,
): void {
  ciudades.forEach((ciudad, indice) => {
    const marca = ciudad.id === ciudadDefaultId ? "  ★ default" : "";
    console.log(`  ${indice + 1}. ${etiquetaCiudad(ciudad)}${marca}`);
  });
}

export function etiquetaCiudad(ciudad: Ciudad): string {
  const detalles = [ciudad.admin1, ciudad.pais].filter(
    (dato): dato is string => typeof dato === "string" && dato.length > 0,
  );
  const sufijo = detalles.length > 0 ? ` (${detalles.join(", ")})` : "";
  return `${ciudad.nombre}${sufijo}`;
}

export function mostrarTarjeta(ciudad: Ciudad, clima: Clima): void {
  const direccion =
    clima.direccionViento === null
      ? ""
      : ` ${direccionViento(clima.direccionViento)}`;
  const viento =
    clima.viento === null
      ? "—"
      : `${clima.viento.toFixed(0)} ${clima.unidadViento}${direccion}`;
  const hoy =
    clima.maxima === null || clima.minima === null
      ? "—"
      : `Máx ${formatearTemperatura(clima.maxima, clima.unidadTemperatura)} / Mín ${formatearTemperatura(clima.minima, clima.unidadTemperatura)}`;
  const hora = clima.hora.length >= 16 ? clima.hora.slice(11, 16) : "—";

  console.log(`\n${LINEA}`);
  console.log(`  ${etiquetaCiudad(ciudad)}`);
  console.log(LINEA);
  fila(
    "Ahora:",
    `${formatearTemperatura(clima.temperatura, clima.unidadTemperatura)} · ${descripcionClima(clima.codigoClima)}`,
  );
  fila(
    "Sensación:",
    formatearTemperatura(clima.sensacion, clima.unidadTemperatura),
  );
  fila("Humedad:", clima.humedad === null ? "—" : `${clima.humedad} %`);
  fila("Viento:", viento);
  fila("Hoy:", hoy);
  fila("Actualizado:", `${hora} (hora local)`);
  console.log(LINEA);
  mostrarPronostico(clima);
  console.log(LINEA);
}

function mostrarPronostico(clima: Clima): void {
  console.log("  Pronóstico: próximos 7 días");
  if (clima.pronostico.length === 0) {
    console.log("    — Pronóstico no disponible.");
    return;
  }

  for (const dia of clima.pronostico) {
    const descripcion = dia.codigoClima === null
      ? "—"
      : descripcionClima(dia.codigoClima);
    const maxima = dia.maxima === null
      ? "—"
      : formatearTemperatura(dia.maxima, clima.unidadTemperatura);
    const minima = dia.minima === null
      ? "—"
      : formatearTemperatura(dia.minima, clima.unidadTemperatura);

    console.log(`  ${formatearFecha(dia.fecha)} · ${descripcion}`);
    console.log(`    Máx ${maxima} / Mín ${minima}`);
  }
}

export function aviso(mensaje: string): void {
  console.log(rojo(`  ⚠ ${mensaje}`));
}

export function exito(mensaje: string): void {
  console.log(verde(`  ✓ ${mensaje}`));
}

export function errorInesperado(mensaje: string): void {
  console.error(rojo(`\n  Error inesperado: ${mensaje}`));
}

function fila(etiqueta: string, valor: string): void {
  console.log(`  ${etiqueta.padEnd(14)}${valor}`);
}
