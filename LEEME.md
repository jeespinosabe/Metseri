# Metseri

Explorador de astronomía en 360° y realidad virtual. Creado con React, Vite, Three.js y JavaScript, sin necesidad de un backend.

## Desarrollo

```sh
npm install
npm run dev
```

Abre la URL que indica Vite. Para acceder desde un móvil en la misma red, utiliza la dirección de red que muestra el servidor. El seguimiento de movimiento, WebXR, la instalación y el service worker requieren un origen seguro: HTTPS o localhost. Una dirección HTTP de la red local permite la navegación táctil, pero no garantiza acceso al sensor.

## Versión instalable y sin conexión

```sh
npm run build
npm run preview
```

La compilación genera `dist/`, el manifiesto y el service worker. Publica el contenido de `dist/` en un hosting HTTPS. Tras la primera visita y la activación del service worker, la interfaz, las fuentes y la escena se conservan para explorar sin conexión. Las texturas de planetas se generan localmente.

En Chrome/Android utiliza «Instalar aplicación». En Safari/iPhone utiliza «Compartir → Añadir a pantalla de inicio». La instalación depende del navegador; el service worker no se activa en el servidor de desarrollo.

## Interacción

- **360°:** arrastra con el mouse o desliza con un dedo. La rueda y los botones +/− cambian el campo de visión. El botón de restablecer recupera la composición inicial.
- **Selección:** los cuerpos celestes brillan al apuntar. Haz clic o toca para abrir su información. Las etiquetas y la búsqueda también permiten seleccionar.
- **Teclado:** enfoca la escena, usa las flechas para mirar y Enter/Espacio para seleccionar el objeto del centro. Los botones y diálogos se pueden recorrer con Tab; Escape cierra la información o el diálogo.
- **VR móvil:** entra en VR, permite el movimiento, coloca el móvil en horizontal y úsalo con un visor. Se renderizan dos vistas estereoscópicas; un toque o el botón capacitivo del visor selecciona el objeto del centro. La información se duplica para ambos ojos y se cierra con otro clic o toque en cualquier parte de la pantalla. Si falta el sensor o su permiso, se conserva el control por arrastre.
- **Salir de VR con el visor:** mira hacia abajo, unos 60° por debajo del horizonte. Al aparecer «Salir de VR» en ambos ojos, pulsa el botón del visor; la posición del clic en la pantalla no importa. Si tienes una ficha abierta, el primer clic la cierra y el siguiente permite salir. También puedes usar el botón «Salir de VR» de la pantalla.
- **WebXR:** en visores y navegadores compatibles se solicita una sesión inmersiva; el gatillo selecciona lo que está en el centro de la mirada. La ficha se presenta dentro de la escena; otro toque del gatillo la cierra. El menú del visor permite salir.
- **Descubrimientos:** búsqueda de destinos y capas de etiquetas y constelaciones.

La vista es una composición educativa. Los tamaños, distancias, posiciones y figuras de constelaciones están adaptados para facilitar la exploración; no es un planetario de posiciones astronómicas en tiempo real. La vista dividida es genérica y no aplica la corrección óptica particular de cada modelo de visor.

## Verificación

```sh
npm test
npm run build
```

Las pruebas revisan el catálogo, la integridad de las constelaciones, los filtros y la recuperación de guardados corruptos. El seguimiento físico de cabeza y el acceso WebXR se deben probar en hardware compatible bajo HTTPS.

## Estructura

- `src/App.jsx`: interfaz, búsqueda, fichas, instalación y entrada VR.
- `src/EscenaEspacial.jsx`: escena, raycasting, navegación, sensores, estéreo y WebXR.
- `src/catalogoCeleste.js`: catálogo y contenido en español, con enlaces de referencia a NASA.
- `src/texturas.js`: texturas generadas en canvas.
- `src/estilos.css`: diseño adaptable a móviles y pantallas grandes.
- `vite.config.js`: compilación y configuración PWA.

Los iconos se pueden regenerar con `node scripts/generarIconos.mjs`.

Las funciones y métodos propios usan nombres descriptivos en español y notación camello, como `cambiarVista()`, `seleccionarObjetivoCentral()` y `salirDeVR()`. Los componentes React usan nombres en español con inicial mayúscula, como `EscenaEspacial`, salvo `App`. Se conservan los nombres `App.jsx` y `main.jsx`, así como los exigidos por las bibliotecas y las APIs externas.
