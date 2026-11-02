import { describe, expect, test } from "bun:test";
import { agregarCiudad, eliminarCiudad, establecerCiudadDefault } from "../../src/storage/citiesStorage.ts";
import { cambiarUnidad } from "../../src/storage/settingsStorage.ts";
import type { Ciudad } from "../../src/types/City.ts";
import type { Configuracion } from "../../src/types/Settings.ts";

const madrid: Ciudad = {
  id: 1,
  nombre: "Madrid",
  latitud: 40.4,
  longitud: -3.7,
};
const roma: Ciudad = {
  id: 2,
  nombre: "Roma",
  latitud: 41.9,
  longitud: 12.5,
};

function configInicial(): Configuracion {
  return { unidad: "celsius", ciudadDefaultId: null, ciudades: [] };
}

describe("almacenamiento de ciudades", () => {
  test("agrega la primera ciudad y la establece como predeterminada", () => {
    const config = configInicial();

    expect(agregarCiudad(config, madrid)).toBe(true);
    expect(config.ciudades).toEqual([madrid]);
    expect(config.ciudadDefaultId).toBe(madrid.id);
  });

  test("no agrega ciudades duplicadas", () => {
    const config = { ...configInicial(), ciudades: [madrid], ciudadDefaultId: madrid.id };

    expect(agregarCiudad(config, madrid)).toBe(false);
    expect(config.ciudades).toHaveLength(1);
  });

  test("no cambia la ciudad predeterminada si ya existe una", () => {
    const config = { ...configInicial(), ciudades: [madrid], ciudadDefaultId: madrid.id };

    agregarCiudad(config, roma);

    expect(config.ciudadDefaultId).toBe(madrid.id);
    expect(config.ciudades).toEqual([madrid, roma]);
  });

  test("eliminar una ciudad inexistente no modifica la configuración", () => {
    const config = { ...configInicial(), ciudades: [madrid], ciudadDefaultId: madrid.id };

    expect(eliminarCiudad(config, 99)).toBe(false);
    expect(config.ciudades).toEqual([madrid]);
  });

  test("al eliminar la ciudad predeterminada asigna la primera restante", () => {
    const config = {
      ...configInicial(),
      ciudades: [madrid, roma],
      ciudadDefaultId: madrid.id,
    };

    expect(eliminarCiudad(config, madrid.id)).toBe(true);
    expect(config.ciudades).toEqual([roma]);
    expect(config.ciudadDefaultId).toBe(roma.id);
  });

  test("al eliminar la última ciudad deja la predeterminada vacía", () => {
    const config = { ...configInicial(), ciudades: [madrid], ciudadDefaultId: madrid.id };

    eliminarCiudad(config, madrid.id);

    expect(config.ciudades).toEqual([]);
    expect(config.ciudadDefaultId).toBeNull();
  });

  test("solo permite establecer como predeterminada una ciudad guardada", () => {
    const config: Configuracion = {
      ...configInicial(),
      ciudades: [madrid],
      ciudadDefaultId: null,
    };

    expect(establecerCiudadDefault(config, 99)).toBe(false);
    expect(establecerCiudadDefault(config, madrid.id)).toBe(true);
    expect(config.ciudadDefaultId).toBe(madrid.id);
  });
});

describe("almacenamiento de unidad", () => {
  test("alterna entre Celsius y Fahrenheit", () => {
    const config = configInicial();

    expect(cambiarUnidad(config)).toBe("fahrenheit");
    expect(cambiarUnidad(config)).toBe("celsius");
  });
});
