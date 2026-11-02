# Design

## Context

Ver la motivación en `proposal.md`. El alcance y la fuente remota fueron confirmados por la usuaria: fichas publicadas mediante API/Supabase y libros dentro de cada ficha.

- `crearSeleccionPlanetas` ya resuelve apuntado, selección y cierre para doce cuerpos. `campoEstelar.js` alimenta una ficha VR compartida; `EscenaEstelar` recibe su estado de lectura y monta `FichaCuerpoCeleste`. No hace falta reconstruir la selección.
- `src/datos/cuerposCelestes.js` conserva identidad, imágenes locales, créditos y relaciones; el contenido editorial está vacío. Sus `id` son slugs, mientras que la API devuelve `id` UUID y `slug` por separado.
- La ficha HTML ya renderiza algunos campos si existen. En cambio, `crearPaginasFicha` dibuja reservas estáticas, mantiene cuatro páginas fijas e ignora los textos reales. Sus pruebas comprueban expresamente ausencia de contenido: deben evolucionar junto con el comportamiento.
- La API ya ofrece una ficha completa con `libros` verificados/activos. No hacen falta endpoints nuevos, un SDK de Supabase, un catálogo general ni consultas del navegador a la base.
- El estilo existente usa fondo azul oscuro, texto claro, acentos verde claro, imagen pequeña a la derecha y cuadrícula de datos. La ficha está a la derecha en escritorio y ocupa casi el ancho del móvil, sobre la escena.
- No hay `PRODUCT.md` ni `DESIGN.md` globales. La dirección de esta propuesta procede de esos componentes y estilos; no se realizó una inspección visual en navegador durante la planificación.
- La lectura inicial al planificar el 2 de noviembre de 2026 devolvía solo Tierra incompleta. Posteriormente, la usuaria ejecutó la carga previa documentada en `bd/README.md`: las doce fichas y dos libros provisionales por cuerpo ya están disponibles. La implementación de interfaz conserva su alcance de solo lectura; la comprobación actual está en `verificacion.md`.

## Goals / Non-Goals

**Goals:**
- Una sola relación selección → slug → contenido vigente para React y VR, sin duplicar consultas por ojo o cambio de modo.
- Estados explícitos que mantienen la escena utilizable; lectura completa y navegación identificable hasta los libros.
- Mantener el contrato HTTP y las unidades científicas del servidor, sin convertir cifras entre conceptos distintos.

**Non-Goals:**
- Cambiar posiciones, modelos, sensores, óptica, doble tap, autenticación, almacenamiento o RLS.
- Cargar el PDF en producción, replicar sus textos como respaldo local, publicar registros o añadir campos de día solar al esquema.
- Diseñar una biblioteca independiente, inventar portadas, títulos, disponibilidad o servicios de préstamo.

## Decisions

### 1. Una ficha pública por selección, con libros incluidos

El cliente hará `GET /api/cuerpos-celestes/{slug}` mediante una URL relativa al mismo origen. Usará los `libros` de esa respuesta, cuyo contrato trae `titulo`, `autor`, `editorial`, `anio` y `url`. La ruta independiente `/libros` seguirá disponible y sin cambios para sus consumidores y Postman.

Alternativas consideradas: consultar ficha y libros por separado añade estados, tráfico y posibles discrepancias; cargar el listado para construir la escena haría depender sus doce cuerpos de la publicación; copiar el PDF al cliente contradice la fuente elegida. Se descartan en este avance. No habrá caché persistente: una selección nueva vuelve a consultar; cambiar modo, página, orientación o tamaño no lo hace.

### 2. Adaptador pequeño y límites de identidad

Incorporar `src/servicios/consultaContenido.js` para consultar, validar y adaptar el JSON, reutilizando funciones de formato y validación pertinentes. Evitar capas de repositorios, contextos globales y dependencias nuevas.

| Respuesta pública | Uso en la interfaz |
|---|---|
| `slug` | Debe coincidir exactamente con el `id` local seleccionado |
| `id` | UUID conservado aparte como `idRemoto`; no reemplaza el identificador de la escena |
| `tipo`, `planeta.slug` | Validación contra el tipo y la relación locales antes de mostrar contenido |
| `subtitulo`, `descripcion_breve` | Subtítulo y descripción de la ficha; texto plano |
| `datos_principales.diametro_km` | Diámetro en km |
| `distancia_sol_millones_km` / `distancia_planeta_km` | Distancia de planeta / satélite, sin intercambiar magnitudes |
| `rotacion_horas`, `orbita_dias` | Rotación y órbita con conversiones de presentación explícitas |
| `curiosidades` | Lista del mismo cuerpo, en el orden recibido |
| `libros[].url` | Enlace bibliográfico; no confundir con `url_ficha` de la ruta independiente |

La identidad e imágenes seleccionables, alternativas, relación planetaria y créditos locales siguen disponibles. Se mantienen esas imágenes locales en la ficha; la API actual no incluye créditos y algunos registros semilla de satélites no tienen imagen. No se cargan imágenes remotas ni se sustituyen créditos con datos sin procedencia. Un slug/tipo/relación incompatible es error de contenido, no una ficha parcialmente mezclada.

No usar importaciones desde `api/` en el código de navegador. Todo contenido se renderiza como texto mediante React/Canvas; no se interpreta HTML remoto. Un dato ausente permanece ausente, un cero válido se conserva y un número no finito se rechaza como valor utilizable.

### 3. Consulta cancelable y actualización del panel sin recrear la escena

`EscenaEstelar` coordinará el contenido a partir de `lectura.cuerpoId`, manteniendo un estado con slug, fase y ficha/error. Cambiar cuerpo o reintentar inicia la consulta; cerrar, desmontar o perder WebGL la cancela. Combinar cancelación con una versión de solicitud para ignorar respuestas antiguas incluso cuando el transporte no respete la cancelación. Acotar la espera a doce segundos y retirar su temporizador al terminar.

Reutilizar el estado de lectura existente y añadir una operación acotada para comunicar el estado remoto a `campoEstelar`/`crearFichaCuerpoVr` solo si corresponde al cuerpo vigente. Esa operación debe admitir una actualización del mismo cuerpo: hoy `establecerCuerpo` ignora llamadas con el mismo `id`. No recrear Three.js, controles ni sensor cuando llega contenido. El mismo estado adaptado alimentará la ficha HTML y la textura VR.

| Fase | Contenido y acciones visibles |
|---|---|
| Sin selección | Escena y controles; sin panel ni consulta |
| Cargando | Identidad/imagen local, «Cargando ficha de [nombre]…» y cierre |
| Disponible | Contenido publicado, ausencias por campo y libros del cuerpo |
| No disponible, 404 | «La ficha de [nombre] no está disponible» y cierre; no revelar si es borrador |
| Error de red/503/formato/plazo | «No pudimos cargar esta ficha. Inténtalo de nuevo», Reintentar y cierre |

Los estados se anuncian de forma breve mediante la lectura accesible existente, sin duplicar anuncios por ojo. Abrir Libros durante carga/error muestra el mismo estado de consulta, no «sin libros». La llegada del contenido conserva la sección elegida si sigue siendo válida. Una acción que ya no corresponde a la selección se descarta.

### 4. Composición de pantalla y recorrido

Modo de experiencia para el cielo y de lectura para la ficha. Conservar la identidad visual existente y evitar modificar la distribución general o añadir una barra global de biblioteca.

```text
Escena 3D ─ seleccionar ─► Ficha del cuerpo
                            ├─ Identidad + imagen local + cierre ×
                            ├─ Accesos: Ficha | Descubrir libros
                            ├─ Descripción
                            ├─ Datos principales (2 × 2)
                            ├─ ¿Sabías que...?
                            ├─ Descubrir libros
                            └─ Créditos de imagen
Ficha ─ cerrar ─► misma escena y orientación, sin selección
Libros ─ abrir ficha bibliográfica ─► nueva pestaña
```

En pantalla, los dos accesos son navegación interna del panel, no pestañas que oculten el resto del documento. «Descubrir libros» desplaza únicamente el panel y enfoca su encabezado; «Ficha» vuelve al encabezado principal. El cierre sigue accesible y devuelve el foco al cielo sin reconstruirlo. No introducir una ruta nueva ni modificar el enrutamiento administrativo de `App`.

En escritorio conservar el panel derecho y dejar una parte utilizable de la escena. En móvil conservar el panel desplazable, márgenes seguros y acceso al cierre; a 320 px no debe haber desplazamiento horizontal ni controles tapados por la barra inferior. Mantener contraste, foco visible, objetivos cómodos de al menos 44 × 44 px para acciones de ficha y reducción de movimiento para desplazamientos cuando el sistema la solicite. La rueda, el tacto y las flechas dentro del panel no deben girar el cielo.

### 5. «Descubrir libros» dentro de la ficha

Presentar una lista sobria de libros relacionados, sin portadas inventadas. Cada entrada tendrá título como elemento principal, autoría, editorial y año cuando existan, y el enlace «Ver ficha bibliográfica ↗», identificado como apertura en otra pestaña. El cuerpo seleccionado permanece visible en la identidad del panel. No mostrar campos vacíos ni convertir años ausentes en cero.

Cuando la respuesta disponible no tenga libros utilizables: «Aún no hay libros verificados asociados a [nombre]». Debajo, reutilizar la invitación a continuar en los libros físicos de la Biblioteca «Solón Argüello». Este mensaje es un estado definitivo de esa respuesta, no una promesa de entrega o de existencias. Reutilizar la validación de título y URL HTTP/HTTPS; una asociación inválida no inutiliza la ficha.

La apertura requiere activación explícita y conserva la protección frente a `window.opener`. En pantalla se conserva la sección Libros. En VR se solicita la apertura y se libera el modo inmersivo conservando el cuerpo; el reinicio de sección al salir sigue la regla existente. Si la pestaña se bloquea, mostrar el aviso y un enlace HTML explícito en vista normal para repetir la apertura desde un gesto directo. Reutilizar el flujo existente de `abrirFichaBibliografica`, ampliando su devolución de resultado a la interfaz cuando sea necesario.

### 6. Contenido VR completo, con secciones estables y páginas variables

Conservar Ficha, Datos, ¿Sabías? y Libros como secciones, pero dejar de asumir que cada sección ocupa una página o que Libros siempre tiene índice 3. Usar los identificadores estables para resolver el inicio de cada sección y mantener su estado activo en todas sus páginas. Las flechas recorren páginas físicas; el contador comunica sección y posición dentro de ella.

Reutilizar `dividirLineas` con medición real del contexto Canvas y distribuir descripción, curiosidades y libros en tantas páginas como necesiten, según el tamaño ya acotado del lienzo. Mantener cabecera y controles fuera del área de texto. No reducir indefinidamente la tipografía, truncar cifras, ocultar curiosidades ni limitar arbitrariamente la cantidad de libros. Las zonas de activación de un libro deben corresponder solo a su control visible, incluso con títulos partidos en varias líneas.

La navegación y la salida siguen usando el estado compartido de la ficha; el HTML aporta una única lectura accesible. Recentrar conserva sección y página; cambiar modo reinicia la lectura y mantiene la consulta. Redimensionar recompone las páginas y conserva la sección, ajustando su subpágina a un rango válido. Mantener los gestos existentes: mirada sin toque no activa; texto consume el toque; doble tap solo recentra; arrastre no selecciona ni abre libros.

### 7. Ciencia publicada y relación con el PDF

El documento aportado, de 15 páginas y fechado el 31 de octubre de 2026, será material de contraste editorial, no instrucciones de ejecución ni autorización para escribir en Supabase. Contiene ocho planetas, cuatro satélites y una invitación bibliotecaria por ficha; no incluye títulos/URLs de libros verificables.

| Slug | Referencia del PDF | Relación que debe conservarse |
|---|---|---|
| `mercurio` | Página 3 | Planeta |
| `venus` | Página 4 | Planeta |
| `tierra` | Página 5 | Planeta |
| `marte` | Página 6 | Planeta |
| `jupiter` | Página 7 | Planeta |
| `saturno` | Página 8 | Planeta |
| `urano` | Página 9 | Planeta |
| `neptuno` | Página 10 | Planeta |
| `luna` | Página 11 | Tierra |
| `europa` | Página 12 | Júpiter |
| `titan` | Página 13 | Saturno |
| `triton` | Página 14 | Neptuno |

El PDF identifica el día solar en los rocosos y la rotación aproximada en los gigantes. El contrato actual solo ofrece `rotacion_horas`; por ello, este avance rotulará ese dato como «Período de rotación» y usará «Período orbital» para la órbita, diferenciando planeta y satélite y sus distancias. No introducir los 176 días solares de Mercurio ni los 116,8 de Venus en un campo de rotación como si fueran el mismo concepto. Conservar la indicación retrógrada donde el valor la exprese y las conversiones de presentación de horas a días y de días orbitales a años; documentar que un año de presentación equivale a 365,25 días, no reconstruir una cifra editorial original.

La revisión de contenido comparará identidad, descripción, curiosidades y magnitudes equivalentes con el PDF; registrará diferencias de concepto o redondeo en vez de forzar igualdad numérica. No añadir al producto una atribución científica que la respuesta no respalde. Una futura reproducción exacta de todos los días solares del PDF requerirá otro acuerdo de datos/esquema y queda fuera de este avance.

### 8. Desarrollo, conservación del trabajo previo y pruebas

Corregir el proxy de Vite para tomar el puerto del proceso o `PORT` del entorno local, con `3000` como valor por defecto, y mantener `/api` como única URL del cliente. Leer solo la configuración necesaria desde el proceso de Vite; nunca propagar `SUPABASE_*`, secretos administrativos o todo el entorno mediante `define` o variables `VITE_*`. Documentar que se ejecutan API y Vite en terminales separadas. En publicación, `/api` necesita un destino del mismo origen configurado por el alojamiento; no se configura un despliegue en esta tarea.

Concentrar los cambios en consulta/adaptación, fichas, composición de contenido y su puente con la escena. Mantener los doce cuerpos, recursos, geometría, relaciones, controles, visor y autenticación de los compañeros. No tocar archivos archivados ni escribir en la base. Antes de implementar, comprobar que no haya trabajo pendiente ajeno en esos archivos.

Actualizar las pruebas que exigían contenido de producción vacío. Cubrir adaptación y correspondencia de los doce slugs con respuestas sintéticas claramente identificadas, controles de cancelación/versión con respuestas diferidas, errores/ausencias, paginación completa y apertura de enlaces. Reutilizar Node y los dobles de Canvas existentes. Añadir verificación de la interfaz real para selección → ficha → libros → escena en escritorio, móvil y VR; si no hay automatización disponible, registrar una comprobación manual explícita, sin declararla automatizada. Ejecutar las pruebas de la API/administración junto con la suite general, lint y build; repetir Postman y la integración real sin escrituras.

## Risks / Trade-offs

- [Solo una ficha pública e incompleta] → La integración se puede construir con pruebas sintéticas, pero la aceptación real de las doce fichas queda pendiente hasta completar/publicar contenido mediante su responsable. No marcar esa validación como realizada por pasar pruebas locales.
- [No hay libros públicos] → El estado vacío es válido; la navegación con títulos reales solo se acreditará cuando haya una asociación verificada disponible. Distinguir la prueba sintética de esa evidencia real.
- [Día solar distinto de rotación y diferencias de redondeo] → Rotular los campos según el contrato y registrar diferencias con el PDF; no migrar ni transformar conceptos automáticamente.
- [Respuesta tardía o contenido ajeno a la selección] → Validar slug/tipo/relación y aplicar cancelación más versión de solicitud.
- [Texto mayor que las reservas actuales de VR] → Paginación basada en mediciones, salto de sección por identificador y pruebas con tamaños mínimos y textos largos.
- [Aperturas desde VR bloqueadas] → Mantener el gesto explícito, detectar el resultado y ofrecer el enlace HTML en vista normal conservando el cuerpo.
- [Proxy de desarrollo y puerto divergentes] → Alinear Vite con `PORT`, verificar también acceso administrativo y conservar secretos solo en servidor.

## Migration Plan

1. Implementar adaptador, estados y proxy sin cambiar el contrato del backend; integrar después la lectura HTML y el puente VR.
2. Verificar con respuestas de prueba las doce identidades, navegación, fallos y limpieza; ejecutar regresiones existentes.
3. Coordinar con la persona responsable el contenido público: identidad, descripción, cuatro datos y curiosidades para los doce slugs, y asociaciones reales cuando existan. Esto no autoriza escrituras automáticas. Los satélites deben conservar una relación pública comprobable con su planeta.
4. Comprobar por la API y en la interfaz lo disponible realmente, con matriz por slug, fecha y resultado. Registrar por separado faltantes de contenido, diferencias editoriales, libros reales y pruebas de interfaz pendientes; no cerrar la aceptación de doce fichas completas con solo Tierra.
5. Actualizar README y el informe de verificación, completar únicamente tareas acreditadas y verificar OpenSpec antes de sincronizar/archivar cuando se solicite. Commit y push requieren autorización propia.

La reversión afecta solo a los archivos de esta integración y recupera las fichas locales reservadas y su configuración anterior; no necesita revertir migraciones o políticas porque no se realizan. No utilizar restablecimientos globales que borren aportaciones posteriores de compañeros.

## Open Questions

- ¿Qué títulos y URLs bibliográficos verificados entregará la biblioteca y cuándo estarán asociados? No bloquea el diseño: sin ellos se muestra el estado vacío especificado.
- La dependencia de publicación de las doce fichas se resolvió antes de implementar; resta la comprobación en móvil/visor físicos que la usuaria no tiene disponible, según `verificacion.md`.
