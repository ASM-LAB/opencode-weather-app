import { describe, expect, test } from "bun:test";
import { descripcionClima, direccionViento, formatearFecha, formatearTemperatura } from "../../src/utils/format.ts";

describe("formato de datos meteorológicos", () => {
  test("formatea temperaturas con un decimal y coma", () => {
    expect(formatearTemperatura(12.34, "°C")).toContain("12,3 °C");
    expect(formatearTemperatura(-2, "°F")).toContain("-2,0 °F");
  });

  test("describe códigos meteorológicos conocidos y desconocidos", () => {
    expect(descripcionClima(0)).toBe("Despejado");
    expect(descripcionClima(95)).toBe("Tormenta");
    expect(descripcionClima(999)).toBe("Condición desconocida");
  });

  test("convierte grados cardinales y normaliza vueltas completas", () => {
    expect(direccionViento(0)).toBe("N");
    expect(direccionViento(90)).toBe("E");
    expect(direccionViento(180)).toBe("S");
    expect(direccionViento(270)).toBe("O");
    expect(direccionViento(360)).toBe("N");
    expect(direccionViento(45)).toBe("NE");
  });

  test("formatea fecha válida y rechaza una fecha inválida", () => {
    expect(formatearFecha("2026-11-02")).toContain("02/11");
    expect(formatearFecha("fecha inválida")).toBe("—");
  });
});
