# consulta-contenido-api Specification

## Purpose

Permitir consultar mediante peticiones HTTP GET el contenido astronómico y bibliográfico público almacenado en Supabase, conservando el funcionamiento independiente de la experiencia visual de Metseri.

## Requirements

### Requirement: Listado de cuerpos celestes públicos

`GET /api/cuerpos-celestes` SHALL responder con estado 200 y un arreglo JSON de cuerpos publicados, ordenado por `orden` y después por `slug`. SHALL incluir tanto planetas como satélites publicados y mantener sus identificadores y relaciones almacenadas.

#### Scenario: Consultar el listado publicado
- **WHEN** existen cuerpos publicados y se consulta el listado
- **THEN** cada elemento contiene `id`, `slug`, `nombre`, `clasificacion`, `subtitulo`, `tipo`, `planeta_id`, `planeta_slug`, `orden`, `imagen_path` e `imagen_alt`
- **AND** `id` conserva el UUID almacenado y `slug` identifica el cuerpo en las rutas
- **AND** ningún cuerpo sin publicar aparece en la respuesta

#### Scenario: Base sin contenido público
- **WHEN** la consulta a la base funciona pero no existen cuerpos visibles para el visitante
- **THEN** la respuesta es 200 con `[]`, sin inventar contenido ni recurrir a los datos locales del frontend

### Requirement: Ficha completa por slug

`GET /api/cuerpos-celestes/:slug` SHALL devolver con estado 200 la ficha JSON del cuerpo publicado identificado por el slug. SHALL conservar las unidades base, los nombres de campos y los valores ausentes de la ficha almacenada. Un cuerpo inexistente o no publicado SHALL producir 404 sin revelar su existencia privada.

#### Scenario: Recuperar una ficha publicada
- **WHEN** se consulta el slug de un cuerpo publicado
- **THEN** la ficha contiene `id`, `slug`, `nombre`, `clasificacion`, `subtitulo`, `tipo`, `planeta`, `imagen`, `descripcion_breve`, `datos_principales`, `curiosidades` y `libros`
- **AND** los datos principales corresponden al tipo planeta o satélite y conservan sus unidades base
- **AND** los valores `null` permanecen ausentes y no se sustituyen por cero ni por textos de ejemplo
- **AND** las colecciones sin registros se presentan como arreglos vacíos

#### Scenario: Consultar un cuerpo no visible
- **WHEN** se solicita un slug válido que no existe o corresponde a un cuerpo no publicado
- **THEN** se devuelve 404 con código JSON `CUERPO_NO_ENCONTRADO`
- **AND** ambas situaciones tienen la misma respuesta pública

### Requirement: Libros asociados a un cuerpo público

`GET /api/cuerpos-celestes/:slug/libros` SHALL responder con estado 200 y los libros verificados y activos asociados a un cuerpo publicado, ordenados por `orden` y después por `libro_id`. Un cuerpo público sin libros SHALL devolver `[]`; uno no visible SHALL producir 404.

#### Scenario: Consultar libros disponibles
- **WHEN** el cuerpo está publicado y tiene asociaciones bibliográficas visibles
- **THEN** cada resultado incluye `libro_id`, `titulo`, `autor`, `editorial`, `anio`, `url_ficha` y `orden`
- **AND** `autor` conserva el orden de autoría definido en la base
- **AND** se excluyen libros sin verificar o inactivos, incluso dentro de la ficha completa

#### Scenario: Diferenciar ausencia de libros y de cuerpo
- **WHEN** un cuerpo publicado no tiene asociaciones visibles
- **THEN** el endpoint de libros devuelve 200 con `[]`
- **AND** solicitar libros de un cuerpo inexistente o no publicado devuelve 404 con `CUERPO_NO_ENCONTRADO`

### Requirement: Acceso público de solo lectura

La API de contenido SHALL consultar con los permisos públicos de Supabase y respetar RLS. SHALL NOT utilizar claves privilegiadas para eludir visibilidad ni modificar datos, publicación, permisos o esquema. Las rutas nuevas SHALL rechazar métodos de escritura con 405 y anunciar `GET, HEAD` en `Allow`.

#### Scenario: Intentar obtener borradores o realizar escrituras
- **WHEN** se consulta contenido no publicado o se envía POST, PUT, PATCH o DELETE a una ruta de contenido
- **THEN** el contenido privado no se devuelve y las escrituras reciben 405 con código `METODO_NO_PERMITIDO`
- **AND** no se ejecuta ninguna escritura en Supabase

### Requirement: Validación de identificadores

Las rutas con slug SHALL aceptar únicamente identificadores que cumplan `^[a-z0-9]+(-[a-z0-9]+)*$`. Un slug inválido SHALL recibir 400 con código `SLUG_INVALIDO` antes de consultar Supabase. Los valores de la petición SHALL NOT permitir seleccionar recursos arbitrarios de la base.

#### Scenario: Identificador inválido
- **WHEN** se solicita una ficha o libros con un slug que contiene espacios, mayúsculas o sintaxis ajena al formato establecido
- **THEN** se devuelve 400 en JSON y no se realiza ninguna consulta externa

### Requirement: Errores de conexión controlados

La API SHALL responder en JSON con forma `{ "error": { "codigo": "...", "mensaje": "..." } }` para los errores definidos. La configuración ausente o inválida SHALL producir 503 con `CONFIGURACION_NO_DISPONIBLE`; errores de Supabase, transporte, formato o tiempo de espera SHALL producir 503 con `CONTENIDO_NO_DISPONIBLE`. Las consultas externas SHALL tener un plazo de cinco segundos.

#### Scenario: Configuración sin completar
- **WHEN** falta la URL o la clave pública de Supabase, o la configuración es inválida
- **THEN** las rutas nuevas responden 503 sin consultar un destino incorrecto
- **AND** el mensaje no revela variables, claves ni detalles internos

#### Scenario: Fallo de Supabase
- **WHEN** Supabase rechaza la consulta, entrega una respuesta inválida, falla la red o vence el plazo
- **THEN** la API responde 503 con un mensaje controlado
- **AND** no presenta el fallo como un listado vacío ni expone el cuerpo de error remoto o la clave utilizada

### Requirement: Compatibilidad con la aplicación existente

`GET /api/estado` SHALL conservar su estado 200 y el JSON actual con `proyecto`, `mensaje` y `estado`, incluso sin Supabase configurado. La incorporación de la API SHALL mantener operativas la escena, sus fichas y VR con sus datos locales, sin hacerlas dependientes del backend.

#### Scenario: Consultar el estado sin Supabase
- **WHEN** el servidor está en marcha y faltan las variables de conexión
- **THEN** `GET /api/estado` devuelve `{ "proyecto": "Metseri", "mensaje": "API de Metseri funcionando correctamente", "estado": "activo" }` con estado 200

#### Scenario: Ejecutar la interfaz sin backend
- **WHEN** se ejecuta la interfaz con Vite y el servidor API está detenido
- **THEN** la escena, selección, fichas y cambio de modo mantienen el comportamiento previo
- **AND** no aparecen solicitudes nuevas de la interfaz a Supabase o a la API

### Requirement: Recuperación comprobable de información almacenada

La integración SHALL permitir recuperar un registro publicado existente del proyecto Supabase mediante la API de Metseri. Su verificación SHALL distinguir una conexión con respuesta vacía de la recuperación efectiva de información y SHALL documentar cualquier requisito de configuración o contenido público pendiente.

#### Scenario: Comprobar un cuerpo real publicado
- **WHEN** se configura el proyecto y el slug de un cuerpo que la persona usuaria confirma como publicado
- **THEN** el listado y la ficha recuperados por HTTP coinciden en UUID y slug con ese registro
- **AND** la consulta de libros devuelve las asociaciones públicas existentes o `[]` si no hay ninguna
- **AND** la verificación no inserta, modifica ni publica datos

#### Scenario: Integración real sin completar
- **WHEN** no hay configuración disponible o no existe un cuerpo publicado que pueda recuperarse
- **THEN** la comprobación se registra como pendiente o fallida con la causa concreta
- **AND** una prueba con datos simulados o un listado vacío no se presenta como recuperación real exitosa
