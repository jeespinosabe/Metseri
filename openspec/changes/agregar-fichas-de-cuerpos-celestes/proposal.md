# Proposal

## Why

Metseri ya permite reconocer y seleccionar los ocho planetas, pero esa selección todavía no ofrece información para aprender sobre ellos. Incorporar una ficha educativa y anticipar la interacción mediante iluminación al apuntar conecta la exploración del cielo con la consulta de libros físicos de la Biblioteca «Solón Argüello».

## What Changes

- Abrir una sola ficha al seleccionar Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano o Neptuno. Cambiar de selección actualiza su contenido; deseleccionar o cerrar la ficha elimina la selección persistente.
- Incluir las cinco secciones solicitadas: nombre e imagen representativa, descripción en español de 30 a 50 palabras, cuatro datos principales, una o dos curiosidades bajo «¿Sabías que...?» y la invitación «Descubrir libros».
- Mostrar para planetas diámetro en km, distancia media al Sol en millones de km, duración del día y duración del año con unidades terrestres y una convención de medición explícita. Preparar el modelo de contenido para satélites con distancia al planeta, período de rotación y período orbital, sin añadir satélites a la escena ni contenido lunar en este cambio.
- Añadir iluminación transitoria al pasar el mouse sobre un planeta en vista única y conservarla únicamente mientras siga bajo el mouse. Mantener el mismo comportamiento por la cruz del visor en VR. Apuntar no abre fichas; seleccionar conserva una iluminación distinta aunque se aparte el mouse o la mirada.
- Presentar la ficha como panel adaptable en vista única y como tarjeta legible en ambas vistas de VR, con el mismo contenido y navegación por páginas mediante mirada y toque, sin activación por permanencia.
- Mantener los gestos actuales: arrastrar no selecciona, el toque global VR deselecciona y los controles explícitos de la ficha ejecutan solo su acción. Leer o cambiar de página no interrumpe el sensor ni modifica la selección.
- Preparar asociaciones configurables entre cuerpos y fichas bibliográficas. Mientras no se proporcionen enlaces reales, mostrar la invitación a la biblioteca y un estado honesto de enlaces pendientes, sin inventar libros, disponibilidad, direcciones ni accesos ficticios.

No se incluyen nuevos cuerpos 3D, órbitas, animación automática, búsqueda o integración remota con el catálogo, préstamos, WebXR, PWA, uso sin conexión ni publicación.

## Capabilities

### New Capabilities

- `fichas-cuerpos-celestes`: Contenido educativo de los ocho planetas, ficha sincronizada con la selección, presentación en pantalla y visor, y asociaciones bibliográficas configurables con estado vacío.

### Modified Capabilities

- `escena-planetaria`: Extender el resaltado transitorio a mouse en vista única y mantener independientes apuntado, selección persistente y ficha. Esta capacidad está definida en el cambio completado `escena-planetaria`, todavía pendiente de sincronización con `openspec/specs/`; sus especificaciones son la dependencia explícita de este delta.
- `mobile-vr-mode`: Añadir acciones de la ficha mediante mirada y toque, coherentes entre ojos y con prioridad sobre el toque global, conservando los controles y el seguimiento existentes.

## Impact

- Reutilizar React, Three.js, Canvas 2D y `node:test`, sin nuevas dependencias ni cambios en la API Express.
- Extender `seleccionPlanetas.js`, `campoEstelar.js` y su integración en `escenaEstelar.jsx`; aprovechar los materiales y el mapeo inverso de proyección existentes para mouse. Añadir módulos acotados de datos, ficha React y tarjeta VR, imágenes locales y estilos relacionados.
- Mantener recursos gráficos locales, dibujo bajo demanda y limpieza al desmontar, perder contexto o reintentar. Comprobar contenido, estados, gestos, navegación VR y accesibilidad; actualizar las instrucciones relacionadas en `README.md`.
- Resolver primero la sincronización de las especificaciones del cambio base `escena-planetaria`, sin modificar sus artefactos ni archivarlo automáticamente. Esta propuesta solo agrega planificación en su propio directorio.
