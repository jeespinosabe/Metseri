# Tasks

## 1. Escena base y ciclo de vida gráfico

- [ ] 1.1 Añadir `three` a `package.json` y actualizar `package-lock.json`; verificar la instalación con `npm ls three` y la compatibilidad del import de `StereoEffect` mediante `npm run build`.
- [ ] 1.2 Crear el motor en `src/escena/campoEstelar.js` y el componente `EscenaEstelar` en `src/componentes/escenaEstelar.jsx`, integrarlos en `src/App.jsx` y sustituir los estilos de plantilla por una escena de área completa; verificar en el navegador el fondo oscuro, la variación de estrellas, la ausencia de la bienvenida y la ausencia de peticiones a la API o a texturas externas.
- [ ] 1.3 Acotar el pixel ratio, adaptar el renderizador al contenedor, pausar al ocultarse y liberar recursos bajo `StrictMode`; incorporar mensaje y reintento ante fallo o pérdida del contexto, y verificar en navegador que un reintento deja un solo canvas y una sola instancia activa, sin controles de una escena fallida.
- [ ] 1.4 Documentar en `README.md` cómo ejecutar y comprobar la escena base, su carácter visual sin precisión astronómica y el alcance sin instalación ni uso sin conexión; verificar que los comandos documentados corresponden a los scripts reales.

## 2. Navegación manual y presentación adaptable

- [ ] 2.1 Implementar en `src/escena/controlesVista.js` el arrastre con Pointer Events, captura y cancelación, rotación horizontal completa, límites verticales y posición fija; añadir un script `test` con `node --test` y pruebas de límites de cámara, y verificar además en navegador arrastre con mouse, arrastre táctil y liberación con `pointercancel`.
- [ ] 2.2 Incorporar navegación con flechas cuando la escena tenga el foco y recentrado manual, sin interceptar los controles; verificar con teclado y con las pruebas de control que el foco y el recentrado no regeneran el cielo ni desplazan la página.
- [ ] 2.3 Adaptar los estilos y metadatos básicos de `index.html` a la experiencia en español, con foco visible, zonas táctiles y zonas seguras; documentar los controles manuales en `README.md` y verificar la vista normal en tamaños de escritorio, móvil vertical y móvil horizontal sin deformaciones ni scroll.

## 3. Presentación VR con pantalla dividida

- [ ] 3.1 Añadir los controles de entrada y salida y el renderizado con `StereoEffect` reutilizando escena, estrellas y orientación; verificar dos vistas proporcionadas y sincronizadas al redimensionar, y la conservación de dirección y estrellas al alternar modos.
- [ ] 3.2 Gestionar pantalla completa y bloqueo horizontal como mejoras opcionales, registrando qué estados adquirió la experiencia; añadir pruebas para solicitudes rechazadas, resultados tardíos y estados de pantalla preexistentes, y comprobar que VR sigue disponible cuando faltan ambas capacidades.
- [ ] 3.3 Incorporar salida con Escape y con el control visible, regreso a vista única al abandonar la pantalla completa adquirida y la indicación de giro en vertical; verificar las transiciones con pruebas y en navegador, incluidos ciclos repetidos sin perder controles ni dejar media pantalla sin dibujar.
- [ ] 3.4 Documentar en `README.md` el uso de la vista dividida y sus controles de salida, y la ausencia de calibración por modelo de lente; verificar que las instrucciones coinciden con la interfaz implementada.

## 4. Orientación del dispositivo y alternativa manual

- [ ] 4.1 Implementar en `src/escena/orientacionDispositivo.js` la conversión de `alpha`, `beta` y `gamma` a cuaterniones con corrección del ángulo de pantalla y alineación inicial; añadir pruebas para ejes, equivalencias entre vertical y horizontal, cruce de 359 a 0 grados, ceros válidos y rechazo de lecturas incompletas o no finitas, y verificar su ejecución con `npm test`.
- [ ] 4.2 Incorporar la activación del sensor desde el gesto de entrada a VR, antes de consumir la activación con pantalla completa, con permiso opcional y plazo de dos segundos de página visible tras habilitarse; verificar con pruebas los caminos de permiso concedido, rechazado, error, API ausente, navegador sin `requestPermission`, ausencia de eventos y permiso pendiente sin agotar el plazo.
- [ ] 4.3 Integrar seguimiento, recentrado y cambio a manual conservando la orientación completa; cancelar intentos al salir, iniciar entrada manual, desmontar o fallar el renderizado, y verificar mediante pruebas que ni promesas ni lecturas tardías reactivan el sensor o cambian la vista, incluidos intentos repetidos de entrada a VR.
- [ ] 4.4 Añadir avisos breves de alternativa manual y documentar en `README.md` el permiso de orientación y un procedimiento de prueba por HTTPS válido desde móvil; verificar el fallback con mouse y toque, el aviso accesible y que los pasos documentados no requieren la API Express ni añaden configuración PWA.

## 5. Verificación integrada del cambio

- [ ] 5.1 Ejecutar `npm test`, `npm run build` y `npm run lint` sobre el resultado integrado; verificar que pruebas y compilación pasan y que no se añaden errores de lint, diferenciando el fallo previo `server.js:3` por `process` sin modificar el servidor para corregirlo dentro de este cambio.
- [ ] 5.2 Comprobar el build de producción con la matriz de escritorio, Chrome en Android y Safari en iPhone por HTTPS: vista normal, VR, permiso aceptado y rechazado, control manual, recentrado, rotación, entrada/salida repetida y regreso desde segundo plano; registrar navegadores, dispositivos y resultados, y señalar expresamente como pendientes las pruebas físicas de móvil o visor que no puedan ejecutarse.
- [ ] 5.3 Revisar capturas frente a la referencia y el diff final: verificar estrellas discretas sobre fondo oscuro, controles mínimos, conservación del mismo cielo entre modos y cambios limitados a la escena, controles, metadatos, dependencias, pruebas y documentación relacionadas; comprobar nombres descriptivos en español y camelCase para funciones, métodos y archivos propios, con clases y componentes en español respetando su convención y las excepciones de plantilla o APIs externas, sin manifest, service worker, modificaciones de la API, commit ni push.
