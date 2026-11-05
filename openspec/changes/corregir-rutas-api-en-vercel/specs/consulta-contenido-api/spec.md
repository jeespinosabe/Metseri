# Spec Delta

## ADDED Requirements

### Requirement: Enrutamiento de la API en Vercel

El despliegue de Metseri en Vercel SHALL atender las rutas públicas existentes de estado, listado, ficha y libros bajo el mismo dominio HTTPS que la interfaz. SHALL conservar el método, la ruta completa, los parámetros de consulta y los contratos HTTP y JSON existentes. Las peticiones a esas rutas SHALL llegar a la API y SHALL NOT resolverse como HTML de la interfaz o como `NOT_FOUND` de la plataforma por falta de enrutamiento. La configuración de conexión SHALL permanecer en el servidor.

#### Scenario: Consultar el estado del despliegue
- **WHEN** se consulta `GET /api/estado` en el despliegue de Vercel, incluso sin conexión configurada con Supabase
- **THEN** se devuelve 200 con `{ "proyecto": "Metseri", "mensaje": "API de Metseri funcionando correctamente", "estado": "activo" }`
- **AND** la respuesta tiene tipo de contenido JSON

#### Scenario: Consultar contenido público desde el dominio de la interfaz
- **WHEN** la conexión de producción es válida, existe un cuerpo publicado y se consultan el listado y su ficha mediante `/api/cuerpos-celestes` y `/api/cuerpos-celestes/:slug`
- **THEN** ambas rutas devuelven 200 con los contratos JSON existentes y coinciden en el identificador y slug del cuerpo
- **AND** la selección de ese cuerpo en la interfaz puede recuperar su contenido publicado usando la URL relativa de la API
- **AND** el navegador no recibe credenciales ni consulta Supabase directamente

#### Scenario: Consultar los libros de un cuerpo publicado
- **WHEN** se consulta `GET /api/cuerpos-celestes/:slug/libros` con la conexión válida y el slug de un cuerpo publicado
- **THEN** se devuelve 200 con los libros públicos del cuerpo según el contrato existente, o `[]` cuando no hay asociaciones visibles
- **AND** se conserva la ruta anidada completa al tramitar la petición

#### Scenario: Conservar errores de validación y visibilidad
- **WHEN** se consulta una ficha con un slug inválido, o con un slug válido inexistente o no publicado y una conexión válida
- **THEN** se recibe respectivamente 400 con `SLUG_INVALIDO` o 404 con `CUERPO_NO_ENCONTRADO`
- **AND** los errores conservan la estructura JSON de la API y se distinguen del `NOT_FOUND` de Vercel

#### Scenario: Distinguir un fallo de conexión de un fallo de enrutamiento
- **WHEN** se consulta una ruta de contenido y la configuración de producción falta o es inválida, o falla la consulta a Supabase
- **THEN** la respuesta es 503 en JSON con `CONFIGURACION_NO_DISPONIBLE` o `CONTENIDO_NO_DISPONIBLE`, respectivamente
- **AND** no se devuelve HTML, un 404 de la plataforma ni contenido inventado como sustituto del error
- **AND** las variables y los detalles internos de la conexión no aparecen en la respuesta

#### Scenario: Mantener la interfaz y sus recursos
- **WHEN** se abre la raíz del despliegue y se solicitan sus archivos compilados e imágenes locales
- **THEN** la interfaz y sus recursos se sirven con sus rutas actuales
- **AND** las reglas de la API no envían esas peticiones al backend
