# Proposal

## Why

La escena de Metseri muestra los ocho planetas, pero todavía faltan los cuatro satélites naturales previstos. Incorporar Luna, Europa, Titán y Tritón completará los doce cuerpos celestes explorables con la misma identificación, selección y consulta de fichas que ya ofrecen los planetas.

## What Changes

- Añadir cuatro cuerpos 3D: Luna, satélite de la Tierra; Europa, de Júpiter; Titán, de Saturno; y Tritón, de Neptuno. Conservar los ocho planetas existentes.
- Situar cada satélite cerca de su planeta en la composición 360, con tamaño menor y separación suficiente para verlo, leer su nombre y seleccionarlo individualmente, también junto a los anillos de Saturno. Mantener posiciones fijas y escalas ilustrativas.
- Dar a cada luna una apariencia distinguible y una etiqueta con su nombre y la relación «Satélite de …», tanto en vista única como en las dos vistas del visor.
- Integrar los satélites en el resaltado, la selección única global y las fichas existentes, conservando clic/toque directo en vista única, mirada y toque global en VR, navegación, sensor y protección de los gestos de lectura y arrastre.
- Completar el catálogo local con los identificadores `luna`, `europa`, `titan` y `triton`, su planeta principal, imágenes locales y créditos. Usar los cuatro datos propios de satélites: diámetro, distancia al planeta, período de rotación y período orbital.
- Mantener vacíos los textos, cifras, curiosidades y asociaciones bibliográficas de producción, como en las fichas actuales. Nombre, clasificación, relación con el planeta, imagen, etiquetas y unidades sí se presentan.
- Ampliar las comprobaciones y la documentación a doce cuerpos, incluyendo continuidad entre modos y recuperación tras un reintento gráfico.

Se mantiene el alcance de escena estática: no se incorporan órbitas, rotación automática, escalas astronómicas, Sol, otros satélites, contenido editorial definitivo, conexión del frontend a la API, cambios en Supabase, WebXR, PWA ni publicación.

## Capabilities

### New Capabilities

Ninguna; se amplían las capacidades de escena y fichas existentes.

### Modified Capabilities

- `escena-planetaria`: Incorporar cuatro satélites reconocibles, ampliar la distribución a doce cuerpos y hacer extensivas a las lunas las reglas de etiquetas, interacción y recuperación existentes.
- `fichas-cuerpos-celestes`: Ampliar las fichas a doce cuerpos e incorporar identidad, relación planetaria, imagen y datos propios de los cuatro satélites. Esta capacidad existe en el cambio completado `agregar-fichas-de-cuerpos-celestes`, pero aún no en las especificaciones principales; ese delta es una dependencia explícita, no una nueva capacidad paralela.

## Impact

- Reutilizar React, Three.js, Canvas 2D y `node:test`, sin nuevas dependencias. La escena y las fichas seguirán funcionando con recursos locales, independientemente del servidor API.
- Extender `src/escena/planetas.js`, `src/datos/cuerposCelestes.js` y sus pruebas; incorporar cuatro imágenes en `public/imagenes/satelites/`. Ajustar únicamente la integración, las etiquetas o las fichas que necesiten cambios para admitir los nuevos registros.
- Conservar el detector y el estado compartido de selección, la proyección de vista única, el perfil óptico HOMIDO GRAB, los controles y la limpieza de recursos. Actualizar las partes pertinentes de `README.md`.
- Antes de sincronizar este cambio, establecer la base del cambio completado de fichas, incluidos sus deltas de escena y VR. La especificación principal de escena ya existe; algunas notas antiguas dicen que no estaba sincronizada. Esta propuesta no modifica ni archiva los cambios anteriores ni las especificaciones principales.
