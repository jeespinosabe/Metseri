# Spec Delta

## Purpose

Presentar una ficha visual de cada planeta seleccionado, con espacios para contenido educativo pendiente y navegación coherente en pantalla y visor móvil.

## ADDED Requirements

### Requirement: Una ficha vinculada a la selección

La aplicación SHALL mostrar una única ficha del planeta seleccionado y conservarla al apartar el mouse o la mirada. Apuntar sin seleccionar SHALL NOT abrir ni sustituir la ficha. Deseleccionar o usar su cierre SHALL retirar la ficha y la selección persistente. Seleccionar otro planeta en vista única SHALL sustituir su identidad e imagen y reiniciar la lectura.

#### Scenario: Apuntar sin seleccionar
- **WHEN** se apunta a un cuerpo sin activarlo
- **THEN** solo cambia su iluminación transitoria y no se abre una ficha

#### Scenario: Conservar y sustituir la ficha
- **WHEN** hay una selección y después se aparta el apuntado o se selecciona otro cuerpo en vista única
- **THEN** la primera interacción conserva la ficha y la segunda la sustituye sin acumular paneles

#### Scenario: Cerrar o deseleccionar
- **WHEN** se cierra o deselecciona mediante el gesto correspondiente
- **THEN** se retira la ficha y solo queda brillo transitorio si el cuerpo sigue apuntado

### Requirement: Cinco secciones de contenido educativo

La ficha SHALL conservar la estructura de identidad e imagen, subtítulo y descripción, datos principales, «¿Sabías que...?» y «Descubrir libros». Su presentación SHALL seguir la referencia: nombre grande, imagen pequeña arriba a la derecha, cuadrícula de datos en dos columnas y separadores discretos. En esta fase subtítulo, descripción, cifras, curiosidades y texto bibliográfico SHALL permanecer vacíos, con espacios estáticos. SHALL NOT mostrarse contenido astronómico real, texto ficticio, ceros que simulen datos ni animación de carga. Nombre, clasificación, imagen y rótulos de estructura SHALL permanecer identificables.

#### Scenario: Revisar los ocho planetas
- **WHEN** se abre cualquier ficha
- **THEN** aparece su identidad e imagen con espacios reservados para el contenido pendiente
- **AND** no aparecen párrafos ni cifras astronómicas de producción

#### Scenario: Imagen que no se puede mostrar
- **WHEN** falla la imagen
- **THEN** se conserva una alternativa identificable y la estructura de ficha sigue disponible

### Requirement: Datos principales con unidades y tipo de cuerpo

La ficha SHALL conservar cuatro espacios de datos: diámetro, distancia al Sol, duración del día y duración del año. Etiqueta, valor y unidad SHALL ocupar áreas diferenciadas; los valores de producción SHALL estar vacíos, sin confundir ausencia con cero. La estructura SHALL admitir datos de satélites con distancia al planeta, rotación y período orbital, sin agregar satélites visibles.

#### Scenario: Consultar los datos pendientes
- **WHEN** se observa el bloque de datos
- **THEN** hay cuatro etiquetas con sus unidades y valores reservados en dos columnas

#### Scenario: Contrato de satélite futuro
- **WHEN** se valida un registro sintético de satélite
- **THEN** admite sus cuatro campos propios sin exigir distancia al Sol ni incorporarse a la escena

### Requirement: Descubrir libros sin información inventada

«Descubrir libros» SHALL conservar encabezado y espacio reservado, sin redactar todavía invitaciones ni presentar libros o destinos ficticios. Las asociaciones bibliográficas SHALL permanecer vacías en producción y admitir registros futuros con título y URL HTTP/HTTPS válida. No SHALL depender de un servicio remoto para mostrar la ficha.

#### Scenario: Sección pendiente de contenido
- **WHEN** se consulta libros sin asociaciones configuradas
- **THEN** aparece el espacio reservado sin títulos, invitaciones temporales ni enlaces activos

#### Scenario: Validar asociaciones futuras
- **WHEN** se comprueba una asociación sin título o destino HTTP/HTTPS utilizable
- **THEN** se descarta sin bloquear el resto de la ficha

### Requirement: Lectura adaptable y accesible en vista única

La ficha SHALL conservar desplazamiento propio y controles utilizables en escritorio y móvil. La interacción con el panel SHALL NOT arrastrar ni activar el cielo. SHALL existir una sola lectura accesible con nombre del cuerpo, texto alternativo, identificación de espacios reservados, foco visible y acciones por teclado. Cerrar SHALL devolver el foco a la exploración.

#### Scenario: Desplazar el panel en móvil
- **WHEN** se desplaza una ficha cuyo contenido no cabe
- **THEN** se alcanzan datos, curiosidades, libros y créditos sin girar el cielo

#### Scenario: Cerrar con teclado
- **WHEN** se recorre y activa el cierre con teclado
- **THEN** la acción es identificable y devuelve el foco al cielo sin interceptar flechas del panel

### Requirement: Contenido completo en ambas vistas de VR

La ficha VR SHALL aparecer frente a la mirada al abrir y compartir cuerpo y sección en ambos ojos. SHALL ofrecer las secciones Ficha, Datos, ¿Sabías? y Libros mediante pestañas con estado actual visible, flechas Anterior/Siguiente cuando correspondan y cierre separado ×. Las dos imágenes SHALL usar un solo estado y SHALL NOT duplicar la lectura accesible. Los espacios vacíos SHALL permanecer vacíos también en VR.

#### Scenario: Apertura inmediata
- **WHEN** se selecciona un cuerpo en VR o se entra con una selección
- **THEN** su ficha aparece directamente frente a la mirada sin exigir buscarla a un lado

#### Scenario: Salto directo de sección
- **WHEN** se apunta a Libros desde Datos y se toca
- **THEN** ambos ojos pasan directamente a Libros conservando selección y pestaña activa

#### Scenario: Navegación secuencial
- **WHEN** se utiliza una flecha habilitada
- **THEN** se avanza o retrocede exactamente una sección y en los extremos no hay una acción inexistente

### Requirement: Continuidad y limpieza de la ficha

Cambiar de modo SHALL conservar el cuerpo y reiniciar la sección. Recentrar SHALL conservar cuerpo y sección y recuperar la tarjeta al frente. Pérdida de WebGL o desmontaje SHALL retirar ficha y acciones; reintentar SHALL iniciar sin estados anteriores. Una imagen tardía SHALL NOT reabrir la ficha.

#### Scenario: Alternar modos y recentrar
- **WHEN** se cambia de modo o se recentra con una selección
- **THEN** permanece el cuerpo; solo el cambio de modo reinicia la sección y el recentrado recupera la tarjeta frente a la mirada

#### Scenario: Pérdida de contexto y reintento
- **WHEN** se pierde WebGL y luego se reintenta
- **THEN** se retira la ficha durante el error y la nueva escena no conserva selección ni acciones residuales
