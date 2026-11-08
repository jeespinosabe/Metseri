# Tasks

## 1. Datos exclusivos de vista previa y búsqueda

- [x] 1.1 Crear `src/datos/registrosBibliograficosEjemplo.js` con el modelo de presentación acordado y ejemplos sintéticos que cubran varias relaciones, campos opcionales ausentes y un libro sin asociar; verificar que todos sus cuerpos existen en el catálogo local y que la escena y sus fichas no importan estos ejemplos.
- [x] 1.2 Implementar en `src/administracion/registrosBibliograficos.js` la búsqueda por título o autoría y su combinación con el filtro por cuerpo; verificar con `node:test` mayúsculas, tildes, espacios exteriores, ausencia de coincidencias, relaciones múltiples y conservación de la colección original.

## 2. Contenedor protegido y navegación

- [x] 2.1 Sustituir la bienvenida de `ModuloAdministrativo` por la estructura del panel, aviso persistente de vista previa, navegación bibliográfica, regreso a la exploración y cierre de sesión; verificar que `/admin` y `/admin/` muestran el listado únicamente después del flujo de autenticación existente.
- [x] 2.2 Incorporar el estado de pantalla y registro activo manteniendo los filtros en el contenedor, sin añadir rutas ni almacenamiento de borradores; verificar que abrir un formulario y volver conserva los criterios y que cerrar sesión retira todo el estado temporal.
- [x] 2.3 Comprobar acceso sin sesión, credenciales incorrectas, acceso autorizado, recarga y cierre mediante el flujo existente y ejecutar `node --test api/pruebas/autenticacionAdmin.test.js`; documentar en `README.md` cómo acceder al panel y que sus registros son ejemplos sin guardado, sin incluir credenciales reales.

## 3. Listado y estados de consulta

- [x] 3.1 Crear `ListadoBibliografico` con título, autoría, editorial, año, todas las relaciones y acciones por registro; verificar con ejemplos que un libro con Tierra y Luna aparece una sola vez y que los campos ausentes muestran los textos definidos en la especificación.
- [x] 3.2 Integrar búsqueda, filtro por cuerpo, cantidad de resultados y limpieza de criterios; verificar en el panel que ambos criterios se combinan, que limpiarlos recupera la colección y que no se alteran los registros.
- [x] 3.3 Representar por separado colección vacía y búsqueda sin coincidencias, conservando Agregar libro o Limpiar filtros según corresponda; verificar ambos estados mediante colecciones explícitas en pruebas de representación con el patrón de Vite y `react-dom/server` existente, sin añadir un selector de datos al producto.
- [x] 3.4 Incorporar los estilos exclusivos del listado y la cabecera en `panelAdministrativo.css`, limitando ajustes de `App.css` a las reglas administrativas necesarias; verificar a 1440 y 360 píxeles que todos los datos y acciones se alcanzan sin desbordamiento horizontal ni cambios en la pantalla de acceso.

## 4. Formularios y relaciones temporales

- [x] 4.1 Crear `FormularioLibro` compartido por alta y edición con los cinco campos bibliográficos y un borrador independiente, copiando también sus relaciones; verificar alta vacía, edición con valores originales, cancelación y reapertura sin conservar cambios del borrador.
- [x] 4.2 Implementar validación visual al abandonar campos editados y al corregirlos: título, autoría y URL obligatorios, URL HTTP/HTTPS absoluta y año opcional entero de 1 a 9999; verificar casos válidos e inválidos con `node:test` y comprobar en la interfaz que cada mensaje se asocia a su campo.
- [x] 4.3 Crear `SelectorCuerposCelestes` reutilizando las doce identidades locales, agrupadas en planetas y satélites con su planeta principal; verificar por teclado selección y retirada de varios cuerpos, ausencia de duplicados, estado Sin asociar y cancelación sin afectar al listado.
- [x] 4.4 Presentar Guardar libro y Guardar cambios siempre deshabilitados con explicación visible y accesible, previniendo el envío nativo del formulario; verificar con campos válidos y con Enter que no aparecen mensajes de éxito, cambios en el listado, escrituras de red ni borradores persistidos.
- [x] 4.5 Completar presentación adaptable, foco inicial en el encabezado y retorno al listado con criterios conservados; verificar formularios de alta y edición a 360 y 1440 píxeles, recorrido con Tab y lectura de errores, y añadir al `README.md` los campos y el alcance temporal de las relaciones.

## 5. Confirmación de eliminación

- [x] 5.1 Crear `ConfirmacionEliminarLibro` como diálogo modal con título del libro, relaciones que se retirarían, Cancelar, cierre explícito y confirmación deshabilitada con explicación; verificar que se abre desde el registro correcto y que su apertura o intento de confirmación no modifica la colección ni envía escrituras.
- [x] 5.2 Integrar foco inicial en Cancelar, foco contenido en el diálogo, Escape y devolución del foco al botón de origen; verificar todos los cierres con teclado, registro sin asociaciones, conservación de filtros y desplazamiento del diálogo en móvil.
- [x] 5.3 Documentar en `README.md` que la acción Eliminar permite revisar la confirmación y que la eliminación real queda pendiente; verificar que la documentación coincide con el control deshabilitado y que no describe un borrado simulado como completado.

## 6. Verificación integrada de la interfaz

- [x] 6.1 Recorrer listado, filtros, alta, edición, selección de cuerpos y confirmación con teclado y a 360 y 1440 píxeles; comprobar en la red que las operaciones bibliográficas no realizan escrituras, conservando reales únicamente las operaciones de sesión, y registrar resultados y capturas en `verificacion.md` del cambio y `evidencias/panelAdministrativo/`.
- [x] 6.2 Ejecutar `npm test`, `npm run lint` y `npm run build`; registrar sus resultados y cualquier limitación en `verificacion.md`, distinguiendo las pruebas de representación de las comprobaciones reales de interacción y foco.
- [x] 6.3 Comprobar el regreso a la escena, apertura de una ficha y entrada/salida de VR sin mostrar ejemplos administrativos; revisar `git diff --check` y el alcance del diff para confirmar que no se han modificado API, base de datos, contratos públicos, credenciales o código ajeno al panel, y anotar la regresión en `verificacion.md`.
