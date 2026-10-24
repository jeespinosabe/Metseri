# Design

## Context

Ver `proposal.md` para la motivación y los tres deltas de `specs/` para el comportamiento acordado. El usuario confirmó ocho planetas actuales, contrato preparado para satélites futuros, asociaciones bibliográficas inicialmente vacías y ficha dentro de ambas vistas del visor.

La aplicación usa React, Vite, Three.js directo y `node:test`. `EscenaEstelar` crea el campo, enlaza los controles y administra modo, avisos y errores. `campoEstelar.js` conserva una cámara, `StereoEffect`, dibujo bajo demanda y selección interna. Su notificación de selección solo actualiza materiales y etiquetas; todavía no comunica el cuerpo seleccionado a React. `seleccionPlanetas.js` mantiene `planetaApuntado` y `planetaSeleccionado`: el apuntado solo se calcula en VR. Ya existen tres aspectos visuales en `planetas.js`, selección directa por coordenadas, deselección global VR y separación entre toque y arrastre sin cancelar el sensor.

La vista única emplea una proyección estereográfica propia. `crearDetectorPlanetas` ya recibe la transformación inversa desde `proyeccionVista.js`; un detector de mouse nuevo debe reutilizarla. Las etiquetas HTML actuales se duplican por ojo, pero no ofrecen controles ni lectura extensa. No hay contenido educativo, fotografías locales de planetas, catálogo bibliográfico ni infraestructura de pruebas de componentes en navegador. `App.css` mantiene la página fija y la superficie con `touch-action: none`.

Las especificaciones principales aún representan la primera escena estelar. El cambio completado `escena-planetaria` contiene la base planetaria y deltas sobre las dos capacidades principales, pero no se ha sincronizado. Se conservará su ruta de capacidad; la sincronización base será un paso explícito previo de implementación. En esta propuesta no se modifican especificaciones principales ni el cambio anterior.

## Goals / Non-Goals

**Goals:**

- Mantener una selección autoritativa y un contenido educativo compartido por React y VR.
- Hacer recorrible toda la ficha con el único botón táctil del visor y los controles de mirada existentes.
- Reutilizar materiales, detección, gestos y sensor sin actualizar React por cada movimiento del mouse o lectura de orientación.
- Mantener costes acotados de imágenes, texturas y redibujado, con limpieza y reintento seguros.

**Non-Goals:**

- Crear una biblioteca general de interfaces VR, un nuevo sistema de navegación o infraestructura de catálogo y préstamos.
- Cambiar geometrías, posiciones, tamaños o texturas procedurales de los planetas para producir sus imágenes de ficha.
- Añadir un motor React para Three.js, dependencias de UI, fuentes o herramientas de pruebas nuevas.

## Decisions

### 1. Contenido local separado de las definiciones gráficas

Crear `src/datos/cuerposCelestes.js`, con entradas vinculadas por los identificadores existentes (`tierra`, `marte`, etc.). El registro incluirá nombre, tipo, descripción, imagen local con texto alternativo y crédito, datos numéricos con unidades y criterio de medición, una o dos curiosidades y referencias de las fuentes consultadas. No importar clases de Three.js ni modificar la composición 3D para alimentar el contenido.

Preparar una transformación pura de datos principales según `tipo: 'planeta'` o `tipo: 'satelite'`. Los satélites admitirán identificador del planeta principal, diámetro, distancia media al planeta, rotación y período orbital; solo habrá un ejemplo sintético en pruebas. Los ocho registros de producción serán planetarios. Guardar unidades base y formatear en español; no interpretar distancias o radios de la escena como valores científicos.

Usar el rótulo «Día (rotación)» y explicar que mide una vuelta sobre su eje; no mezclar con día solar. Registrar y mostrar si el diámetro es medio o ecuatorial y usar un mismo criterio en los ocho planetas. La duración del año representa el período orbital; convertir horas/días/años terrestres con una convención documentada. Los valores finales y su precisión se cotejarán durante la implementación, antes de marcar terminado el contenido.

Seleccionar fotografías o representaciones documentadas y guardarlas optimizadas en `public/imagenes/planetas/`, con nombres en español. Reutilizar el archivo para ambas presentaciones y conservar crédito específico. Puntos de partida verificados para la curación: [exploración del sistema solar de NASA](https://science.nasa.gov/solar-system/) y [galería de imágenes planetarias de NASA Space Place](https://spaceplace.nasa.gov/gallery-solar-system/en/). Consultar la página de cada planeta al incorporar valores; estos enlaces orientan la curación y no sustituyen la comprobación individual. No habrá peticiones remotas de contenido o imágenes al abrir una ficha.

Alternativas: incrustar textos en `planetas.js` acoplaría divulgación y geometría; obtenerlos desde una API haría depender la lectura de otro servicio; una captura del canvas completo no garantiza una imagen representativa de cada cuerpo.

### 2. La selección sigue siendo la fuente de verdad

Extender la interfaz de `crearCampoEstelar` con una notificación de selección para `EscenaEstelar` y una operación explícita para deseleccionar desde el cierre. Notificar a React solo al cambiar el identificador seleccionado; los cambios de apuntado siguen dentro del motor. No simular clics en el fondo para cerrar.

Administrar un pequeño estado de lectura ligado al identificador seleccionado: página actual, número de páginas y acción apuntada. Reiniciar al seleccionar otro cuerpo o alternar presentación. Recentrar conserva cuerpo y página. Las acciones VR y DOM usan el mismo despachador; deseleccionar destruye u oculta ambas presentaciones. La ficha React se monta fuera de la superficie que recibe los eventos de navegación.

| Interacción | Selección | Ficha |
| --- | --- | --- |
| Pasar el mouse o apuntar en VR | No cambia | No abre ni sustituye contenido. |
| Seleccionar sin selección anterior | Nuevo cuerpo | Abre desde el comienzo. |
| Pulsar otro planeta en vista única | Se traslada | Sustituye contenido y reinicia lectura. |
| Página siguiente o anterior | Se conserva | Cambia solo la página. |
| Cerrar o deseleccionar | Se elimina | Se retira. |
| Entrar o salir de VR | Se conserva | Cambia presentación y reinicia lectura. |
| Recentrar | Se conserva | Conserva página y recupera posición localizable en VR. |

Alternativas: mantener una selección adicional en React permitiría ficha e iluminación contradictorias; reconstruir el campo al abrir contenido perdería orientación y recursos; notificar cada apuntado a React produciría renders innecesarios.

### 3. Mouse con el detector existente y estados visuales compartidos

Añadir escucha de `pointermove` para mouse sobre el área de escena y conservar su última posición válida. Recalcular el objetivo con `detectarPosicion` al mover el mouse, orientar o redimensionar, usando el rectángulo real del canvas y la proyección inversa existente. Actualizar después de ajustar proyección y matrices. El clic resuelve de nuevo su propio objetivo; no depende de una caché de hover.

Limpiar la posición y el apuntado al salir de la superficie, entrar en un control o panel superpuesto, ocultar la página, perder foco, cambiar de modo o cancelar el puntero. Al regresar a vista única, esperar un nuevo evento válido de mouse. La captura durante un arrastre no conserva un objetivo fuera del área visible; al terminar se comprueba también si la posición está cubierta por interfaz. Los eventos táctiles no generan hover ni dejan la última posición del dedo.

Reutilizar `planetaApuntado` para mouse en normal y mirada en VR, y los materiales y etiquetas ya existentes. El seleccionado tiene prioridad; otro planeta puede estar apuntado a la vez. La cruz normal continúa visual. No añadir posprocesado ni luces nuevas.

Alternativas: usar `mouseover` sobre elementos HTML no sigue las mallas WebGL; un rayo distinto del de selección fallaría en los bordes de la proyección; un bucle de detección continuo no es necesario para la escena estática.

### 4. Panel React adaptable en vista única

Añadir `src/componentes/fichaCuerpoCeleste.jsx` y estilos acotados. Usar un panel lateral en escritorio y un panel inferior en móvil, fondo oscuro legible, nombre e imagen al inicio y las cinco secciones en el orden solicitado. Limitar su altura y desplazar internamente; conservar área de cielo y controles utilizables. No añadir pantalla ni ruta nuevas.

Identificar el panel como región con nombre asociado al título, mantener botones y enlaces nativos, texto alternativo y foco visible. Al abrir desde mouse/toque no robar el foco de navegación; anunciar de forma breve el nuevo cuerpo, sin releer todo el texto en cada actualización. El cierre explícito devuelve foco a la superficie. El desplazamiento táctil pertenece al panel y no hereda `touch-action: none` del cielo. Las flechas de la ficha no llegan al manejador de orientación.

Alternativas: un modal de pantalla completa impediría pulsar otro planeta y explorarlo; usar la misma textura VR como contenido normal reduciría accesibilidad y selección de texto.

### 5. Tarjeta VR en el espacio y páginas compartidas

Añadir `src/escena/fichaCuerpoVr.js` con un plano de Three.js y una `CanvasTexture` que dibuje bloques a partir de los mismos datos. Colocar la tarjeta dentro del entorno, delante del observador y desplazada respecto de la dirección inicial de selección para no ocultar el planeta ni situar un botón automáticamente bajo la cruz. Mantenerla fija en el mundo mientras se gira la mirada y orientada hacia la posición fija del observador. Reubicarla respecto del nuevo frente al recentrar y al entrar en VR. Un panel pegado a la cámara no permitiría recorrer con la mirada sus controles.

Renderizar ese único plano mediante las cámaras de `StereoEffect`, con profundidad y tamaño angular ajustados para lectura cómoda. No duplicar meshes ni mantener una tarjeta independiente por ojo; ambas imágenes provienen del mismo contenido y estado. Ocultar el plano en vista única. La proyección propia de vista única no necesita aplicarse a la tarjeta VR.

Distribuir inicialmente cuatro grupos de páginas: presentación con nombre, imagen y descripción; datos principales; curiosidades; libros. El nombre permanece como cabecera en todas. El cálculo de líneas añadirá páginas dentro de una sección si los textos o el área disponible lo exigen; no usar elipsis para ocultar contenido educativo ni encoger el texto para que quepa todo. Reservar controles «Anterior», «Siguiente», «Cerrar» y un indicador de página; las acciones inexistentes en un extremo no serán objetivos accionables.

Mantener una representación semántica del contenido y de sus acciones para teclado y tecnología de asistencia, con una sola lectura. La textura de ambos ojos no añade copias accesibles. Las páginas cambian mediante un estado lógico común, también al utilizar las acciones accesibles.

Alternativas: una ficha HTML extendida sobre toda la pantalla no se lee en el visor; dos paneles HTML fijos facilitan duplicar el contenido, pero no permiten apuntar a diferentes controles con el eje central si acompañan constantemente a la cámara; desplegar todo el texto a la vez perjudica el tamaño de letra en media pantalla.

### 6. Prioridad de acciones sin romper el toque global

El detector VR consultará primero la tarjeta y sus zonas accionables, con el mismo rayo de mirada central. Usar coordenadas UV de la intersección con el plano para resolver los rectángulos de acción generados junto al texto; las zonas deben corresponder a lo dibujado. Si el plano ocluye un planeta, no apuntar a ese planeta a través del panel. Resolver nuevamente en el instante del toque, sin usar coordenadas físicas del dedo.

Orden de procesamiento de una activación válida:

1. Un botón DOM explícito ejecuta su acción y no llega a la superficie.
2. En VR, una acción habilitada bajo la mirada ejecuta una sola operación de ficha y consume la activación.
3. Sin acción de ficha, se aplica la selección existente: con selección previa, el toque global la quita; sin selección, puede seleccionar el planeta apuntado.

El texto y el fondo de la tarjeta no son controles: un toque mirándolos sigue deseleccionando. Mostrar el estado apuntado de los botones y una instrucción breve de mirada más toque. No activar por tiempo. El clasificador de gestos de `controlesVista.js` continúa siendo el único filtro de clic/toque/arrastre y mantiene el clic aislado del visor. Un arrastre nunca pagina ni selecciona, y un toque no cancela el sensor, ni siquiera con permiso pendiente.

Alternativas: consumir cualquier toque al haber una ficha anularía la deselección global acordada; enviar el mismo toque a paginación y selección cerraría la ficha al intentar leerla; basar la acción en el dedo exigiría acertar físicamente a media pantalla con el visor puesto.

### 7. Bibliografía configurable y estado vacío deliberado

Crear `src/datos/librosCuerposCelestes.js` con asociaciones por identificador de cuerpo y registros con título y URL de ficha. Iniciar las asociaciones de producción vacías, según lo confirmado. Usar la misma sección en ambas presentaciones: invitación a la Biblioteca «Solón Argüello» y texto breve que explica que los enlaces se incorporarán próximamente. No mostrar botones deshabilitados como si ya hubiera libros concretos ni afirmar que la biblioteca carece de ejemplares.

Filtrar registros sin título o sin URL HTTP/HTTPS utilizable. Con registros reales incorporados, mostrar su título como acceso a la ficha, sin integrar búsquedas, existencias o préstamos. En vista única abrir el destino en una pestaña nueva con las propiedades de aislamiento correspondientes. En VR, la acción de mirada más toque abre el destino dentro del gesto del usuario y vuelve a vista única conservando selección, mediante la misma salida que libera pantalla completa y sensor. No esperar promesas antes de solicitar la apertura; si el navegador la bloquea, queda el enlace accesible en la ficha normal para reintentarlo.

Comprobar las ramas de enlaces con registros sintéticos de prueba claramente separados del contenido de producción. La entrega de esta versión no depende de recibir enlaces del usuario y no acredita una integración real con el catálogo.

Alternativas: buscar títulos al azar o inventar URLs no satisface una asociación con fichas reales; ocultar por completo la sección perdería una de las cinco partes solicitadas; un iframe del catálogo introduce dependencia remota y una lectura poco utilizable en el visor.

### 8. Recursos y verificación proporcionada

Actualizar textura VR solo al cambiar cuerpo, página, dimensiones, imagen cargada o acción apuntada. Solicitar dibujo a través de la invalidación existente; conservar pausa en segundo plano y no actualizar materiales o React si el estado es idéntico. Limitar resolución y tamaño de imágenes según uso real, reutilizar la imagen decodificada entre páginas y retirar listeners, geometría, material, textura y referencias al destruir. Ignorar cargas tardías mediante identidad de instancia y cuerpo.

Extender las pruebas existentes de selección, proyección y sensor; añadir pruebas puras de contrato de datos, cantidad de palabras/curiosidades, formato según tipo, estado de lectura, paginación y resolución de acciones VR. Usar el patrón actual de Canvas 2D simulado donde permita verificar límites y liberación sin WebGL. Las pruebas de límites deben impedir texto omitido y zonas de acción desalineadas. Comprobar en navegador panel, foco, desplazamiento táctil, estados de imagen, ocho fichas, enlaces vacíos, ambas vistas y pérdida de contexto. No instalar otra infraestructura solo para este cambio.

El informe base registra 107 pruebas aprobadas y un fallo previo de lint en `server.js` por `process` no definido; volver a medirlo al implementar y distinguirlo sin corregir archivos ajenos. El navegador de escritorio no acredita comodidad óptica ni botón físico: probar teléfono/visor por HTTPS cuando estén disponibles y registrar las pruebas físicas pendientes.

## Risks / Trade-offs

- [La capacidad planetaria todavía no está en las especificaciones principales] → Sincronizar primero los deltas base y después los nuevos. Si el cambio base se archiva posteriormente, revisar o repetir la combinación en ese orden para no sobrescribir la ampliación de iluminación con su texto anterior.
- [Cinco secciones no caben legibles en media pantalla] → Paginación por bloques con salto adicional por líneas y verificación en móvil horizontal; el ajuste visual de tamaño angular y fuente debe confirmarse en visor.
- [Una tarjeta fija en el mundo puede quedar fuera del campo visible] → Recentrar recupera su posición conservando página y selección; mantener siempre disponible la salida VR.
- [Interferencia entre controles de ficha y deselección global] → Resolver una sola acción por toque, destacar el control apuntado y cubrir expresamente texto, fondo, acciones y eventos derivados.
- [Canvas no ofrece semántica textual] → Conservar una representación accesible única del contenido y los controles, sin duplicarla por ojo.
- [Diferencias entre día solar, rotación y criterios de diámetro] → Fijar rótulos y convenciones, conservar fuentes y validar cada registro antes de entregar contenido.
- [No hay fichas bibliográficas reales proporcionadas] → Entregar asociaciones vacías y estado informativo; incorporar posteriormente solo destinos reales identificados.

## Migration Plan

1. Al iniciar la implementación, sincronizar las especificaciones del cambio completado `escena-planetaria` mediante el flujo de sincronización; comprobar la nueva capacidad principal y conservar sus demás requisitos. No archivar el cambio anterior automáticamente.
2. Implementar datos, selección/hover, panel, tarjeta y acciones como cambios relacionados, sin migraciones de servidor ni almacenamiento. Mantener las asociaciones bibliográficas vacías.
3. Ejecutar verificaciones automáticas, revisar el resultado en navegador y documentar las comprobaciones físicas realizadas o pendientes. Sincronizar los deltas nuevos después de la base cuando se solicite finalizar el cambio.
4. Para revertir la función, retirar solo su integración y sus módulos/recursos, restaurando el comportamiento anterior de selección y sin alterar escena, sensor ni API ajenos a este cambio. Si las especificaciones ya se sincronizaron, revertir también sus deltas correspondientes de forma coherente. No se propone despliegue, commit ni push.
