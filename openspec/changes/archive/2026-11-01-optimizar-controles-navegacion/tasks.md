# Tasks

## 1. Combinar navegación manual y seguimiento de orientación

- [x] 1.1 Cambiar `src/escena/controlesVista.js` para que arrastre y flechas actualicen la alineación del sensor activo en lugar de cancelarlo; verificar en `controlesVistaSensor.test.js` que el estado sigue siendo `sensor`, no aumentan las cancelaciones y las siguientes lecturas conservan el ajuste y responden al movimiento físico.
- [x] 1.2 Mantener vigente el intento durante permiso o primera lectura pendientes y alinear la primera lectura con la última vista manual; verificar con pruebas de arrastre y flechas durante ambas esperas, sin salto, aviso espurio ni nuevo permiso.
- [x] 1.3 Sustituir las pruebas que exigen el paso a manual por regresiones con lecturas intercaladas durante arrastre, balanceo, límites verticales, vueltas horizontales y recentrado después de ajustes; verificar también que fallo real conserva la vista y el aviso, y que salida, destrucción e intentos anteriores no reactivan el sensor. Ejecutar `node --test src/escena/controlesVista.test.js src/escena/controlesVistaSensor.test.js src/escena/orientacionDispositivo.test.js`.
- [x] 1.4 Actualizar los comentarios del controlador y los párrafos de sensores, selección y fichas en `README.md`; verificar que ya no afirman que arrastrar o usar flechas cancela el seguimiento y que describen la alternativa manual cuando no hay sensor utilizable.



## 2. Ajustar la guía de escritorio

- [x] 2.1 Condicionar la cruz de vista única mediante entrada principal precisa con hover en `punteroCruz.jsx`, su montaje o las reglas pertinentes de `App.css`; verificar en navegador escritorio ancho y estrecho sin cruz y con cursor, vista táctil con cruz y VR con sus dos cruces ópticas sin copias HTML adicionales.
- [x] 2.2 Actualizar la sección del puntero en `README.md` y comprobar visualmente apuntado y selección lateral, arrastre y teclado tras alternar modos; verificar que las coordenadas del mouse siguen eligiendo el cuerpo visible y que la documentación distingue escritorio, tacto y visor.



## 3. Botones por modo, instrucción inicial y doble tap

- [x] 3.1 Mantener Recentrar y Entrar VR en vista normal, y únicamente Ajustar visor y Salir de VR abajo en VR. Retirar todos los botones de navegación de la escena. Conservar el formulario anterior de ajuste, su validación y persistencia.
- [x] 3.2 Añadir doble tap en VR para recentrar sin seleccionar, deseleccionar ni paginar. Distinguirlo del tap simple mediante una espera breve, capturar el objetivo al tocar y cancelar acciones pendientes ante arrastre, cancelación, pérdida de foco, cambio de modo o destrucción. Conservar selección, sección y sensor activo o pendiente.
- [x] 3.3 Mostrar en ambos ojos al entrar en VR «Pulsa tap para seleccionar. Pulsa dos tap para recentrar.». El primer tap en cualquier punto cierra la instrucción sin seleccionar; volver a entrar la muestra de nuevo. Verificar adaptación y limpieza de recursos.
- [x] 3.4 Actualizar pruebas y README al flujo final y comprobar selección normal inmediata, tap VR, doble tap, botón del visor simulado, cancelaciones y continuidad del sensor.

## 4. Verificar la integración final

- [x] 4.1 Ejecutar npm test, npm run lint, npm run build y validación estricta de OpenSpec; verificar resultados y diff limitado al alcance.
- [x] 4.2 Revisar en navegador los botones por modo, instrucción y primer tap, recentrado por doble tap, ajuste y conservación de fichas; sustituir la evidencia visual del flujo anterior.
- [x] 4.3 Registrar validación física con teléfono y visor cuando estén disponibles; si no lo están, dejar expresamente pendientes sensor real, botón físico, comodidad y alcance con visor, sin acreditarlos mediante simulaciones.

