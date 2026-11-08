# panel-administrativo Specification

## Purpose

Ofrecer al administrador una interfaz protegida y organizada para revisar registros bibliográficos y preparar sus formularios, asociaciones con cuerpos celestes y confirmación de eliminación, dejando las operaciones de guardado para una etapa posterior.

## Requirements

### Requirement: Acceso mediante la autenticación existente

El panel SHALL estar integrado en `/admin` y `/admin/` mediante la comprobación, inicio y cierre de sesión existentes. SHALL mostrar el estado de comprobación antes de resolver el acceso y SHALL presentar el formulario de inicio de sesión a quien no tenga una sesión autenticada. La vista previa bibliográfica SHALL NOT habilitar un acceso alternativo que omita la autenticación.

#### Scenario: Abrir sin sesión
- **WHEN** una persona accede directamente a cualquiera de las dos rutas sin una sesión válida
- **THEN** ve la comprobación de acceso y después el formulario de autenticación existente
- **AND** no puede interactuar con el panel bibliográfico

#### Scenario: Acceder con sesión
- **WHEN** la comprobación existente confirma una sesión o se inicia sesión correctamente
- **THEN** se muestra el listado bibliográfico como pantalla inicial del panel

#### Scenario: Cerrar la sesión
- **WHEN** el administrador activa Cerrar sesión y el servicio confirma su cierre
- **THEN** se retiran el panel, los formularios abiertos y sus valores temporales
- **AND** se presenta nuevamente el acceso administrativo

### Requirement: Vista previa identificada y sin mutaciones bibliográficas

Los registros de ejemplo SHALL ser sintéticos, exclusivos del panel y distinguibles del catálogo real por su propio contenido: títulos identificados como ejemplos y una cantidad de resultados expresada como registros de ejemplo. La interfaz SHALL NOT mostrar un aviso general de vista previa ni textos que expliquen que el guardado está pendiente. Guardar un alta y guardar una edición SHALL permanecer deshabilitados, incluso con campos válidos. Confirmar una eliminación SHALL permanecer deshabilitado con la explicación que muestra su diálogo. Ninguna interacción bibliográfica SHALL enviar escrituras, crear, modificar o eliminar registros del listado ni persistir borradores en el navegador. Las operaciones reales de autenticación SHALL continuar disponibles.

#### Scenario: Revisar datos de ejemplo
- **WHEN** el administrador abre el listado con contenido
- **THEN** puede reconocer que los registros son ejemplos por sus títulos y por la cantidad de resultados identificada como registros de ejemplo
- **AND** no se muestra un aviso general de vista previa
- **AND** esos registros no aparecen en las fichas públicas ni en la experiencia VR

#### Scenario: Intentar guardar un formulario válido
- **WHEN** se completan correctamente los campos de un alta o una edición
- **THEN** el control de guardado sigue deshabilitado, sin texto explicativo adicional
- **AND** ni pulsar Enter ni intentar enviar el formulario produce una escritura, un cambio en el listado o un mensaje de guardado exitoso

#### Scenario: Salir y volver a abrir
- **WHEN** se descarta un formulario, se recarga la página o se cierra la sesión
- **THEN** sus cambios temporales no se conservan como registros ni como borradores guardados

### Requirement: Navegación organizada del panel

El panel SHALL ofrecer una entrada identificable a Registros bibliográficos, una acción Agregar libro, acciones Editar y Eliminar asociadas a cada registro y los controles de volver a la exploración y cerrar sesión. La navegación SHALL indicar la sección activa. Listado, Agregar libro y Editar libro SHALL NOT mostrar sobrelínea, título ni descripción propios. Cada formulario SHALL ofrecer una forma clara de regresar al listado. Volver desde un formulario o cerrar una confirmación SHALL conservar la búsqueda y el filtro activos durante esa visita al listado.

#### Scenario: Abrir el listado
- **WHEN** se muestra el listado bibliográfico
- **THEN** la navegación indica Registros bibliográficos como sección activa
- **AND** los filtros y registros aparecen sin sobrelínea, título ni descripción previos

#### Scenario: Recorrer alta y edición
- **WHEN** se activa Agregar libro o Editar en un registro
- **THEN** se abre el formulario correspondiente sin título visible, con un nombre accesible que identifica la operación y el botón Guardar libro o Guardar cambios según corresponda
- **AND** Cancelar o Volver al listado permite regresar a los mismos resultados sin aplicar cambios

#### Scenario: Volver a la exploración
- **WHEN** se activa el enlace de regreso a la exploración
- **THEN** se abre la escena pública en su ruta habitual
- **AND** ningún campo temporal del panel se incorpora a sus fichas

### Requirement: Listado bibliográfico legible

El listado SHALL presentarse como una galería de tarjetas, una por registro. Cada tarjeta SHALL mostrar un espacio de portada, el título, la autoría, la editorial, el año, etiquetas con los cuerpos celestes relacionados y acciones Editar y Eliminar inequívocamente vinculadas al libro. La portada SHALL mostrar la parte elegida de la fotografía del libro cuando exista. Sin fotografía, el espacio de portada SHALL mostrarse vacío. La portada SHALL NOT mostrar composiciones orbitales, imágenes de cuerpos celestes ni indicaciones superpuestas, y su contenido SHALL ser decorativo. Un libro relacionado con varios cuerpos SHALL aparecer una sola vez e identificar todas sus relaciones con sus etiquetas. La ausencia de editorial, año o relaciones SHALL indicarse con textos explícitos en la información de la tarjeta, sin valores inventados. La galería SHALL mostrar la cantidad de registros que cumplen la búsqueda y el filtro actuales. Sin criterios activos, la galería SHALL terminar con una tarjeta que abre Agregar libro.

#### Scenario: Consultar registros con varias relaciones
- **WHEN** se representa un libro asociado a la Tierra y la Luna
- **THEN** aparece una sola tarjeta con las etiquetas Tierra y Luna y sus acciones inequívocamente vinculadas al libro

#### Scenario: Consultar un libro con fotografía
- **WHEN** un registro tiene fotografía
- **THEN** su portada muestra la parte de la fotografía elegida en su encuadre
- **AND** no muestra imágenes de cuerpos celestes ni indicaciones sobre la fotografía

#### Scenario: Consultar un libro sin fotografía
- **WHEN** un registro no tiene fotografía
- **THEN** su espacio de portada se muestra vacío
- **AND** no muestra composición orbital, imágenes de cuerpos celestes ni indicaciones

#### Scenario: Consultar información opcional ausente
- **WHEN** un registro no tiene editorial, año o cuerpos asociados
- **THEN** se muestran respectivamente Sin editorial, Año no indicado o Sin asociar en la información de la tarjeta
- **AND** la información restante y las acciones siguen disponibles

#### Scenario: Agregar desde la galería
- **WHEN** se muestra la galería sin búsqueda ni filtro
- **THEN** la última tarjeta ofrece Agregar libro y abre el formulario de alta
- **AND** esa tarjeta no se muestra mientras haya criterios activos

#### Scenario: Listado sin registros
- **WHEN** la colección proporcionada al panel está vacía
- **THEN** se muestra un estado vacío con una explicación y la acción Agregar libro
- **AND** no se añaden ejemplos automáticamente para ocultar ese estado

### Requirement: Búsqueda y filtro por cuerpo celeste

El panel SHALL permitir buscar por título o autoría y filtrar por un cuerpo celeste. La búsqueda SHALL ignorar mayúsculas, tildes y espacios exteriores. Ambos criterios SHALL combinarse; un libro con varias relaciones SHALL coincidir con cualquiera de sus cuerpos. SHALL existir una acción para limpiar los criterios y recuperar el listado completo.

#### Scenario: Combinar búsqueda y cuerpo
- **WHEN** se introduce una parte del título o de la autoría y se elige un cuerpo celeste
- **THEN** solo aparecen los registros que cumplen ambos criterios, sin duplicados
- **AND** se actualiza la cantidad de resultados

#### Scenario: Buscar sin coincidencias
- **WHEN** existen registros pero ninguno cumple los criterios
- **THEN** se muestra un mensaje de ausencia de resultados diferente del catálogo vacío
- **AND** limpiar los criterios recupera los registros de ejemplo originales

### Requirement: Formularios para preparar altas y ediciones

Los formularios SHALL ofrecer título, autoría, editorial, año y URL de la ficha bibliográfica, una fotografía opcional del libro y la selección de cuerpos celestes. Título, autoría y URL SHALL identificarse como obligatorios; editorial, año y fotografía SHALL ser opcionales. El alta SHALL comenzar vacía y sin fotografía. La edición SHALL presentar los valores originales del libro seleccionado, incluidos su fotografía y su encuadre. Los campos SHALL poder modificarse como borrador temporal, sin alterar el registro mostrado en el listado.

#### Scenario: Preparar un alta
- **WHEN** se abre Agregar libro
- **THEN** se muestran campos vacíos, indicación de obligatoriedad, el campo de fotografía sin imagen y selección inicial sin cuerpos asociados
- **AND** Guardar libro permanece deshabilitado sin texto explicativo

#### Scenario: Preparar una edición
- **WHEN** se abre Editar para un registro
- **THEN** se muestran sus datos, su fotografía si la tiene y sus asociaciones actuales
- **AND** modificar un campo, la fotografía o su encuadre solo cambia el borrador visible

#### Scenario: Cancelar una edición
- **WHEN** se modifican datos o la fotografía, se cancela y se vuelve a editar el mismo registro
- **THEN** reaparecen sus valores originales, sin conservar el borrador cancelado

### Requirement: Validación visual de los campos

La interfaz SHALL señalar errores al abandonar un campo que se haya editado y actualizar el mensaje al corregirlo. Título y autoría SHALL rechazar contenido compuesto únicamente por espacios. La URL SHALL requerir un destino absoluto con protocolo HTTP o HTTPS. El año, cuando se indique, SHALL ser un entero positivo de hasta cuatro cifras. Cada error SHALL estar asociado al campo y expresarse en texto; su corrección SHALL NOT habilitar el guardado en esta etapa.

#### Scenario: Mostrar y corregir errores
- **WHEN** se introduce un título vacío, una URL no válida o un año decimal y se abandona el campo correspondiente
- **THEN** se identifica el campo con un mensaje que explica cómo corregirlo
- **AND** al introducir un valor válido desaparece su error sin enviar información

#### Scenario: Conservar campos opcionales vacíos
- **WHEN** se dejan vacíos editorial y año
- **THEN** esos campos no generan errores ni se sustituyen por información inventada

### Requirement: Preparación de relaciones con cuerpos celestes

El formulario SHALL permitir seleccionar y retirar de su borrador cero, uno o varios cuerpos entre Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano, Neptuno, Luna, Europa, Titán y Tritón. SHALL distinguir planetas de satélites e identificar el planeta principal de cada satélite. Cada cuerpo SHALL poder seleccionarse una sola vez. Cambiar una relación del borrador SHALL NOT alterar las asociaciones originales del listado.

#### Scenario: Relacionar varios cuerpos
- **WHEN** se seleccionan Tierra y Luna en el formulario
- **THEN** ambas aparecen seleccionadas y Luna se identifica como satélite de la Tierra
- **AND** ninguna selección se duplica ni se aplica al registro original

#### Scenario: Retirar todas las relaciones del borrador
- **WHEN** se desmarcan todos los cuerpos de una edición
- **THEN** el formulario indica Sin asociar y permanece disponible para seguir editando
- **AND** cancelar recupera las relaciones originales

### Requirement: Confirmación visual de eliminación

Cada registro SHALL disponer de una acción Eliminar que abra un diálogo identificando su título y las relaciones que se retirarían con una futura eliminación. El diálogo SHALL mostrar Cancelar y un control de confirmación deshabilitado, junto con la explicación de que la eliminación aún no está disponible. Abrir o cerrar el diálogo SHALL conservar íntegro el listado.

#### Scenario: Revisar una eliminación
- **WHEN** se activa Eliminar en un registro con asociaciones
- **THEN** el diálogo muestra el título y las relaciones afectadas por la operación futura
- **AND** la confirmación permanece deshabilitada y no se anuncia una eliminación exitosa

#### Scenario: Cancelar la confirmación
- **WHEN** se usa Cancelar, el cierre del diálogo o Escape
- **THEN** se cierra la confirmación, se conserva el registro y el foco vuelve a la acción que la abrió

### Requirement: Presentación adaptable y accesible

Listado, formularios y confirmación SHALL ser utilizables en escritorio y móvil, incluido un ancho de 360 píxeles, con desplazamiento que permita alcanzar todo su contenido y sin desbordamiento horizontal de la página. Los controles SHALL tener nombres accesibles, etiquetas y foco visible. La navegación SHALL ser operable con teclado y no depender del color, hover o iconos sin texto. La confirmación SHALL mantener el foco dentro mientras permanezca abierta y los formularios SHALL llevar el foco al campo Título al abrirse.

#### Scenario: Revisar el panel en móvil
- **WHEN** se abre el panel en una pantalla de 360 píxeles de ancho
- **THEN** pueden leerse los datos y alcanzarse todas las acciones mediante desplazamiento vertical
- **AND** los formularios y el diálogo permanecen dentro del área visible de la página

#### Scenario: Recorrer las operaciones con teclado
- **WHEN** se utiliza Tab, Shift+Tab, Enter, Espacio y Escape según el control activo
- **THEN** se pueden abrir formularios, seleccionar relaciones, revisar la confirmación y cancelar con foco visible
- **AND** ninguna de esas acciones activa los controles bibliográficos deshabilitados

#### Scenario: Abrir un formulario
- **WHEN** se abre Agregar libro o Editar
- **THEN** el foco se sitúa en el campo Título
- **AND** al cancelar o volver, el foco regresa al control que abrió el formulario

### Requirement: Fotografía del libro

El formulario SHALL permitir elegir una fotografía del libro con un control de archivo accesible por teclado o arrastrándola sobre el campo. SHALL aceptar imágenes JPG, PNG o WebP de hasta 5 MB. Un archivo con otro formato o de mayor tamaño SHALL rechazarse con un mensaje asociado al campo, sin modificar la fotografía vigente del borrador. Con una fotografía elegida, el campo SHALL mostrarla completa con el área visible marcada. SHALL ofrecer un control operable con teclado para mover esa área en el eje que se recorta y una vista previa de la tarjeta con el encuadre actual. SHALL permitir cambiar y quitar la fotografía. La fotografía y su encuadre SHALL pertenecer exclusivamente al borrador temporal: SHALL NOT enviarse a ningún servidor, persistirse en el navegador ni incorporarse al listado. Los registros de ejemplo SHALL NOT incluir fotografías.

#### Scenario: Elegir una fotografía válida
- **WHEN** se elige o se arrastra una imagen JPG, PNG o WebP de hasta 5 MB
- **THEN** el campo muestra la imagen completa con el área visible marcada y la vista previa de la tarjeta la usa como portada
- **AND** no se realiza ninguna petición de red

#### Scenario: Rechazar un archivo no válido
- **WHEN** se elige un archivo de otro formato o de más de 5 MB
- **THEN** se muestra un mensaje que explica los formatos y el tamaño admitidos
- **AND** el borrador conserva la fotografía que tenía

#### Scenario: Ajustar la parte visible
- **WHEN** se mueve el control de parte visible con el ratón o con las flechas del teclado
- **THEN** el área marcada y la portada de la vista previa muestran la misma parte de la fotografía

#### Scenario: Quitar o descartar la fotografía
- **WHEN** se quita la fotografía, o se cancela el formulario y se vuelve a abrir
- **THEN** la vista previa vuelve al espacio de portada vacío, o reaparece el estado original del registro
- **AND** el listado conserva la portada original del libro
