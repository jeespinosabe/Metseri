# Verificación de incorporar-lunas

Fecha: 2026-11-01. Cambio implementado con el esquema `spec-driven`.

## Resultado

La escena incorpora Luna, Europa, Titán y Tritón, completando doce cuerpos explorables. Cada luna tiene superficie ilustrativa propia, etiqueta con su planeta principal, apuntado, selección y ficha local en vista única y VR. Se conservan los ocho planetas, sus posiciones, semillas de textura y anillos de Saturno.

Se reutilizan detector, selección global, materiales, geometría, etiquetas, ficha React y tarjeta VR existentes. No se añadieron dependencias ni cambios de API, Supabase, configuración óptica, órbitas o contenido editorial. Las instrucciones accesibles y las secciones relacionadas de `README.md` incluyen ahora las lunas.

## Comprobaciones automáticas

| Comprobación | Resultado |
| --- | --- |
| `node --test src/datos/cuerposCelestes.test.js` | 4 pruebas aprobadas: doce identidades, ocho planetas, cuatro relaciones, imágenes locales y campos pendientes. |
| `node --test src/escena/planetas.test.js` | 5 pruebas aprobadas: correspondencia con catálogo, doce objetivos individuales, posiciones previas, anillos/Titán, resaltado y liberación/recreación. |
| Pruebas de contenido de ficha, tarjeta VR, selección, mouse y controles con sensor | 52 pruebas aprobadas. Incluyen las cuatro fichas reales de satélite, proyección lateral, selección mixta y continuidad del sensor. |
| `npm test` | 158 pruebas aprobadas, 0 fallidas, 0 omitidas. |
| `npm run lint` | Aprobado. |
| `npm run build` | Aprobado; 41 módulos transformados. |

La compilación informa un archivo JavaScript de 821.54 kB, 223.00 kB con gzip, y el aviso de fragmento mayor de 500 kB. No se cambió la partición de código, por quedar fuera del alcance.

La primera ejecución de la suite dentro del entorno restringido no podía conectarse a sus servidores HTTP locales (`EACCES`). La ejecución completa con acceso a esos sockets terminó correctamente. No se modificó código del backend para resolver una restricción del entorno.

## Recursos de las fichas

Se verificó la apertura de las cuatro imágenes WebP con Pillow y su carga efectiva en el navegador. Las fotos fueron recortadas y reducidas para la ficha; no se usan como mapas de superficie 3D.

| Archivo local | Tamaño | Procedencia y crédito |
| --- | --- | --- |
| `public/imagenes/satelites/luna.webp` | 1 380 bytes | [Fotografía ISS068-E-039237](https://www.nasa.gov/image-article/full-moon-pictured-from-international-space-station/), NASA. |
| `public/imagenes/satelites/europa.webp` | 20 784 bytes | [Vista de Galileo PIA19048](https://science.nasa.gov/jupiter/jupiter-moons/europa/), NASA/JPL-Caltech/SETI Institute. |
| `public/imagenes/satelites/titan.webp` | 3 526 bytes | [Imagen de Cassini PIA11548](https://science.nasa.gov/saturn/moons/titan/), NASA/JPL/Space Science Institute. |
| `public/imagenes/satelites/triton.webp` | 26 628 bytes | [Mosaico Voyager 2 PIA00317](https://science.nasa.gov/neptune/moons/triton/), NASA/JPL/USGS. |

Los cuatro registros conservan URL del recurso, alternativa y crédito. Los valores numéricos siguen nulos; subtítulo, descripción, curiosidades y libros permanecen vacíos. Las fichas usan distancia al planeta y períodos de rotación/orbital propios de satélites.

## Comprobación en navegador

Aplicación servida por Vite en `http://127.0.0.1:5173/`, con los servidores API de los puertos 3000 y 3001 detenidos. Se utilizó el navegador integrado y sus ajustes de tamaño; los tamaños móviles son emulación de ventana, no emulación de sensores o de dimensiones físicas de pantalla.

| Vista | Recorrido y resultado |
| --- | --- |
| Escritorio 1440 × 900 | Selección directa y cierre de las doce fichas, con el nombre correcto en cada apertura. Revisión de superficies y separación de parejas, incluido Titán fuera de los anillos. |
| Vista única 650 × 704 | Selección y cierre de las doce fichas mediante coordenadas visibles y teclado. |
| Móvil vertical 390 × 780 | Selección de los doce cuerpos, imágenes locales cargadas y ficha correcta; revisión de las cuatro parejas y medición de etiquetas sin superposición entre luna y planeta. |
| VR horizontal 844 × 390 | Apuntado manual por teclado y arrastre, seguido de toque global lejos de la imagen, para seleccionar por separado los doce cuerpos. Ficha correcta en cada caso; secciones, lectura protegida y cierre disponibles. |

También se comprobó en vivo:

- Recentrar con Luna seleccionada conserva su ficha.
- Entrar en VR mantiene Luna y permite pasar a Libros. Recentrar conserva la sección 4 de 4.
- Mirar a Neptuno fuera de la tarjeta y tocar cierra la ficha de Luna sin seleccionar otro cuerpo; un segundo toque selecciona Neptuno.
- Salir de VR conserva Neptuno en su ficha normal.
- Un toque mientras se mira el área de lectura de Luna mantiene abierta su ficha.
- Las etiquetas de las lunas se dibujan en ambas vistas y la ficha conserva una sola lectura accesible. La alineación y lectura ópticas en equipo real se acreditan mediante la confirmación del usuario indicada abajo, no mediante la emulación de ventana.

Un arnés temporal, guardado fuera del código de producción en `.cache/`, observó recursos del navegador al consultar la ficha de Luna: ninguna petición a `/api/` o a orígenes externos, imagen local cargada, un lienzo y un contenedor de etiquetas. Las doce fichas comprobadas en móvil cargaron rutas locales de imagen. El arnés no forma parte de la compilación entregada.

Capturas locales de la revisión, excluidas de Git por `.cache/`: `verificacionLunas/saturnoTitanEscritorio.jpg`, `verificacionLunas/parejasMovil.jpg`, `verificacionLunas/lunaDatosVr.jpg` y las capturas de recuperación indicadas a continuación. Las imágenes de VR muestran una ventana de escritorio y no se usan para certificar comodidad o calibración física.

## Pérdida y recuperación de WebGL

Con Luna seleccionada, el arnés temporal invocó `WEBGL_lose_context.loseContext()` sobre el contexto gráfico real de la aplicación. Apareció el mensaje de interrupción con Reintentar y desaparecieron la ficha y sus acciones.

Al activar Reintentar se recuperaron los doce nombres: Tierra, Marte, Júpiter, Saturno, Neptuno, Urano, Mercurio, Venus, Luna, Europa, Titán y Tritón. El estado observado fue `ficha: null`, un lienzo, un único contenedor de etiquetas y ninguna petición a API u origen externo. Las pruebas de geometría complementan esta observación comprobando liberación única, reconstrucción estable y ausencia de halos residuales.

Evidencia local: `.cache/verificacionLunas/contextoPerdido.jpg` y `.cache/verificacionLunas/contextoRecuperado.jpg`. Un primer intento del arnés se ejecutó antes de que terminara de cargar el iframe; se repitió esperando la superficie de la aplicación. Ese error pertenecía al arnés temporal.

## Prueba física confirmada por el usuario

El usuario confirmó en esta conversación que el recorrido solicitado en la tarea 4.4 es correcto y se probó en los siguientes equipos. En un mensaje posterior precisó los navegadores, en el mismo orden:

| Equipo | Navegador | Resultado |
| --- | --- | --- |
| Motorola Edge 30 | Chrome | Correcto, confirmado por el usuario. |
| iPhone 17 Pro Max | Safari | Correcto, confirmado por el usuario. |

La pregunta de comprobación incluía las cuatro lunas con HOMIDO GRAB, apuntado y toque, lectura de fichas en ambos ojos, recentrado, entrada/salida, sensor y alternativa manual. Esta evidencia se atribuye al usuario; el agente no manipuló esos teléfonos ni el visor. No se proporcionaron versiones de navegador o sistema operativo.

## Estado de OpenSpec

Las 16 tareas del cambio están completadas. Los artefactos anteriores y las especificaciones principales no se modificaron. Antes de archivar o sincronizar este delta debe establecerse la base completada de `agregar-fichas-de-cuerpos-celestes`, incluida la capacidad `fichas-cuerpos-celestes` que todavía no existe en las especificaciones principales. La validación estricta informa esa dependencia de archivo.

No se realizaron commits ni push.
