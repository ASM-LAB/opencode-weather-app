// Colores ANSI para la interfaz de consola.

function detectarColor(): boolean {
  const forzado = process.env.FORCE_COLOR;
  if (forzado === "0") {
    return false;
  }
  if (forzado !== undefined) {
    return true;
  }

  return (
    process.stdout.isTTY === true &&
    process.env.NO_COLOR === undefined &&
    process.env.TERM !== "dumb"
  );
}

const COLOR_HABILITADO = detectarColor();

function pintar(codigo: number, texto: string): string {
  if (!COLOR_HABILITADO || texto.length === 0) {
    return texto;
  }

  return `\x1b[${codigo}m${texto}\x1b[0m`;
}

export function cyan(texto: string): string {
  return pintar(36, texto);
}

export function amarillo(texto: string): string {
  return pintar(33, texto);
}

export function verde(texto: string): string {
  return pintar(32, texto);
}

export function rojo(texto: string): string {
  return pintar(31, texto);
}
