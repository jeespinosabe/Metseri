# fichas-cuerpos-celestes Specification

## Purpose

Presentar una ficha visual de cada planeta seleccionado, con espacios para contenido educativo pendiente y navegación coherente en pantalla y visor móvil.

## Requirements

### Requirement: Una ficha vinculada a la selección

La aplicación SHALL mostrar una única ficha del cuerpo seleccionado, entre los ocho planetas y los cuatro satélites, y conservarla al apartar el mouse o la mirada. Apuntar sin seleccionar SHALL NOT abrir ni sustituir la ficha. Deseleccionar o usar su cierre SHALL retirar la ficha y la selección persistente. Seleccionar otro planeta o satélite en vista única SHALL sustituir su identidad e imagen y reiniciar la lectura. El contenido remoto SHALL corresponder al cuerpo seleccionado; una respuesta tardía SHALL NOT sustituir otra selección ni reabrir una ficha cerrada.

#### Scenario: Apuntar sin seleccionar
- **WHEN** se apunta a un cuerpo sin activarlo
- **THEN** solo cambia su iluminación transitoria y no se abre una ficha

#### Scenario: Conservar y sustituir la ficha
- **WHEN** hay una selección y después se aparta el apuntado o se selecciona otro cuerpo en vista única
- **THEN** la primera interacción conserva la ficha y la segunda la sustituye sin acumular paneles
- **AND** cambiar entre planeta y satélite actualiza nombre, imagen, relación y rótulos de datos, reiniciando la lectura
- **AND** se retira el contenido del cuerpo anterior mientras se consulta el nuevo

#### Scenario: Cerrar o deseleccionar
- **WHEN** se cierra o deselecciona mediante el gesto correspondiente
- **THEN** se retira la ficha y solo queda brillo transitorio si el cuerpo sigue apuntado
- **AND** una consulta pendiente no vuelve a abrirla

#### Scenario: Respuestas en orden diferente al de selección
- **WHEN** se selecciona Mercurio y después Europa antes de recibir la primera respuesta
- **THEN** únicamente la respuesta válida de Europa puede rellenar la ficha visible
- **AND** la llegada posterior de Mercurio no cambia su contenido ni su identidad

### Requirement: Cinco secciones de contenido educativo

La ficha de cualquiera de los doce cuerpos SHALL conservar la estructura de identidad e imagen, subtítulo y descripción, datos principales, «¿Sabías que...?» y «Descubrir libros». Su presentación SHALL seguir la referencia: nombre grande, imagen pequeña arriba a la derecha, cuadrícula de datos en dos columnas y separadores discretos. En vista unica y VR SHALL rellenar los espacios con descripción, datos y curiosidades publicados del PDF del equipo. Los campos ausentes SHALL conservar su reserva sin inventar contenido, subtítulos o ceros. La ficha VR SHALL rellenar sus espacios con el mismo contenido conservando apariencia y controles.

#### Scenario: Revisar los ocho planetas
- **WHEN** se abre cualquier ficha de planeta en vista única y su consulta publicada tiene éxito
- **THEN** aparecen su identidad e imagen y la descripción, los cuatro datos y las dos curiosidades correspondientes al PDF
- **AND** se reutiliza la estructura visual existente

#### Scenario: Revisar los doce cuerpos
- **WHEN** se abre cualquier ficha de los ocho planetas o los cuatro satélites en vista única
- **THEN** se consulta la información publicada de ese cuerpo
- **AND** el resultado válido rellena sus espacios sin agregar libros ficticios
- **AND** un subtítulo nulo conserva la reserva existente sin redactar uno nuevo

#### Scenario: Imagen que no se puede mostrar
- **WHEN** falla la imagen de un planeta o satélite
- **THEN** se conserva una alternativa identificable y la estructura de ficha sigue disponible

### Requirement: Datos principales con unidades y tipo de cuerpo

La ficha SHALL conservar cuatro espacios de datos en dos columnas. En vista unica y VR SHALL presentar en orden las etiquetas, cifras, unidades y notas de `contenido_ficha.datos_principales` sin recalcular sus valores. Etiqueta, valor y unidad SHALL conservar sus áreas diferenciadas. Los planetas SHALL distinguir día solar y rotación según el PDF; los satélites SHALL mostrar distancia al planeta, rotación y órbita propias, sin distancia al Sol ni «Un año dura». Los valores ausentes SHALL conservar su reserva sin convertirse en cero. En VR SHALL conservarse la cuadricula y repartirse su contenido en continuaciones cuando no quepa.

#### Scenario: Consultar los datos pendientes
- **WHEN** la consulta está pendiente o falta un dato editorial válido
- **THEN** la cuadrícula conserva sus cuatro espacios y no muestra cifras de otro cuerpo, ceros de relleno ni conversiones sustitutivas

#### Scenario: Contrato de satélite futuro
- **WHEN** se valida un registro sintético de satélite
- **THEN** admite sus cuatro campos propios sin exigir distancia al Sol ni incorporarse a la escena

#### Scenario: Datos de un satélite incorporado
- **WHEN** se abre la sección de datos de Luna, Europa, Titán o Tritón en vista única
- **THEN** aparecen diámetro medio, distancia orbital media desde su planeta, período de rotación y período orbital con las cifras y unidades del PDF
- **AND** no se exige ni se muestra una distancia al Sol
- **AND** al abrirlo en VR se presentan los mismos datos en ambos ojos, con los controles anteriores

#### Scenario: Conservar los datos de un planeta
- **WHEN** después de consultar un satélite se selecciona un planeta
- **THEN** se recuperan las etiquetas, cifras y unidades del planeta seleccionado sin conservar rótulos de satélite

#### Scenario: Día solar de los planetas rocosos
- **WHEN** se consulta Mercurio, Venus, Tierra o Marte en vista única
- **THEN** se presentan respectivamente «176 días terrestres (día solar)», «116,8 días terrestres (día solar)», «24 horas (día solar)» o «24,7 horas (día solar)»
- **AND** no se sustituyen por períodos de rotación de otra fuente

#### Scenario: Años redondeados del PDF
- **WHEN** se consultan Júpiter, Saturno, Urano o Neptuno en vista única
- **THEN** sus años se presentan respectivamente como «11,9 años terrestres (aprox.)», «29,4 años terrestres (aprox.)», «84 años terrestres (aprox.)» o «165 años terrestres (aprox.)»
- **AND** se conservan las comas decimales y las notas del documento

### Requirement: Descubrir libros sin información inventada

«Descubrir libros» SHALL conservar su encabezado y ubicación. En vista unica y VR SHALL rellenar su espacio con la invitación publicada en `contenido_ficha.descubrir_libros` del cuerpo seleccionado. En este avance SHALL NOT agregar libros, enlaces o destinos provisionales ni un catálogo. El contrato existente de asociaciones futuras con título y URL HTTP/HTTPS válida SHALL conservarse. La estructura local SHALL poder abrirse sin backend; solo rellenar su contenido requiere la consulta. En VR SHALL mostrarse esa misma invitacion mediante la pestaña Libros existente.

#### Scenario: Sección pendiente de contenido
- **WHEN** se consulta «Descubrir libros» de un cuerpo cuya ficha publicada tiene la invitación del PDF y no tiene libros asociados
- **THEN** se muestra íntegra esa invitación, aunque el arreglo de libros esté vacío
- **AND** no aparecen títulos, enlaces activos o mensajes que afirmen una verificación bibliográfica inexistente

#### Scenario: Validar asociaciones futuras
- **WHEN** se comprueba una asociación sin título o destino HTTP/HTTPS utilizable
- **THEN** se descarta sin bloquear el resto de la ficha

#### Scenario: Recorrer libros y volver sin controles nuevos
- **WHEN** se desplaza el panel existente hasta «Descubrir libros», se vuelve hacia la información y después se usa el cierre
- **THEN** se conserva el cuerpo durante la lectura, el panel no mueve la escena y el cierre devuelve el foco a la exploración
- **AND** no se agregan pestañas, botones o rutas para completar ese recorrido

### Requirement: Lectura adaptable y accesible en vista única

La ficha SHALL conservar desplazamiento propio y controles utilizables en escritorio y móvil. La interacción con el panel SHALL NOT arrastrar ni activar el cielo. SHALL existir una sola lectura accesible con nombre del cuerpo, texto alternativo, identificación de espacios reservados, foco visible y acciones por teclado. Cerrar SHALL devolver el foco a la exploración.

#### Scenario: Desplazar el panel en móvil
- **WHEN** se desplaza una ficha cuyo contenido no cabe
- **THEN** se alcanzan datos, curiosidades, libros y créditos sin girar el cielo

#### Scenario: Cerrar con teclado
- **WHEN** se recorre y activa el cierre con teclado
- **THEN** la acción es identificable y devuelve el foco al cielo sin interceptar flechas del panel

### Requirement: Contenido completo en ambas vistas de VR

La ficha VR SHALL aparecer frente a la mirada al abrir y compartir cuerpo, página y sección en ambos ojos. SHALL ofrecer las secciones Ficha, Datos, ¿Sabías? y Libros mediante pestañas con estado actual visible, Anterior cuando exista una página anterior, un control de avance disponible también en la última página y cierre separado ×. Las dos imágenes SHALL usar un solo estado y SHALL NOT duplicar la lectura accesible. El contenido publicado SHALL rellenar también el Canvas y coincidir con la lectura accesible. Las continuaciones SHALL recorrerse con los mismos controles de navegación y mediante taps sobre las mitades de la tarjeta, sin perder la relación entre pestaña y sección.

Cada avance o retroceso SHALL recorrer exactamente una página, incluidas las continuaciones dentro de una sección. Desde la última página, tanto el control de avance como el tap sobre la mitad derecha sin control explícito SHALL cerrar la ficha y quitar la selección permaneciendo en VR. El control de avance final SHALL indicar «Cerrar» y la alternativa accesible VR SHALL permitir activarlo con teclado. La mitad izquierda de la primera página SHALL mantener la ficha abierta sin cambiar de página. La vista única SHALL conservar su navegación y cierre existentes.

#### Scenario: Apertura inmediata
- **WHEN** se selecciona un cuerpo en VR o se entra con una selección
- **THEN** su ficha aparece directamente frente a la mirada sin exigir buscarla a un lado

#### Scenario: Salto directo de sección
- **WHEN** se apunta a Libros desde Datos y se toca
- **THEN** ambos ojos pasan directamente a la primera página de Libros conservando selección y pestaña activa
- **AND** no se añade otra página por estar la pestaña en la mitad derecha

#### Scenario: Navegación secuencial
- **WHEN** se activa Anterior o Siguiente mediante su control o la mitad correspondiente de la tarjeta y existe esa página
- **THEN** se avanza o retrocede exactamente una página compartida por ambos ojos
- **AND** la pestaña activa representa la sección a la que pertenece la página resultante

#### Scenario: Sección con continuaciones
- **WHEN** una sección ocupa varias páginas y se activa Siguiente antes de su última continuación
- **THEN** se muestra la continuación inmediata de esa sección sin saltar a otra ni perder texto

#### Scenario: Última página con salida disponible
- **WHEN** se alcanza la última página de toda la ficha, incluida cualquier continuación de Libros
- **THEN** el control que servía para avanzar sigue disponible y muestra «Cerrar» en la tarjeta y en la alternativa accesible VR
- **AND** activarlo cierra la ficha y quita la selección sin salir de VR ni abrir otra ficha

#### Scenario: Salida final mediante teclado
- **WHEN** la alternativa accesible VR tiene el foco en el control «Cerrar» al final de la lectura y se activa con teclado
- **THEN** se cierra la misma ficha que muestran ambos ojos y el foco vuelve a la exploración
- **AND** no se generan acciones de mirada adicionales

#### Scenario: Navegación durante carga o error
- **WHEN** la ficha muestra reservas, información en carga o un error y se navega con sus mitades o controles
- **THEN** se aplican las mismas reglas de páginas y cierre sobre la lectura disponible
- **AND** no se requiere que la consulta termine para poder cerrar

#### Scenario: Conservar la vista única
- **WHEN** se consulta y se toca el contenido de una ficha en vista única
- **THEN** mantiene su desplazamiento y cierre actuales sin navegación por mitades ni cierre por tocar el lado derecho

### Requirement: Continuidad y limpieza de la ficha

Cambiar de modo SHALL conservar el cuerpo y reiniciar la sección. Recentrar SHALL conservar cuerpo y sección y recuperar la tarjeta al frente. Pérdida de WebGL o desmontaje SHALL retirar ficha y acciones; reintentar SHALL iniciar sin estados anteriores. Una imagen tardía SHALL NOT reabrir la ficha.

#### Scenario: Alternar modos y recentrar
- **WHEN** se cambia de modo o se recentra con una selección
- **THEN** permanece el cuerpo; solo el cambio de modo reinicia la sección y el recentrado recupera la tarjeta frente a la mirada

#### Scenario: Pérdida de contexto y reintento
- **WHEN** se pierde WebGL y luego se reintenta
- **THEN** se retira la ficha durante el error y la nueva escena no conserva selección ni acciones residuales

### Requirement: Identidad y recursos locales de los cuatro satélites

Las fichas SHALL identificar Luna como satélite de la Tierra, Europa de Júpiter, Titán de Saturno y Tritón de Neptuno. Cada satélite SHALL tener identidad estable, clasificación de satélite natural, planeta principal, imagen local propia, texto alternativo y crédito con enlace al origen. La relación con el planeta SHALL ser visible tanto en la ficha normal como en VR. La identidad SHALL coincidir con el cuerpo seleccionado, sin abrir la ficha del planeta principal en su lugar. Las imágenes y la apertura de la estructura local SHALL funcionar sin necesitar una respuesta del servidor API ni imágenes remotas; solo el relleno educativo en ambos modos procede de la consulta.

#### Scenario: Abrir las cuatro fichas
- **WHEN** se selecciona por separado Luna, Europa, Titán o Tritón
- **THEN** la ficha presenta el nombre, la imagen y la relación planetaria correctos en vista única y VR
- **AND** no sustituye su identidad por la de su planeta principal
- **AND** en vista única el relleno educativo coincide con el slug de ese satélite

#### Scenario: Consultar sin servidor API
- **WHEN** la aplicación está servida con sus recursos locales y el servidor API está detenido
- **THEN** las cuatro fichas se pueden abrir y sus imágenes y créditos están disponibles en la estructura habitual
- **AND** se informa la indisponibilidad del contenido en vista única sin bloquear selección o cierre
- **AND** solo abrir expresamente el enlace de créditos navega a la fuente externa

### Requirement: Conservación del diseño del sprint anterior

El relleno de contenido SHALL conservar distribución, colores, tipografía, imágenes, cuadrícula, separadores, controles y desplazamiento existentes. SHALL NOT incorporar botones, pantallas, rutas, estilos o navegación nuevos. La llegada del texto SHALL utilizar los contenedores actuales; el modo VR SHALL conservar su composición y sus controles previos.

#### Scenario: Comparar antes y después en navegador
- **WHEN** se compara la ficha vacía previa y la ficha rellenada con el mismo tamaño de ventana
- **THEN** cambia el contenido dentro de los espacios existentes sin rediseñar la interfaz
- **AND** no se modifican las hojas de estilo ni se agregan controles

#### Scenario: Conservar la experiencia del visor
- **WHEN** se entra y sale del modo VR con una selección
- **THEN** permanecen el cuerpo y las reglas anteriores de navegación y reinicio de lectura
- **AND** el contenido publicado aparece en el panel y en ambos ojos sin cambiar colores, imagenes, controles u optica

### Requirement: Consulta de contenido sin bloquear la escena

En vista unica y VR la aplicacion SHALL consultar la ficha publicada por el slug seleccionado. Durante la espera o ante un error, un 404 o un resultado incompatible SHALL conservar la escena, la identidad local y el cierre. SHALL comunicar el estado con texto breve dentro de los espacios actuales y conservar reservas en campos ausentes, sin animaciones ni controles nuevos. La respuesta de otro cuerpo SHALL descartarse.

#### Scenario: Consulta en curso
- **WHEN** se abre una ficha y su consulta todavía no termina
- **THEN** aparece su estructura local con un estado de carga comprensible
- **AND** no se conserva el texto de la selección anterior

#### Scenario: API no disponible o cuerpo no publicado
- **WHEN** la consulta falla, vence su plazo o responde 404
- **THEN** se informa que el contenido no está disponible sin simular una ficha completa
- **AND** el usuario puede continuar explorando o cerrar y volver a seleccionar sin un botón nuevo

#### Scenario: Respuesta incompatible con la selección
- **WHEN** la respuesta tiene otro slug, tipo o planeta anfitrión
- **THEN** no se aplica a la ficha visible y se comunica la indisponibilidad
- **AND** no cambia la identidad ni la relación local del cuerpo seleccionado

### Requirement: Lectura completa del contenido publicado en VR

La ficha VR SHALL presentar descripcion, cuatro datos, curiosidades e invitacion del cuerpo seleccionado mediante las cuatro pestañas y flechas existentes. SHALL envolver el texto sin recortarlo ni invadir los controles y permitir continuaciones cuando no quepa. Ambos ojos y la lectura accesible SHALL coincidir. Al llegar datos o redimensionar SHALL conservarse la seccion actual.

#### Scenario: Seleccionar directamente dentro del visor
- **WHEN** se selecciona un cuerpo estando en VR
- **THEN** se consulta su ficha y se rellena el Canvas con su contenido publicado en ambos ojos
- **AND** la informacion no depende de haber abierto antes la ficha normal

#### Scenario: Texto que necesita continuacion
- **WHEN** descripcion, datos, curiosidades o invitacion exceden el area disponible
- **THEN** las flechas existentes permiten leer el contenido completo sin recortes ni texto encima de otros controles
- **AND** cada pestaña lleva a la primera pagina de su seccion y marca correctamente la seccion actual

#### Scenario: Cambiar de modo o recibir informacion tardia
- **WHEN** se entra o sale de VR con una seleccion o llega el contenido de su consulta
- **THEN** se conserva el cuerpo, se comparte el contenido entre representaciones y no se muestran datos de otra seleccion
- **AND** una respuesta tardia tras cerrar la ficha no vuelve a abrirla
