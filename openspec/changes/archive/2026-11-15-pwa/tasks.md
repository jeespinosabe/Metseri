# Tasks

## 1. Instalación y archivos de la aplicación

- [x] 1.1 Integrar `vite-plugin-pwa` compatible con Vite 8 y generar el manifest y los iconos a partir del logo de Metseri. Ejecutar `npm run build` y comprobar en la salida los tamaños de icono, la variante `maskable`, el punto de inicio, el modo `standalone` y las referencias desde el HTML.
- [x] 1.2 Generar y registrar el service worker de producción con precaché de la interfaz y de las doce imágenes WebP. Limitar el respaldo HTML a la raíz y conservar la activación diferida entre versiones. Comprobar el inventario del build y, con el worker activo, verificar la reapertura local sin red y que las rutas `/api/` y `/admin` pasan a la red.
- [x] 1.3 Actualizar `README.md` con el arranque del build para pruebas, los orígenes seguros y la instalación desde los controles del navegador. Seguir las instrucciones en un origen limpio y verificar que el manifest, el worker y la API pública responden en las rutas documentadas.

## 2. Preparación de las fichas y recomendaciones

- [x] 2.1 Reutilizar los clientes públicos y sus validadores para las consultas individuales y la descarga. Comprobar las rutas por slug, la selección de recomendaciones, la aceptación de `[]` y la distinción entre fallo de transporte, respuesta HTTP, datos incompatibles y cancelación en los tests de los servicios.
- [x] 2.2 Implementar la lectura y el reemplazo transaccional de una copia compatible en IndexedDB. Verificar que conserva los doce pares tras cerrar y reabrir, rechaza copias incompletas o incompatibles y preserva la copia válida ante una escritura fallida o una actualización simultánea más antigua.
- [x] 2.3 Integrar la descarga por lotes desde vista única con estados accesibles de progreso, finalización, error y reintento. Comprobar que se descargan los 24 recursos públicos sin abrir fichas y que el mensaje de disponibilidad exige tanto el worker activo como la escritura completa. Simular una respuesta inválida, una ficha no publicada y una interrupción durante la actualización con una copia previa.
- [x] 2.4 Documentar cómo descargar, actualizar y volver a abrir Metseri en el mismo contexto, incluida la primera descarga dentro de la app ya instalada en iPhone. Seguir los pasos en un build de prueba y verificar que la fecha y el progreso coinciden con el estado real.

## 3. Lectura de la copia en vista única y VR

- [x] 3.1 Integrar la lectura por slug cuando una consulta no recibe respuesta por fallo de transporte. Verificar resultados correctos para los doce slugs, prioridad de datos en línea, errores HTTP 404 y 503, datos inválidos y ausencia de copia. Comprobar que una lectura tardía se descarta al cambiar de cuerpo o cerrar.
- [x] 3.2 Mostrar la etiqueta y fecha de descarga en los espacios de ficha y de recomendaciones correspondientes en pantalla y VR. Verificar contenido, imágenes, estados vacíos, controles y una sola lectura accesible en el visor, incluidos ambos ojos y los fallos independientes de ficha y libros.

## 4. Verificación de la experiencia completa

- [x] 4.1 Instalar desde un origen seguro en Windows, Android y macOS. Descargar sin abrir fichas previamente, cerrar y reabrir desde el icono en modo avión. Comprobar la escena 360, fichas de planeta y satélite con sus imágenes, datos y recomendaciones, y la entrada, lectura y salida de VR en móvil. Volver a conectar y comprobar que las nuevas consultas muestran la respuesta en línea.
- [x] 4.2 Servir dos builds consecutivos en el mismo origen. Confirmar que el segundo no recarga una sesión de exploración o VR abierta y que al cerrar y volver a abrir arranca la versión nueva con la copia educativa compatible. Con el worker activo comprobar que `/api/estado`, las consultas públicas y el acceso administrativo conservan su flujo de red y que el contenido administrativo queda fuera de la copia.
- [x] 4.3 Ejecutar `npm test`, `npm run lint` y `npm run build`. Confirmar que las consultas usan URLs relativas bajo `/api` y que el proxy local y la regla de Vercel las resuelven en sus respectivos entornos. Reportar los resultados de la matriz de navegador y dispositivo.

Verificación local con Edge de escritorio (Chromium) y datos de prueba. Pasaron el arranque sin red, la lectura en pantalla y VR y la actualización entre dos builds. El despliegue público de prueba respondió a las 24 consultas educativas. La tarea 4.1 se completó con la verificación del usuario en Windows, Android y macOS.
