# Spec Delta

## MODIFIED Requirements

### Requirement: Ficha completa por slug

`GET /api/cuerpos-celestes/:slug` SHALL devolver con estado 200 la ficha JSON del cuerpo publicado identificado por el slug. SHALL conservar las unidades base, los nombres de campos y los valores ausentes de la ficha almacenada, junto con `contenido_ficha` cuando esté publicado en la base. La propiedad editorial SHALL conservar las etiquetas, cifras y unidades literales del PDF y su invitación a la biblioteca. Un cuerpo inexistente o no publicado SHALL producir 404 sin revelar su existencia privada.

#### Scenario: Recuperar una ficha publicada
- **WHEN** se consulta el slug de un cuerpo publicado
- **THEN** la ficha contiene `id`, `slug`, `nombre`, `clasificacion`, `subtitulo`, `tipo`, `planeta`, `imagen`, `descripcion_breve`, `datos_principales`, `curiosidades` y `libros`
- **AND** los datos principales corresponden al tipo planeta o satélite y conservan sus unidades base
- **AND** los valores `null` permanecen ausentes y no se sustituyen por cero ni por textos de ejemplo
- **AND** las colecciones sin registros se presentan como arreglos vacíos
- **AND** si la base contiene `contenido_ficha`, se devuelve sin sustituir sus datos editoriales por conversiones de los números normalizados

#### Scenario: Consultar un cuerpo no visible
- **WHEN** se solicita un slug válido que no existe o corresponde a un cuerpo no publicado
- **THEN** se devuelve 404 con código JSON `CUERPO_NO_ENCONTRADO`
- **AND** ambas situaciones tienen la misma respuesta pública

#### Scenario: Recuperar las cifras corregidas del PDF
- **WHEN** se consulta Mercurio después de la corrección de contenido
- **THEN** `contenido_ficha.datos_principales` incluye «176 días terrestres (día solar)» y `datos_principales.dia_solar_horas` conserva 4224
- **AND** un período de rotación ausente permanece nulo y no impide devolver la ficha
- **AND** `contenido_ficha.descubrir_libros` conserva la invitación propia de Mercurio aunque `libros` sea `[]`

### Requirement: Compatibilidad con la aplicación existente

`GET /api/estado` SHALL conservar su estado 200 y el JSON actual con `proyecto`, `mensaje` y `estado`, incluso sin Supabase configurado. La escena, selección, estructura local de las fichas y VR SHALL seguir operativas sin backend. En vista unica y VR la interfaz SHALL poder consultar la ficha publicada mediante la API de Metseri; solo rellenar su contenido educativo requiere esa respuesta. La interfaz SHALL NOT consultar Supabase directamente ni incluir sus credenciales.

#### Scenario: Consultar el estado sin Supabase
- **WHEN** el servidor está en marcha y faltan las variables de conexión
- **THEN** `GET /api/estado` devuelve `{ "proyecto": "Metseri", "mensaje": "API de Metseri funcionando correctamente", "estado": "activo" }` con estado 200

#### Scenario: Ejecutar la interfaz sin backend
- **WHEN** se ejecuta la interfaz con Vite y el servidor API está detenido
- **THEN** la escena, selección, estructura local de las fichas y cambio de modo mantienen su comportamiento previo
- **AND** la consulta fallida de cualquiera de los modos no bloquea sus controles ni muestra contenido de otro cuerpo
- **AND** no aparecen solicitudes directas a Supabase ni credenciales en el navegador

#### Scenario: Rellenar una ficha mediante la API existente
- **WHEN** se selecciona un cuerpo en vista única con el backend disponible
- **THEN** el navegador consulta la ficha de ese slug mediante la ruta de Metseri y recibe el contenido publicado
- **AND** recorrer la misma ficha hasta libros utiliza su invitación ya recibida, sin necesitar una ruta o consulta adicional
- **AND** los endpoints, sus permisos de lectura y los errores definidos se conservan
