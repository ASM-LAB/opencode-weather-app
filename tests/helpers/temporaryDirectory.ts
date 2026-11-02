import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function crearDirectorioTemporal(): Promise<string> {
  return mkdtemp(join(tmpdir(), "weather-cli-tests-"));
}

export async function eliminarDirectorioTemporal(
  ruta: string | undefined,
): Promise<void> {
  if (ruta) {
    await rm(ruta, { recursive: true, force: true });
  }
}
