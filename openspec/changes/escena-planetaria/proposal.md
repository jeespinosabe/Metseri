# Proposal

## Why

Metseri permite recorrer un cielo de estrellas, pero todavía no ofrece planetas ni selección de cuerpos celestes. Este cambio incorpora los ocho planetas del sistema solar como objetos 3D y permite interactuar con ellos tanto en pantalla como con el único botón táctil de un visor móvil.

## What Changes

- Incorporar Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno, con volumen y apariencia reconocible, distribuidos en distintas direcciones de la escena 360 existente. Su distribución y escala serán compositivas, sin simular posiciones, distancias ni tamaños astronómicos reales.
- Mostrar el nombre de cada planeta visible mediante etiquetas que acompañen su posición, sin interceptar gestos y con una copia por ojo en VR.
- Aplicar el estilo visual de las referencias aportadas: cuerpos con mayor presencia y relieve, anillos de Saturno con bandas y separación, etiquetas sin cápsula con nombre y clasificación y resaltado de contorno, sin un recuadro «Haz clic para explorar».
- Corregir el estiramiento de los cuerpos hacia los extremos de la vista única mediante una proyección que conserve sus contornos circulares, manteniendo la correspondencia entre imagen, etiqueta y selección.
- Conservar la exploración mediante arrastre con mouse o dedo y distinguirla del clic o toque de selección. Arrastrar no seleccionará ni deseleccionará planetas.
- En vista única, seleccionar un planeta al hacer clic o tocar su representación; iluminarlo mientras esté seleccionado. Habrá como máximo un planeta seleccionado: pulsarlo de nuevo o pulsar el fondo quitará la selección; pulsar otro la trasladará.
- En VR, resaltar el planeta al que apunta la mirada sin seleccionarlo automáticamente. Cuando no haya selección, un toque en cualquier zona de la escena seleccionará el planeta apuntado, independientemente de dónde se produzca el toque.
- Aplicar la aclaración del usuario para VR: una selección se conserva al mirar a otro lado y el siguiente toque en cualquier zona la quita, incluso mirando el fondo u otro planeta. Ese toque solo deselecciona; seleccionar otro planeta requiere un toque posterior mientras se le apunta.
- Distinguir visualmente el resaltado por mirada de la iluminación persistente por selección. Compartir ambos estados entre las dos vistas y conservar la selección al alternar modos o recentrar.
- Mantener el seguimiento del sensor al tocar para seleccionar o deseleccionar. Pasar a control manual únicamente al reconocer un arrastre real o usar las flechas.
- Conservar los controles superpuestos como acciones independientes: recentrar y entrar o salir de VR no activarán la selección planetaria.

No se incluyen órbitas, rotación automática, traslación del observador, Sol, lunas, fichas informativas, selección múltiple, activación por tiempo de mirada, WebXR, instalación PWA ni funcionamiento sin conexión.

## Capabilities

### New Capabilities

- `escena-planetaria`: Ocho planetas 3D reconocibles distribuidos en 360 grados, selección e iluminación en vista única, resaltado por mirada y selección/deselección mediante toque independiente de su posición en VR.

### Modified Capabilities

- `immersive-starfield`: Ampliar la escena autónoma de estrellas para admitir planetas y permitir cambios de iluminación por interacción; conservar el puntero como superposición visual sin impedir la selección gestionada por la escena.
- `mobile-vr-mode`: Conservar la selección entre modos, utilizar el eje común de mirada como referencia del objetivo y distinguir un toque de un arrastre para que seleccionar no cancele el sensor.

## Impact

- Reutilizar React y Three.js ya instalados. Incorporar módulos acotados en `src/escena/` para los cuerpos planetarios y la detección/estado de selección; integrar su creación, renderizado y liberación en `campoEstelar.js`.
- Adaptar `controlesVista.js` y su enlace en `src/componentes/escenaEstelar.jsx` para distinguir activación y arrastre. Conservar `PunteroCruz` como guía superpuesta sin manejadores propios; ajustar estilos o instrucciones accesibles solo donde la interacción lo necesite.
- Extender las pruebas existentes con `node:test` para selección, detección del objetivo, gestos y continuidad del sensor. Actualizar `README.md` con los controles y la comprobación de escritorio, móvil y visor.
- Generar geometrías, materiales y texturas localmente, sin nuevas dependencias, solicitudes a la API Express ni recursos visuales remotos. Conservar el dibujo bajo demanda y la liberación de recursos.
- La especificación vigente limita expresamente la escena a estrellas; los deltas de este cambio sustituyen esa restricción. Esta propuesta solo crea artefactos de planificación y no modifica todavía la aplicación ni las especificaciones principales.
