# Spec Delta

## MODIFIED Requirements

### Requirement: Compatibilidad con la aplicación existente

`GET /api/estado` SHALL conservar su estado 200 y el JSON actual con `proyecto`, `mensaje` y `estado`, incluso sin Supabase configurado. La escena, selección, estructura local de las fichas y VR SHALL seguir operativas sin backend. En vista única y VR, la interfaz SHALL obtener el contenido educativo desde la API pública de Metseri y, ante un fallo de transporte sin respuesta HTTP, SHALL poder presentarlo desde una descarga válida anterior. Una respuesta HTTP de error o un resultado incompatible SHALL conservar su tratamiento de error. La interfaz SHALL NOT consultar Supabase directamente ni incluir sus credenciales.

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
- **AND** recorrer la misma ficha hasta libros utiliza su invitación ya recibida, sin necesitar una ruta o consulta adicional para obtenerla
- **AND** los endpoints, sus permisos de lectura y los errores definidos se conservan

#### Scenario: Mantener los errores HTTP con una copia descargada
- **WHEN** existe una copia previa y la API en línea responde 404 para un cuerpo o devuelve otro error HTTP
- **THEN** la petición conserva su código y su respuesta JSON y la interfaz presenta el fallo de esa consulta
- **AND** la copia descargada no sustituye la respuesta HTTP ni se devuelve como contenido de la API
