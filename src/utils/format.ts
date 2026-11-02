import { amarillo } from "./colors.ts";
import { DESCRIPCIONES_CLIMA, DIRECCIONES } from "./constants.ts";

export function formatearTemperatura(valor: number, unidad: string): string {
  return amarillo(`${valor.toFixed(1).replace(".", ",")} ${unidad}`);
}

export function descripcionClima(codigo: number): string {
  return DESCRIPCIONES_CLIMA[codigo] ?? "Condición desconocida";
}

export function direccionViento(grados: number): string {
  const indice = Math.round((grados % 360) / 45) % 8;
  return DIRECCIONES[indice] ?? "N";
}

export function formatearFecha(fecha: string): string {
  // UTC conserva la fecha local recibida sin desplazarla a la zona del equipo.
  const dia = new Date(`${fecha}T00:00:00Z`);
  if (Number.isNaN(dia.getTime())) {
    return "—";
  }
  const semana = dia.toLocaleDateString("es", {
    weekday: "short",
    timeZone: "UTC",
  });
  return `${semana} ${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}
