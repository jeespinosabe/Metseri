# Spec Delta

## MODIFIED Requirements

### Requirement: Descubrir libros sin información inventada

«Descubrir libros» SHALL conservar su encabezado y ubicación y presentar hasta tres libros elegibles del cuerpo seleccionado, en el orden público, con título y URL HTTP/HTTPS válida. En vista normal SHALL conservar la invitación publicada cuando exista; en VR se aplica la presentación bibliográfica resumida. SHALL NOT inventar títulos, destinos ni verificación institucional. La estructura local SHALL poder abrirse sin backend; cargar libros publicados requiere la consulta.

#### Scenario: Sección pendiente de contenido
- **WHEN** se consulta libros sin asociaciones publicadas
- **THEN** aparece el estado vacío con la invitación del cuerpo, si existe, sin títulos ni enlaces ficticios

#### Scenario: Validar asociaciones futuras
- **WHEN** se comprueba una asociación sin título o destino HTTP/HTTPS utilizable
- **THEN** se descarta sin bloquear el resto de la ficha

#### Scenario: Recorrer las tres sugerencias
- **WHEN** el cuerpo tiene tres libros elegibles
- **THEN** se presentan tres títulos distintos con autoría, editorial y año confirmado, conservando su orden
- **AND** los mismos libros están disponibles en vista única y VR

#### Scenario: Cobertura pública incompleta
- **WHEN** hay menos de tres libros elegibles, aunque existan más candidatos administrativos
- **THEN** se muestran solo los libros públicos válidos y un aviso neutral de recomendaciones en preparación
- **AND** no se afirma completada la cobertura pública ni se revelan candidatos privados

## ADDED Requirements

### Requirement: Identidad visual de las recomendaciones
La sección SHALL conservar el fondo azul oscuro, acento verde claro, tipografía y jerarquía de la ficha de Metseri. En vista normal las tres sugerencias SHALL organizarse en bloques verticales legibles con título, datos bibliográficos y explicación temática breve en español mexicano, sin clasificación por edad o nivel. En VR se aplica la presentación bibliográfica resumida.

#### Scenario: Lectura en escritorio y móvil
- **WHEN** se consulta la sección en escritorio o una pantalla móvil estrecha
- **THEN** las recomendaciones se alcanzan mediante el desplazamiento del panel, sin desbordamiento horizontal ni activación del cielo
- **AND** la interfaz conserva su apariencia astronómica y no exige un carrusel para descubrir un título

### Requirement: Interacción accesible para público general
Los controles SHALL ser accesibles con teclado y tacto, tener foco visible y nombres descriptivos, y conservar legibilidad al ampliar el texto. El color SHALL NOT ser la única forma de distinguir opciones o estados. La sección SHALL NOT incluir botones, filtros ni etiquetas para elegir recomendaciones por edad o nivel de lectura.

#### Scenario: Consultar y abrir una ficha bibliográfica
- **WHEN** una persona activa en vista normal el enlace de un libro con teclado, tacto o mouse
- **THEN** se abre únicamente el destino institucional permitido y se informa que abre otra pestaña
- **AND** el título largo se adapta sin ocultar información esencial y los controles táctiles tienen al menos 44 por 44 píxeles CSS

### Requirement: Lectura bibliográfica en VR
La sección Libros de VR SHALL mostrar las mismas obras con solo título, autor, editorial y año, con estado compartido en ambos ojos y una sola lectura accesible. SHALL conservar el tamaño del título y usar negrita, con autor debajo y editorial · año en tono tenue. SHALL NOT incluir explicación, invitación ni enlaces en páginas con libros. SHALL conservar pestañas, avance, retroceso, cierre y recentrado existentes y exigir activación explícita para navegar.

#### Scenario: Lectura resumida con la referencia visual
- **WHEN** se consulta un libro en VR
- **THEN** aparece el número a la izquierda, el título en negrita al tamaño anterior, el autor y editorial · año alineados debajo
- **AND** no se presentan explicación, invitación ni enlace; la vista normal conserva su contenido completo

#### Scenario: Tres libros con títulos extensos
- **WHEN** las tres fichas bibliográficas no caben en una sola página VR
- **THEN** se distribuyen en páginas adicionales sin recortar textos ni reducirlos hasta hacerlos ilegibles
- **AND** ambos ojos muestran el mismo libro y página y continúan disponibles los controles existentes

### Requirement: Estados de consulta sin pérdida de contexto
La sección SHALL distinguir carga, ausencia de libros, error de consulta y resultados incompletos. Una respuesta tardía de otro cuerpo SHALL NOT sustituir las sugerencias actuales ni reabrir una ficha cerrada. Un error de libros SHALL NOT bloquear la información astronómica o el cierre.

#### Scenario: Cambiar de cuerpo durante la consulta
- **WHEN** se selecciona otro cuerpo antes de que lleguen sus recomendaciones
- **THEN** solo la respuesta del cuerpo actualmente seleccionado puede rellenar la sección
- **AND** un fallo o retraso conserva operativos cierre, navegación y exploración
