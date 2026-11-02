// Elementos de interfaz de consola: menú, listas, tarjeta y mensajes.

import { createInterface } from "node:readline/promises";
import { stdin as entrada, stdout as salida } from "node:process";
import type { Ciudad, Clima, Unidad } from "./tipos.ts";

const ANCHO = 40;
const SEPARADOR = "═".repeat(ANCHO);
const LINEA = "─".repeat(ANCHO);

const DIRECCIONES = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] as const;

const DESCRIPCIONES_CLIMA: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos intensos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo intenso",
};

const rl = createInterface({ input: entrada, output: salida });

rl.on("SIGINT", () => {
  console.log("\n  ¡Hasta luego!");
  rl.close();
  process.exit(0);
});

export async function preguntar(mensaje: string): Promise<string> {
  const respuesta = await rl.question(mensaje);
  return respuesta.trim();
}

export function cerrarUi(): void {
  rl.close();
}

export async function pausar(): Promise<void> {
  await preguntar("\n  Presiona Enter para continuar...");
}

export function imprimirMenu(
  cantidadCiudades: number,
  unidad: Unidad,
): void {
  const simboloUnidad = unidad === "celsius" ? "°C" : "°F";

  console.log(SEPARADOR);
  console.log("         WEATHER CLI");
  console.log(SEPARADOR);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${cantidadCiudades})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${simboloUnidad})`);
  console.log("  9. Salir");
  console.log(SEPARADOR);
}

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
}

export function aviso(mensaje: string): void {
  console.log(`  ⚠ ${mensaje}`);
}

export function exito(mensaje: string): void {
  console.log(`  ✓ ${mensaje}`);
}

export function formatearTemperatura(valor: number, unidad: string): string {
  return `${valor.toFixed(1).replace(".", ",")} ${unidad}`;
}

export function descripcionClima(codigo: number): string {
  return DESCRIPCIONES_CLIMA[codigo] ?? "Condición desconocida";
}

export function direccionViento(grados: number): string {
  const indice = Math.round((grados % 360) / 45) % 8;
  return DIRECCIONES[indice] ?? "N";
}

function fila(etiqueta: string, valor: string): void {
  console.log(`  ${etiqueta.padEnd(14)}${valor}`);
}
