# Design

## Context

Ver `proposal.md` para el propósito y los límites del avance.

Estado observado al planificar:

- `EscenaEstelar` recibe `lectura.cuerpoId` de la escena y obtiene la identidad local. `FichaCuerpoCeleste` ya tiene los contenedores y el desplazamiento necesarios; los textos vacíos se representan mediante `EspacioContenido`.
- `src/datos/cuerposCelestes.js` mantiene ocho planetas y cuatro satélites con slugs locales, relaciones e imágenes. No contiene el contenido corregido de Supabase.
- `crearConsultaSupabase` ya devuelve el resultado de `ficha_cuerpo` con propiedades adicionales. Una consulta real de solo lectura confirmó doce cuerpos publicados y, en Mercurio, los cuatro datos editoriales, la invitación del PDF y `libros: []`. Esto acredita disponibilidad del contrato para planificar, no la implementación ni las doce fichas visuales.
- La usuaria ejecutó la corrección de `bd/corregirContenidoDesdePdf.sql` y compartió los 48 valores literales. `contenido_ficha` conserva las unidades y notas del documento; los números normalizados no son la fuente de presentación de este avance.
- `vite.config.js` dirige `/api` al puerto 3000; `.env` configura el servidor en 3001.
- La ficha Canvas del visor usa cuatro páginas con reservas propias. Su representacion es independiente del panel HTML; el reporte de la usuaria exige suministrarle el mismo contenido sin cambiar apariencia u optica.
- Las especificaciones vigentes exigen espacios vacíos y ausencia de consultas desde el frontend. Los dos deltas de este cambio actualizan explícitamente esa fase para vista unica y VR; no se editarán las especificaciones principales durante la implementación.

## Goals / Non-Goals

**Goals:**

- Separar la identidad local de la lectura remota para que el contenido llegue sin reconstruir la escena ni alterar su selección.
- Mantener una sola consulta vigente y aplicar únicamente información del cuerpo visible.
- Insertar texto editorial dentro de los elementos y clases existentes, con manejo de ausencia o error.
- Poder comprobar la integración y la conservación del diseño mediante evidencia del navegador.

**Non-Goals:**

- Cambiar hojas de estilo, tamaños, tipografía, colores, imágenes, controles o distribución; agregar pestañas o botones de reintento.
- Modificar gestos, sensores, perfil/optica del visor o geometria del cielo; rediseñar la interfaz movil. El relleno del Canvas y las continuaciones de lectura con las flechas existentes si estan incluidos.
- Volver a ejecutar SQL, modificar RLS, autenticar visitantes, reescribir endpoints, construir el catálogo o verificar físicamente libros.
- Introducir caché persistente, funcionamiento sin conexión, bibliotecas de consultas o dependencias nuevas.

## Decisions

### 1. Una consulta por seleccion compartida entre modos

Agregar un módulo pequeño en `src/servicios/consultaContenido.js`, con `fetch` a la ruta relativa `/api/cuerpos-celestes/:slug`. `EscenaEstelar` controla su ciclo a partir del slug seleccionado sin cancelar al alternar modos. El mismo estado llega al HTML y, mediante un puente acotado del campo, al Canvas compartido por ambos ojos. No se consulta el listado para reconstruir la identidad de la escena ni se hace otra petición para llegar a libros.

Se descarta consultar Supabase desde el navegador: el backend público y sus controles ya existen. Tampoco se copiarán los textos del PDF a los datos locales de producción, para mantener una única fuente de contenido.

### 2. Identidad estable y resultados tardíos descartados

El ID local sigue siendo el slug; el UUID remoto no reemplaza identificadores de escena. Validar que slug, nombre, tipo y planeta anfitrión coincidan con la identidad elegida antes de aplicar la respuesta. Conservar imagen, alternativa y créditos locales; incorporar solo los campos editoriales compatibles.

Al cambiar o cerrar la seleccion o desmontar, cancelar la petición mediante `AbortController` y descartar igualmente cualquier resultado cuya consulta ya no sea vigente. Un plazo finito controla la espera. No se necesita un almacén global ni una nueva arquitectura de estado; basta el ciclo acotado de consulta de la selección.

El estado de carga/error utiliza texto en el espacio de descripción y las reservas actuales en los campos sin contenido. No se conservan datos de otro cuerpo ni se añade un botón. Cerrar y volver a seleccionar permite una nueva consulta con los controles existentes.

### 3. Presentación editorial fiel al PDF

Usar `descripcion_breve`, `curiosidades`, `clasificacion` y los cuatro elementos de `contenido_ficha.datos_principales`. Conservar sus cadenas, orden y notas. Separar únicamente el prefijo numérico de la unidad para ocupar los `<dt>`, `<dd>` y espacios de unidad actuales; no convertir números ni cambiar separadores decimales. La reconstrucción de valor y unidad debe conservar el texto de origen.

No usar `rotacion_horas` para sustituir un día solar ni recalcular `orbita_dias` para producir otra cifra redondeada. Si falta un dato editorial, mantener su reserva sin inferirlo desde otra fuente. El subtítulo nulo conserva su espacio actual. El contenido se representa como texto React, sin insertar HTML recibido.

### 4. Libros dentro del espacio existente

En ambos modos, sustituir las reservas bibliograficas por `contenido_ficha.descubrir_libros`. Un arreglo `libros: []` es esperado y no impide mostrar esa invitación. No insertar nombres, enlaces, portadas, avisos de demostración o un catálogo nuevo. El contrato local futuro de libros se conserva, pero la incorporación de títulos reales queda para su tarea correspondiente.

En vista normal, el recorrido sigue siendo el desplazamiento del panel: llegar al encabezado existente, leer la invitación, volver hacia arriba o cerrar con la equis actual. No se agrega una barra de navegación.

### 5. Rellenar el visor conservando su diseno

Mantener una consulta activa por cuerpo al entrar/salir de VR. El componente de consulta conserva su montaje mientras no cambie el cuerpo y comunica su estado al campo mediante un callback estable. El puente rechaza cualquier actualizacion cuyo ID ya no este seleccionado. El Canvas y la lectura accesible reciben el mismo contenido.

`crearPaginasFicha` utiliza las cadenas editoriales adaptadas y `measureText` para envolver descripcion, etiquetas, cifras, unidades, curiosidades e invitacion dentro del area de lectura actual. Conservar cabecera, imagen, colores, familia tipografica, cuadricula, posiciones de controles y plano compartido entre ojos. Si no cabe una seccion, crear continuaciones que se recorren con Anterior/Siguiente; las cuatro pestañas siguen saltando a la primera pagina de su seccion y marcan la seccion actual. No reducir las fuentes para forzar todo a una pagina ni omitir texto.

Al llegar contenido o redimensionar se conserva la seccion y, cuando exista, su continuacion. Cambiar cuerpo/modo conserva el reinicio previsto. El estado de carga/error tambien se representa en el Canvas, sin boton nuevo. El cambio solo rellena contenido y aprovecha controles existentes; no altera sensores, gestos ni optica.

### 6. Puerto del backend y límites de archivos

Configurar el proxy de Vite a partir de `PORT`, respetando la variable del proceso y el archivo local, con 3000 como valor por defecto del servidor. Leer solo lo necesario desde la configuración de Node; no exportar URL, claves o contraseñas de Supabase mediante `VITE_`, `define` o respuestas del frontend. Mantener las peticiones relativas también fuera del desarrollo.

Archivos de implementación previstos: los dos componentes citados, el módulo de consulta con sus pruebas, `vite.config.js`, pruebas acotadas del renderizado/selección/proxy, instrucciones relacionadas en `README.md` y evidencias. No editar CSS, los datos de identidad de los compañeros, `server.js`, rutas/servicios de administración, SQL previo, geometria del cielo ni optica. Se permiten el puente y la composicion textual de la ficha VR indicados arriba. Los archivos `bd/` que ya estaban sin seguimiento son trabajo previo y deben conservarse.

## Risks / Trade-offs

- [Respuesta tardía o cambio de modo] → Cancelar y verificar vigencia; probar cambio rápido de cuerpo, cierre y retorno de VR.
- [Dato editorial ausente] → Mantener la reserva correspondiente y comunicar indisponibilidad; no fabricar un valor a partir de otro campo.
- [Texto extenso] → Ajuste y desplazamiento existentes en HTML; continuaciones con flechas existentes en Canvas. Verificar limites y ausencia de perdida de texto en 320 × 440, 750 × 624 y 900 × 1000.
- [Dependencia de red para rellenar] → Escena, identidad, imágenes y cierre permanecen locales; la ausencia de contenido se distingue de una ficha recuperada.
- [Libros todavía no entregados] → Mostrar la invitación exacta; la evidencia no afirmará que se consultaron títulos reales.
- [Lectura del telefono] → Comprobar el contenido VR en navegador y mediante el puerto 5173 compartido; registrar por separado cualquier prueba fisica que la usuaria confirme. El ajuste 6.9 es diagonal en pulgadas y no interviene en la consulta de datos.

## Migration Plan

1. Registrar una captura de la ficha actual a un tamaño de ventana conocido antes de tocar código; conservar el estado de archivos previos.
2. Aplicar únicamente la consulta, su enlace con la selección, el relleno HTML/Canvas y el ajuste del proxy. No ejecutar migraciones ni recuperar el commit revertido completo.
3. Probar contrato, respuestas fuera de orden, campos ausentes, cierre y regresiones existentes. Ejecutar las comprobaciones de proyecto y verificar por HTTP las doce fichas reales frente al contenido del SQL corregido.
4. Obtener capturas y ejecutar una demostración en navegador: seleccionar un planeta, consultar información, recorrer hasta libros, regresar, cambiar a un satélite y cerrar. Registrar resultados observados en `verificacion.md` y guardar las capturas en `evidencias/rellenarFichas/`. La demostración puede documentarse como secuencia de capturas de una ejecución real; no basta un guion sin ejecutar.
5. Cerrar la implementacion solo cuando se acredite el contenido en vista normal y VR del navegador y la conservación del diseño. No bloquearla por pruebas de comodidad con visor ajenas a este avance. No sincronizar especificaciones principales, archivar, hacer commit o push sin la instrucción correspondiente.

Para retirar la integración, revertir solo sus cambios de interfaz/proxy mediante el flujo acordado de Git. Los cuerpos y el contenido corregido permanecen en Supabase; este cambio no los modifica.
