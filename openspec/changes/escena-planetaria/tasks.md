# Tasks

## 1. Cuerpos planetarios y composición 360

- [x] 1.1 Crear `src/escena/planetas.js` con los ocho planetas, esferas de complejidad acotada, materiales y texturas locales, anillos de Saturno y una interfaz de liberación; verificar visualmente que cada cuerpo tiene volumen y apariencia reconocible, en especial Tierra, Júpiter y Saturno, sin solicitudes de modelos o imágenes remotas.
- [x] 1.2 Integrar los cuerpos y su iluminación base en `campoEstelar.js`, con posiciones estables a distintas elevaciones y sectores alrededor del observador; comprobar en navegador que se puede encontrar y apuntar individualmente a los ocho, que hay presencia delante, a los lados y detrás y que no cambian de posición al redimensionar o recentrar.
- [x] 1.3 Incorporar la liberación de geometrías, materiales y texturas planetarias al ciclo de vida existente, manteniendo recursos compartidos y dibujo bajo demanda; comprobar desmontaje/recreación bajo `StrictMode`, reintento tras pérdida de contexto y ciclos de modo sin duplicar cuerpos, canvas o recursos ni alterar las estrellas.
- [x] 1.4 Actualizar el alcance y la comprobación visual de `README.md` con los ocho planetas y su disposición compositiva sin escala astronómica; revisar que las instrucciones coinciden con el resultado y ya no afirman que la escena contiene únicamente estrellas.

## 2. Detección del objetivo, selección e iluminación

- [x] 2.1 Crear `src/escena/seleccionPlanetas.js` con detección por intersección sobre mallas planetarias y resolución de un único identificador por cuerpo, incluidos los anillos; añadir pruebas con `node:test` para coordenadas del lienzo fuera del centro y con desplazamiento respecto a la ventana, cambio de tamaño, orientación actualizada, impacto más cercano y exclusión de estrellas/halo, y verificar que pasan sin iniciar WebGL.
- [x] 2.2 Implementar estados independientes de planeta apuntado y seleccionado y las transiciones de vista única y VR de `design.md`; añadir pruebas para selección directa, cambio a otro, fondo, persistencia al apartar la mirada y deselección global VR mirando el fondo, el mismo planeta u otro, verificando que este último caso exige otro toque para seleccionar el nuevo objetivo.
- [x] 2.3 Implementar aspectos normal, apuntado y seleccionado con emisión y halo local, sin luces globales adicionales; verificar visualmente que ambos resaltados se distinguen, que deseleccionar bajo la mirada produce un cambio perceptible y que un seleccionado y otro apuntado pueden coexistir sin alterar las estrellas ni ocultar detalles de superficie.

## 3. Gestos de navegación y activación sin perder el sensor

- [x] 3.1 Separar pulsación pendiente y arrastre confirmado en `controlesVista.js`, con umbral inicial de 6 píxeles CSS y notificación `alActivar`; ampliar `controlesVista.test.js` para toque con pequeña oscilación, arrastre acumulado, recorrido de ida y vuelta, cancelación, pérdida de captura, botón secundario y segundo dedo, verificando que solo los gestos válidos activan una vez y que arrastrar nunca modifica la selección.
- [x] 3.2 Posponer el paso a manual hasta reconocer un arrastre real y conservar el comportamiento de las flechas; actualizar `controlesVistaSensor.test.js` para comprobar que `pointerdown` y el toque completo conservan el sensor activo o pendiente, que el arrastre parte de la última orientación visible y que lecturas o permisos tardíos siguen sin reactivar un intento cancelado.
- [x] 3.3 Resolver la activación de toques y clics derivados mediante una sola ruta, admitiendo el clic aislado del botón del visor; añadir pruebas de una única activación por pulsación, clic posterior a un arrastre ignorado y recuperación tras cancelaciones, y verificar que los eventos derivados no seleccionan y deseleccionan en el mismo gesto.
- [x] 3.4 Enlazar `alActivar` desde `EscenaEstelar` al motor y aplicar selección directa por posición en vista única; comprobar mouse y toque fuera del centro, fondo y cambio de planeta, además de arrastres sobre cuerpos y pulsaciones sobre las cruces, y verificar que los botones superpuestos solo ejecutan su acción.
- [x] 3.5 Actualizar la descripción accesible de la superficie y los controles de vista única de `README.md`; comprobar que se explican selección, deselección y diferencia entre toque y arrastre, que las flechas y el foco de los botones conservan su comportamiento y que la cruz continúa sin eventos ni foco propios.

## 4. Mirada y toque global en VR

- [x] 4.1 Integrar la detección por el eje de la cámara común al orientar, entrar en VR y activar, compartiendo objetivo y selección entre ojos e ignorando las coordenadas del toque; verificar con pruebas la selección del objetivo vigente y la conservación del seleccionado al cambiar de modo, junto con la limpieza del objetivo por mirada al salir.
- [x] 4.2 Ajustar la convergencia a la envolvente planetaria conservando las cruces centradas por mitad; comprobar visualmente ambos ojos en horizontal, vertical y tras redimensionar, incluyendo resaltado del mismo cuerpo, superficies/anillos reconocibles y ausencia de cambios inesperados al entrar o salir de VR.
- [x] 4.3 Comprobar en navegador el flujo completo: apuntar, tocar lejos del cuerpo en cada mitad para seleccionar, apartar la mirada y tocar para deseleccionar, y mirar otro planeta mientras hay selección para quitarla con el primer toque y seleccionarlo con el siguiente; verificar que el seguimiento continúa y repetir mediante la alternativa manual con sensores denegados o ausentes.
- [x] 4.4 Asegurar que recentrar y alternar modos conservan la selección sin activar el toque global, y que pérdida de contexto, desmontaje y reintento eliminan estados y gestos anteriores; verificar ciclos repetidos, retorno desde segundo plano y reintento sin selecciones residuales ni activaciones tardías.
- [x] 4.5 Actualizar `README.md` con resaltado por mirada, selección persistente, deselección global aun mirando fuera y prioridad de deselección antes de seleccionar otro planeta; incluir comprobación del botón real del visor y continuidad del sensor, y revisar que la guía coincide con ambos caminos, sensor y alternativa manual.

## 5. Verificación integrada

- [x] 5.1 Ejecutar `npm test`, `npm run build` y `npm run lint` sobre el resultado integrado; registrar resultados y distinguir cualquier fallo previo del proyecto sin ampliar el alcance a archivos ajenos.
- [x] 5.2 Verificar la versión compilada en escritorio y, con hardware disponible, móvil y visor por contexto seguro: ocho cuerpos, selección con mouse/toque, ambos ojos, botón real, permisos aceptados/rechazados, recentrado, orientación, cambios de modo y segundo plano; registrar navegadores, dispositivos y capturas, y dejar explícitamente pendientes las comprobaciones físicas que no puedan ejecutarse, sin darlas por acreditadas con eventos simulados.
- [x] 5.3 Revisar el diff y validar `escena-planetaria` con `openspec validate escena-planetaria --strict`; comprobar que los escenarios implementados cubren los tres deltas, que los nombres propios nuevos están en español según las convenciones del proyecto y que solo se modificaron escena, controles, pruebas y documentación relacionadas, sin commit ni push.

## 6. Nombres visibles y corrección de los extremos

- [x] 6.1 Incorporar nombres en español y etiquetas que sigan a los planetas, con ocultación fuera de vista, una copia por ojo en VR y sin interceptar gestos; verificar en navegador nombres, arrastre, recentrado y transición a VR, y actualizar `README.md`.
- [x] 6.2 Corregir la proyección de vista única para conservar los contornos circulares y adaptar los rayos de selección a su transformación inversa; verificar mediante pruebas contornos en formatos de escritorio, ultrapanorámico y vertical, inversión de coordenadas y clic lateral, y comprobar visualmente los extremos a 1440 × 900.
- [x] 6.3 Verificar etiquetas por ojo y conservación de la perspectiva VR, ejecutar la suite completa, compilación y lint, registrar resultados y actualizar propuesta, diseño y especificaciones para este alcance; comprobar 106 pruebas aprobadas, compilación correcta y únicamente el fallo de lint previo en `server.js`.

## 7. Acabado visual según las referencias

- [x] 7.1 Ajustar tamaño aparente, iluminación, bandas gaseosas, atmósfera y contorno activo; detallar los anillos de Saturno con bandas y separación, conservando la distribución y los ocho objetivos apuntables; verificar apariencia en navegador y las pruebas de geometrías, selección y liberación de recursos.
- [x] 7.2 Sustituir las cápsulas por etiquetas con punto, guía, nombre y clasificación, color activo y distribución por ojo en VR, sin recuadro de exploración; verificar en navegador y mediante una prueba del contorno de anillos y la separación de los controles, y documentar el resultado.
