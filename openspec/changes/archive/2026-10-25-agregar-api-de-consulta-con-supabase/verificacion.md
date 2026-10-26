# Verificación de agregar-api-de-consulta-con-supabase

## Resultado de implementación

La API implementa listado de cuerpos públicos, ficha por slug y libros asociados mediante Express y las vistas y función de Supabase existentes. Conserva `/api/estado`, admite configuración independiente con `.env` y mantiene la exportación usada por `server.js`. No se añadieron dependencias ni se modificaron el lockfile, el esquema o las políticas de la base.

Se trabaja en `main` por instrucción expresa. Se añadieron `.env.example`, el cliente de consulta, pruebas HTTP y la comprobación de integración; se ampliaron la documentación, los comandos npm y la configuración Node de ESLint. `.env` fue configurado por la persona usuaria, permanece ignorado y no se reproducen aquí sus valores de conexión.

## Pruebas automatizadas locales

- `node --test api/consultaContenido.test.js`: 11 pruebas aprobadas, sin fallos.
- `npm test -- --test-reporter=dot`: suite completa aprobada; se conservan las 125 pruebas anteriores y se añaden las 11 de consultas y una de arranque del backend, 137 pruebas en total tras la revisión de Postman descrita al final.
- `npm run lint`: aprobado. El ajuste del entorno Node corrige el error previo de `process` en `server.js`; se conservan las reglas React para `src/`.
- `npm run build`: aprobado. El JavaScript conserva el tamaño previo de 806,26 kB (218,24 kB gzip), con el aviso existente de paquete mayor de 500 kB.
- `npm run start:api` con `PORT=3087`: servidor iniciado y contrato de `/api/estado` conservado. El proceso de prueba se detuvo al terminar.
- `openspec validate agregar-api-de-consulta-con-supabase --strict`: aprobado.
- `git diff --check`: aprobado. El diff no modifica `src/`, `public/`, `package-lock.json`, las especificaciones principales ni los cambios OpenSpec anteriores. La revisión posterior del arranque modifica únicamente el manejo de error de `server.js`, como se explica al final.

Las pruebas nuevas cubren recursos remotos permitidos, proyecciones y orden de consulta, clave pública sin credenciales reenviadas, configuración inválida o privilegiada, nulos y listas vacías, errores de red/HTTP/JSON, cancelación real del transporte a los cinco segundos, contratos HTTP, planetas y satélites sintéticos, libros y autoría, HEAD, 400/404/405/503 y cierre del servidor de comprobación tanto en éxito como en fallo. No se considera que los transportes simulados acrediten por sí mismos RLS remoto.

## Integración real con Supabase

La primera comprobación obtuvo un listado público vacío. La persona usuaria confirmó que el registro de prueba tenía `publicado=false`, coherente con la política `using (publicado)` del SQL compartido. Se explicó que la existencia de filas en Table Editor no implica visibilidad pública. El agente no cambió datos ni políticas.

En una consulta posterior el proyecto ya entregó un cuerpo público. Se repitió `npm run test:integracion`, que terminó con código 0 y estos resultados:

| Consulta | Resultado |
| --- | --- |
| `GET /api/cuerpos-celestes` | 200, un cuerpo público visible. |
| `GET /api/cuerpos-celestes/tierra` | 200; UUID y slug coinciden con el registro esperado configurado por la persona usuaria. |
| `GET /api/cuerpos-celestes/tierra/libros` | 200 con `[]`; coincide con la ausencia de libros públicos en la ficha. |

Registro acreditado: Tierra, slug `tierra`, UUID `e8e30d37-49aa-4f4b-84cc-0af40ee7105e`. Las consultas utilizaron la clave pública y la configuración local sin mostrarla. No hubo inserciones, actualizaciones, publicaciones de registros ni ejecución de SQL por el agente.

La rama con asociaciones bibliográficas reales no se pudo acreditar porque el cuerpo consultado no tiene libros públicos asociados; su contrato se comprobó con datos sintéticos. La observación inicial sin contenido público y la posterior con Tierra no constituyen una auditoría completa de RLS. No se dispone de un conjunto conocido de UUID de borradores/libros ocultos contrastado mediante acceso administrativo; esa exclusión detallada permanece sin verificar y no se eludieron permisos para investigarla.

## Compatibilidad visual: tarea 5.2 comprobada por la persona usuaria

La suite de escena y la compilación pasan; el código y los recursos del frontend permanecen intactos y no se añadieron llamadas del frontend a la API o Supabase. El servidor API de prueba quedó detenido.

El agente no realizó una revisión visual automatizada. El navegador integrado no está habilitado, el inventario de navegadores conectados está vacío y el acceso a Chrome mediante Computer Use devolvió `Computer Use was not approved to use Google Chrome`. No se reintentó ni se utilizó otra vía para eludir esa falta de autorización.

Se dejó Vite disponible en `http://127.0.0.1:5173/` y se pidió comprobar navegación, selección de un planeta, apertura/cierre de su ficha y entrada/salida de VR con el servidor API de prueba detenido. La persona usuaria confirmó en esta conversación: «si todo bien». Esta confirmación manual, junto con el diff sin cambios en `src/` o `public/`, completa la tarea 5.2. No se atribuye esa observación al agente ni se presentan pruebas nuevas con teléfono o visor físicos.

No se realizó commit, push, despliegue, sincronización de especificaciones ni archivo del cambio.

## Revisión de arranque y pruebas con Postman

Ante la consulta de la persona usuaria sobre `Cannot GET /`, se comprobó que `.env` configuraba `PORT=5173`, también usado por Vite. El puerto 3000 estaba ocupado por otro servicio, por lo que se ajustó únicamente `PORT` en el archivo local ignorado a 3001. La raíz del backend sigue respondiendo 404 porque no forma parte del contrato; el estado se consulta en `/api/estado` y la interfaz se sirve por Vite.

Se corrigió además el callback de arranque de `server.js`: Express 5 entrega en ese callback los errores al escuchar. El código anterior anunciaba éxito aun ante `EADDRINUSE`, lo que podía producir el mensaje de servidor ejecutándose seguido del regreso al prompt. Ahora informa el puerto ocupado y termina con código 1. `api/inicioServidor.test.js` reproduce la colisión con un puerto reservado temporalmente y acredita que no aparece el mensaje de éxito. La suite completa de 137 pruebas y ESLint pasan tras esta corrección.

Se añadió `postman/consultasMetseri.postman_collection.json`, sin claves de Supabase, con `urlBase` y `slugCuerpo` configurables. Postman CLI 1.73.0 ejecutó la colección local contra la API en 3001: seis peticiones y 12 aserciones, todas aprobadas. Se comprobaron estado, listado con Tierra publicada, ficha, libros, slug inválido (400) y cuerpo inexistente (404). Los dos errores son resultados esperados. No se inició sesión ni se publicaron los resultados en Postman Cloud.

El README contiene los pasos de importación y ejecución, y distingue las direcciones de frontend, API y sus rutas. No se añadieron endpoints ni se modificaron datos o políticas de Supabase en esta revisión.

## Revisión formal previa al archivo

| Dimensión | Resultado |
| --- | --- |
| Completitud | 16/16 tareas y los cuatro artefactos completos; los ocho requisitos nuevos tienen implementación identificada. |
| Corrección | Ocho requisitos mapeados y 14 escenarios revisados con pruebas locales, integración real y confirmación manual. Cobertura parcialmente no verificada en el escenario «Consultar libros disponibles»: no existen asociaciones públicas reales para contrastar esa rama y la exclusión de libros ocultos en el proyecto remoto. |
| Coherencia | Las decisiones de consulta GET, clave pública, RLS delegado, configuración del backend, pruebas separadas y conservación del frontend coinciden con la implementación. Nombres y estructura respetan las convenciones del proyecto. |

### Evidencia por requisito

| Requisito | Implementación y comprobaciones |
| --- | --- |
| Listado de cuerpos públicos | `api/index.js:36`, `api/consultaSupabase.js:77`; proyección y orden comprobados en `api/consultaContenido.test.js:66`, HTTP en `:158`, caso vacío en `:181` y lectura real de Tierra en la integración y Postman. |
| Ficha por slug | `api/index.js:40`, `api/consultaSupabase.js:85`; campos, unidades, nulos y tipos comprobados en `api/consultaContenido.test.js:158`, cuerpo no visible en `:181` y UUID/slug reales contrastados en la comprobación integrada. |
| Libros asociados | `api/index.js:53`, `api/consultaSupabase.js:90`; contratos con libros sintéticos en `api/consultaContenido.test.js:158`, ausencia y cuerpo no visible en `:181`. Lectura real sin asociaciones y limitación de la rama positiva registradas arriba. |
| Solo lectura pública | `api/consultaSupabase.js:41` y `:55` usan configuración pública y método GET; claves y recursos se comprueban en `api/consultaContenido.test.js:66` y `:85`, rechazo de escrituras en `:202`. No se atribuye a estos dobles una auditoría remota de RLS. |
| Validación del slug | `api/index.js:29`, `api/consultaSupabase.js:15`; entradas inválidas, codificación rota y ausencia de consulta externa comprobadas en `api/consultaContenido.test.js:202`. |
| Errores controlados | `api/consultaSupabase.js:55`, `api/index.js:58`; errores de configuración, HTTP, JSON, red, plazo y saneamiento comprobados en `api/consultaContenido.test.js:85`, `:102`, `:129`, `:146` y `:221`. |
| Compatibilidad existente | `/api/estado` conservado en `api/index.js:12` y probado en `api/consultaContenido.test.js:146`; `src/`, recursos y lockfile sin cambios. La revisión visual manual fue confirmada por la persona usuaria. |
| Recuperación real verificable | `api/comprobarSupabase.js:7`; éxito/fallo de la comprobación cubiertos en `api/consultaContenido.test.js:241` y `:251`, integración real con Tierra y Postman CLI aprobados. La persona usuaria confirmó además que sus pruebas en Postman fueron exitosas. |

### Hallazgos y límites

- **Críticos:** ninguno. No faltan tareas ni implementaciones requeridas.
- **Advertencia (1):** cobertura remota parcial del escenario de libros disponibles y de su filtro de visibilidad por falta de asociaciones reales conocidas. Antes de afirmar esa comprobación, repetir las consultas con un libro verificado y activo asociado a un cuerpo publicado y contrastar un libro oculto conocido, sin cambiar RLS para probar. El contrato de esta rama está cubierto localmente; el caso remoto vacío sí se acreditó.
- **Sugerencias:** ninguna adicional.
- Se conserva el aviso previo de tamaño de compilación, sin regresión del paquete del frontend.

Evaluación: no se encontraron problemas críticos en las comprobaciones realizadas. La cobertura del escenario de libros disponibles permanece parcialmente no verificada de extremo a extremo por la limitación de datos indicada. La revisión de código, diseño y pruebas no requiere modificar la implementación para el archivo; se conservan las limitaciones como evidencia, sin presentarlas como verificaciones completas.

### Alcance de sincronización evaluado

La única especificación delta es `specs/consulta-contenido-api/spec.md`. Contiene ocho requisitos ADDED, 14 escenarios y un propósito completo; no contiene requisitos MODIFIED, REMOVED ni RENAMED. La especificación principal correspondiente todavía no existe. La sincronización creará únicamente `openspec/specs/consulta-contenido-api/spec.md`, con el mismo propósito y requisitos bajo `## Requirements`; no modificará las tres capacidades principales ni los dos cambios activos anteriores.

## Cierre del cambio

La persona usuaria solicitó revisar y archivar el cambio y eligió expresamente sincronizar la especificación antes de archivarlo. Se creó `openspec/specs/consulta-contenido-api/spec.md` con el propósito completo, ocho requisitos y 14 escenarios. La comparación íntegra con el delta, ajustando únicamente el título y la cabecera `Requirements`, confirmó que no quedan operaciones por aplicar.

`openspec validate --specs` aprobó las cuatro capacidades. Se conserva un aviso previo de requisito largo en `mobile-vr-mode`, sin modificar esa capacidad. La validación estricta del cambio pasó y el archivo conservó sus 16 tareas completas y los metadatos `.openspec.yaml`.

El cambio se archivó en `openspec/changes/archive/2026-10-25-agregar-api-de-consulta-con-supabase/`, utilizando la fecha de la sesión de la persona usuaria. Los cambios activos `escena-planetaria` y `agregar-fichas-de-cuerpos-celestes` permanecen en su ubicación original. Se conserva la limitación de datos reales de libros indicada en la revisión, y se registra la confirmación adicional de la persona usuaria de que sus pruebas en Postman fueron exitosas.

El cierre modifica únicamente documentación y especificaciones de OpenSpec; no cambia implementación, datos de Supabase, `.env`, frontend ni recursos gráficos. No se realizó commit ni push.
