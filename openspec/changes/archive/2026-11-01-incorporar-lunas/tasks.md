# Tasks

## 1. Catálogo e imágenes de los satélites

- [x] 1.1 Incorporar imágenes verificadas de Luna, Europa, Titán y Tritón como `public/imagenes/satelites/{luna,europa,titan,triton}.webp`; comprobar que cada archivo se abre, pesa menos de 100 000 bytes y dispone de URL de origen, crédito y alternativa propios del recurso elegido.
- [x] 1.2 Añadir los cuatro registros en `src/datos/cuerposCelestes.js` con `tipo: 'satelite'`, `planetaId`, `planetaPrincipal`, clasificación con relación visible, imágenes y valores editoriales vacíos; actualizar `cuerposCelestes.test.js` y ejecutar `node --test src/datos/cuerposCelestes.test.js` para verificar doce identidades únicas, ocho planetas, las cuatro relaciones correctas, recursos locales y rótulos/unidades por tipo sin datos o libros inventados.
- [x] 1.3 Actualizar el apartado de fichas educativas de `README.md` con los cuatro satélites, sus campos y las rutas de imágenes; verificar que documenta distancia al planeta y el estado editorial vacío sin introducir dependencia de la API.

## 2. Modelos y distribución de doce cuerpos

- [x] 2.1 Extender la colección de `src/escena/planetas.js` con las cuatro lunas al final, usando como punto de partida las posiciones y radios del diseño; ampliar `planetas.test.js` y ejecutar `node --test src/escena/planetas.test.js` para comprobar doce grupos y etiquetas en correspondencia con el catálogo, relación con su planeta y conservación de las ocho posiciones previas.
- [x] 2.2 Incorporar las cuatro variantes de textura determinista mediante Canvas 2D, reutilizando esfera, materiales y halo; inspeccionar las cuatro lunas en el navegador para verificar rasgos propios y volumen con iluminación base y que las superficies de los ocho planetas no cambian.
- [x] 2.3 Ampliar las pruebas geométricas de `planetas.test.js` para apuntar individualmente a los doce centros con las mallas reales y a los anillos de Saturno; comprobar mediante rayos que Titán es un objetivo separado y ajustar solo la composición de las nuevas lunas si alguna queda oculta.
- [x] 2.4 Integrar las lunas en los estados de aspecto y los registros de recursos existentes; ampliar las pruebas de resaltado, selección, liberación idempotente y recreación para incluirlas y comprobar que todos sus recursos se liberan una sola vez y la nueva instancia conserva doce posiciones sin halos ni selección residuales.
- [x] 2.5 Actualizar la descripción de escena y alcance de `README.md` para reflejar ocho planetas y cuatro satélites estáticos, identificando las cuatro parejas; revisar que se retira la exclusión antigua de lunas y se conservan las limitaciones de escala y movimiento.

## 3. Etiquetas, selección y fichas en ambos modos

- [x] 3.1 Integrar las etiquetas de las lunas en pantalla y visor con nombre y «Satélite de …»; revisar cada pareja completamente visible en escritorio, móvil vertical y VR horizontal y ajustar solo lo necesario en posiciones o presentación para obtener nombres separados, relaciones legibles, Titán fuera del contorno de anillos y ninguna interferencia con gestos o tarjeta.
- [x] 3.2 Verificar las cuatro fichas con los registros reales del catálogo en React y VR, reutilizando su estructura; ampliar `contenidoFicha.test.js` y, si es necesario, `fichaCuerpoVr.test.js` para comprobar relación planetaria, cuatro páginas, datos propios de satélite, contenido reservado e identidad correcta al pasar de planeta a luna y viceversa. Ejecutar `node --test src/escena/contenidoFicha.test.js src/escena/fichaCuerpoVr.test.js`.
- [x] 3.3 Ampliar las pruebas de interacción pertinentes en `seleccionPlanetas.test.js` y `apuntadoMouse.test.js` con selecciones mixtas planeta/satélite y una luna lateral; comprobar una única selección/ficha, clic directo alineado con la proyección, mirada sin activación, toque global VR con deselección prioritaria y ausencia de selección durante arrastre. Ejecutarlas junto con `controlesVistaSensor.test.js` para conservar el sensor al tocar.
- [x] 3.4 Actualizar los recorridos de controles y comprobación de `README.md` con selección individual de las lunas, lectura de su planeta principal, navegación y cierre en visor; verificar que las instrucciones cubren los doce cuerpos y preservan la diferencia entre selección directa y toque global VR.

## 4. Validación integrada

- [x] 4.1 Ejecutar `npm test`, `npm run lint` y `npm run build` sobre el resultado completo; registrar comandos, resultados y cualquier limitación en `verificacion.md` de este cambio, sin presentar estas pruebas como validación física del visor.
- [x] 4.2 Comprobar en navegador escritorio ancho, móvil vertical y VR horizontal con el servidor API detenido: recorrer y seleccionar los doce cuerpos, revisar sus etiquetas, las cuatro fichas de satélite, imágenes y créditos, cambios de selección, lectura, cierre, recentrado y alternancia de modos; registrar tamaños, navegador y resultados y verificar que no hay consultas a la API ni carga remota de imágenes.
- [x] 4.3 Comprobar pérdida de contexto WebGL y reintento con una luna seleccionada; registrar que durante el error se retiran ficha y acciones y que el reintento recupera los doce cuerpos sin apuntado o selección anterior, sin duplicar etiquetas, lienzos o interacciones.
- [x] 4.4 Validar en móvil físico con HOMIDO GRAB el apuntado individual de las cuatro lunas, legibilidad en ambos ojos, toque de selección y ficha con sensor y con alternativa manual, junto con recentrado y entrada/salida; registrar dispositivo, navegador y resultado. Si no se dispone del equipo, dejar esta tarea pendiente y explicar la limitación en `verificacion.md`.

La sincronización futura de este cambio depende de incorporar primero los deltas del cambio completado `agregar-fichas-de-cuerpos-celestes`, como se detalla en el diseño. Estas tareas no autorizan modificar ni archivar los cambios anteriores.
