# Tasks

Las tareas se implementan cuando se solicite aplicar el cambio. Las comprobaciones con datos sintéticos no acreditan contenido publicado real. La falta de fichas públicas puede dejar pendiente la aceptación de contenido aunque la integración funcione.

## 1. Consulta pública y configuración de desarrollo

- [x] 1.1 Crear `src/servicios/consultaContenido.js` para consultar la ficha por slug y adaptar sus campos/libros, manteniendo UUID e identidad local separados; verificar con pruebas de Node los doce slugs, tipos y relaciones, valores nulos, cero válido, números inválidos y respuestas incompatibles.
- [x] 1.2 Incorporar cancelación, versión de solicitud, estados de carga/404/error y plazo máximo de doce segundos; verificar con respuestas diferidas que cerrar, cambiar selección o destruir invalida resultados anteriores y limpia los temporizadores, y que el reintento puede recuperarse.
- [x] 1.3 Alinear el proxy `/api` de Vite con `PORT` del proceso/entorno y el valor por defecto 3000; verificar acceso a `/api/estado` y `/api/admin/sesion` mediante Vite con el puerto configurado, y documentar en README el arranque de API/Vite sin exponer secretos al cliente.

## 2. Selección y ficha informativa en pantalla

- [x] 2.1 Conectar la consulta a la selección en `escenaEstelar.jsx`, compartir su resultado con la ficha y el puente VR y mantener la instancia de escena; verificar que cambiar modo, recentrar o redimensionar no duplica solicitudes y que Tierra → Luna con respuestas invertidas nunca mezcla contenido.
- [x] 2.2 Renderizar descripción, subtítulo opcional, datos y curiosidades remotos y sus estados de ausencia en `fichaCuerpoCeleste.jsx`; verificar carga, éxito parcial, 404, error, reintento y cierre con contenido correspondiente al cuerpo vigente, sin reservas permanentes ni datos del cuerpo anterior.
- [x] 2.3 Adaptar los formateadores de datos a las unidades publicadas y rótulos «Período de rotación»/«Período orbital», conservando distancias propias de cada tipo y señal retrógrada; actualizar las pruebas de datos para comprobar conversiones, cero/ausencia y que no se presenta rotación como día solar.
- [x] 2.4 Mantener imágenes, relaciones y créditos locales, reinicio de lectura al cambiar cuerpo y devolución de foco al cerrar; verificar con las pruebas existentes de selección y recursos, y una comprobación de teclado, desplazamiento del panel y ausencia de activaciones sobre el cielo.
- [x] 2.5 Actualizar README para explicar contenido público, campos no disponibles y navegación local/remota; verificar que los pasos descritos reproducen los estados implementados y no prometen doce fichas ya publicadas.

## 3. Descubrir libros y navegación de la ficha

- [ ] 3.1 Incorporar accesos internos «Ficha»/«Descubrir libros» y encabezados enfocables, conservando el panel desplazable y el estilo existente; verificar por teclado y tacto que se llega a cada sección, se conserva la selección y no hay desplazamiento horizontal a 320 px.
- [x] 3.2 Usar los libros incluidos en la ficha pública en lugar de las asociaciones locales vacías, validando título/URL y mostrando autoría, editorial y año disponibles; verificar con pruebas de asociaciones que se mantiene el orden, se descartan destinos inválidos y nunca se heredan libros de otro cuerpo.
- [x] 3.3 Incorporar el mensaje de ausencia de libros verificados y la invitación a la Biblioteca «Solón Argüello» solo tras una respuesta disponible; verificar casos con libros, sin libros y consulta fallida, sin confundir error con una lista vacía.
- [x] 3.4 Conectar apertura bibliográfica y resultado de bloqueo a la interfaz, conservando selección, protección de la pestaña de Metseri y salida de VR; verificar mediante pruebas de apertura válida/bloqueada y acción única, y documentar en README la nueva pestaña y la alternativa de enlace HTML.

## 4. Lectura del contenido publicado en VR

- [x] 4.1 Sustituir las reservas de `contenidoFicha.js` por descripción, datos, curiosidades, libros y estados compartidos; verificar mediante pruebas de composición que los doce cuerpos producen su propio contenido y que las reservas editoriales antiguas no ocultan una respuesta disponible.
- [x] 4.2 Incorporar distribución en páginas mediante medición de texto, conservando secciones identificables y acceso directo al inicio de Libros; verificar textos y títulos largos, listas con varias entradas y lienzos de 320 × 440, 750 × 624 y 900 × 1000, sin pérdida de texto ni invasión de controles.
- [x] 4.3 Actualizar `fichaCuerpoVr.js`, navegación y puente en `campoEstelar.js` para recibir contenido del mismo cuerpo sin recrear la escena, y resolver libros desde el estado remoto vigente; verificar con los dobles de Canvas la actualización tardía válida, pestaña activa, flechas, identidad compartida y zonas accionables correctas.
- [x] 4.4 Mantener sección/página al recentrar, sección válida al cambiar tamaño y reinicio de sección al cambiar modo, sin nuevas consultas; verificar regresiones de cierre, pérdida de contexto, imágenes/respuestas tardías y liberación única de recursos.
- [x] 4.5 Conservar mirada/toque, consumo del texto, doble tap y arrastre sin aperturas accidentales; ejecutar las pruebas de gestos, selección y ficha VR, y actualizar README con navegación por secciones/páginas y salida al abrir libros.

## 5. Contenido real y referencia editorial

- [x] 5.1 Crear una matriz de verificación de los doce slugs en `verificacion.md`, con identidad, relación, publicación, descripción, datos, curiosidades y libros, usando solo consultas públicas; verificar que se distinguen contenido incompleto, 404 y error, con fecha y evidencia sin credenciales.
- [x] 5.2 Con el contenido completado/publicado por su responsable, comprobar las doce fichas reales por API e interfaz y contrastar sus campos con las páginas 3–14 del PDF aportado; registrar diferencias de rotación/día solar y redondeo sin forzar equivalencias. Dejar esta tarea pendiente si faltan fichas o contenido: no cargar, publicar ni cambiar RLS automáticamente.
- [x] 5.3 Registrar la comprobación real de «Descubrir libros»: estado vacío cuando no hay asociaciones y apertura del destino cuando exista un libro verificado; identificar expresamente cualquier rama con libros reales aún no comprobada, sin sustituirla por evidencia de ejemplos sintéticos.

## 6. Verificación de integración y aceptación

- [x] 6.1 Ejecutar `npm test`, `npm run lint` y `npm run build`; registrar resultados y comprobar que se conservan las pruebas de API pública, autenticación administrativa, selección, sensores y visor, sin modificar componentes ajenos para ocultar fallos previos.
- [x] 6.2 Ejecutar `npm run test:integracion` con un cuerpo publicado y la colección Postman existente contra la API; registrar coincidencia de UUID/slug, resultados GET y ausencia de cambios en contratos o escrituras, distinguiendo libros reales de arreglos vacíos.
- [ ] 6.3 Verificar en escritorio, móvil y VR el recorrido selección → ficha → Descubrir libros → ficha/escena, además de API detenida, recuperación y selección rápida; registrar navegador/dispositivo, foco, orientación, sincronía entre ojos y resultado de apertura externa, indicando si la comprobación fue manual.
- [ ] 6.4 Relacionar los cuatro criterios de aceptación de la solicitud con pruebas/evidencia en `verificacion.md`, comprobar el alcance del diff y ejecutar `openspec validate integrar-fichas-publicadas-y-descubrir-libros --strict`; no marcar aceptación completa mientras falten contenido real o comprobaciones requeridas.

## Workflow follow-up

- Revisar la implementación mediante OpenSpec cuando se solicite verificarla; sincronizar las especificaciones y archivar solo después de resolver las tareas y dependencias de aceptación pendientes.
- Hacer commit y push únicamente con autorización expresa, conservando la identidad de autoría indicada por la usuaria y las aportaciones de los compañeros.
