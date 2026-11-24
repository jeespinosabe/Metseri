# validacion-datos-bibliograficos Specification

## Purpose
Definir las reglas que deben cumplir los datos de un libro (título, autoría, editorial y año) para que el catálogo administrativo solo contenga información congruente con un libro real, con los mismos criterios y mensajes en el formulario, la API y la base de datos.

## Requirements

### Requirement: Límites de longitud de los textos
Los textos del libro SHALL respetar estos máximos, contados después de normalizarlos: título 200 caracteres, nombre de cada autor 100, editorial 100 y hasta 50 autores por libro. Un valor que los exceda SHALL rechazarse sin guardar.

#### Scenario: Título dentro del límite
- **WHEN** se guarda un libro con un título de 200 caracteres
- **THEN** el título se acepta

#### Scenario: Título que excede el límite
- **WHEN** se escribe un título de 201 caracteres y se abandona el campo
- **THEN** el campo muestra «El título admite hasta 200 caracteres.»
- **AND** el libro no se guarda

#### Scenario: Límite contado tras colapsar espacios
- **WHEN** se escribe un título que mide 203 caracteres pero 199 al colapsar sus espacios repetidos
- **THEN** el título se acepta

#### Scenario: Nombre de autor que excede el límite
- **WHEN** la segunda línea de la autoría tiene 101 caracteres
- **THEN** el campo muestra «El nombre de autor de la línea 2 admite hasta 100 caracteres.»

#### Scenario: Editorial que excede el límite
- **WHEN** se escribe una editorial de 101 caracteres
- **THEN** el campo muestra «La editorial admite hasta 100 caracteres.»

#### Scenario: Más autores de los permitidos
- **WHEN** la autoría contiene 51 nombres
- **THEN** el campo muestra «Escribe hasta 50 autores.»

### Requirement: El nombre de autor inicia con una letra
El nombre de cada autor SHALL iniciar con una letra, evaluado después de quitar espacios exteriores. SHALL rechazarse un nombre que inicie con un número, un símbolo o un signo de puntuación. Las letras acentuadas, la «ñ» y la «ü» SHALL aceptarse como letras. No hay excepciones por apóstrofo inicial.

#### Scenario: Nombre válido con letra acentuada
- **WHEN** se guarda un libro con la autoría «Álvaro Mutis»
- **THEN** el nombre se acepta

#### Scenario: Nombre que inicia con símbolo
- **WHEN** se escribe «#Carl Sagan» en la primera línea de la autoría y se abandona el campo
- **THEN** el campo muestra «El nombre de autor de la línea 1 debe empezar con una letra, no con «#».»
- **AND** el libro no se guarda

#### Scenario: Nombre que inicia con puntuación
- **WHEN** una línea de la autoría empieza con «¿», «(», «-», «_» o una comilla
- **THEN** se rechaza con el mismo mensaje, indicando ese carácter

#### Scenario: Nombre que inicia con número
- **WHEN** una línea de la autoría empieza con un dígito, como «3 Carl Sagan»
- **THEN** se muestra «El nombre de autor de la línea 1 debe empezar con una letra, no con «3».»

#### Scenario: Error solo en la línea afectada
- **WHEN** la autoría tiene «Carl Sagan» en la línea 1 y «@Ann Druyan» en la línea 2
- **THEN** el mensaje se refiere únicamente a la línea 2

### Requirement: El nombre de autor tiene al menos dos caracteres
El nombre de cada autor SHALL tener al menos 2 caracteres, contados después de quitar espacios exteriores. La exigencia de contener una letra SHALL cubrirla únicamente la regla de iniciar con letra, sin un mensaje duplicado.

#### Scenario: Nombre de un solo carácter
- **WHEN** se escribe «A» en una línea de la autoría
- **THEN** se muestra «El nombre de autor de la línea 1 debe tener al menos 2 caracteres.»

#### Scenario: Nombre mínimo válido
- **WHEN** se guarda la autoría «Li» o «NASA»
- **THEN** se acepta

#### Scenario: Un carácter que además no es letra
- **WHEN** se escribe «#» en una línea de la autoría
- **THEN** se muestra solo el mensaje de iniciar con una letra, no el de longitud mínima

### Requirement: Título y editorial en una línea y sin caracteres de control
Título y editorial SHALL rechazar saltos de línea y caracteres de control, y SHALL contener al menos una letra o un dígito. Al guardar, los espacios exteriores SHALL quitarse y los espacios internos repetidos SHALL colapsarse a uno solo, sin generar error.

#### Scenario: Salto de línea en el título
- **WHEN** se pega un título con un salto de línea en medio
- **THEN** el campo muestra «El título no admite saltos de línea ni caracteres de control.»

#### Scenario: Carácter de control en la editorial
- **WHEN** la editorial contiene una tabulación
- **THEN** el campo muestra «La editorial no admite saltos de línea ni caracteres de control.»

#### Scenario: Título sin letras ni dígitos
- **WHEN** se escribe «!!!» como título
- **THEN** el campo muestra «El título debe contener al menos una letra o un número.»

#### Scenario: Editorial sin letras ni dígitos
- **WHEN** se escribe «....» como editorial
- **THEN** el campo muestra «La editorial debe contener al menos una letra o un número.»

#### Scenario: Espacios repetidos colapsados
- **WHEN** se guarda el título «  Cosmos    infinito  » y la editorial «Fondo   de  Cultura»
- **THEN** se almacenan «Cosmos infinito» y «Fondo de Cultura»

### Requirement: Editorial obligatoria
Todo libro SHALL tener editorial. La editorial SHALL identificarse como obligatoria en el formulario y SHALL rechazarse si está vacía o compuesta solo de espacios, tanto al crear como al editar.

#### Scenario: Alta con editorial
- **WHEN** se guarda un libro con la editorial «Fondo de Cultura Económica»
- **THEN** el libro se guarda y su tarjeta muestra la editorial

#### Scenario: Alta sin editorial
- **WHEN** se intenta guardar un libro con la editorial vacía o con solo espacios
- **THEN** el campo muestra «Escribe la editorial del libro.»
- **AND** el libro no se guarda y el foco pasa al campo

#### Scenario: Retirar la editorial mediante la API
- **WHEN** un cliente envía `editorial: null` o una cadena vacía al crear o actualizar un libro
- **THEN** la API responde 400 con `LIBRO_INVALIDO` y el mensaje «Escribe la editorial del libro.»

### Requirement: Rango del año de publicación
El año, cuando se indique, SHALL ser un entero de cuatro cifras entre 1450 y el año actual más uno, calculado con la fecha del servidor. El año SHALL seguir siendo opcional.

#### Scenario: Año válido
- **WHEN** se guarda un libro con año 2020
- **THEN** el año se acepta

#### Scenario: Límites inclusivos
- **WHEN** se guarda un libro con año 1450 y otro con el año actual más uno
- **THEN** ambos se aceptan

#### Scenario: Año anterior al mínimo
- **WHEN** se escribe 1449 o 1000
- **THEN** el campo muestra «Escribe un año entre 1450 y {máximo}.» con el máximo vigente

#### Scenario: Año posterior al máximo
- **WHEN** se escribe el año actual más dos, o 2100
- **THEN** se muestra el mismo mensaje y el libro no se guarda

#### Scenario: Año con formato inválido
- **WHEN** se escribe «20», «2020.5», «dos mil» o «02020»
- **THEN** el campo muestra «Escribe el año con cuatro cifras, por ejemplo 2020.»

#### Scenario: Año omitido
- **WHEN** se deja el año vacío
- **THEN** no hay error y el libro se guarda sin año

### Requirement: Las mismas reglas en formulario y API
La API administrativa SHALL aplicar las mismas reglas y normalización que el formulario, de modo que un cliente que omita el formulario reciba el mismo rechazo. Ante un libro inválido SHALL responder 400 con código `LIBRO_INVALIDO` y los mensajes concretos en `error.mensaje`, sin detalles internos.

#### Scenario: Petición directa con varios errores
- **WHEN** se envía por POST un libro con título de 250 caracteres, editorial vacía y año 1200
- **THEN** la API responde 400 con `LIBRO_INVALIDO`
- **AND** `error.mensaje` incluye los mensajes del título, de la editorial y del año

#### Scenario: Petición válida
- **WHEN** se envía por POST un libro que cumple todas las reglas
- **THEN** la API responde 201 como hasta ahora

#### Scenario: Normalización antes de comparar duplicados
- **WHEN** existe «Cosmos infinito» con cierta editorial y año, y se envía por POST «Cosmos    infinito» con los mismos editorial y año
- **THEN** la API responde 409 `LIBRO_DUPLICADO`

#### Scenario: Libro duplicado exacto
- **WHEN** se envía por POST un libro con el mismo título, editorial y año de uno existente
- **THEN** la API responde 409 `LIBRO_DUPLICADO`, como hasta ahora

### Requirement: Mensajes por campo en el error de la API
Cuando el rechazo se deba a campos inválidos, la respuesta 400 SHALL incluir `error.campos`, un objeto con el mensaje de cada campo inválido bajo las claves `titulo`, `autores`, `editorial` y `anio`. `error.codigo` y `error.mensaje` SHALL conservarse sin cambios de forma. Los rechazos que no correspondan a un campo SHALL omitir `error.campos`.

#### Scenario: Varios campos inválidos
- **WHEN** se envía por POST un libro con título de 250 caracteres, editorial vacía y año 1200
- **THEN** `error.campos` contiene `titulo`, `editorial` y `anio`, cada uno con su mensaje
- **AND** `error.codigo` es `LIBRO_INVALIDO` y `error.mensaje` sigue presente

#### Scenario: Autoría inválida
- **WHEN** se envía una autoría con «#Ana»
- **THEN** `error.campos.autores` contiene el mensaje de la línea afectada

#### Scenario: Rechazo sin campo
- **WHEN** se envía un objeto con un campo desconocido
- **THEN** la API responde 400 `LIBRO_INVALIDO` sin `error.campos`

#### Scenario: Cliente que ignora `campos`
- **WHEN** un cliente lee solo `error.codigo` y `error.mensaje`
- **THEN** su comportamiento no cambia

### Requirement: Las mismas reglas en la base de datos
La base de datos SHALL rechazar, sin cambiar ningún dato, los libros que incumplan título de 1 a 200 caracteres, editorial obligatoria de hasta 100, sin caracteres de control, sin espacios consecutivos y con al menos una letra o dígito, y año entre 1450 y 2100; y SHALL rechazar los autores cuyo nombre no inicie con una letra o no tenga entre 2 y 100 caracteres. La función de guardado SHALL normalizar los espacios, aplicar el año máximo vigente y no dejar un libro parcial si rechaza una creación.

#### Scenario: Función de guardado sin editorial
- **WHEN** se llama directamente a la función de guardado sin editorial
- **THEN** la operación falla y no queda ningún libro nuevo, ni siquiera con solo el título

#### Scenario: Año fuera de rango en la base
- **WHEN** se escribe directamente en la tabla un año 1449 o 2101, o mediante la función un año mayor al máximo vigente
- **THEN** la base rechaza la operación

#### Scenario: Texto no limpio en la base
- **WHEN** se escribe directamente un título con salto de línea, o una editorial «....»
- **THEN** la base rechaza la operación

#### Scenario: Normalización en la función
- **WHEN** se llama a la función con el título «Cosmos    infinito»
- **THEN** se guarda «Cosmos infinito»

#### Scenario: Autor inválido en la base
- **WHEN** se intenta guardar un autor «#x», «3x» o «A» por la función o directamente en la tabla de autores
- **THEN** la base rechaza la operación

#### Scenario: Libros existentes
- **WHEN** se aplica la validación a la base con los 11 libros actuales
- **THEN** los 11 siguen consultables y editables sin cambios

#### Scenario: Datos que incumplen antes de migrar
- **WHEN** existe algún libro o autor que incumple las reglas al ejecutar la migración
- **THEN** la migración se detiene con un mensaje legible que indica cuántos son, sin cambiar nada

#### Scenario: Libro verificado
- **WHEN** se guarda un libro verificado con editorial, año, URL y fecha de verificación
- **THEN** sigue cumpliendo la regla de verificación completa existente
