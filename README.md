## Weather CLI APP

El objetivo de esta aplicación es que creemos una aplicación de consola que pida que ingresemos la ciudad, Al final, generaremos un binario ejecutable.

### Opciones:

- Ingresar el nombre de una ciudad.
- Guardar la ciudad por defecto.
- Registrar varias otras ciudades para buscar el clima en esas otras ciudades.

## Stack

- Bun.js
- OpenMeteo

## Ejemplo de petición http:

1. Paso 1: Geocoding API.
2. Paso 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Inicializar proyecto

```bash
bun init
```

### Ejemplo del menú
Esta es la apariencia que deseamos crear

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5
```

## Pronóstico de 7 días

Las opciones de clima de la ciudad predeterminada y de todas las ciudades incluyen el clima actual y el pronóstico de los próximos siete días, desde mañana según la fecha local de cada ciudad. Cada día muestra fecha, condición meteorológica, máxima y mínima, en la unidad seleccionada (°C o °F). Los datos que no estén disponibles aparecen como `—`.

## Colores de la interfaz

La interfaz usa colores ANSI: menú en cyan, temperaturas en amarillo, mensajes de éxito en verde y avisos o errores en rojo. Se desactivan automáticamente cuando la salida no es una terminal o cuando defines `NO_COLOR`; puedes forzarlos con `FORCE_COLOR=1`.

## Pruebas y compilación

Las pruebas automáticas usan el ejecutor integrado de Bun y no requieren servicios externos:

```bash
bun run test
```

La compilación ejecuta primero toda la suite y solo genera el binario si las pruebas pasan:

```bash
bun run build
```

La variable opcional `WEATHER_CONFIG_PATH` permite indicar la ruta del archivo de configuración, por ejemplo para aislar ejecuciones de prueba. Si no se define, se usa `~/.weather-cli.json`.
