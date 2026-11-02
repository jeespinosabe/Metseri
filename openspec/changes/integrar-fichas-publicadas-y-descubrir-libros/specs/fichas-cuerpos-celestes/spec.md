# Spec Delta

## MODIFIED Requirements

### Requirement: Una ficha vinculada a la selección

La aplicación SHALL mostrar una única ficha del cuerpo seleccionado entre los ocho planetas y cuatro satélites, conservándola al apartar el apuntado. Apuntar sin seleccionar SHALL NOT abrir ni sustituir la ficha. Cerrar o deseleccionar SHALL retirar ficha y selección. Seleccionar otro cuerpo en vista única SHALL sustituir identidad, imagen y contenido, reiniciar la lectura y solicitar su ficha pública por slug.

#### Scenario: Apuntar sin seleccionar
- **WHEN** se apunta a un cuerpo sin activarlo
- **THEN** solo cambia su iluminación transitoria y no se abre una ficha ni se consulta su contenido

#### Scenario: Conservar y sustituir la ficha
- **WHEN** hay una selección y después se aparta el apuntado o se selecciona otro cuerpo en vista única
- **THEN** la primera interacción conserva la ficha y la segunda la sustituye sin acumular paneles
- **AND** cambiar entre planeta y satélite actualiza nombre, imagen, relación y rótulos de datos, reiniciando la lectura y retirando el contenido del cuerpo anterior

#### Scenario: Cerrar o deseleccionar
- **WHEN** se cierra o deselecciona mediante el gesto correspondiente
- **THEN** se retira la ficha y solo queda brillo transitorio si el cuerpo sigue apuntado

### Requirement: Cinco secciones de contenido educativo

La ficha SHALL conservar identidad e imagen, subtítulo y descripción, datos principales, «¿Sabías que...?» y «Descubrir libros». SHALL mostrar el contenido público recibido, sin inventarlo, con nombre grande, imagen local arriba a la derecha, datos en dos columnas y separadores discretos. Los campos ausentes SHALL identificarse como no disponibles; los espacios editoriales vacíos permanentes SHALL sustituirse por contenido o estados explícitos.

#### Scenario: Revisar los ocho planetas
- **WHEN** se abre la ficha de un planeta con contenido público disponible
- **THEN** aparecen su descripción, datos y curiosidades publicados bajo su identidad e imagen correctas
- **AND** el contenido no se sustituye por una copia local del PDF ni por ejemplos

#### Scenario: Revisar los doce cuerpos
- **WHEN** se abre por separado la ficha de cualquiera de los ocho planetas o cuatro satélites
- **THEN** cada panel conserva sus cinco bloques y su identidad propia, incluidos los estados de contenido pendiente o no disponible
- **AND** una ficha pública presenta exclusivamente sus propios campos y asociaciones bibliográficas

#### Scenario: Imagen que no se puede mostrar
- **WHEN** falla la imagen de un planeta o satélite
- **THEN** se conserva una alternativa identificable y la estructura de ficha sigue disponible

#### Scenario: Contenido público incompleto
- **WHEN** una ficha pública tiene descripción o datos nulos, subtítulo vacío o ninguna curiosidad
- **THEN** no aparecen `null`, `undefined`, cifras inventadas ni reservas que simulen una carga indefinida
- **AND** se omite el subtítulo vacío y se indica «Descripción no disponible», «Dato no disponible» o «No hay curiosidades publicadas para este cuerpo», según corresponda

### Requirement: Datos principales con unidades y tipo de cuerpo

La ficha SHALL presentar cuatro datos con etiquetas, valores y unidades diferenciados. Los planetas SHALL usar diámetro, distancia al Sol, período de rotación y período orbital; los satélites, diámetro, distancia al planeta, período de rotación y período orbital. Los valores SHALL conservar el significado de las unidades base publicadas; ausencia SHALL NOT convertirse en cero ni rotación en día solar. Los satélites SHALL NOT rotular la órbita como «Un año dura».

#### Scenario: Consultar los datos pendientes
- **WHEN** falta un dato principal de una ficha publicada
- **THEN** conserva su etiqueta y unidad, y comunica que el dato no está disponible en lugar de mostrar cero
- **AND** un valor numérico igual a cero no se confunde con ausencia

#### Scenario: Contrato de satélite futuro
- **WHEN** se valida un registro sintético de satélite
- **THEN** admite sus cuatro campos propios sin exigir distancia al Sol ni incorporarse a la escena

#### Scenario: Datos de un satélite incorporado
- **WHEN** se abre la sección de datos de Luna, Europa, Titán o Tritón en vista única o VR
- **THEN** aparecen diámetro en km, distancia al planeta en km, período de rotación en horas o días terrestres y período orbital en días terrestres
- **AND** se muestran los valores públicos disponibles sin exigir ni mostrar distancia al Sol

#### Scenario: Conservar los datos de un planeta
- **WHEN** después de consultar un satélite se selecciona un planeta
- **THEN** se recuperan sus etiquetas, unidades y valores propios sin conservar rótulos o datos de satélite

#### Scenario: Diferenciar rotación y día solar
- **WHEN** la API entrega `rotacion_horas` para un planeta
- **THEN** se presenta como «Período de rotación», con su conversión de unidad explícita y su carácter retrógrado cuando proceda
- **AND** no se presenta ese valor como el día solar del PDF ni se calcula un día solar que no figura en la respuesta

### Requirement: Descubrir libros sin información inventada

«Descubrir libros» SHALL ser una sección accesible dentro de cada ficha, con acceso directo y asociaciones públicas del cuerpo seleccionado. SHALL mostrar título, autoría, editorial y año cuando existan, y enlaces bibliográficos HTTP/HTTPS utilizables. SHALL NOT inventar libros, disponibilidad o préstamos. Cuando una ficha pública no tenga asociaciones utilizables SHALL mostrar una invitación a la Biblioteca «Solón Argüello» y explicar la ausencia de libros verificados.

#### Scenario: Sección pendiente de contenido
- **WHEN** se consulta la sección de una ficha pública sin libros utilizables
- **THEN** se muestra «Aún no hay libros verificados asociados a [nombre]» y una invitación a seguir explorando en los libros físicos de la Biblioteca «Solón Argüello»
- **AND** no aparecen títulos ficticios, botones de catálogo inexistentes ni enlaces inventados

#### Scenario: Validar asociaciones futuras
- **WHEN** se recibe una asociación sin título o destino HTTP/HTTPS utilizable
- **THEN** se descarta sin bloquear el resto de la ficha

#### Scenario: Consultar asociaciones públicas
- **WHEN** la ficha pública de un cuerpo contiene libros utilizables
- **THEN** «Descubrir libros» muestra esos libros en el orden recibido, con título y los metadatos bibliográficos disponibles
- **AND** seleccionar otro cuerpo retira las asociaciones anteriores antes de mostrar las nuevas

#### Scenario: Acceso directo y regreso a la lectura
- **WHEN** se activa «Descubrir libros» desde la ficha o se regresa a «Ficha»
- **THEN** se alcanza la sección correspondiente sin cerrar el panel, perder el cuerpo seleccionado ni reiniciar la escena

### Requirement: Lectura adaptable y accesible en vista única

La ficha SHALL conservar desplazamiento propio y controles utilizables en escritorio y móvil, sin arrastrar ni activar el cielo al interactuar con ella. SHALL ofrecer una única lectura accesible con identidad, alternativas de imagen, estados de consulta anunciados, foco visible y acciones por teclado. El acceso directo a libros SHALL llevar el foco a su sección; cerrar SHALL devolverlo a la exploración.

#### Scenario: Desplazar el panel en móvil
- **WHEN** se desplaza una ficha cuyo contenido no cabe
- **THEN** se alcanzan datos, curiosidades, libros y créditos sin girar el cielo ni desplazar horizontalmente la página

#### Scenario: Cerrar con teclado
- **WHEN** se recorre y activa el cierre con teclado
- **THEN** la acción es identificable y devuelve el foco al cielo sin interceptar flechas del panel

#### Scenario: Acceder a libros con teclado
- **WHEN** se activa el acceso directo a «Descubrir libros» con teclado
- **THEN** su encabezado queda visible y recibe el foco, y se pueden recorrer sus enlaces o volver a la ficha
- **AND** las acciones de interfaz no seleccionan ni deseleccionan cuerpos accidentalmente

### Requirement: Contenido completo en ambas vistas de VR

La ficha VR SHALL abrir frente a la mirada y compartir cuerpo, contenido y sección en ambos ojos, con una sola lectura accesible. SHALL conservar Ficha, Datos, ¿Sabías? y Libros, pestaña activa, flechas habilitadas y cierre ×. El contenido público y sus estados SHALL coincidir con la ficha normal. El texto que exceda el espacio SHALL distribuirse en páginas alcanzables, sin recortarse ni invadir los controles.

#### Scenario: Apertura inmediata
- **WHEN** se selecciona un cuerpo en VR o se entra con una selección
- **THEN** su ficha aparece directamente frente a la mirada sin exigir buscarla a un lado
- **AND** ambos ojos presentan el mismo estado de carga, contenido o indisponibilidad

#### Scenario: Salto directo de sección
- **WHEN** se apunta a Libros desde Datos y se toca
- **THEN** ambos ojos pasan al inicio de Libros conservando selección y pestaña activa, aunque las secciones anteriores ocupen varias páginas

#### Scenario: Navegación secuencial
- **WHEN** se utiliza una flecha habilitada
- **THEN** se avanza o retrocede exactamente una página de lectura y en los extremos no hay una acción inexistente
- **AND** el indicador identifica la sección y la posición de lectura actuales

#### Scenario: Contenido que supera una página
- **WHEN** la descripción, curiosidades o lista de libros no cabe en el área disponible
- **THEN** todo su contenido sigue siendo alcanzable mediante la navegación, sin texto sobre pestañas, cierre o flechas
- **AND** cambiar de tamaño conserva una posición válida y ambas vistas permanecen sincronizadas

### Requirement: Continuidad y limpieza de la ficha

Cambiar de modo SHALL conservar cuerpo y consulta de contenido, reiniciando la sección. Recentrar SHALL conservar cuerpo y sección y recuperar la tarjeta al frente. Pérdida de WebGL o desmontaje SHALL retirar ficha, acciones y consultas pendientes; reintentar la escena SHALL iniciar sin estados anteriores. Las respuestas e imágenes tardías SHALL NOT reabrir una ficha ni sustituir la selección vigente.

#### Scenario: Alternar modos y recentrar
- **WHEN** se cambia de modo o se recentra con una selección
- **THEN** permanece el cuerpo y su contenido; solo el cambio de modo reinicia la sección y el recentrado recupera la tarjeta frente a la mirada
- **AND** esas acciones no disparan consultas de contenido duplicadas

#### Scenario: Pérdida de contexto y reintento
- **WHEN** se pierde WebGL y luego se reintenta
- **THEN** se retira la ficha durante el error y la nueva escena no conserva selección ni acciones residuales
- **AND** una respuesta de la escena anterior no aparece en la nueva

### Requirement: Identidad y recursos locales de los cuatro satélites

Las fichas SHALL identificar Luna como satélite de Tierra, Europa de Júpiter, Titán de Saturno y Tritón de Neptuno, con identidad estable, clasificación, relación, imagen local, alternativa y crédito de origen propios. La identidad SHALL coincidir con la selección en vista única y VR. Las imágenes y la estructura local SHALL estar disponibles sin API; su contenido editorial SHALL consultarse por el slug del satélite, sin sustituirse por el del planeta.

#### Scenario: Abrir las cuatro fichas
- **WHEN** se selecciona por separado Luna, Europa, Titán o Tritón
- **THEN** la ficha presenta el nombre, imagen y relación planetaria correctos en vista única y VR
- **AND** solicita el slug del satélite, no la ficha de su planeta principal

#### Scenario: Consultar sin servidor API
- **WHEN** la aplicación está servida con sus recursos locales y el servidor API está detenido
- **THEN** las cuatro fichas conservan identidad, imagen, créditos y cierre, con un estado explícito de contenido no disponible
- **AND** explorar, seleccionar, recentrar y alternar VR sigue funcionando; solo abrir expresamente créditos navega a su fuente externa

## ADDED Requirements

### Requirement: Estados de consulta de contenido público

Seleccionar un cuerpo SHALL consultar su ficha pública mediante la API de Metseri. La ficha SHALL distinguir carga, contenido recibido, no disponible y error recuperable. Un 404 SHALL tratarse igual para cuerpos inexistentes y no publicados. Errores de red, servidor, tiempo de espera o formato SHALL ofrecer reintento, con una espera máxima de doce segundos, sin bloquear la escena ni presentarse como ausencia de libros.

#### Scenario: Carga inicial
- **WHEN** se selecciona un cuerpo y la consulta está pendiente
- **THEN** se muestra «Cargando ficha de [nombre]…» bajo su identidad local y el cierre sigue operativo
- **AND** no se muestra el contenido del cuerpo anterior ni una falsa lista vacía

#### Scenario: Ficha no disponible
- **WHEN** la API responde 404
- **THEN** se informa «La ficha de [nombre] no está disponible» sin distinguir inexistencia de falta de publicación
- **AND** no se presenta contenido privado ni se utiliza el PDF como respaldo silencioso

#### Scenario: Fallo y recuperación
- **WHEN** la consulta falla o supera su espera máxima y después se activa Reintentar
- **THEN** se comunica «No pudimos cargar esta ficha. Inténtalo de nuevo» y se vuelve a consultar únicamente el cuerpo que continúa seleccionado
- **AND** se conserva la escena, orientación y selección y no se muestran datos técnicos o credenciales

### Requirement: Correspondencia de respuestas con la selección vigente

Una respuesta SHALL mostrarse únicamente si su slug y tipo corresponden al cuerpo de la selección vigente y la relación planetaria de un satélite es coherente. El UUID remoto SHALL NOT sustituir al identificador usado por la escena. Cambiar o cerrar la selección SHALL invalidar la consulta anterior; una respuesta obsoleta SHALL NOT alterar identidad, datos, libros o estado de lectura actuales.

#### Scenario: Respuestas fuera de orden
- **WHEN** se selecciona Tierra y después Luna antes de que termine la primera consulta, y Tierra responde al final
- **THEN** solo puede mostrarse el contenido de Luna y los libros de Tierra no aparecen en su ficha

#### Scenario: Cerrar durante la consulta
- **WHEN** se cierra una ficha antes de recibir su respuesta
- **THEN** la respuesta no reabre el panel ni restaura la selección

#### Scenario: Respuesta incompatible
- **WHEN** la API devuelve otro slug, un tipo incompatible o una relación planetaria incorrecta para el satélite seleccionado
- **THEN** se presenta un error recuperable sin mezclar ese contenido con la identidad local

### Requirement: Apertura de fichas bibliográficas y continuidad

Activar un libro utilizable SHALL abrir su ficha bibliográfica en otra pestaña desde una acción explícita, sin dar acceso a la pestaña de Metseri. En VR SHALL liberar el modo inmersivo conservando el cuerpo para continuar en vista normal. Si el navegador bloquea la apertura SHALL comunicarlo y ofrecer un enlace HTML utilizable. Volver a Metseri SHALL conservar la selección y permitir regresar al cielo mediante el cierre habitual.

#### Scenario: Abrir desde la ficha normal
- **WHEN** se activa un libro válido en «Descubrir libros»
- **THEN** se solicita su URL real en otra pestaña sin perder la selección ni la sección de libros en Metseri

#### Scenario: Abrir desde VR
- **WHEN** se apunta a un libro y se completa el gesto de activación simple existente
- **THEN** se solicita la apertura una sola vez, se sale de VR y se conserva el cuerpo en vista normal
- **AND** un doble tap de recentrado no abre un libro y el texto de lectura no se convierte en un enlace accidental

#### Scenario: Apertura bloqueada
- **WHEN** el navegador bloquea la nueva pestaña
- **THEN** la ficha normal informa del bloqueo y ofrece «Abrir ficha bibliográfica» mediante un enlace explícito
- **AND** el cuerpo sigue seleccionado y no se anuncia una apertura exitosa
