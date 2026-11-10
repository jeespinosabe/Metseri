# Spec Delta

## Purpose

Permitir al administrador gestionar libros, autorías y asociaciones astronómicas con persistencia íntegra y acceso separado de las consultas públicas.

## ADDED Requirements

### Requirement: Acceso administrativo autenticado
La API SHALL exigir una sesión administrativa válida para toda operación en `/api/admin/libros`. Una petición sin sesión SHALL recibir 401 antes de consultar o modificar registros bibliográficos.

#### Scenario: Intento de acceso sin sesión
- **WHEN** un cliente sin sesión solicita listar, consultar, crear, editar o eliminar libros
- **THEN** recibe 401 con código `SESION_REQUERIDA`
- **AND** no se ejecuta una operación bibliográfica en la base

### Requirement: Creación de un registro bibliográfico
`POST /api/admin/libros` SHALL aceptar un objeto JSON con título no vacío y una lista ordenada no vacía de autores. SHALL admitir editorial, año, URL institucional, estado activo y relaciones. Una creación válida SHALL responder 201, con el libro persistido y su ubicación en `Location`.

#### Scenario: Crear un candidato sin disponibilidad comprobada
- **WHEN** un administrador envía título, autores y relaciones válidas sin verificación institucional
- **THEN** se crea un libro con identificador estable, `verificado=false` y `activo=true` por defecto
- **AND** editorial, año y URL pueden permanecer en null cuando no estén confirmados
- **AND** la respuesta incluye autores ordenados y cuerpos asociados

### Requirement: Consulta administrativa de registros
La API SHALL permitir listar libros con GET y consultar uno mediante `/api/admin/libros/:id`, incluidos registros no verificados o inactivos. El listado SHALL aceptar `limite` de 1 a 100 y `desplazamiento` desde cero, con valores predeterminados 50 y 0 y orden estable por creación descendente e identificador ascendente.

#### Scenario: Consultar detalle y páginas
- **WHEN** el administrador consulta un libro existente o una página válida
- **THEN** recibe 200 con el registro completo o un arreglo de registros con autores y relaciones
- **AND** una página sin resultados devuelve `[]`

#### Scenario: Consultar un identificador inexistente
- **WHEN** se consulta un UUID válido que no identifica un libro
- **THEN** se devuelve 404 con código `LIBRO_NO_ENCONTRADO`

### Requirement: Edición parcial y sustitución explícita de relaciones
`PATCH /api/admin/libros/:id` SHALL conservar los campos omitidos y reemplazar las listas enviadas de autores o cuerpos. `cuerpos: []` SHALL retirar asociaciones no protegidas. Las autorías SHALL conservar su orden y reutilizar autores existentes por nombre normalizado sin duplicarlos.

#### Scenario: Cambiar solo la editorial
- **WHEN** se edita editorial sin enviar autores ni cuerpos
- **THEN** las autorías y relaciones anteriores permanecen

#### Scenario: Reemplazar asociaciones
- **WHEN** se envía una nueva lista de cuerpos existentes sin duplicados
- **THEN** las asociaciones finales corresponden a esa lista y conservan su orden
- **AND** las marcas previas de fuente de las relaciones conservadas no cambian

### Requirement: Escritura íntegra por libro
Crear o editar un libro SHALL guardar sus campos, autores y relaciones en una sola operación íntegra. Si alguna parte falla, SHALL conservarse el estado anterior completo, sin dejar un libro, un autor o una asociación creados parcialmente por esa operación.

#### Scenario: Falla una asociación durante el guardado
- **WHEN** un alta o edición incluye un cuerpo inexistente y falla
- **THEN** no persisten los otros cambios de esa operación
- **AND** una edición mantiene el libro y las relaciones anteriores

### Requirement: Eliminación con protección de fuentes
`DELETE /api/admin/libros/:id` SHALL responder 204 al eliminar un libro existente y sus asociaciones dependientes, sin eliminar cuerpos celestes ni autores. Si alguna asociación declara que el libro respalda una ficha, eliminarlo o retirar esa asociación SHALL producir 409 con código `LIBRO_ES_FUENTE`.

#### Scenario: Eliminar un libro con un autor compartido
- **WHEN** se elimina un libro sin dependencias de fuente y su autor participa en otro libro
- **THEN** el otro libro y el autor permanecen
- **AND** consultar el libro eliminado devuelve 404

#### Scenario: Retirar una referencia científica
- **WHEN** se intenta eliminar un libro fuente o excluir su relación protegida mediante PATCH
- **THEN** la operación se rechaza con 409 y no modifica el estado anterior

### Requirement: Verificación institucional explícita
`verificado` SHALL significar existencia comprobada en la biblioteca. Confirmarlo SHALL requerir editorial, año, URL institucional y autoría, y registrar la fecha en el servidor. Cambiar título, editorial, año, URL o autoría SHALL invalidar la verificación anterior salvo confirmación explícita en la misma operación.

#### Scenario: Corregir un libro previamente verificado
- **WHEN** se cambia un dato bibliográfico sin enviar `verificado=true`
- **THEN** el registro queda sin verificar y se retira la fecha de verificación

#### Scenario: Confirmar disponibilidad
- **WHEN** el administrador confirma `verificado=true` después de comprobar el ejemplar y proporciona todos los datos requeridos
- **THEN** el libro queda verificado con fecha generada por el sistema
- **AND** el cliente no puede atribuir la verificación a un perfil arbitrario

### Requirement: Validación y errores controlados
La API SHALL validar UUID, campos permitidos, textos no vacíos, año entero entre 1000 y 2100, URL HTTP/HTTPS, booleanos, autores y relaciones sin duplicados y órdenes positivos. SHALL devolver errores JSON con `error.codigo` y `error.mensaje`, sin secretos ni detalles internos del proveedor.

#### Scenario: Entrada inválida
- **WHEN** la petición contiene campos desconocidos, identificadores inválidos, JSON mal formado o relaciones duplicadas
- **THEN** recibe 400 y no realiza una escritura
- **AND** un cuerpo mayor de 64 KB recibe 413

#### Scenario: Conflicto o indisponibilidad
- **WHEN** el proveedor rechaza una duplicidad que viola una restricción
- **THEN** la API responde 409 sin exponer el error interno
- **AND** la falta de configuración o un fallo de transporte produce 503 y no un resultado vacío exitoso

### Requirement: Separación del acceso público y administrativo
La escritura SHALL usar permisos exclusivos del servidor y SHALL NOT habilitar escrituras para visitantes. Las consultas públicas SHALL conservar su contrato y mostrar únicamente libros activos y verificados de cuerpos publicados. Las funciones administrativas SHALL NOT poder ejecutarse con los roles públicos.

#### Scenario: Libro pendiente de verificación
- **WHEN** existe un libro no verificado que el administrador puede consultar
- **THEN** no aparece en la ficha pública ni en el listado público de libros del cuerpo
- **AND** los métodos de escritura en las rutas públicas siguen recibiendo 405

#### Scenario: Intento de invocación pública directa
- **WHEN** un visitante intenta ejecutar una operación de persistencia administrativa directamente en la base
- **THEN** se rechaza por falta de permisos

### Requirement: Evidencia diferenciada de persistencia
La entrega SHALL incluir comprobaciones reproducibles del CRUD y sus relaciones y distinguir pruebas aisladas de operaciones comprobadas contra Supabase. La falta de configuración o de una migración aplicada SHALL registrarse como pendiente y SHALL NOT presentarse como integración real completada.

#### Scenario: Entorno real pendiente
- **WHEN** las pruebas locales pasan pero falta configuración o aplicar el SQL en Supabase
- **THEN** la entrega indica esa limitación y mantiene pendiente la evidencia de persistencia real

### Requirement: Comprobación del código adelantado
La verificación SHALL incluir los cambios bibliográficos escritos antes de crear OpenSpec, contrastándolos con el contrato revisado. SHALL comprobar integración de rutas, autenticación, tratamiento de JSON, persistencia, carga por HTTP y regresiones públicas. La existencia de código o resultados previos SHALL NOT sustituir esta revisión.

#### Scenario: Incorporar el borrador al flujo aprobado
- **WHEN** se inicia apply después de revisar los artefactos
- **THEN** cada archivo adelantado tiene correspondencia con requisitos y evidencia ejecutable o revisión documental pertinente
- **AND** las diferencias se corrigen antes de marcar tareas como terminadas
