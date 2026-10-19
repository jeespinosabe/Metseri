# Registro de verificación (tareas 5.2 y 6.2)

Fecha: 2026-10-18. Las comprobaciones de navegador se ejecutaron de forma automatizada con el protocolo de depuración de Chrome (CDP), en modo sin interfaz y con renderizado por software (SwiftShader). El build de producción (`npm run build`) se sirvió con `vite preview` en `http://localhost:4173`.

## Cierre de alcance del sprint

Por decisión de la persona usuaria (2026-10-18), **no se realizarán más pruebas ni ajustes en este sprint**. Con lo implementado se considera cubierto el entregable: durante su uso en un iPhone no observó errores de ejecución, y aprobó la escena y el puntero. El cambio queda en su estado actual (21/21 tareas completas) y **sin archivar**.

Lo siguiente queda **documentado para retomarse en un sprint posterior y no está verificado ni corregido**:

1. **Hallazgo del toque quieto:** un toque sin desplazamiento sobre la escena interrumpe el seguimiento con el sensor (ver «Hallazgo» más abajo). **No se aplicó la corrección** por decisión de la persona usuaria; el comportamiento actual se mantiene.
2. **Perfil del HOMIDO GRAB:** no se ha obtenido su perfil de Google Cardboard (URL del código QR) ni el modelo de teléfono con el que se usará. Sin él no se ajustó la separación entre vistas, la alineación vertical, la distorsión ni el campo de visión.
3. **Pruebas físicas:** teléfono colocado en el visor real, botón de acción, Chrome en Android y registro por caso en iPhone (ver «Pendiente o no acreditado»).

Estas tres líneas no deben leerse como comprobadas: la revisión del iPhone fue una impresión de uso, no un registro de pruebas por caso, y todo lo demás de este documento marcado como aprobado es verificación por software o simulada.

> **Límite general:** todo lo de este documento marcado como aprobado es **verificación por software o simulada**. Los eventos de sensor simulados, la emulación de pantalla táctil y los viewports emulados de un navegador de escritorio **no acreditan** la compatibilidad con hardware móvil ni con un visor real.

## Resultado resumido

| Entorno | Estado | Detalle |
| --- | --- | --- |
| Chrome 155.0.8059.79, escritorio (Windows 11), sin interfaz, **build de producción** | **Aprobado** | 7 suites automatizadas (incluido el puntero de cruz), todas correctas |
| Edge 155.0.4283.62, escritorio (Windows 11), sin interfaz, **build de producción** | **Aprobado** | Las mismas 7 suites, todas correctas |
| Chrome 155 con viewports de teléfonos 4.5"–5.7" emulados (ver «Visor HOMIDO GRAB») | **Aprobado (simulado)** | 7 viewports, división de pantalla, proporción de vistas y posición de la cruz |
| iPhone, Safari, por HTTPS (túnel) | **Revisión de uso por la persona usuaria** (escena, VR y puntero), sin errores de ejecución observados | Sin registro de modelo, versión de iOS ni resultados por caso; las pruebas físicas de 5.2 siguen sin acreditarse (ver «Pendiente») |
| Chrome en Android, dispositivo físico, HTTPS | **PENDIENTE** | No ejecutado |
| Visor HOMIDO GRAB real con teléfono colocado | **PENDIENTE** | No ejecutado: alineación óptica, escala, distorsión, comodidad y botón de acción sin comprobar |
| Firefox y Safari de escritorio | No ejecutado | Fuera de la matriz solicitada |

## Qué cubrieron las suites de escritorio (build de producción, Chrome y Edge)

- **Vista normal:** un solo canvas bajo `StrictMode`, fondo oscuro, sin la pantalla de bienvenida de la plantilla, sin peticiones externas, a la API ni a imágenes de textura, sin barras de desplazamiento.
- **Tamaños y rotación:** 1280×720, móvil vertical 390×780 y móvil horizontal 780×390 (emulación de Chrome), más rotación en caliente: el canvas cubre la vista, sin deformación y con controles dentro de la pantalla y zonas táctiles de al menos 44 px.
- **Control manual:** arrastre con mouse y táctil (emulado), liberación con `pointercancel`, flechas con la escena enfocada, flechas sin interceptar un botón enfocado, y recentrado que devuelve exactamente la imagen inicial.
- **VR:** dos vistas sincronizadas e idénticas, cada una con el aspecto de su mitad, redimensionado dentro de VR, conservación de dirección y estrellas al alternar, y ciclos de entrada y salida con clics reales sin perder controles ni dejar media pantalla sin dibujar.
- **Pantalla completa:** obtenida de verdad en estos navegadores; salida con botón, con `Escape` y desde el navegador devuelven a la vista única. También sin pantalla completa ni bloqueo de orientación disponibles.
- **Sensores:** eventos `deviceorientation` nativos mediante la emulación de sensores de CDP: seguimiento, primera lectura sin salto, recentrado con sensor, paso a manual al arrastrar y sin efecto de los movimientos tras salir de VR.
- **Permiso:** con un `requestPermission` simulado al estilo de iOS: concedido, rechazado (aviso y VR disponible, sin repetir la solicitud) y pendiente (sin agotar el plazo; un permiso tardío tras salir no reactiva el sensor). La petición se hace una sola vez, dentro del gesto y antes que la pantalla completa.
- **Fallos de renderizado:** pérdida de contexto y ausencia de WebGL muestran el mensaje con **Reintentar**, y tres reintentos seguidos dejan un solo canvas.
- **Alternativa manual:** sin sensores, el aviso breve aparece tras el plazo, es accesible (región `role="status"`) y desaparece solo; el arrastre con mouse y táctil sigue funcionando en VR.
- **Puntero de cruz (build de producción):** una cruz blanca de 24 px exactamente en el centro en vista única; en VR, dos cruces en el 25 % y el 75 % del ancho y el 50 % del alto, idénticas y sin cruzar la división, en cuatro tamaños incluida la vertical; una sola al salir y tras ciclos repetidos; se distingue de las estrellas (64 píxeles blancos frente a un máximo de 0 en cualquier otra región de 24×24); no es enfocable ni intercepta clics, toques, arrastre o teclado; no aparece con el error de renderizado y vuelve al reintentar.

Además: `npm test` (79 pruebas) para conversión de orientación, negociación del sensor, plazo con la página visible, cancelación de intentos, pantalla completa y bloqueo.

## Visor HOMIDO GRAB

### Información recibida y qué permite concluir

Datos del producto aportados por la persona usuaria (no verificados contra el fabricante):

- Lentes desarrolladas por Homido; certificación Google Cardboard (WWGC).
- Campo de visión de 100°.
- Teléfonos Android e iOS de 4.5" a 5.7".
- Clip para sujetar el teléfono y botón de acción.

| Dato | Uso permitido | Lo que NO permite |
| --- | --- | --- |
| Rango 4.5"–5.7" | Elegir viewports de prueba y acotar la aritmética de la geometría de pantalla. | Conocer la separación entre los centros de las lentes ni la posición del teléfono en el clip. |
| FOV 100° | Contrastarlo con el campo de visión que renderiza la aplicación. | Ajustar la cámara: no se sabe si es horizontal, vertical o diagonal, si es por ojo o total, ni si ya cuenta la distorsión. **No se ha cambiado ningún valor.** |
| Certificación Cardboard | Saber que el visor define un perfil de visor (distancia entre lentes, distancia pantalla–lente, alineación vertical, coeficientes de distorsión, campo de visión por lente). | Esos valores concretos: no están en la información recibida y **no se han supuesto**. |
| Botón de acción | Tenerlo en cuenta para los próximos sprints. | Saber cómo genera su señal (por ejemplo, un toque en la pantalla). |

### Comprobado por software (simulado, build de producción, Chrome 155)

Viewports en horizontal; los tamaños CSS son los publicados de cada modelo o genéricos en los extremos del rango. Cada fila pasó las cinco comprobaciones: lienzo a pantalla completa con dos cruces; vistas izquierda y derecha coincidentes (desfase entre ojos 0 px, error ≤ 0,06 %); cada cruz en el centro de su mitad; misma posición dentro de cada mitad; cruz nítida (blanco puro presente, 88 a 576 píxeles blancos según la densidad).

| Teléfono (simulado) | Viewport CSS @ densidad | Vista por ojo | Aspecto por ojo | FOV horizontal renderizado por ojo | FOV vertical renderizado | Ancho nominal de pantalla | Separación entre centros de mitades |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Genérico 4.5" 16:9 | 640×360 @1.5× | 320×360 | 0,889 | 63,8° | 70° | ~100 mm | ~49,8 mm |
| iPhone SE 2/3 · 8 (4.7") | 667×375 @2× | 333,5×375 | 0,889 | 63,8° | 70° | ~104 mm | ~52,0 mm |
| Pixel 2 (5.0") | 731×411 @2,625× | 365,5×411 | 0,889 | 63,8° | 70° | ~111 mm | ~55,4 mm |
| Galaxy S5 (5.1") | 640×360 @3× | 320×360 | 0,889 | 63,8° | 70° | ~113 mm | ~56,5 mm |
| iPhone 12/13 mini (5.4") | 812×375 @3× | 406×375 | 1,083 | 74,3° | 70° | ~125 mm | ~62,3 mm |
| iPhone 8 Plus (5.5") | 736×414 @3× | 368×414 | 0,889 | 63,8° | 70° | ~122 mm | ~60,9 mm |
| Genérico 5.7" 18:9 | 720×360 @2× | 360×360 | 1,000 | 70,0° | 70° | ~129 mm | ~64,7 mm |

Notas de lectura:

- Las dos últimas columnas y el FOV son **aritmética** con datos nominales (diagonal y relación de aspecto del viewport), no mediciones del visor ni del teléfono.
- **Criterio de posición de la cruz:** error ≤ 0,5 px CSS respecto al centro de su mitad. Con densidad 2,625× (Pixel 2) el error máximo fue 1,29 px de pantalla = 0,49 px CSS, el redondeo de la posición a píxel físico. Se expresó la tolerancia en px CSS después de ver ese resultado; el cambio es de unidad de medida, no de resultado.
- Con anchura impar (667, 731) cada mitad mide una fracción de píxel CSS; el desfase medido entre ojos fue de 0 px de pantalla.
- La densidad de píxeles del lienzo se limita a 1,5× (decisión de rendimiento), por lo que en pantallas de 2× a 4× la escena se reescala; la cruz es vectorial y no se ve afectada.

### Lo que NO se puede comprobar por software (y por qué las cruces centradas no validan la alineación óptica)

1. **Centro de la mitad ≠ centro de la lente.** La aplicación centra cada cruz en su mitad de pantalla. Un visor tiene una separación fija entre los centros de sus lentes; la separación entre los centros de las mitades depende del ancho del teléfono (de ~50 mm a ~65 mm en la tabla anterior, un rango de ~15 mm). Solo un teléfono cuya separación coincidiera con la del visor alinearía ambas cruces con los ejes ópticos, y cualquier diferencia es un desplazamiento horizontal igual para cada ojo. Se desconoce la separación de las lentes del HOMIDO GRAB.
2. **Alineación vertical.** El eje óptico de las lentes puede no coincidir con el centro vertical de la pantalla colocada en el clip. Se desconoce.
3. **Distorsión de las lentes.** La aplicación **no aplica corrección de distorsión** de lente (ni cromática): renderiza con una proyección estéreo básica. Corregirla exige los coeficientes del perfil del visor.
4. **Escala y campo de visión.** El campo vertical que renderiza la cámara es fijo (70°); el horizontal por ojo varía con la proporción del teléfono (63,8° a 74,3° en la tabla). Que la imagen tenga la escala correcta al girar la cabeza depende del campo de visión real de cada lente, no del «100°» anunciado; no se puede comprobar sin el visor ni sin sus parámetros.
5. **Dimensiones físicas del teléfono.** El navegador no expone el tamaño físico de la pantalla en milímetros; no se puede calcular por software la posición de las lentes respecto a la pantalla sin que la persona usuaria indique el modelo o calibre.
6. **Comodidad y legibilidad** con el visor puesto.

### Hallazgo: un toque quieto interrumpe el seguimiento con el sensor (relevante para el botón de acción)

Simulación (build de producción, 812×375 @3×, emulación táctil, sensor nativo emulado), con VR y sensor activos:

- Antes del toque, el sensor mueve la vista.
- Tras **un toque quieto, sin desplazamiento**, sobre la escena, el sensor **ya no mueve la vista**: la aplicación pasó a control manual hasta salir de VR y entrar de nuevo.

Causa: `controlesVista.js` pasa a manual en el `pointerdown`, no cuando el dedo empieza a moverse. La especificación habla de «comienza un arrastre»; un toque sin movimiento no lo es. Si el botón de acción del HOMIDO GRAB funciona como un toque en la pantalla (como el botón de un Cardboard convencional), pulsarlo en el visor detendría el seguimiento de la cabeza. **No se sabe cómo genera su señal el botón real**; esto es una simulación del toque, no una prueba con el botón. No se ha modificado el código. **Decisión (2026-10-18):** no se aplica ahora; se retoma en un sprint posterior, junto con el botón de acción. Corrección propuesta, sin aplicar: pasar a control manual cuando el dedo se desplace más de unos píxeles y no en el `pointerdown`.

### Parámetros que harían falta para ir más allá

- **Perfil de Google Cardboard del HOMIDO GRAB**: la URL contenida en su código QR (o los parámetros que muestra la aplicación Cardboard al escanearlo). Contiene la distancia entre lentes, la distancia pantalla–lente, la alineación vertical, los coeficientes de distorsión y el campo de visión por lente.
- **Modelo exacto del teléfono** (o su tamaño físico de pantalla) y cómo queda colocado en el clip.
- Para comprobar la alineación óptica: un teléfono colocado en el visor real (ver «Pendiente»).

## Pendiente o no acreditado (diferido a un sprint posterior)

Estas comprobaciones **no se han realizado** y no deben darse por aprobadas:

1. **Teléfono colocado en un HOMIDO GRAB real:** alineación óptica de las cruces y de las vistas con las lentes, posición vertical, escala al girar la cabeza, distorsión en los bordes, nitidez y comodidad.
2. **Botón de acción del visor:** qué señal genera y cómo reacciona la aplicación (ver el hallazgo).
3. **Dispositivos físicos por HTTPS:** Chrome en Android y Safari en iPhone con registro de modelo y versión; en iOS, el flujo real del permiso de orientación, la entrega real del giroscopio, y la compensación del ángulo de pantalla al girar el teléfono físico. La persona usuaria revisó la aplicación en un iPhone y la dio por satisfactoria visualmente; no hay un registro de pruebas con resultados por caso.
4. **iPhone en el visor:** Safari no ofrece pantalla completa ni bloqueo de orientación para una página; la barra de Safari y la muesca o isla dinámica en horizontal pueden afectar a la posición visible de cada mitad. No comprobado.
5. **Regreso desde segundo plano en un móvil real:** el cómputo del plazo con la página visible está probado con un reloj simulado, pero no con el cambio real de aplicación en un teléfono.
6. **Bloqueo de orientación horizontal** en Android con pantalla completa: la API existe pero no se comprobó su efecto físico.
7. **Contexto no seguro:** el camino `contexto-inseguro` está cubierto por pruebas unitarias; no se probó desde una IP local por HTTP.
8. **Fluidez con dos vistas** en teléfonos reales de gama baja.
