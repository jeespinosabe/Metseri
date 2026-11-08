# Tasks

## 1. Registrar la referencia y proteger el trabajo previo

- [x] 1.1 Guardar una captura de la ficha actual en navegador con el tamaño de ventana registrado y anotar el estado inicial de Git; verificar que la referencia permite comparar diseño y controles antes de implementar y distingue los archivos previos de `bd/`.
- [x] 1.2 Comprobar por lectura HTTP que las doce fichas públicas contienen descripción, dos curiosidades, cuatro datos editoriales e invitación, y cotejarlas con la carga corregida del PDF; registrar resultados y cualquier ausencia en `verificacion.md`, sin ejecutar SQL ni modificar Supabase.

## 2. Consultar y adaptar únicamente el contenido necesario

- [x] 2.1 Implementar la consulta relativa de una ficha y su adaptación en `src/servicios/consultaContenido.js`; verificar con pruebas de contrato que slug, nombre, tipo y planeta coinciden con la selección, el UUID no sustituye al ID local y no se reemplazan las imágenes o créditos.
- [x] 2.2 Preparar los datos editoriales para los espacios de etiqueta, valor y unidad sin recalcular cifras; verificar con pruebas que se reconstruyen los textos originales del día solar, los años aproximados y los datos de satélites, y que las ausencias conservan reservas sin ceros ni sustituciones.
- [x] 2.3 Integrar el ciclo de consulta en `escenaEstelar.jsx` para vista normal y VR compartiendo su contenido, con cancelación, plazo finito y descarte de resultados obsoletos; verificar cambio rápido de cuerpo, cierre, error, 404 y cambio de modo mediante pruebas controladas sin reabrir fichas ni mezclar contenidos.

## 3. Rellenar los contenedores existentes

- [x] 3.1 Rellenar descripción, clasificación, datos y curiosidades en `fichaCuerpoCeleste.jsx`, conservando elementos, clases, subtítulo ausente y recursos locales; verificar el renderizado de un planeta y un satélite y que el texto recibido se representa como texto, sin modificar CSS ni agregar controles.
- [x] 3.2 Mostrar la invitación de `contenido_ficha.descubrir_libros` en la sección bibliográfica actual; verificar mediante una prueba de renderizado que `libros: []` mantiene la invitación completa del cuerpo elegido, sin títulos, enlaces provisionales ni otro recorrido de navegación.
- [x] 3.3 Mantener los estados de carga/error y el cierre dentro de los espacios y controles actuales; comprobar selección, desplazamiento del panel, retorno hacia la información y foco al cerrar, incluyendo que la lectura accesible y el Canvas VR muestran el mismo contenido.

## 4. Conectar el entorno y documentar su uso

- [x] 4.1 Ajustar el proxy de Vite para resolver `PORT` del proceso/archivo local y el valor por defecto del servidor; verificar que una petición relativa llega al backend configurado y que el frontend no recibe variables o credenciales de Supabase.
- [x] 4.2 Actualizar las instrucciones relacionadas en `README.md` para iniciar API y frontend, explicar el relleno desde la base y la invitación sin catálogo, y describir el contenido compartido del visor y el tunel del puerto 5173; comprobar que los comandos documentados abren la aplicación y no exigen volver a cargar datos.

## 5. Verificar integración y regresiones

- [x] 5.1 Ejecutar las pruebas apropiadas del proyecto, `npm run lint`, `npm run build` y `npm run test:integracion`; registrar comandos, resultados y limitaciones reales en `verificacion.md`, sin presentar la consulta inicial de planificación como evidencia de la implementación.
- [x] 5.2 Probar en navegador un planeta y un satélite, cambio rápido, cierre y nueva selección, entrada/salida de VR y consulta con API detenida; verificar que la escena y los controles anteriores permanecen utilizables y cotejar todas las fichas reales mediante HTTP con sus contenidos publicados.
- [x] 5.3 Comparar el resultado con la captura inicial al mismo tamaño de ventana y revisar el diff; acreditar que no cambian hojas de estilo, distribución, colores, tipografía, imágenes, controles, optica del visor, base de datos o administración, y que los archivos previos se conservan.

## 6. Entregar las evidencias del alcance acordado

- [x] 6.1 Guardar capturas legibles de las fichas de un planeta y un satélite y de «Descubrir libros» en `evidencias/rellenarFichas/`; verificar que muestran contenido real, identidad correcta e invitación del PDF dentro del diseño existente.
- [x] 6.2 Ejecutar y documentar una demostración en navegador de selección → ficha → libros → regreso → cambio de cuerpo → cierre, con capturas de la ejecución o grabación si está disponible; vincular las evidencias a los cuatro criterios de aceptación en `verificacion.md` y validar este cambio con `openspec validate rellenar-fichas-con-contenido-publicado --strict`.

## 7. Rellenar las fichas del visor

- [x] 7.1 Compartir la respuesta de la API con el Canvas seleccionado y la lectura accesible, descartando actualizaciones de otro cuerpo; comprobar apertura directa en VR, entrada/salida de modo y cierre con pruebas de consulta y ficha.
- [x] 7.2 Componer descripcion, datos, curiosidades e invitacion con las medidas y controles actuales, y usar continuaciones cuando no quepan; probar los doce cuerpos en tres tamaños y verificar texto completo, limites y salto directo de las cuatro pestañas.
- [x] 7.3 Servir y comprobar la aplicacion en el puerto 5173 usado por el tunel, guardar capturas reales del contenido VR y actualizar el informe; ejecutar pruebas, lint, build y validacion estricta, distinguiendo la evidencia del navegador de una lectura fisica confirmada por la usuaria.

## Workflow follow-up

- Revisar la implementación y sus evidencias cuando las tareas estén completas; sincronizar y archivar solo con la instrucción correspondiente.
- Las pruebas de comodidad con visor físico, el rediseño movil y la comprobacion del catalogo permanecen en sus tareas posteriores; no forman parte del progreso de este cambio.
- No hacer commit ni push sin autorización expresa de la usuaria.
