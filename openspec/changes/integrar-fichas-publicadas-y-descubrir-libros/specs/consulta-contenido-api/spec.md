# Spec Delta

## MODIFIED Requirements

### Requirement: Compatibilidad con la aplicación existente

`GET /api/estado` SHALL conservar su estado 200 y JSON con `proyecto`, `mensaje` y `estado`, incluso sin Supabase configurado. La escena, selección, imágenes y controles VR SHALL seguir operativos sin backend. El frontend SHALL consultar el contenido editorial mediante la API pública de Metseri y mostrar su indisponibilidad sin bloquear la exploración. SHALL NOT consultar Supabase directamente ni incorporar sus credenciales al cliente.

#### Scenario: Consultar el estado sin Supabase
- **WHEN** el servidor está en marcha y faltan las variables de conexión
- **THEN** `GET /api/estado` devuelve `{ "proyecto": "Metseri", "mensaje": "API de Metseri funcionando correctamente", "estado": "activo" }` con estado 200

#### Scenario: Ejecutar la interfaz sin backend
- **WHEN** se ejecuta la interfaz con Vite y el servidor API está detenido
- **THEN** la escena, selección, imágenes locales y cambio de modo mantienen sus controles habituales
- **AND** al seleccionar un cuerpo se intenta consultar su ficha mediante `/api/cuerpos-celestes/:slug`, y el fallo se comunica dentro del panel con reintento y cierre operativos
- **AND** no se consulta Supabase desde el navegador ni se sustituye el contenido remoto por datos científicos locales

#### Scenario: Integración pública disponible
- **WHEN** el servidor está disponible y el usuario selecciona un cuerpo con ficha publicada
- **THEN** el frontend recupera su contenido mediante las rutas públicas existentes y lo presenta en la ficha correspondiente
- **AND** se mantienen los contratos GET, los errores públicos y las políticas de visibilidad existentes, sin requerir una sesión administrativa
