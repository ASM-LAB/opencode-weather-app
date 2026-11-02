import { agregarCiudadInteractivo } from "./actions/addCity.ts";
import { cambiarUnidadInteractivo } from "./actions/changeUnit.ts";
import { climaCiudadDefault, climaTodasLasCiudades } from "./actions/getWeather.ts";
import { eliminarCiudadInteractivo } from "./actions/removeCity.ts";
import { establecerDefaultInteractivo } from "./actions/setDefaultCity.ts";
import { aviso, errorInesperado } from "./presentation/output.ts";
import { cerrarUi } from "./presentation/input.ts";
import { esOpcionMenu, imprimirMenu, seleccionarOpcion } from "./presentation/menu.ts";
import { cargarConfig } from "./storage/configStorage.ts";
import type { Configuracion } from "./types/Settings.ts";
import { mensajeError } from "./utils/errors.ts";

async function main(): Promise<void> {
  try {
    const config = await cargarConfig();
    await cicloMenu(config);
  } finally {
    cerrarUi();
  }
}

async function cicloMenu(config: Configuracion): Promise<void> {
  while (true) {
    imprimirMenu(config.ciudades.length, config.unidad);
    const opcion = await seleccionarOpcion();

    if (!esOpcionMenu(opcion)) {
      aviso("Opción no válida. Elige una opción del menú.");
      continue;
    }

    switch (opcion) {
      case "1":
        await climaCiudadDefault(config);
        break;
      case "2":
        await climaTodasLasCiudades(config);
        break;
      case "3":
        await agregarCiudadInteractivo(config);
        break;
      case "4":
        await eliminarCiudadInteractivo(config);
        break;
      case "5":
        await establecerDefaultInteractivo(config);
        break;
      case "8":
        await cambiarUnidadInteractivo(config);
        break;
      case "9":
        console.log("\n  ¡Hasta luego!");
        return;
    }
  }
}

main().catch((error: unknown) => {
  errorInesperado(mensajeError(error));
  process.exitCode = 1;
});
