# Spec Delta

## Purpose

Ofrecer información educativa en español sobre los planetas seleccionados, legible en pantalla y en visor móvil, y orientar al visitante hacia los libros físicos de la Biblioteca «Solón Argüello».

## ADDED Requirements

### Requirement: Una ficha vinculada a la selección

La aplicación SHALL mostrar una única ficha del planeta seleccionado y SHALL mantenerla abierta aunque el usuario aparte el mouse o la mirada. Apuntar sin seleccionar SHALL NOT abrir ni cambiar la ficha. Deseleccionar SHALL cerrar la ficha; su acción explícita de cierre SHALL quitar la selección. Seleccionar otro planeta en vista única SHALL sustituir el contenido sin dejar fichas acumuladas. Los ocho planetas actuales SHALL tener contenido propio.

#### Scenario: Apuntar sin seleccionar
- **WHEN** el mouse o la cruz del visor apuntan a un planeta sin activarlo
- **THEN** aparece únicamente su iluminación transitoria y no se abre una ficha

#### Scenario: Abrir y conservar la ficha
- **WHEN** se selecciona un planeta y después se aparta el mouse o la mirada
- **THEN** su ficha permanece abierta y el planeta conserva la iluminación persistente

#### Scenario: Cambiar de planeta en vista única
- **WHEN** hay una ficha abierta y se pulsa otro planeta sin arrastrar
- **THEN** la única ficha muestra el nombre, la imagen y el contenido del nuevo seleccionado
- **AND** se reinicia su lectura al comienzo

#### Scenario: Cerrar o deseleccionar
- **WHEN** el usuario cierra la ficha o deselecciona mediante los gestos de su modo
- **THEN** se retira la ficha y se elimina la selección persistente
- **AND** solo permanece el resaltado transitorio si el cuerpo sigue apuntado

### Requirement: Cinco secciones de contenido educativo

Cada ficha SHALL incluir, en este orden, nombre del cuerpo e imagen representativa, descripción breve, «Datos principales», «¿Sabías que...?» y «Descubrir libros». La descripción SHALL contener entre 30 y 50 palabras en español y presentar características generales y un motivo de interés. «¿Sabías que...?» SHALL contener una o dos curiosidades del cuerpo. El contenido SHALL ser específico y contrastado con fuentes astronómicas identificables; la imagen SHALL corresponder al cuerpo, tener texto alternativo y conservar el crédito o la procedencia que corresponda.

#### Scenario: Revisar cualquiera de los ocho planetas
- **WHEN** se consulta la ficha de cada planeta disponible
- **THEN** aparecen las cinco secciones con su nombre e imagen propios, una descripción de 30 a 50 palabras y una o dos curiosidades
- **AND** los textos no se sustituyen por contenido genérico repetido entre todos los cuerpos

#### Scenario: Imagen que no se puede mostrar
- **WHEN** falla la carga de la imagen representativa
- **THEN** el nombre y el contenido permanecen disponibles y se presenta una alternativa identificable sin bloquear la ficha

### Requirement: Datos principales con unidades y tipo de cuerpo

Para planetas, la ficha SHALL mostrar diámetro en km, distancia media al Sol en millones de km, duración del día en horas o días terrestres y duración del año en días o años terrestres. SHALL indicar la convención usada para el diámetro y que «Día (rotación)» corresponde al período de rotación, evitando mezclarlo con el día solar. Los valores SHALL mostrar sus unidades y conservar una precisión coherente con sus fuentes.

La estructura de contenido SHALL admitir el tipo satélite natural con diámetro en km, distancia media al planeta en km, período de rotación en horas o días terrestres y período orbital en días terrestres, identificando el planeta principal. Este cambio SHALL proporcionar fichas y objetos seleccionables únicamente para los ocho planetas actuales.

#### Scenario: Consultar datos de un planeta
- **WHEN** el visitante abre «Datos principales»
- **THEN** encuentra los cuatro datos planetarios con valores, unidades terrestres donde correspondan y significado de las mediciones
- **AND** no se confunden la distancia al Sol y la distancia a un planeta ni el día solar y la rotación

#### Scenario: Preparar un registro de satélite futuro
- **WHEN** se valida un registro de ejemplo del tipo satélite natural
- **THEN** el contrato de contenido admite sus cuatro datos y su planeta principal sin exigir distancia al Sol ni año planetario
- **AND** ese registro de ejemplo no agrega satélites visibles ni seleccionables a la aplicación

### Requirement: Descubrir libros sin información inventada

«Descubrir libros» SHALL invitar a consultar libros físicos de la Biblioteca «Solón Argüello». El contenido SHALL admitir asociaciones configurables de cada cuerpo con fichas bibliográficas reales identificadas por título y destino. Con asociaciones válidas, SHALL ofrecer accesos identificables a las fichas correspondientes. Sin asociaciones, SHALL conservar la invitación y explicar que los enlaces bibliográficos están pendientes, sin botones que aparenten abrir fichas ni títulos, existencias o direcciones inventados. La escena y la ficha SHALL funcionar sin consultar un servicio de catálogo.

#### Scenario: Catálogo todavía pendiente
- **WHEN** el planeta no tiene asociaciones bibliográficas configuradas
- **THEN** la sección invita a visitar la Biblioteca «Solón Argüello» e indica que los enlaces estarán disponibles cuando se incorporen
- **AND** no presenta destinos ficticios ni interpreta la falta de enlaces como ausencia de libros en la biblioteca

#### Scenario: Incorporar una asociación válida
- **WHEN** existe una ficha bibliográfica real configurada para el cuerpo y el usuario activa su acceso en vista única
- **THEN** se abre el destino configurado, identificado por su título, sin activar selección planetaria por propagación
- **AND** la consulta no afirma disponibilidad de préstamo que no haya sido proporcionada

#### Scenario: Asociación sin destino utilizable
- **WHEN** una asociación carece de título o de una dirección HTTP o HTTPS válida
- **THEN** no se ofrece como enlace activo y el resto de la ficha sigue funcionando

### Requirement: Lectura adaptable y accesible en vista única

La ficha SHALL poder leerse en escritorio y móvil, con desplazamiento propio cuando el contenido no quepa, sin desplazar la página ni arrastrar el cielo al interactuar con ella. Los controles de la escena y el cierre SHALL permanecer utilizables. SHALL existir una única lectura accesible del contenido, un nombre de panel asociado al cuerpo, texto alternativo de imagen, foco visible y acceso por teclado a sus acciones. Cerrar mediante el control de la ficha SHALL devolver el foco a la superficie de exploración.

#### Scenario: Leer y desplazar la ficha en móvil
- **WHEN** el visitante desplaza el contenido de la ficha en una pantalla pequeña
- **THEN** alcanza todas las secciones, incluidos libros y cierre, sin girar el cielo ni cambiar la selección

#### Scenario: Utilizar el teclado en la ficha
- **WHEN** el visitante recorre sus controles mediante teclado y activa el cierre
- **THEN** las acciones tienen nombre y foco visibles y la exploración vuelve a recibir el foco
- **AND** las flechas usadas dentro de la ficha no giran la escena

### Requirement: Contenido completo en ambas vistas de VR

Con una selección activa en VR, la misma ficha SHALL ser legible en ambos ojos y SHALL permitir recorrer todas sus secciones sin quitarse el visor. La paginación SHALL conservar nombre del cuerpo, sección actual e indicador de posición; las dos vistas SHALL compartir contenido y página. El texto SHALL distribuirse en páginas adicionales si hace falta, sin recortarlo ni reducirlo hasta hacerlo ilegible. La segunda representación visual SHALL NOT duplicar la lectura accesible ni crear un segundo estado de ficha.

#### Scenario: Recorrer las cinco secciones con el visor
- **WHEN** el visitante selecciona un planeta en VR y avanza por la ficha
- **THEN** puede leer su imagen y descripción, los cuatro datos, las curiosidades y la invitación bibliográfica en ambos ojos
- **AND** la lectura no requiere deslizar físicamente una mitad de pantalla

#### Scenario: Navegar con sensor o alternativa manual
- **WHEN** apunta a los controles de página y los activa mediante un toque del visor, con sensor activo o apuntado manual
- **THEN** ambas vistas cambian a la misma página y mantienen el planeta seleccionado

#### Scenario: Enlace bibliográfico desde VR
- **WHEN** hay una asociación real y el visitante activa su acceso en la ficha VR
- **THEN** la aplicación pasa a vista única y abre el destino configurado desde ese gesto
- **AND** conserva el planeta seleccionado y libera únicamente las capacidades inmersivas adquiridas por la experiencia

### Requirement: Continuidad y limpieza de la ficha

Alternar entre vista única y VR o recentrar SHALL conservar el cuerpo seleccionado y el contenido de su ficha; alternar presentación SHALL reiniciar su posición de lectura al comienzo. Una pérdida del contexto gráfico o desmontaje SHALL retirar la ficha y sus acciones. Reintentar SHALL iniciar sin selección ni ficha residual. Cargar una imagen después del cierre o un reintento SHALL NOT reabrir contenido anterior.

#### Scenario: Alternar modos con la ficha abierta
- **WHEN** el usuario entra o sale de VR con un planeta seleccionado
- **THEN** permanece abierta la ficha de ese cuerpo en la presentación de destino y comienza por la primera sección

#### Scenario: Recentrar durante la lectura VR
- **WHEN** se recentra la mirada con una ficha abierta
- **THEN** se conserva el cuerpo y la página y la ficha queda nuevamente localizable desde el frente de referencia

#### Scenario: Pérdida de contexto y reintento
- **WHEN** se pierde WebGL con una ficha abierta y posteriormente se reintenta
- **THEN** desaparecen la ficha y sus controles durante el error y la nueva escena empieza sin estados residuales
