# Spec Delta

## MODIFIED Requirements

### Requirement: Identidad y recursos locales de los cuatro satélites

Las fichas SHALL identificar Luna como satélite de la Tierra, Europa de Júpiter, Titán de Saturno y Tritón de Neptuno. Cada satélite SHALL tener identidad estable, clasificación de satélite natural, planeta principal, imagen local propia, texto alternativo y crédito con enlace al origen. La relación con el planeta SHALL ser visible tanto en la ficha normal como en VR. La identidad SHALL coincidir con el cuerpo seleccionado, sin abrir la ficha del planeta principal en su lugar. Las imágenes y la apertura de la estructura local SHALL funcionar sin necesitar una respuesta del servidor API ni imágenes remotas. El relleno educativo en ambos modos SHALL proceder de la API pública, mediante una consulta en el momento o desde la copia descargada.

#### Scenario: Abrir las cuatro fichas
- **WHEN** se selecciona por separado Luna, Europa, Titán o Tritón
- **THEN** la ficha presenta el nombre, la imagen y la relación planetaria correctos en vista única y VR
- **AND** no sustituye su identidad por la de su planeta principal
- **AND** en vista única el relleno educativo coincide con el slug de ese satélite

#### Scenario: Consultar sin servidor API
- **WHEN** la aplicación está servida con sus recursos locales, el servidor API está detenido y no hay una copia descargada compatible
- **THEN** las cuatro fichas se pueden abrir y sus imágenes y créditos están disponibles en la estructura habitual
- **AND** se informa la indisponibilidad del contenido en vista única sin bloquear selección o cierre
- **AND** solo abrir expresamente el enlace de créditos navega a la fuente externa

### Requirement: Consulta de contenido sin bloquear la escena

En vista única y VR, la aplicación SHALL consultar por slug la ficha y las recomendaciones públicas. Durante la espera y ante un error SHALL conservar la escena, la identidad local, las imágenes y el cierre. Cuando falla el transporte y hay una copia completa y compatible, SHALL mostrar para la consulta fallida lo que se descargó para ese cuerpo e identificar la copia y su fecha tanto en vista única como en VR, incluida su lectura accesible. Cuando no haya una respuesta utilizable ni una copia aplicable, SHALL comunicar el estado con texto breve dentro de los espacios actuales y conservar las reservas de los campos ausentes, sin animaciones ni controles nuevos en la ficha. SHALL descartar cualquier resultado en línea o local que corresponda a otra selección o llegue después del cierre.

#### Scenario: Consulta en curso
- **WHEN** se abre una ficha y su consulta todavía no termina
- **THEN** aparece su estructura local con un estado de carga comprensible
- **AND** no se conserva el texto de la selección anterior

#### Scenario: API no disponible o cuerpo no publicado
- **WHEN** ocurre un fallo de transporte sin copia aplicable, o la API responde con un error como 404 o 503
- **THEN** se informa que el contenido no está disponible sin simular una ficha completa
- **AND** el usuario puede continuar explorando o cerrar y volver a seleccionar sin un botón nuevo

#### Scenario: Respuesta incompatible con la selección
- **WHEN** la respuesta tiene otro slug, tipo o planeta anfitrión
- **THEN** no se aplica a la ficha visible y se comunica la indisponibilidad
- **AND** no cambia la identidad ni la relación local del cuerpo seleccionado

#### Scenario: Leer una ficha y sus recomendaciones descargadas
- **WHEN** falla el transporte y se abre la ficha de cualquier cuerpo tras completar la descarga
- **THEN** se pueden recorrer la descripción, los datos, las curiosidades y las recomendaciones públicas guardadas del cuerpo, con la fecha de la copia y el formato correspondiente a la vista única o a VR
- **AND** una lista vacía guardada se presenta como ausencia de recomendaciones, distinguiéndola de un fallo de consulta, y los enlaces a sitios externos requieren conexión

#### Scenario: Volver a consultar después de recuperar la conexión
- **WHEN** se selecciona de nuevo un cuerpo y vuelven a estar disponibles sus respuestas públicas en línea
- **THEN** se presentan los datos y las recomendaciones de esas respuestas sin identificar el contenido en línea como una copia descargada
