# Tasks

Los grupos 1–8 registran la implementación inicial. El grupo 9 incorpora la revisión visual y los espacios de contenido solicitados después; sus criterios sustituyen los textos reales y el cierre por toque sobre la lectura de la primera versión.

## 1. Establecer la base de especificaciones

- [x] 1.1 Sincronizar mediante el flujo correspondiente los deltas del cambio completado `escena-planetaria` con las especificaciones principales, sin archivarlo automáticamente ni alterar sus artefactos; comprobar con `openspec list --specs` y lectura de las capacidades que existe `escena-planetaria` y se conservan los requisitos vigentes de selección, proyección, etiquetas, sensor y controles.
- [x] 1.2 Registrar el estado inicial de `npm test`, `npm run build` y `npm run lint` antes de implementar; contrastar el fallo previo de `server.js` documentado por el cambio base y dejar los resultados en la documentación de verificación del cambio, sin corregir archivos ajenos.

## 2. Contenido educativo y asociaciones configurables

- [x] 2.1 Crear `src/datos/cuerposCelestes.js` con los ocho identificadores actuales, descripciones propias de 30 a 50 palabras, cuatro datos con unidades y convenciones explícitas y una o dos curiosidades; cotejar cada registro con fuentes astronómicas primarias, conservar referencias y comprobar con `node:test` cobertura de los ocho cuerpos, límites de contenido y datos obligatorios.
- [x] 2.2 Incorporar ocho imágenes locales optimizadas en `public/imagenes/planetas/`, con nombres en español, texto alternativo, fuente y crédito individual; verificar que cada ruta corresponde a su planeta y carga localmente y que se puede presentar un estado alternativo ante fallo de imagen.
- [x] 2.3 Añadir la transformación de datos según tipo y las asociaciones inicialmente vacías de `src/datos/librosCuerposCelestes.js`; verificar con pruebas puras formato, unidades y criterios de los planetas, contrato de un satélite sintético sin introducirlo en producción y descarte de asociaciones sin título o URL HTTP/HTTPS válida.
- [x] 2.4 Documentar en `README.md` las convenciones de día, año y diámetro, la procedencia de imágenes/datos y dónde completar las asociaciones reales de la Biblioteca «Solón Argüello»; comprobar que los ejemplos coinciden con la estructura entregada y no aparentan registros reales de catálogo.

## 3. Apuntado por mouse e iluminación independiente

- [x] 3.1 Extender `seleccionPlanetas.js` y `campoEstelar.js` para apuntado por mouse con el detector y proyección inversa existentes, recalculando al mover, orientar y redimensionar; ampliar las pruebas de selección/proyección con mouse inmóvil, posición lateral, anillos de Saturno y prioridad del seleccionado, y comprobar que apuntar no selecciona ni abre contenido.
- [x] 3.2 Limpiar apuntado y posición al abandonar la superficie, entrar en un panel/control, cambiar de modo, ocultar la página, perder foco o cancelar el puntero; verificar con pruebas de eventos y revisión en navegador que la captura durante arrastre no deja hover residual, el toque no lo simula y toda selección previa permanece.
- [x] 3.3 Reutilizar los aspectos y etiquetas actuales para normal, apuntado y seleccionado; verificar visualmente que un seleccionado y otro apuntado coexisten, que al deseleccionar bajo el mouse o mirada queda únicamente el brillo transitorio y que después vuelve el aspecto normal. Actualizar las instrucciones de apuntado y selección de `README.md` según ambos modos.

## 4. Ficha React y sincronización de selección

- [x] 4.1 Exponer notificación de cambio de seleccionado y cierre explícito desde el campo, y enlazarlos con `EscenaEstelar` sin reconstruir la escena ni notificar cada hover a React; probar apertura, persistencia al apartar el apuntado, sustitución por otro cuerpo, cierre y reinicio de lectura al alternar modos.
- [x] 4.2 Crear `src/componentes/fichaCuerpoCeleste.jsx` con las cinco secciones, datos compartidos y el estado bibliográfico vacío acordado; verificar las ocho fichas en navegador, el contenido propio de cada una, imagen y alternativa de carga, descripción, cuatro datos, curiosidades e invitación completa.
- [x] 4.3 Añadir los estilos de panel lateral en escritorio e inferior en móvil y el desplazamiento interno; verificar en navegador a 1440 × 900 y 390 × 780 que se alcanza todo el contenido, los controles de escena y cierre quedan utilizables y desplazar o pulsar la ficha no arrastra ni selecciona el cielo.
- [x] 4.4 Incorporar región con nombre, texto alternativo, anuncio breve de cambio de cuerpo y acciones nativas con foco visible; verificar teclado, flechas dentro del panel, ausencia de lectura duplicada y devolución del foco al cerrar, y documentar los controles de lectura/cierre en `README.md`.

## 5. Tarjeta VR legible y estado de lectura

- [x] 5.1 Crear el estado compartido de lectura y la composición de páginas por presentación, datos, curiosidades y libros; probar límites, retroceso, reinicio al cambiar cuerpo/modo y conservación de página al recentrar, junto con distribución por líneas que no omita texto cuando necesite páginas adicionales.
- [x] 5.2 Crear `src/escena/fichaCuerpoVr.js` con plano y textura Canvas 2D alimentados por los mismos datos; verificar en navegador que `StereoEffect` muestra la misma página en ambos ojos, con nombre e indicador, imagen correcta, texto legible sin recortes y plano oculto en vista única, y probar las zonas de dibujo y liberación con el patrón de Canvas simulado existente.
- [x] 5.3 Situar la tarjeta fija en el entorno y orientada al observador, desplazada de la dirección de selección, y recuperar su posición al entrar en VR o recentrar; comprobar con sensor simulado y alternativa manual que puede recorrerse con la mirada sin cubrir inicialmente el planeta o dejar un control bajo la cruz, y registrar en `README.md` la ubicación y recuperación de lectura.
- [x] 5.4 Añadir una representación semántica única del contenido y las acciones VR; verificar que el contenido no se anuncia dos veces por las dos vistas y que las acciones accesibles por teclado comparten cuerpo y página con la tarjeta.

## 6. Acciones por mirada y toque del visor

- [x] 6.1 Integrar intersección de tarjeta y zonas accionables con el rayo central, resolviendo UV y límites de «Anterior», «Siguiente» y «Cerrar»; probar que las zonas corresponden al dibujo, los botones no disponibles no se activan, se usa el objetivo vigente al tocar y no se apunta a planetas ocluidos por la ficha.
- [x] 6.2 Aplicar prioridad de control de ficha sobre toque global usando la única ruta de activación de `controlesVista.js`; ampliar pruebas para paginar sin deseleccionar, cerrar una vez, no actuar por permanencia, clic aislado de visor, eventos derivados sin duplicación y arrastres que no paginan ni seleccionan.
- [x] 6.3 Conservar la deselección global al tocar sin una acción de ficha apuntada; verificar mirando texto, fondo, seleccionado y otro planeta, y comprobar que el primer toque cierra la ficha anterior y solo un toque posterior puede seleccionar otro cuerpo. Documentar en las instrucciones accesibles y `README.md` la prioridad de acciones.
- [x] 6.4 Extender las pruebas de sensor y controles para apertura, paginación y cierre con seguimiento activo o pendiente; verificar que un toque conserva el sensor, que arrastre confirmado/flechas pasan a manual y que las mismas acciones funcionan con permiso rechazado o sensor ausente, conservando recentrado y salida VR.

## 7. Accesos bibliográficos preparados

- [x] 7.1 Enlazar las asociaciones válidas con accesos identificados por título y mantener la invitación sin enlaces activos cuando estén vacías; verificar con registros sintéticos de prueba las ramas con/sin asociación y URL inválida en ambas presentaciones, sin agregar libros o destinos ficticios al contenido de producción.
- [x] 7.2 Implementar apertura explícita de ficha bibliográfica en vista única y, desde acción VR, apertura dentro del gesto más salida normal conservando la selección; verificar con destinos de prueba que no se propaga una activación planetaria, se liberan solo capacidades adquiridas y, si se bloquea la nueva pestaña, el enlace sigue disponible en la ficha normal.
- [x] 7.3 Completar la guía para incorporar título y enlace de fichas reales y explicar el comportamiento de «Descubrir libros» en pantalla y visor; revisar que `README.md` refleja las asociaciones vacías actuales y no promete búsqueda, existencias ni préstamos.

## 8. Ciclo de vida y comprobación integrada

- [x] 8.1 Integrar liberación de tarjeta, texturas, imágenes y eventos, e invalidación bajo demanda; comprobar con pruebas de recursos y navegador StrictMode, selección/cierre repetidos, cambios de modo, segundo plano, cargas de imagen tardías y pérdida de WebGL/reintento, sin renders continuos, fichas duplicadas ni estados anteriores recuperados.
- [x] 8.2 Ejecutar `npm test`, `npm run build` y `npm run lint` sobre el resultado completo; registrar resultados, distinguir fallos previos y verificar el recorrido integrado de ocho planetas con panel, hover, tarjeta, paginación y catálogo vacío sin solicitudes a Express ni a servicios remotos.
- [x] 8.3 Comprobar la versión compilada en escritorio y, con equipo disponible, móvil y visor por contexto seguro: lectura completa en ambos ojos, tamaño de letra, acciones con botón físico, sensor/permisos, alternativa manual, recentrado, vertical/horizontal y retorno de segundo plano; registrar dispositivos, capturas y toda comprobación física pendiente sin darla por acreditada con simulaciones.
- [x] 8.4 Revisar la coherencia de los tres deltas y el orden de sincronización base, ejecutar `openspec validate agregar-fichas-de-cuerpos-celestes --strict` y revisar el diff; verificar que solo se modificaron archivos necesarios para este cambio, se respetan nombres en español y no se realizó commit, push ni publicación.

## 9. Diseño de referencia y navegación VR revisada

- [x] 9.1 Adaptar la cabecera, miniatura, tipografía, datos en dos columnas y separadores a la imagen de referencia; comprobar Saturno en navegador y el panel en una pantalla móvil.
- [x] 9.2 Vaciar subtítulo, descripción, cifras y curiosidades de producción, reservando también libros; comprobar con pruebas que los ocho registros no exponen datos reales ni ceros ficticios y que permanecen nombre, imagen, etiquetas y unidades.
- [x] 9.3 Centrar la tarjeta VR y añadir pestañas con salto directo, flechas y cierre separado; comprobar intersecciones UV y navegación real de Datos a Libros con mirada y toque.
- [x] 9.4 Consumir los toques en la lectura sin cerrar ni paginar, manteniendo cierre explícito y deselección fuera de la tarjeta; comprobar selección y sección persistentes con pruebas y navegador.
- [x] 9.5 Ejecutar la suite, compilación y lint aplicables, revisar móvil/VR y guardar capturas actualizadas; registrar las limitaciones físicas y resultados sin atribuir comprobaciones nuevas a los informes de la versión anterior.
- [x] 9.6 Actualizar README, propuesta, diseño y deltas para la revisión; validar OpenSpec y comprobar que el diff solo incluye cambios relacionados, sin commit ni push.
