# Proposal

## Why

Metseri ya permite reconocer y seleccionar los ocho planetas, pero esa selección todavía no ofrece información para aprender sobre ellos. Incorporar una ficha educativa y anticipar la interacción mediante iluminación al apuntar conecta la exploración del cielo con la consulta de libros físicos de la Biblioteca «Solón Argüello».

## What Changes

- Abrir una sola ficha al seleccionar Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano o Neptuno. Cambiar de selección actualiza su contenido; deseleccionar o cerrar la ficha elimina la selección persistente.
- Conservar la estructura de nombre e imagen, subtítulo, descripción, cuatro datos, «¿Sabías que...?» y «Descubrir libros», dejando vacíos los textos y valores editoriales hasta recibir el contenido definitivo.
- Conservar las etiquetas y unidades de los cuatro datos, con los valores de producción en blanco. Mantener preparado el contrato para satélites futuros sin añadir cuerpos a la escena.
- Añadir iluminación transitoria al pasar el mouse sobre un planeta en vista única y conservarla únicamente mientras siga bajo el mouse. Mantener el mismo comportamiento por la cruz del visor en VR. Apuntar no abre fichas; seleccionar conserva una iluminación distinta aunque se aparte el mouse o la mirada.
- Adaptar la ficha a la referencia visual: nombre grande, imagen pequeña arriba a la derecha, descripción reservada, datos en dos columnas y separadores discretos. En VR abrirla de frente y ofrecer cuatro pestañas de sección, flechas visibles y cierre independiente.
- Conservar navegación, selección y sensor. En VR, tocar la superficie de lectura mantiene la ficha abierta; los controles ejecutan solo su acción, el cierre explícito deselecciona y tocar mirando fuera mantiene la deselección global.
- Conservar las asociaciones bibliográficas configurables vacías y reservar el espacio de libros sin invitaciones, títulos ni enlaces ficticios. Los créditos de las imágenes se conservan aparte del contenido editorial.

No se incluyen nuevos cuerpos 3D, órbitas, animación automática, búsqueda o integración remota con el catálogo, préstamos, WebXR, PWA, uso sin conexión ni publicación.

## Capabilities

### New Capabilities

- `fichas-cuerpos-celestes`: Contenido educativo de los ocho planetas, ficha sincronizada con la selección, presentación en pantalla y visor, y asociaciones bibliográficas configurables con espacios editoriales vacíos y diseño conforme a la referencia.

### Modified Capabilities

- `escena-planetaria`: Extender el resaltado transitorio a mouse en vista única y mantener independientes apuntado, selección persistente y ficha. Esta capacidad está definida en el cambio completado `escena-planetaria`, todavía pendiente de sincronización con `openspec/specs/`; sus especificaciones son la dependencia explícita de este delta.
- `mobile-vr-mode`: Añadir acciones de la ficha mediante mirada y toque, coherentes entre ojos y con protección de los toques de lectura y prioridad sobre el toque global, conservando los controles y el seguimiento existentes.

## Impact

- Reutilizar React, Three.js, Canvas 2D y `node:test`, sin nuevas dependencias ni cambios en la API Express.
- Extender `seleccionPlanetas.js`, `campoEstelar.js` y su integración en `escenaEstelar.jsx`; aprovechar los materiales y el mapeo inverso de proyección existentes para mouse. Añadir módulos acotados de datos, ficha React y tarjeta VR, imágenes locales y estilos relacionados.
- Mantener recursos gráficos locales, dibujo bajo demanda y limpieza al desmontar, perder contexto o reintentar. Comprobar contenido, estados, gestos, navegación VR y accesibilidad; actualizar las instrucciones relacionadas en `README.md`.
- Resolver primero la sincronización de las especificaciones del cambio base `escena-planetaria`, sin modificar sus artefactos ni archivarlo automáticamente. Esta propuesta solo agrega planificación en su propio directorio.
