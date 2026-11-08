# Spec Delta

## MODIFIED Requirements

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
