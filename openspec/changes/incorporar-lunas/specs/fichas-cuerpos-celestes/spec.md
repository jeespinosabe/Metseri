# Spec Delta

La base de esta capacidad está en `openspec/changes/agregar-fichas-de-cuerpos-celestes/specs/fichas-cuerpos-celestes/spec.md`, un cambio completado cuya capacidad todavía no aparece en `openspec/specs/`. Los requisitos MODIFIED se aplican sobre esa base una vez sincronizada. Se conservan sus reglas de accesibilidad, navegación VR, continuidad y limpieza.

## ADDED Requirements

### Requirement: Identidad y recursos locales de los cuatro satélites

Las fichas SHALL identificar Luna como satélite de la Tierra, Europa de Júpiter, Titán de Saturno y Tritón de Neptuno. Cada satélite SHALL tener identidad estable, clasificación de satélite natural, planeta principal, imagen local propia, texto alternativo y crédito con enlace al origen. La relación con el planeta SHALL ser visible tanto en la ficha normal como en VR. La identidad de la ficha SHALL coincidir con el cuerpo seleccionado, sin abrir la ficha del planeta principal en su lugar. Las imágenes y la apertura de fichas SHALL funcionar sin consultar el servidor API ni cargar imágenes remotas en tiempo de ejecución.

#### Scenario: Abrir las cuatro fichas
- **WHEN** se selecciona por separado Luna, Europa, Titán o Tritón
- **THEN** la ficha presenta el nombre, la imagen y la relación planetaria correctos en vista única y VR
- **AND** no sustituye su identidad por la de su planeta principal

#### Scenario: Consultar sin servidor API
- **WHEN** la aplicación está servida con sus recursos locales y el servidor API está detenido
- **THEN** las cuatro fichas se pueden abrir y sus imágenes y créditos están disponibles en la estructura habitual
- **AND** solo abrir expresamente el enlace de créditos navega a la fuente externa

## MODIFIED Requirements

### Requirement: Una ficha vinculada a la selección

La aplicación SHALL mostrar una única ficha del cuerpo seleccionado, entre los ocho planetas y los cuatro satélites, y conservarla al apartar el mouse o la mirada. Apuntar sin seleccionar SHALL NOT abrir ni sustituir la ficha. Deseleccionar o usar su cierre SHALL retirar la ficha y la selección persistente. Seleccionar otro planeta o satélite en vista única SHALL sustituir su identidad e imagen y reiniciar la lectura.

#### Scenario: Apuntar sin seleccionar
- **WHEN** se apunta a un cuerpo sin activarlo
- **THEN** solo cambia su iluminación transitoria y no se abre una ficha

#### Scenario: Conservar y sustituir la ficha
- **WHEN** hay una selección y después se aparta el apuntado o se selecciona otro cuerpo en vista única
- **THEN** la primera interacción conserva la ficha y la segunda la sustituye sin acumular paneles
- **AND** cambiar entre planeta y satélite actualiza nombre, imagen, relación y rótulos de datos, reiniciando la lectura

#### Scenario: Cerrar o deseleccionar
- **WHEN** se cierra o deselecciona mediante el gesto correspondiente
- **THEN** se retira la ficha y solo queda brillo transitorio si el cuerpo sigue apuntado

### Requirement: Cinco secciones de contenido educativo

La ficha de cualquiera de los doce cuerpos SHALL conservar la estructura de identidad e imagen, subtítulo y descripción, datos principales, «¿Sabías que...?» y «Descubrir libros». Su presentación SHALL seguir la referencia: nombre grande, imagen pequeña arriba a la derecha, cuadrícula de datos en dos columnas y separadores discretos. En esta fase subtítulo, descripción, cifras, curiosidades y texto bibliográfico SHALL permanecer vacíos, con espacios estáticos. SHALL NOT mostrarse párrafos o cifras astronómicas de producción, texto ficticio, ceros que simulen datos ni animación de carga. Nombre, clasificación, relación planetaria de los satélites, imagen y rótulos de estructura SHALL permanecer identificables.

#### Scenario: Revisar los doce cuerpos
- **WHEN** se abre cualquier ficha de los ocho planetas o los cuatro satélites
- **THEN** aparece su identidad e imagen con espacios reservados para el contenido pendiente
- **AND** no aparecen párrafos ni cifras astronómicas de producción y no se agregan libros ficticios

#### Scenario: Imagen que no se puede mostrar
- **WHEN** falla la imagen de un planeta o satélite
- **THEN** se conserva una alternativa identificable y la estructura de ficha sigue disponible

### Requirement: Datos principales con unidades y tipo de cuerpo

La ficha SHALL conservar cuatro espacios de datos en dos columnas. Para los planetas SHALL mostrar diámetro en km, distancia al Sol en millones de km, duración del día y duración del año con las unidades existentes. Para los satélites SHALL mostrar diámetro en km, distancia al planeta en km, período de rotación en horas o días terrestres según el valor y período orbital en días terrestres. Etiqueta, valor y unidad SHALL ocupar áreas diferenciadas; los valores de producción SHALL estar vacíos, sin confundir ausencia con cero. Las fichas de satélites SHALL NOT presentar distancia al Sol ni rotular su período orbital como «Un año dura».

#### Scenario: Consultar los datos pendientes
- **WHEN** se observa el bloque de datos de cualquier cuerpo
- **THEN** hay cuatro etiquetas con sus unidades y valores reservados en dos columnas

#### Scenario: Datos de un satélite incorporado
- **WHEN** se abre la sección de datos de Luna, Europa, Titán o Tritón en vista única o VR
- **THEN** aparecen diámetro, distancia al planeta, período de rotación y período orbital con sus unidades
- **AND** los valores quedan vacíos y no se exige ni se muestra una distancia al Sol

#### Scenario: Conservar los datos de un planeta
- **WHEN** después de consultar un satélite se selecciona un planeta
- **THEN** se recuperan las etiquetas y unidades propias de planeta sin conservar rótulos de satélite
