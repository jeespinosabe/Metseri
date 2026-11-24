# Proposal

## Why

La información, los nombres y las formas de los cuerpos pierden definición en VR, y aumentar el ajuste de pulgadas no activa actualmente una compensación de calidad para toda la escena. La meta es que el visitante pueda leer e identificar con facilidad los doce cuerpos y su información, mediante un ajuste automático que preserve fluidez.

## What Changes

- Mantener Ajustar visor con la diagonal como único dato de configuración del visitante, junto con Guardar y Cancelar. Se descarta incorporar elecciones manuales de tamaño de lectura o calidad.
- Calcular automáticamente la resolución por ojo, el detalle de rasterización y los tamaños de texto a partir de las pulgadas declaradas, viewport, screen, DPR y límites gráficos.
- Compensar la pérdida de definición al aumentar las pulgadas, tanto en fichas como en nombres, relaciones de satélites, superficies, contornos, anillos y cielo.
- Adaptar las etiquetas al área útil del visor y separar los nombres de cada pareja. Si se abre una ficha, esta puede cubrir las etiquetas en su posición dentro de la vista.
- Separar composición lógica y resolución física del texto. Repartir el contenido en continuaciones cuando sea necesario para conservar una letra legible.
- Revisar resolución por ojo, muestreo y detalle de texturas de cuerpos y estrellas con un presupuesto común acotado, preservando la distribución e identidad visual.
- Incorporar las tres nuevas capturas aportadas como evidencia del antes y compararlas con un después equivalente; conservar también las dos capturas anteriores de fichas.
- Verificar automáticamente la transición entre 6.9, 7 y 8 pulgadas y repetir lectura, identificación de cuerpos y fluidez en los teléfonos disponibles.

## Capabilities

### New Capabilities

Ninguna. Se amplían cuatro capacidades existentes.

### Modified Capabilities

- `mobile-vr-mode`: calidad integral automática a partir de la diagonal, sin controles adicionales de calidad o tamaño.
- `fichas-cuerpos-celestes`: texto legible tras la proyección, resolución independiente y continuidad de la lectura durante el ajuste automático.
- `escena-planetaria`: nombres y relaciones legibles y cuerpos reconocibles al aumentar pulgadas, con etiquetas dentro del área útil.
- `immersive-starfield`: cielo definido y estable con la resolución automática, sin regenerar estrellas ni perjudicar lectura o fluidez.

## Impact

Áreas previstas: `src/escena/rendimientoEscena.js`, `efectoVisor.js`, `perfilVisor.js`, `fichaCuerpoVr.js`, `contenidoFicha.js`, `etiquetasVisor.js`, `planetas.js`, `campoEstelar.js`, su integración en `escenaEstelar.jsx` y pruebas relacionadas. No se prevén campos nuevos en `configuracionVisor.jsx`, dependencias nuevas ni cambios de API, datos publicados o ficha normal.

El [informe](informeNitidezVr.md) reúne el diagnóstico y las cinco capturas del antes. El [diseño](design.md) define la política automática y el [plan de tareas](tasks.md) su verificación. Se conserva el identificador del cambio para mantener su continuidad; su alcance ahora incluye toda la escena VR. Esta revisión es planificación, no implementación.
