# Proposal

## Why

Metseri permite consultar contenido bibliográfico público, pero necesita que el administrador gestione los libros y sus relaciones con cuerpos celestes para completar la tarea Backend del Sprint 4. Se propone investigar primero libros reales en español y aprovechar los registros cargados para elaborar después las fichas bibliográficas de Contenido/QA.

## What Changes

- Agregar una API administrativa protegida para crear, listar, consultar por identificador, editar y eliminar libros, incluidos autores ordenados y asociaciones con cuerpos celestes.
- Guardar cada libro, sus autorías y sus relaciones en una operación transaccional sobre el núcleo existente de Supabase; reutilizar el login propio sin requerir el módulo 02.
- Proponer validaciones esenciales, errores JSON y protección del borrado o retiro de relaciones cuando el libro respalde una ficha astronómica.
- Separar la escritura administrativa con credencial exclusiva del servidor de las consultas públicas existentes, que siguen mostrando únicamente libros activos y verificados.
- Preparar una carga revisable de libros infantiles, de divulgación y científicos en español, preferentemente con fuentes mexicanas. Conservar ISBN, fuentes y dudas de edición; no afirmar existencia en la biblioteca a partir de una ficha editorial.
- Completar una selección de **tres títulos distintos por cada uno de los doce cuerpos celestes**: 36 asociaciones justificadas. Un mismo título puede reutilizarse entre cuerpos si trata sus temas; no se exigen 36 obras distintas. Los cuatro candidatos adelantados no bastan para declarar completa la cobertura.
- Seleccionar contenido en **español mexicano**, cotejando la edición o muestras y conservando evidencia de adecuación regional; no confundir venta en México con adaptación lingüística. Redactar las recomendaciones y etiquetas en es-MX. Las ediciones no confirmadas quedan pendientes, sin sustituir silenciosamente el requisito por español de España.
- Elegir libros variados y adecuados para público general, incluidos títulos infantiles, de divulgación y científicos cuando sean pertinentes al cuerpo celeste. Esta variedad es un criterio de investigación del catálogo, no una función de selección del visitante: no se incorporan botones, filtros ni etiquetas por edad o nivel, ni se exige una categoría determinada para cada uno de los tres libros.
- Incorporar la presentación pública de las recomendaciones en «Descubrir libros», con la paleta y jerarquía de la ficha existente, adaptación a móvil y VR y estados de carga, error y cobertura incompleta.
- Ajuste solicitado el 10 de noviembre: en VR, cada libro muestra únicamente título en negrita con su tamaño actual, autor y editorial · año; la vista web conserva explicación, invitación y enlace.
- Preparar evidencia reproducible del CRUD; Postman puede usarse como herramienta local opcional, con su colección fuera del repositorio. Tras la carga real, elaborar las fichas de Contenido/QA con los mismos registros y señalar la disponibilidad física pendiente de comprobar.
- Incluir expresamente en la revisión y en las pruebas todo el código adelantado sin OpenSpec: integración de rutas y JSON, servicio, SQL, cargador y pruebas; verificarlo contra los requisitos revisados sin acreditarlo por existir previamente.

## Capabilities

### New Capabilities

- `gestion-bibliografica`: Administración autenticada y persistencia íntegra de libros, autores y relaciones con cuerpos celestes.
- `seleccion-bibliografica`: Selección trazable, carga de candidatos y preparación posterior de fichas bibliográficas sin confundir investigación editorial con disponibilidad institucional.

### Modified Capabilities

- `fichas-cuerpos-celestes`: Evolucionar «Descubrir libros» de su reserva/invitación actual a tres recomendaciones legibles y accesibles en vista única y VR, preservando la identidad de la ficha y las reglas públicas de verificación.

Se conserva el contrato de `consulta-contenido-api`: la lectura pública mantiene sus campos y visibilidad; el componente selecciona hasta tres resultados elegibles en el orden existente. Las escrituras pertenecen exclusivamente al espacio administrativo.

## Impact

- Backend: `api/index.js`, rutas administrativas, servicio de persistencia y pruebas. Base: funciones adicionales sobre `libros`, `autores`, `libros_autores` y `cuerpo_libro`.
- Configuración privada: clave Secret del mismo proyecto Supabase y credenciales del login; no se incluyen secretos en artefactos ni en el frontend.
- Interfaz afectada: sección Libros de la ficha, consulta/adaptación de sus datos, paginación del contenido VR y estilos asociados; no cambia la navegación general ni los controles de exploración.
- Entrega: matriz de cobertura de los doce cuerpos, conjunto bibliográfico con fuentes, guía de configuración y fichas posteriores. No incluye construir el panel administrativo completo ni reemplazar el sistema de sesiones. Referirse al producto como PWA no añade instalación ni soporte sin conexión a este cambio.
- La propuesta no autoriza commit, push, despliegue ni publicación de libros como verificados sin evidencia.

## Estado para revisión

**Propuesta pendiente de revisión de Sophia.** Antes de crear este cambio se adelantaron código, pruebas, SQL y cuatro candidatos bibliográficos fuera del flujo OpenSpec. Esos archivos siguen como trabajo local sin commit; no equivalen a decisiones aprobadas ni a una aplicación verificada de esta propuesta. Las tareas de este cambio quedan pendientes hasta contrastar ese borrador con la revisión de la usuaria.

En este paso solo se crean artefactos OpenSpec. No se ejecuta el SQL en Supabase ni se carga el catálogo. Fuentes de alcance: [tarea Backend](https://app.notion.com/p/f0edac38922e4695bda8ccdd3eec139b) y [tarea Contenido/QA](https://app.notion.com/p/89181324b88740c3b1697fd446727736).

La cobertura de selección y la cobertura pública se comprobarán por separado: se requieren tres candidatos documentados por cuerpo; para mostrar tres al visitante también deben cumplir la verificación institucional del esquema. Si faltan ejemplares verificados, esa parte permanece pendiente y la interfaz muestra solo los existentes, sin rellenar con libros ficticios ni publicar candidatos privados.
