# Tasks

## 1. Resolución de acciones sobre la tarjeta

- [x] 1.1 Extender `src/escena/contenidoFicha.js` para resolver primero controles explícitos y después las mitades locales de tarjeta, asignando el centro a Siguiente y consumiendo sin acción el retroceso inicial; verificar en `contenidoFicha.test.js` izquierda, derecha, centro, coordenadas externas y prioridad de pestañas/×.
- [x] 1.2 Mantener el control de avance al final con rótulo «Cerrar →» y una resolución compartida del cierre; verificar mediante pruebas que las páginas intermedias avanzan una sola página, las continuaciones no se saltan y el extremo final ofrece cierre en vez de una página inexistente.
- [x] 1.3 Integrar la resolución en `src/escena/fichaCuerpoVr.js` conservando impacto y oclusión incluso sin acción disponible; adaptar `fichaCuerpoVr.test.js` para apuntar mediante rayos a ambos lados, pestañas y cierre y comprobar que la mitad izquierda inicial no permite activar el cielo de detrás.

## 2. Ejecución, vigencia del tap y gestos

- [x] 2.1 Actualizar la ejecución de acciones en `src/escena/campoEstelar.js` para cerrar y quitar selección al avanzar desde la última página válida, usando la ruta de cierre existente; verificar con una prueba de integración que funciona tanto por mitad derecha como por control, conserva VR y orientación y no selecciona otro cuerpo en ese tap.
- [x] 2.2 Incorporar la revisión de composición de lectura y capturar acción efectiva, cuerpo y página en `prepararActivacion`; verificar con temporizadores controlados que mover la mirada conserva la acción capturada y cambiar cuerpo, página o composición por contenido/tamaño la descarta.
- [x] 2.3 Ampliar las pruebas de gestos para navegar y cerrar al completar un tap simple y para recentrar sin paginar/cerrar al completar dos taps dentro de 300 ms en la última página; verificar también las cancelaciones existentes, la precedencia de la instrucción inicial y la continuidad del sensor con `gestosVr.test.js` y las pruebas de controles pertinentes.

## 3. Puntero contextual con corrección óptica

- [x] 3.1 Derivar en `src/escena/campoEstelar.js` el estado visual de la acción efectiva y actualizarlo al cambiar mirada, lectura, contenido, instrucción, selección, tamaño, diagonal o modo; verificar que Anterior/Siguiente/cierre producen su símbolo y que no quedan figuras obsoletas al cerrar, cambiar de objetivo o volver a vista única.
- [x] 3.2 Extender `src/escena/efectoVisor.js` para dibujar cruz, flecha izquierda, flecha derecha y × mediante el shader existente, compartiendo figura entre ojos y conservando escala y centros ópticos; verificar con pruebas del renderizador que ambos ojos reciben el mismo estado y que cambiar de figura no altera sus parámetros ópticos.
- [x] 3.3 Verificar automáticamente los cuatro estados de puntero en ambos ojos, con diagonales de 5.5, 6.1 y 6.5 pulgadas, tamaños horizontales/verticales y dos densidades; comprobar coincidencia con la acción, escala y alineación óptica, registrando los resultados y el uso de renderizador simulado en `verificacion.md`, sin abrir navegadores ni aplicaciones externas.

## 4. Controles accesibles e indicaciones

- [x] 4.1 Actualizar únicamente la navegación VR de `src/componentes/fichaCuerpoCeleste.jsx` para habilitar el avance final con rótulo de cierre y conservar Anterior deshabilitado al inicio; ampliar `fichaCuerpoCeleste.test.js` y comprobar con teclado que cerrar retira la ficha y devuelve el foco a la exploración, manteniendo intacta la vista única.
- [x] 4.2 Actualizar las indicaciones de ficha en ambos ojos y la descripción accesible de `src/componentes/escenaEstelar.jsx`; verificar que explican mirar izquierda/derecha, cerrar al avanzar desde el final y el doble tap, sin seguir afirmando que tocar el texto conserva la página.
- [x] 4.3 Actualizar en `README.md` solo las instrucciones de navegación y prueba VR relacionadas; verificar que describen mitades de tarjeta determinadas por la mirada, prioridad de controles, primera página sin retroceso, cierre final y conservación del recentrado.

## 5. Comprobación integrada

- [x] 5.1 Ejecutar `npm test`, `npm run lint`, `npm run build` y `openspec validate mejorar-controles-tactiles-vr --strict`; registrar los resultados en `verificacion.md` y resolver los fallos atribuibles al cambio, conservando los requisitos de contenido publicado del cambio previo al revisar el requisito compartido.
- [x] 5.2 Recorrer mediante pruebas locales las fichas de Tierra y Luna en VR, con continuaciones y contenido disponible/en carga/error en tres tamaños; comprobar prioridad de pestañas y ×, avance y retroceso completos, extremos, toque lejano, retorno a exploración, doble tap, rotación/redimensionado y vista única, y registrar los resultados sin abrir navegadores ni aplicaciones externas.
