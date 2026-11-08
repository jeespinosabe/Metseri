# Design

## Context

La motivación está en `proposal.md`; el contrato observable se define en `specs/panel-administrativo/spec.md`.

- `src/App.jsx` distingue `/admin` y `/admin/`, comprueba la sesión mediante `GET /api/admin/sesion` y alterna entre `AccesoAdministrativo` y `ModuloAdministrativo`. El acceso usa `POST` y el cierre usa `DELETE` en ese mismo recurso.
- `src/componentes/moduloAdministrativo.jsx` contiene únicamente una bienvenida y el botón de cierre de sesión. `src/App.css` ya define una estética administrativa oscura con acento verde claro; `src/index.css` bloquea el desplazamiento del documento, mientras el módulo administrativo tiene desplazamiento propio.
- `api/rutas/administracion.js` expone autenticación y una comprobación de acceso, pero carece de operaciones bibliográficas. La sesión actual se administra en el servidor con una cookie HttpOnly. No hay que sustituirla por un indicador local.
- El contrato público de libros contiene `libro_id`, `titulo`, `autor`, `editorial`, `anio`, `url_ficha` y `orden`. Su endpoint está vinculado a un cuerpo y solo devuelve libros activos y verificados: no constituye un catálogo administrativo completo.
- `src/datos/cuerposCelestes.js` ofrece las doce identidades locales, con slugs como `id`, clasificación y relación planetaria de los satélites. Estos identificadores locales no son los UUID de Supabase.
- Las pruebas existentes emplean `node:test`; las pruebas de representación React usan Vite en modo middleware y `react-dom/server`. No hay un router de terceros ni una biblioteca de componentes instalada.
- El usuario eligió mostrar formularios y confirmación de borrado, dejando el guardado pendiente. Esta decisión excluye también simular un CRUD en memoria.

Las especificaciones principales de fichas todavía contienen reglas de contenido vacío que los cambios completados y pendientes de archivar ya actualizan. Esa diferencia no se resuelve aquí: la nueva capacidad administrativa no modifica la lectura pública ni introduce libros en ella.

## Goals / Non-Goals

**Goals:**

- Separar la representación de registros de su futura fuente administrativa y mantener inmutables los ejemplos originales.
- Permitir recorrer las operaciones y editar borradores temporales sin sugerir persistencia ni ejecutar mutaciones.
- Reutilizar la autenticación, identidades y lenguaje visual existentes con componentes administrativos pequeños y CSS acotado.

**Non-Goals:**

- Diseñar ahora los endpoints, permisos o transacciones de una futura API bibliográfica, ni convertir los slugs de vista previa en claves de base de datos.
- Gestionar autores como entidades independientes, ISBN, inventario, préstamos, publicación, verificación o edición del contenido astronómico.
- Incorporar un router, una biblioteca visual, almacenamiento local, nuevas fuentes, una escena administrativa 3D o cambios de infraestructura.

## Decisions

### 1. Mantener `/admin` como único contenedor autenticado

`ModuloAdministrativo` pasará a coordinar listado, alta y edición con estado React local. El diálogo de eliminación se superpondrá al listado. No se crean subrutas: la pantalla inicial de una recarga será el listado tras la comprobación de sesión actual. La búsqueda y el filtro permanecen en el contenedor mientras se recorre un formulario; el borrador desaparece al cancelarlo o desmontarlo.

La cabecera ofrecerá marca, regreso a la exploración y cierre de sesión. Una navegación compacta identificará Registros bibliográficos y la acción Agregar libro; los encabezados indicarán Listado, Agregar libro o Editar libro. No se añadirán secciones administrativas sin contenido.

Se conservará el flujo actual de autenticación y solo se tocará `src/App.jsx` si lo exige su integración con el módulo ampliado. No se añadirá una entrada de demostración sin autenticar.

**Alternativa considerada:** introducir rutas para cada operación y un router externo. No se necesita para tres pantallas temporales sin persistencia y ampliaría los cambios de navegación y despliegue.

### 2. Colección de ejemplo inmutable y modelo de presentación explícito

Se definirá `src/datos/registrosBibliograficosEjemplo.js` con una colección pequeña de registros inequívocamente sintéticos, incluyendo varias relaciones y campos opcionales ausentes. Los títulos y la autoría identificarán su condición de ejemplo. La cabecera del contenido mostrará «Vista previa · Datos de ejemplo» y «Los cambios aún no se guardan».

El modelo de presentación será `{ id, titulo, autoria, editorial, anio, urlFicha, cuerposIds }`. `autoria` será texto de presentación, `anio` podrá estar ausente y `cuerposIds` contendrá slugs del catálogo local. Los nombres propios siguen la convención española; el modelo no se declara como payload de una API futura.

El contenedor aceptará una colección de registros, usando la de ejemplo de manera predeterminada. Una colección vacía explícita seguirá vacía, lo que permite comprobar ese estado sin añadir selectores técnicos al producto. La lógica de búsqueda y validación se concentrará en `src/administracion/registrosBibliograficos.js`. El listado se derivará de la colección original; no tendrá operaciones para insertar, reemplazar o eliminar elementos.

**Alternativas consideradas:** reconstruir un catálogo con consultas públicas por cuerpo o presentar solo un estado vacío. Las consultas públicas omiten registros administrativos y exigen deduplicación y numerosas peticiones; una pantalla siempre vacía impide revisar edición y eliminación. Los ejemplos identificados permiten evaluar estos recorridos sin atribuirles datos reales.

### 3. Componentes por recorrido y borrador independiente

Responsabilidades propuestas:

| Archivo | Responsabilidad |
| --- | --- |
| `src/componentes/moduloAdministrativo.jsx` | Estructura, navegación, filtros, registro activo y cierre de sesión existente. |
| `src/componentes/listadoBibliografico.jsx` | Listado, cantidad de resultados, estados vacíos y acciones por libro. |
| `src/componentes/formularioLibro.jsx` | Alta y edición, borrador, validación al abandonar campos editados y cancelación. |
| `src/componentes/selectorCuerposCelestes.jsx` | Selección múltiple con etiquetas de planeta o satélite y su planeta principal. |
| `src/componentes/confirmacionEliminarLibro.jsx` | Diálogo accesible y presentación de la futura eliminación. |
| `src/componentes/panelAdministrativo.css` | Presentación adaptable y estados visuales exclusivos del panel. |

Alta y edición compartirán un formulario. Al editar, se copiarán los valores y el arreglo de relaciones al borrador para evitar modificar el ejemplo original. Se permitirán cero o varios cuerpos, sin duplicados, mediante casillas agrupadas y etiquetadas. Un registro sin cuerpos se rotulará «Sin asociar»; esto no determina las reglas de publicación de la futura API.

Título, autoría y URL serán obligatorios para la validación visual. Editorial y año serán opcionales; la URL usará validación de protocolo HTTP/HTTPS y el año admitirá enteros de 1 a 9999. Los errores se mostrarán al salir de un campo editado y se actualizarán al corregirlo, sin depender de activar Guardar. La búsqueda normalizará mayúsculas, tildes y espacios exteriores; se combinará con un filtro de cuerpo y ofrecerá limpiar criterios.

**Alternativas consideradas:** formularios separados o reutilizar directamente el contrato público. Un formulario compartido mantiene las mismas reglas; el contrato público no contiene todas las asociaciones de un libro ni representa sus estados administrativos.

### 4. Acciones de persistencia visiblemente pendientes

Los botones Guardar libro, Guardar cambios y la confirmación Eliminar estarán deshabilitados mediante el atributo nativo `disabled`. Un texto cercano y asociado explicará «El guardado estará disponible en una próxima etapa» o su equivalente para eliminación. La interfaz no necesita mencionar endpoints o detalles de implementación.

Se prevendrá el envío nativo del formulario, incluido Enter, sin llamadas de escritura ni alteración del listado. No habrá mensajes de éxito, almacenamiento de borradores, retrasos de red simulados ni actualización optimista. Los botones Agregar libro, Editar y Eliminar del listado sí abrirán sus respectivos recorridos. Cancelar y volver descartarán únicamente el borrador de la operación.

La confirmación usará un diálogo modal nativo, con título, libro seleccionado y relaciones que se retirarían. El foco inicial estará en Cancelar; Escape y el cierre explícito retirarán el diálogo y devolverán el foco al control de origen.

**Alternativa considerada:** activar botones que solo muestren un aviso o realizar un CRUD temporal. Se descartan por la decisión del usuario de dejar las operaciones pendientes y para evitar un resultado que parezca guardado.

### 5. Presentación coherente con Metseri y aislamiento del CSS

Se conservarán fondo oscuro, superficies discretas, acento verde claro y tipografía del sistema del acceso actual. La jerarquía destacará título de pantalla, acciones, filtros y registros. El escritorio usará una tabla semántica; el móvil podrá apilar cada registro con etiquetas de campo conservando el orden de lectura. Los formularios pasarán de dos columnas a una y las relaciones se organizarán por tipo de cuerpo.

El panel mantendrá su propio desplazamiento dentro de la ventana para respetar el `overflow: hidden` global requerido por la escena. Los estilos nuevos estarán bajo clases administrativas específicas. De `src/App.css` solo se ajustarán reglas del módulo que entren en conflicto; se conservarán los estilos de acceso y de la escena.

Se comprobarán anchos de 1440 y 360 píxeles, contenidos extensos, foco visible, etiquetas, errores asociados y alcance de acciones por teclado. El formulario recibirá foco en su encabezado al abrirse; el diálogo mantendrá el foco modal mientras esté abierto.

**Alternativa considerada:** un rediseño global o una biblioteca de componentes. El CSS actual ofrece la base necesaria y permite limitar los cambios al área administrativa.

### 6. Verificación proporcional a los recorridos

Las funciones de filtro y validación se comprobarán con `node:test` para entradas combinadas, años inválidos, URLs y ausencia de mutación de los ejemplos. Las pruebas de representación seguirán el patrón local de Vite y `react-dom/server` cuando aporten cobertura de etiquetas, estados vacíos y controles deshabilitados.

Los recorridos de abrir, editar campos, cancelar, conservar filtros y manejar el foco requieren comprobación en navegador; la representación estática no se presentará como prueba de interacción. Se reutilizarán las pruebas existentes de autenticación. En la fase de implementación se ejecutarán `npm test`, `npm run lint` y `npm run build`, se comprobará la red para confirmar que las acciones bibliográficas no envían escrituras y se registrarán las limitaciones de las comprobaciones realizadas.

**Alternativa considerada:** introducir una infraestructura completa de pruebas de interfaz. No se necesita para este avance; se priorizan pruebas de lógica y revisión de los recorridos visuales, sin añadir dependencias.

## Risks / Trade-offs

- [Los ejemplos podrían confundirse con el catálogo real] → Aviso persistente, títulos sintéticos y cantidades identificadas como vista previa; los datos se importan exclusivamente desde el módulo administrativo.
- [Una colección vacía podría ocultarse con ejemplos predeterminados] → Diferenciar la ausencia de una propiedad de una colección explícitamente vacía; cubrir el estado vacío en la verificación.
- [Un borrador podría modificar referencias del registro original] → Copiar también las relaciones, derivar el listado de una colección inmutable y comprobar cancelación y reapertura.
- [La interfaz podría parecer terminada en términos de gestión real] → Controles de persistencia deshabilitados con explicación accesible y documentación que limita la aceptación a interfaz.
- [Slugs locales y autoría de presentación no coinciden con un futuro modelo de escritura] → Mantenerlos como modelo de vista; la API futura deberá definir permisos, UUID, autores y transacciones en otro cambio antes de habilitar guardado.
- [El bloqueo global de desplazamiento podría recortar formularios o confirmación] → Desplazamiento propio del panel, diálogo con altura limitada y revisión a 360 píxeles.
- [La sesión actual reside en memoria del proceso servidor] → Reutilizar el comportamiento existente y documentar que este cambio no corrige su continuidad entre instancias o reinicios. Esa limitación no se sustituye por autenticación ficticia.

## Migration Plan

La implementación se entregará como una ampliación de la interfaz Vite, sin migraciones ni cambios en variables de entorno o reglas de despliegue. Su comprobación utilizará la configuración administrativa ya existente y no requiere ejecutar SQL ni crear libros reales.

Para revertir el avance bastará restaurar el módulo visual anterior y retirar sus componentes, ejemplos y estilos exclusivos, conservando los endpoints y el acceso administrativo. La futura conexión con el catálogo real y la habilitación de guardado requerirán un cambio independiente; no forman parte de la entrega de esta interfaz.
