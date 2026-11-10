# Design

## Context

Véase `proposal.md` para motivación y estado de revisión. El esquema aportado por Sophia contiene el módulo 01 ya ejecutado y la usuaria confirmó que no se ejecutó el módulo 02. Existen Express 5, consultas REST con fetch a Supabase, un login propio y vistas públicas sujetas a RLS. Los autores se reutilizan por nombre normalizado; las tablas puente mantienen orden y pueden señalar fuentes de fichas.

El árbol de trabajo también contiene un borrador adelantado de rutas, servicio, SQL, pruebas y cuatro candidatos; la colección auxiliar de Postman se conserva fuera del repositorio. Se usará como material a revisar durante apply; no es una implementación aprobada de estos artefactos. El último diagnóstico local no encontró configuradas la clave Secret ni la cuenta del login. No se ha aplicado la migración en el proyecto real.

## Goals / Non-Goals

**Goals:** persistencia íntegra por libro, contratos claros para el futuro panel, permisos administrativos separados y trazabilidad entre candidatos cargados y fichas posteriores.

**Non-Goals:** añadir el módulo 02, construir el panel administrativo completo, alterar los datos científicos o los controles de exploración, automatizar la certificación de disponibilidad física o reemplazar la autenticación. La sección Libros sí incluye diseño e integración en vista única y VR. La instalación PWA y el uso sin conexión no se incorporan a este cambio. La validación general del Sprint 5 sigue independiente; aquí se incluye la mínima requerida por este CRUD y sus recomendaciones.

## Decisions

### 1. Reutilizar el login y separar el servicio administrativo

Montar las rutas en `/api/admin/libros` detrás de `exigirAdministrador`, dentro del alcance de la cookie actual. Crear un servicio dedicado y mantener `consultaSupabase.js` con su clave pública. Usar `SUPABASE_SECRET_KEY` en el servidor y encabezado apikey para las operaciones administrativas; no distribuirla al panel ni a Postman.

Alternativas: habilitar escritura anónima contradice los permisos del núcleo; migrar el login a Supabase Auth y ejecutar el módulo 02 ampliaría el alcance. Se propone conservar la autenticación actual y documentar sus límites de sesiones en memoria.

### 2. Funciones transaccionales sobre el esquema existente

Añadir funciones RPC para obtener, listar, guardar y eliminar libros; `guardarLibroAdministrativo` recibe UUID opcional y datos JSON. Las funciones serán security invoker, con search_path fijo y tablas calificadas. Revocar ejecución a PUBLIC, anon y authenticated y concederla a service_role. No volver a ejecutar el esquema original ni alterar sus políticas públicas.

La operación de guardado bloqueará el libro durante su edición, reutilizará autores por el índice normalizado y guardará datos y asociaciones dentro de la transacción de la llamada. Un fallo revierte también autores nuevos. No eliminar autores al borrar libros para conservar las autorías compartidas.

Alternativas: varias llamadas REST independientes pueden dejar asociaciones incompletas; conectar directamente por un nuevo cliente SQL añadiría dependencias y configuración innecesarias.

### 3. Contrato explícito para edición y verificación

Aceptar título, editorial, año, url_ficha, activo, verificado, autores y cuerpos. Los campos omitidos en PATCH se conservan; las listas enviadas reemplazan el conjunto anterior. Usar autores por nombre en orden y cuerpos por slug con orden propio. El detalle devuelve sus identificadores para vincular evidencias y fichas.

Los campos de verificación temporal se generan en la base. Al no existir perfil asociado al login, verificado_por queda null; no se inventa un UUID de perfil. Cambios bibliográficos invalidan la verificación salvo confirmación explícita. No aceptar la marca de fuente científica desde este CRUD; conservar las existentes y bloquear su retirada con conflicto.

Alternativas: reemplazar todo el registro en cada edición facilita pérdidas accidentales; conservar una verificación después de cambiar de edición o de autoría certificaría datos diferentes a los comprobados.

### 4. Investigación reutilizable y carga por HTTP

Conservar el conjunto de candidatos en un archivo estructurado del repositorio con ISBN, fuentes, fecha y notas de edición, separado del objeto admitido por la API. Cargarlo con el login del servidor mediante un script que consulte antes de crear y omita coincidencias en título/editorial/año. Guardar resultados con UUID sin tokens ni contraseñas.

Los candidatos mantienen `verificado=false` y `url_ficha=null` hasta comprobar el registro institucional. Después de cargar, elaborar las fichas de Contenido/QA en el destino documental autorizado por Sophia en Notion; no cambiar estados ni declarar disponible un ejemplar sin evidencia. Los cuatro candidatos previos son un punto de partida insuficiente: la entrega requiere tres títulos distintos por cada uno de los doce cuerpos y una matriz de 36 asociaciones. Un título puede servir para varios cuerpos, con justificación individual; no se inventan relaciones para alcanzar el conteo.

La matriz distinguirá título/edición, cuerpo, orden 1–3, evidencia temática, evidencia de español mexicano y estado de verificación institucional. La investigación considerará libros variados para público general, incluidos infantiles, de divulgación y científicos cuando sean pertinentes, sin exigir una distribución por edad o nivel dentro de cada terna. No se agregan categorías de lectura al modelo ni botones, filtros o etiquetas de ese tipo a la interfaz. La ausencia de una edición adecuada o de evidencia regional se registra como pendiente y requiere completar la investigación; no basta la nacionalidad de la tienda. El texto propio de la interfaz y las explicaciones se redactan en es-MX, sin traducir o modificar por cuenta propia la obra para declarar que cumple el idioma.

Para conservar el contrato público existente, las justificaciones temáticas se resuelven con metadatos curados asociados al UUID del libro. Solo se mostrarán después de comprobar que ese UUID llega en la respuesta pública; no se empaqueta la investigación privada completa en el frontend ni se publica un libro por existir en ese conjunto. La guía describirá cómo sincronizar los UUID tras la carga. No se requiere cambiar las columnas del núcleo para edad ni recoger información personal.

Alternativas: insertar directamente por SQL no demuestra el flujo del backend; colocar enlaces de tiendas en url_ficha altera el significado institucional del campo. La carga será repetible por comparación de registros, no una garantía de unicidad global cuando el esquema admite null en editorial/año.

### 5. Pruebas y evidencia independientes del proveedor real

Usar node:test para validar HTTP, autorización y errores; PostgreSQL embebido para comprobar SQL, permisos, rollback y referencias. Usar opcionalmente una colección local de Postman con login y CRUD de un libro temporal, guardada fuera del repositorio y excluida de la entrega versionada. La carga real y sus capturas son una etapa posterior a la revisión y configuración; los resultados previos de pruebas no completan tareas de este cambio automáticamente.

La revisión incluirá expresamente `api/index.js`, `api/rutas/administracion.js`, `api/rutas/libros.js`, `api/servicios/gestionLibros.js`, `api/pruebas/gestionLibros.test.js`, `bd/agregarGestionBibliografica.sql`, `bd/verificarGestionBibliografica.mjs`, `api/herramientas/cargarLibrosInvestigados.js`, `bd/librosInvestigados.json`, `.env.example` y la documentación añadida. Se comprobará comportamiento y cobertura, no solo presencia de archivos: JSON mal formado/excesivo, sesión ausente/cerrada/vencida, errores y timeout saneados, permisos RPC, repetición del SQL, escritura parcial revertida, fuentes protegidas, lotes interrumpidos y repetición del cargador sin modificar coincidencias. Las instrucciones y ejemplos se revisan contra el contrato real.

Se añadirán pruebas de cobertura 12 × 3, títulos distintos por cuerpo, justificaciones y evidencia regional; igualdad de UUID y orden entre base, API y recomendaciones; exclusión de candidatos privados; carga/error/ausencia/uno/dos/tres/más resultados; títulos largos y respuestas tardías. La prueba visual y funcional abarca escritorio, móvil estrecho, teclado, ampliación de texto y VR con contenido realista. El resultado previo de 225 pruebas es una referencia histórica, no una aprobación de la ampliación de alcance.

### 6. Diseño de «Descubrir libros»

**Dirección:** prolongar la lectura de la ficha astronómica con tres libros relacionados con el cuerpo seleccionado. Conservar la sección y su invitación; integrar tres bloques verticales separados por líneas discretas en lugar de una pantalla o carrusel nuevo. La ficha tiene unos 540 px de ancho máximo: tres columnas reducirían demasiado el espacio de lectura. En móvil se mantiene el orden y se usa el desplazamiento propio del panel.

**Paleta observada en `src/App.css`:** fondo `#111b24`, borde `#2b3942`, encabezados/acento `#c7e69d`, título principal `#edf2f5`, texto `#a6b4c0` y foco `#d1eca8`. Reutilizar los valores y tipografía existentes; los equivalentes próximos de la textura VR se conservan. No añadir otra identidad, fuentes o librerías. Verificar contraste de textos y controles sobre sus fondos efectivos antes de dar por terminada la presentación.

**Composición propuesta, con rótulos ilustrativos y sin títulos ficticios de producción:**

```text
DESCUBRIR LIBROS
Invitación publicada del cuerpo celeste

01  Título real del libro
    Autoría · Editorial · Año
    Una frase que explique su relación con este cuerpo.
    Ver ficha en la biblioteca ↗
──────────────────────────────────
02  Título real del segundo libro
    Datos bibliográficos, explicación y enlace
──────────────────────────────────
03  Título real del tercer libro
    Datos bibliográficos, explicación y enlace
```

Los números indican únicamente el orden de las recomendaciones. No hay etiquetas ni controles por edad o nivel. Conservar títulos completos, ajustar saltos de línea, usar texto de lectura de al menos 16 px CSS y altura de línea suficiente, y evitar bloques enteros en mayúsculas; el rótulo existente de sección conserva su estilo. No inventar portadas: la propuesta no depende de imágenes remotas y puede funcionar con tipografía y separadores.

**Interacciones y estados:** enlaces descriptivos con foco visible, área táctil de al menos 44 × 44 px y aviso de otra pestaña. Desplazar el panel no gira el cielo. Con más de tres resultados, tomar los primeros tres elegibles según el orden público, sin duplicados. Con uno o dos, mostrar únicamente esos y «Estamos preparando más recomendaciones»; con cero, mantener invitación y estado vacío neutral. Carga y error son estados distintos, sin presentar un fallo como ausencia de libros. Preservar identidad al cambiar de cuerpo y no mostrar datos de una respuesta anterior.

**VR (ajuste autorizado por Sophia el 10 de noviembre):** usar la pestaña Libros y el modelo de páginas existente, priorizando una recomendación por página y continuaciones si el contenido lo exige. De cada libro presentar solo número de orden a la izquierda, título en negrita 700 con el tamaño de lectura anterior, autor regular debajo y editorial · año en tono tenue, alineados como en la referencia compartida. No incluir explicación, invitación ni enlace en páginas con libros. Conservar carga/error/vacío y cobertura parcial. Compartir estado y contenido entre ojos, conservar corrección óptica, puntero, recentrado, avance/retroceso y cierre final. Medir los saltos del título con la misma fuente en negrita que usa Canvas. La alternativa accesible HTML de VR muestra los mismos cuatro campos; la vista normal conserva invitación, explicación y apertura de enlaces.

### 7. Coordinación con especificaciones anteriores

La spec principal `fichas-cuerpos-celestes` aún exige reserva bibliográfica; el cambio abierto `rellenar-fichas-con-contenido-publicado` añadió la invitación del PDF. Este delta modifica el requisito «Descubrir libros sin información inventada» para habilitar las tres sugerencias y conserva la invitación. Al aplicar o sincronizar, verificar el orden de ambos cambios para no restaurar la prohibición anterior de catálogo ni perder los textos publicados. No archivar ni modificar otros cambios como parte de esta revisión.

## Risks / Trade-offs

- [Sesiones en memoria] → La administración puede perder sesión al reiniciar o cambiar de instancia. Verificar el entorno de ejecución y declarar la limitación antes de afirmar compatibilidad administrativa con producción.
- [Clave con privilegios elevados] → Uso exclusivo en backend, funciones de propósito limitado y rechazo de campos arbitrarios; evitar claves y cookies en archivos, errores o evidencias.
- [Cambios recientes en el esquema real] → Contrastar las tablas y permisos vigentes antes de aplicar el SQL adicional; las correcciones astronómicas existentes se conservan.
- [Ediciones y disponibilidad inciertas] → Conservar null y notas de procedencia; no publicar candidatos como verificados.
- [No hay tres ediciones regionalmente acreditadas o ejemplares verificados por cuerpo] → Mantener la cobertura correspondiente pendiente, continuar la selección y no sustituir el requisito lingüístico ni certificar existencia sin evidencia.
- [Lote interrumpido o timeout] → Cada libro es atómico; consultar los registros antes de reintentar y guardar resultados. No prometer rollback global del lote ni reintentos automáticos de escrituras.
- [Dependencias científicas] → Bloquear retirada de asociaciones fuente y borrado desde la API; una revisión científica queda fuera de la gestión bibliográfica ordinaria.

## Migration Plan

1. Esperar revisión de Sophia y una petición posterior para aplicar el cambio.
2. Contrastar el borrador local con los requisitos aprobados y corregir únicamente las diferencias necesarias; volver a comprobar pruebas y permisos.
3. Revisar y aplicar el script aditivo completo en Supabase y configurar las variables privadas del servidor. No ejecutar de nuevo el módulo 01.
4. Probar en un entorno controlado un alta, consulta, edición, relación y borrado por HTTP con datos temporales; comprobar también el acceso público.
5. Comprobar la matriz de tres libros por cuerpo, cargar los candidatos revisados mediante la API y guardar identificadores; elaborar después sus fichas documentales y registrar por separado la verificación física pendiente.
6. Integrar los metadatos públicos curados y el diseño de tres recomendaciones; verificar escritorio, móvil y VR, mostrando solo libros elegibles y documentando cualquier cobertura pública pendiente.
7. Para retirar el cambio, deshabilitar las rutas administrativas y su configuración, revocar los permisos de las cuatro RPC y retirar únicamente esas funciones tras comprobar dependencias. Restaurar la presentación anterior de Libros conservando la invitación. No eliminar tablas ni registros del catálogo como parte del rollback. Las cargas realizadas se revisan individualmente.
