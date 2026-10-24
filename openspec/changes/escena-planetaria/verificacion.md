# Verificación de escena-planetaria

Fecha: 2026-10-24.

## Resultado automatizado

- `npm test`: 107 pruebas aprobadas, sin fallos. La base tenía 79 pruebas. Las pruebas de etiquetas y proyección cubren contornos circulares en escritorio, ultrapanorámico y vertical, inversión de coordenadas, selección lateral, etiquetas por ojo y separación respecto de los anillos y controles.
- `npm run build`: compilación aprobada. Vite conserva el aviso de un paquete JavaScript mayor de 500 kB; no se amplió el alcance para reorganizar dependencias.
- `npm run lint`: únicamente el fallo previo `server.js:3:14`, `process` no definido (`no-undef`), observado también antes de implementar. Los archivos nuevos y modificados de la escena no añaden errores.
- Las nuevas pruebas cubren intersecciones fuera del centro y con desplazamiento del lienzo, tamaño y orientación, cuerpo más cercano y anillos; independencia de mirada y selección; deselección global VR; gestos cancelados, varios dedos y clic aislado; sensor activo o pendiente conservado al tocar; cancelación al arrastrar; ocho cuerpos apuntables y liberación de recursos compartidos exactamente una vez.
- Las pruebas de cuerpos utilizan mallas y recursos reales de Three.js con Canvas 2D simulado. La apariencia se comprobó por separado en el navegador.

## Navegador de escritorio

Comprobado en el navegador integrado de Codex, con WebGL2, sobre el servidor de desarrollo y la versión compilada servida mediante `vite preview`. Se observaron áreas verticales y horizontales, incluidas 390 × 780 y 1100 × 550 en un marco de comprobación, y VR horizontal a pantalla completa.

| Caso | Resultado |
| --- | --- |
| Recorrido de los ocho cuerpos | Se observaron Tierra, Marte, Júpiter, Saturno, Neptuno, Urano, Mercurio y Venus en diferentes sectores y elevaciones. Se distinguen continentes, bandas, superficies rocosas y anillos. |
| Arrastre desde un planeta | Cambia la mirada sin seleccionar. Arrastrar un seleccionado conserva su selección. |
| Selección directa fuera de la cruz | La Tierra se selecciona en su posición desplazada, con iluminación y halo. |
| Recentrado y botones | Recentrar conserva la selección. Entrar/salir de VR no produce una activación planetaria. |
| Mirada en VR | El mismo cuerpo se resalta en ambos ojos, sin selección automática. |
| Toque alejado del objetivo | Clics en zonas vacías de ambas mitades seleccionan el cuerpo apuntado. |
| Deselección mirando el fondo | El toque quita la selección; al recentrar, el cuerpo muestra únicamente el resaltado de mirada. |
| Mirar otro cuerpo seleccionado el anterior | Primer toque deselecciona; segundo toque selecciona el nuevo cuerpo, con halo. |
| Vista vertical | Cada cruz permanece en su mitad y aparece la indicación para girar. Se mantienen los planetas y el control de salida. |
| Sensor sin datos utilizables | Aparece el aviso previsto y se puede apuntar y seleccionar con controles manuales. |
| Nombres de planetas | Etiquetas en español junto a los cuerpos; acompañan el giro, se ocultan fuera de vista y aparecen alineadas en cada ojo de VR sin bloquear los gestos. |
| Acabado de las referencias | Cuerpos con mayor presencia, iluminación con relieve y contorno suave; Saturno presenta bandas finas y separación de anillos. Las etiquetas muestran punto, guía, nombre y clasificación sin cápsula ni recuadro de exploración. Se revisaron vista única y VR. |
| Extremos en escritorio | A 1440 × 900, Marte y Venus conservan el contorno circular hacia ambos lados. En vista única se verificó también el clic lateral sobre la Tierra y su iluminación con halo. |
| Pérdida de WebGL y reintento | Se provocó una pérdida real con la extensión `WEBGL_lose_context`: aparece el error, se retiran el canvas y las cruces y Reintentar crea una única instancia sin selección residual. |
| StrictMode en desarrollo | Después de la creación/limpieza de efectos hay un solo canvas; pérdida de contexto y reintento vuelven a dejar una única instancia. |
| Pausa y dibujo bajo demanda | Con visibilidad de documento simulada y conteo de llamadas reales de WebGL, se verificaron cero dibujos en reposo, cero dibujos al seleccionar mientras está oculto, reanudación al volver y regreso al reposo. |

Se utilizó una página temporal de comprobación para tamaño, contexto y visibilidad; se retiró después de las comprobaciones. No se añadieron rutas de diagnóstico ni controles de pruebas a la aplicación.

Capturas guardadas como artefactos locales de esta conversación: `saturnoVr.png` y `tierraSeleccionadaVr.png`, en `C:/Users/jesus/.codex/visualizations/2026/10/24/01a16ebd-178a-76f3-a578-6191f27c3bc6/`.

## Comprobaciones físicas pendientes

No se dispuso de teléfono ni visor físico. Quedan pendientes Chrome en Android, Safari en iPhone, el botón táctil real del visor, la entrega real de orientación y permisos por HTTPS, la fusión óptica de las cruces y la fluidez en esos dispositivos. Las lecturas, los permisos y los eventos táctiles simulados no acreditan esas pruebas físicas. La pausa por visibilidad se verificó mediante simulación del estado del documento; no se presenta como prueba de suspensión del navegador por un sistema móvil.

El procedimiento para completarlas está en `README.md`. No se añadió WebXR, PWA ni funcionamiento sin conexión. No se realizó commit, push ni publicación.
