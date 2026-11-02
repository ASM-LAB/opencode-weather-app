import { createInterface } from "node:readline/promises";
import { stdin as entrada, stdout as salida } from "node:process";
import type { Ciudad } from "../types/City.ts";

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

export async function elegirCiudad(
  ciudades: Ciudad[],
  mensaje: string,
): Promise<Ciudad | null> {
  const entrada = await preguntar(mensaje);
  if (!entrada) {
    return null;
  }

  const numero = Number(entrada);
  if (!Number.isInteger(numero) || numero < 1 || numero > ciudades.length) {
    return null;
  }

  return ciudades[numero - 1] ?? null;
}
