# Verificación de agregar-fichas-de-cuerpos-celestes

## Revisión según la referencia visual

Esta revisión sustituye la presentación y los textos de la primera implementación, conforme a la nueva instrucción del usuario.

- **Contenido:** los ocho registros mantienen nombre, clasificación e imagen, con subtítulo y descripción vacíos, valores null y curiosidades sin entradas. La sección de libros también queda como espacio reservado. No se muestran textos de ejemplo, números científicos ni ceros ficticios.
- **Diseño:** cabecera con nombre grande y miniatura superior derecha, cuatro datos en dos columnas, unidades separadas, divisores discretos, curiosidades con icono y créditos aparte. Reservas estáticas y accesibles, sin animación de carga.
- **VR:** apertura al frente, cuatro pestañas con sección actual visible, flechas y × separados. Tocar la lectura no cierra ni cambia sección; mirar fuera mantiene la deselección global.
- **Pruebas:** 125 aprobadas, sin fallos. Se ajustaron los contratos de contenido vacío, límites de reservas, navegación absoluta por sección y consumo de toques; se conserva la cobertura previa de sensor y recursos.
- **Compilación:** npm run build aprobado; sigue el aviso previo de paquete mayor de 500 kB. npx eslint src aprobado. El error general ya conocido de server.js queda fuera del alcance.
- **Navegador:** comparación de Saturno con la referencia; marco móvil real de 390 × 780 y VR de 834 × 390 con pantalla completa denegada por el marco de prueba. Se verificaron cuatro reservas numéricas, ausencia de párrafos/cifras, desplazamiento propio y salto por las cuatro pestañas. En el visor de escritorio se apuntó a Datos y luego a Libros, activándolos con toque alejado del objetivo; la selección se mantuvo. Recentrar conservó la sección y tocar lectura no la cerró.
- **Capturas:** fichaSaturnoRevisada.png y fichaVrRevisada.png en C:/Users/jesus/.codex/visualizations/2026/10/24/01a16fd9-b191-7ae3-935d-27425d72223a/. Las capturas anteriores muestran la primera versión y no representan esta revisión.
- **Documentación:** propuesta, diseño, deltas, README y grupo 9 de tareas actualizados; validación estricta de OpenSpec y revisión de espacios aprobadas.

Se conservan pendientes las comprobaciones con teléfono y visor físicos. No se realizó commit, push, publicación ni archivo de cambios.

## Registro de la primera implementación

El registro siguiente corresponde a los criterios iniciales, anteriores al diseño de referencia y a la petición de dejar el contenido editorial vacío.


## Base antes de implementar

- `npm test`: 107 pruebas aprobadas, sin fallos.
- `npm run build`: aprobado; aviso previo de paquete JavaScript mayor de 500 kB.
- `npm run lint`: fallo previo y ajeno al alcance en `server.js:3:14`, `process` no definido (`no-undef`).
- Especificaciones de `escena-planetaria` sincronizadas sin archivar el cambio base. `openspec validate --specs`: tres capacidades aprobadas.

## Resultado automatizado

Fecha: 2026-10-24.

- `npm test`: 124 pruebas aprobadas, sin fallos; 17 comprobaciones nuevas sobre la base de 107.
- `npm run build`: aprobado. Se conserva el aviso de tamaño de paquete JavaScript mayor de 500 kB; no se amplió el alcance para reorganizar dependencias.
- `npx eslint src`: aprobado. `npm run lint` conserva únicamente el fallo previo de `server.js:3:14`.
- `openspec validate agregar-fichas-de-cuerpos-celestes --strict`: aprobado después de sincronizar las especificaciones base. `git diff --check`: sin errores de espacios.
- Nuevas pruebas: ocho registros y rutas de imagen locales, descripción de 30 a 50 palabras, curiosidades y fuentes, formato por tipo, rotación retrógrada, asociaciones válidas/vacías/inválidas y apertura antes de salir de VR; hover sin selección, eventos y limpieza; paginación a 320 × 440, 750 × 624 y 900 × 1000 sin pérdida de texto ni invasión de controles; UV, estado compartido, recursos, cargas tardías y etiquetas ocluidas; paginación/cierre con sensor activo o pendiente.
- Las imágenes oficiales de NASA se optimizaron a WebP, entre 5 y 35 kB cada una. Cada registro conserva URL original, página de referencia, texto alternativo y crédito. Los valores métricos siguen la tabla NSSDCA y los textos se contrastaron con las páginas individuales de NASA, enlazadas desde las fichas y el README.
- Se comprobó también el renderizado de la ficha React en presentación normal y VR con asociaciones bibliográficas sintéticas, únicamente en el proceso de prueba. No hay libros, destinos de ejemplo ni asociaciones bibliográficas reales en producción.

## Navegador y WebGL reales

Se utilizó el navegador integrado de Codex sobre desarrollo y la compilación servida por `vite preview` en localhost. Las páginas temporales de comprobación se retiraron al finalizar. Se emplearon áreas de contenido reales mediante marcos de 390 × 780 y 1440 × 900, además de VR a 834 × 390 y pantalla completa. Esto permite revisar diseño adaptable sin afirmar que se utilizó un móvil físico.

| Comprobación | Resultado |
| --- | --- |
| Ocho planetas, motor y React | Se seleccionaron Tierra, Marte, Júpiter, Saturno, Neptuno, Urano, Mercurio y Venus; la ficha mostraba su nombre y cuatro datos propios. |
| Mouse sin clic | El objetivo recibe brillo y etiqueta activa sin abrir ficha; al salir se retira el aspecto transitorio. |
| Selección independiente | La selección y ficha se conservan al apartar el apuntado; otro objetivo no sustituye el contenido por hover. |
| Lectura móvil y escritorio | Los ocho paneles se recorrieron a 390 × 780 y 1440 × 900 en la compilación; desplazamiento interno, biblioteca visible y ausencia de accesos ficticios. |
| Cierre y foco | El cierre retira la ficha y devuelve el foco al cielo. Las acciones permanecen separadas de los eventos de la superficie. |
| Imagen fallida | Se emitió un error de imagen y se observó la alternativa con el resto del contenido disponible. |
| Ambos ojos VR | Una misma tarjeta y página aparecen en ambas vistas, con imagen, texto, nombre, sección, indicador y controles; a 834 × 390 se distribuye en más páginas para conservar el texto. |
| Mirada más toque | La zona «Siguiente» se apuntó con el rayo real y se activó con coordenadas alejadas de ambas mitades, avanzando sin deseleccionar. Se alcanzó la última página. |
| Texto y cierre VR | Tocar mirando el texto aplicó la deselección global; apuntar a «Cerrar» y tocar quitó la selección una sola vez. |
| Etiquetas | Se detectó y corrigió una etiqueta HTML que atravesaba la tarjeta; solo se ocultan las etiquetas cubiertas. |
| Sensor simulado | La paginación pasó por el controlador real y mantuvo la fuente de orientación activa; lecturas posteriores siguieron dirigiendo la vista. La prueba automatizada cubre permiso pendiente y primera lectura. |
| Dibujo bajo demanda | Se contaron llamadas reales a `WebGL2RenderingContext.drawElements`: no hubo nuevos dibujos en reposo. |
| Visibilidad simulada | Al ocultar el documento mediante la simulación de visibilidad no hubo dibujos pese a cambiar orientación; al volver se redibujó. No equivale a una suspensión real del sistema móvil. |
| Pérdida real de WebGL | Se usó `WEBGL_lose_context`; el motor notificó una vez, React retiró ficha y controles, y Reintentar dejó un canvas nuevo sin selección residual. |
| StrictMode y recursos | Se observó un solo canvas en React; las pruebas de tarjeta verifican liberación única y rechazo de imágenes tardías. |

Las capturas `fichaEscritorio.png`, `fichaMovil.png` y `fichaVr.png` están en `C:/Users/jesus/.codex/visualizations/2026/10/24/01a16fd9-b191-7ae3-935d-27425d72223a/`. Muestran la compilación dentro de sus áreas de comprobación.

## Comprobaciones físicas pendientes

No se dispuso de teléfono ni visor físico. Quedan pendientes permisos reales y orientación por HTTPS en Android/iPhone, el botón táctil físico, fusión óptica, comodidad del tamaño de letra y fluidez en dichos equipos. Los eventos, sensores y visibilidad simulados no acreditan estas comprobaciones. El procedimiento está en `README.md`.

La sección bibliográfica se entrega deliberadamente sin enlaces reales, conforme a lo acordado. Su configuración y las ramas de presentación/apertura se comprobaron con datos sintéticos separados de producción. No se integró un catálogo remoto, PWA, WebXR ni publicación. No se realizó commit ni push, ni se archivó ningún cambio.
