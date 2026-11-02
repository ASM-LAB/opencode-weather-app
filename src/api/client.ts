const TIMEOUT_MS = 10_000;

export async function obtenerJson<T>(url: string): Promise<T> {
  const respuesta = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!respuesta.ok) {
    throw new Error(`OpenMeteo respondió con estado ${respuesta.status}.`);
  }

  return (await respuesta.json()) as T;
}
