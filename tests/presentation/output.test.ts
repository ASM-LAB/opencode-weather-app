import { afterEach, describe, expect, test } from "bun:test";
import { etiquetaCiudad, imprimirCiudades, mostrarTarjeta } from "../../src/presentation/output.ts";
import type { Ciudad } from "../../src/types/City.ts";
import type { Clima } from "../../src/types/Weather.ts";

const ciudad: Ciudad = {
  id: 10,
  nombre: "Madrid",
  admin1: "Comunidad de Madrid",
  pais: "España",
  latitud: 40.4,
  longitud: -3.7,
};

const clima: Clima = {
  temperatura: 18,
  sensacion: 17,
  humedad: 60,
  viento: 10,
  direccionViento: 90,
  codigoClima: 3,
  hora: "2026-11-02T10:30",
  maxima: 20,
  minima: 10,
  unidadTemperatura: "°C",
  unidadViento: "km/h",
  pronostico: [{ fecha: "2026-11-03", codigoClima: 61, maxima: 19, minima: 9 }],
};

const salidaOriginal = console.log;
let salida: string[];

afterEach(() => {
  console.log = salidaOriginal;
});

function capturarSalida(): void {
  salida = [];
  console.log = (...valores: unknown[]) => {
    salida.push(valores.map(String).join(" "));
  };
}

describe("presentación de ciudades y clima", () => {
  test("construye una etiqueta con ubicación disponible", () => {
    expect(etiquetaCiudad(ciudad)).toBe("Madrid (Comunidad de Madrid, España)");
    expect(etiquetaCiudad({ id: 2, nombre: "Roma", latitud: 0, longitud: 0 }))
      .toBe("Roma");
  });

  test("marca la ciudad predeterminada al imprimir la lista", () => {
    capturarSalida();

    imprimirCiudades([ciudad], ciudad.id);

    expect(salida.join("\n")).toContain("1. Madrid (Comunidad de Madrid, España)  ★ default");
  });

  test("imprime información actual y pronóstico", () => {
    capturarSalida();

    mostrarTarjeta(ciudad, clima);

    const texto = salida.join("\n");
    expect(texto).toContain("Ahora:");
    expect(texto).toContain("18,0 °C");
    expect(texto).toContain("Viento:");
    expect(texto).toContain("10 km/h E");
    expect(texto).toContain("Actualizado:");
    expect(texto).toContain("Pronóstico: próximos 7 días");
    expect(texto).toContain("Lluvia ligera");
  });

  test("representa como no disponibles los datos ausentes", () => {
    capturarSalida();
    const climaSinOpcionales: Clima = {
      ...clima,
      humedad: null,
      viento: null,
      direccionViento: null,
      maxima: null,
      minima: null,
      hora: "",
      pronostico: [],
    };

    mostrarTarjeta(ciudad, climaSinOpcionales);

    const texto = salida.join("\n");
    expect(texto).toContain("Humedad:");
    expect(texto).toContain("—");
    expect(texto).toContain("Pronóstico no disponible.");
    expect(texto).toContain("Actualizado:");
  });
});
