# Design

## Context

La motivación y el alcance están en `proposal.md`; los contratos se detallan en los dos deltas de `specs/`.

Estado observado del repositorio:

- `src/escena/planetas.js` genera ocho grupos a distancia 60, con esferas, texturas deterministas de Canvas 2D, anillos de Saturno, resaltado y halo. Devuelve la raíz, las mallas seleccionables y los datos para etiquetas, y registra sus recursos para liberarlos.
- `campoEstelar.js` usa esa colección en un solo detector, un estado de selección y las etiquetas de pantalla y visor. `seleccionPlanetas.js` devuelve el identificador de la malla impactada; no limita los identificadores a ocho nombres. Las estrellas, halos y resplandores no son seleccionables.
- `src/datos/cuerposCelestes.js` contiene ocho registros con identidad e imágenes locales, textos vacíos y valores numéricos nulos. `obtenerDatosPrincipales` ya distingue `tipo: 'satelite'`, admite `distanciaPlanetaKm` y usa rótulos y unidades propios. Sus pruebas todavía exigen ocho registros y ningún satélite.
- La ficha React y la tarjeta VR consultan el mismo registro. Ambas usan su clasificación; la cabecera VR conserva solo el último segmento separado por «·». Las cuatro páginas y los cuatro datos se generan mediante `contenidoFicha.js`.
- Las etiquetas de pantalla calculan su posición a partir del cuerpo y, en Saturno, de muestras del contorno de los anillos. Las de VR son sprites que atraviesan la corrección óptica. La mayor densidad de parejas exige revisar separaciones y la longitud de las nuevas relaciones.
- La API de consulta admite planetas y satélites, pero el frontend no la consume. Se conserva esa independencia.
- `escena-planetaria` ya está en las especificaciones principales; `fichas-cuerpos-celestes` sigue únicamente en el cambio completado de fichas. Sus deltas de escena y VR contienen mejoras presentes en el código que tampoco deben perderse al sincronizar más adelante.

## Goals / Non-Goals

**Goals:**

- Completar doce identidades coincidentes entre mallas, etiquetas y catálogo sin crear una segunda selección para lunas.
- Mantener los ocho cuerpos existentes, incluidas sus coordenadas, texturas y selección sobre los anillos.
- Incorporar las cuatro lunas aprovechando geometrías, proyecciones, navegación de fichas y limpieza existentes.
- Definir una composición inicial verificable, ajustable solo en las nuevas lunas y sus etiquetas durante la revisión visual.

**Non-Goals:**

- Renombrar de forma general archivos, funciones o estados que hoy usan «planeta»; sus identificadores internos pueden transportar también los nuevos cuerpos.
- Añadir un motor de órbitas, simulación física, luces por cada pareja, un segundo renderizador o solicitudes de contenido en el ciclo de dibujo.
- Cambiar contratos de API, datos remotos, autenticación, dependencias o configuración del visor.

## Decisions

### 1. Extender la colección visual existente

Conservar `crearPlanetas()` como punto de integración. Añadir las cuatro definiciones al final de los ocho registros actuales, con su identificador, nombre, relación visible, coordenadas, radio y paleta. Los grupos de las lunas serán hermanos de los planetas bajo la misma raíz: la relación con el planeta es un dato explícito y una proximidad visual, no una jerarquía animada.

Esta decisión mantiene el registro de mallas, etiquetas y recursos en un solo lugar. Añadir al final conserva las semillas actuales, que dependen del índice, evitando cambiar las superficies de los planetas.

Alternativas: un subsistema de lunas duplicaría integración y limpieza; hacerlas hijas de grupos planetarios exigiría adaptar coordenadas mundiales y contornos sin aportar comportamiento necesario. Una renombración general de módulos ampliaría el cambio sin modificar lo que ve el usuario.

### 2. Composición fija cerca de cada planeta

Reutilizar la esfera de distribución de radio 60 para conservar la profundidad y el enfoque del visor. Punto de partida en grados y unidades ilustrativas:

| Cuerpo | Planeta | Giro | Elevación | Radio |
| --- | --- | --- | --- | --- |
| Luna | Tierra | 14 | -15 | 2.2 |
| Europa | Júpiter | 72 | -28 | 2.2 |
| Titán | Saturno | 168 | 42 | 2.8 |
| Tritón | Neptuno | 198 | -32 | 2.1 |

Son parámetros propuestos, no posiciones astronómicas ni un resultado visual ya comprobado. El tamaño es menor que el de su planeta, pero deliberadamente suficiente para apuntar y tocar. Titán se desplaza hacia arriba y a un lado para separarse del gran contorno de los anillos. La validación por rayos y la inspección en vista única y ambos ojos determinarán ajustes menores en estas cuatro definiciones, sin mover los planetas.

Comprobar cada centro con geometría real de Three.js, incluido el impacto separado sobre anillos y Titán. Revisar las parejas completas en escritorio, móvil vertical y visor horizontal. Ajustar las posiciones y, si hace falta, el desplazamiento de las nuevas etiquetas para impedir superposición de sus textos; conservar el tratamiento actual de contornos, controles y oclusión por ficha.

Alternativas: repartir las lunas en sectores sin relación con sus planetas dificultaría entender las parejas; distancias y tamaños reales harían difícil verlas y seleccionarlas con los controles actuales.

### 3. Texturas ilustrativas deterministas

Reutilizar la esfera compartida y el material existente. Añadir variantes de Canvas 2D con semilla estable por luna: regiones oscuras y cráteres en Luna, trazos entrecruzados sobre fondo claro en Europa, capas ocre suaves para la bruma de Titán, y regiones pálidas de tonos distintos en Tritón. Las texturas se crean al construir la escena; no se regeneran por fotograma, mirada o cambio de modo. Las cuatro reciben el resaltado y halo existentes.

Las referencias visuales respaldan esos motivos, sin convertirse en textos o cifras editoriales de las fichas: [relieve y regiones lunares, NASA](https://science.nasa.gov/moon/facts/), [fracturas de Europa, NASA](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/), [bruma de Titán, NASA](https://science.nasa.gov/saturn/moons/titan/facts/) y [superficie y mosaico de Tritón, NASA](https://science.nasa.gov/neptune/moons/triton/). Las paletas y el nivel de detalle son decisiones ilustrativas.

Alternativas: mapas fotográficos remotos introducirían dependencia de red en la escena; imágenes generadas por IA o modelos externos no son necesarios para este estilo basado en código. Las fotografías locales se reservan para las fichas, como en los planetas.

### 4. Catálogo local y relación explícita

Añadir los siguientes registros a `CUERPOS_CELESTES`, manteniendo intactos los ocho existentes:

| id | nombre | tipo | planetaId | planetaPrincipal |
| --- | --- | --- | --- | --- |
| `luna` | Luna | `satelite` | `tierra` | Tierra |
| `europa` | Europa | `satelite` | `jupiter` | Júpiter |
| `titan` | Titán | `satelite` | `saturno` | Saturno |
| `triton` | Tritón | `satelite` | `neptuno` | Neptuno |

`planetaId` enlaza una identidad local existente y `planetaPrincipal` proporciona el nombre legible. No son UUID ni se traducen al contrato remoto. En el registro de datos, `tipo` indica la categoría; en los metadatos visuales actuales, `tipo` es el texto secundario de etiqueta y contendrá «Satélite de …».

Usar una clasificación completa como «Satélite natural de la Tierra», sin depender de prefijos que la cabecera VR eliminaría al separar por «·». Así ambas fichas identifican la relación sin añadir una sección ni rellenar subtítulo o descripción.

Conservar `subtitulo` y `descripcion` como cadenas vacías, `curiosidades` como arreglo vacío y los valores `diametroKm`, `distanciaPlanetaKm`, `rotacionHoras` y `orbitaDias` como `null`. Reutilizar `obtenerDatosPrincipales`; no copiar cifras astronómicas ni sustituir nulos por cero. `LIBROS_POR_CUERPO` continúa vacío.

Incorporar `luna.webp`, `europa.webp`, `titan.webp` y `triton.webp` en `public/imagenes/satelites/`, con menos de 100 000 bytes por imagen para conservar el límite comprobado por el catálogo. Seleccionar fotografías de las páginas oficiales citadas, verificar el recurso concreto y su crédito antes de incorporarlo, y guardar su origen en `imagenOriginal`. Cada archivo tendrá alternativa y autoría del recurso elegido, sin atribuciones supuestas. La aplicación usa la copia local y solo navega al origen al pulsar los créditos.

Alternativas: obtener los registros desde Supabase cambiaría la disponibilidad y el alcance; compartir la imagen o ficha de su planeta impediría identificar correctamente la luna.

### 5. Compartir interacción, ficha y ciclo de vida

Registrar las nuevas mallas con el mismo campo `userData.planetaId` y los nuevos identificadores. El detector existente puede resolverlos sin una segunda lista de estados. No hacer seleccionables halos, rótulos ni resplandores. Una selección global seguirá decidiendo tanto la ficha React como la VR y su lectura.

Las etiquetas se incorporan por los datos devueltos por la fábrica y reutilizan las dos presentaciones. Revisar que «Satélite de Neptuno» y las otras relaciones quepan y se lean, y que Titán no herede el contorno de los anillos de Saturno. Solo modificar los módulos de etiquetas o presentación si la validación identifica un ajuste necesario para las nuevas parejas.

Conservar la prioridad de tarjeta VR sobre el cielo, el toque de lectura, las pestañas y cierre, el apuntado mediante sensor o alternativa manual y la continuidad al recentrar o cambiar de modo. Los recursos de las lunas se registran en los mismos conjuntos y se liberan también si falla parcialmente la construcción. Reintentar crea doce cuerpos sin estado anterior. No habrá un ciclo de animación adicional.

Alternativas: estados separados por tipo permitirían dos fichas o dos selecciones simultáneas; manejar las lunas desde React por fotograma introduciría actualizaciones innecesarias.

## Risks / Trade-offs

- [Titán oculto o confundido con anillos] → Separación angular de partida, rayos sobre los dos objetivos e inspección del contorno en ambas vistas.
- [Lunas pequeñas o etiquetas próximas] → Tamaños ilustrativos, pruebas de objetivo individual y ajuste local de las cuatro posiciones y sus etiquetas en los tamaños indicados.
- [Regresión de superficies existentes] → Añadir las lunas tras los ocho registros conserva los índices usados por las semillas; comparar posiciones y apariencia de los planetas durante la revisión.
- [Más materiales y texturas en móvil] → Compartir geometría y textura de halo, generar superficies una vez, usar imágenes de ficha pequeñas y conservar liberación idempotente.
- [Identidad distinta entre escena y ficha] → Comprobar los doce identificadores, la relación de cada luna y la correspondencia entre malla, etiqueta y registro; probar cambios de planeta a luna y viceversa.
- [Validación de escritorio insuficiente para visor] → Registrar navegador y tamaños usados; diferenciar la emulación de la prueba física con móvil y HOMIDO GRAB, dejando explícita cualquier comprobación física pendiente.
- [Sincronizar sobre una base incompleta] → Aplicar primero las especificaciones del cambio completado de fichas antes de sincronizar este delta, sin editar ni archivar ese cambio como parte de esta propuesta.

## Migration Plan

La implementación será una ampliación del cliente y sus recursos estáticos; no necesita migraciones de datos ni configuración remota. Actualizar solo la documentación relacionada y comprobar la aplicación con el servidor API detenido. Una reversión retiraría los cuatro registros visuales y de catálogo, sus imágenes y los ajustes específicos de integración, restituyendo la colección previa de ocho cuerpos.

Antes de sincronizar o archivar `incorporar-lunas`, sincronizar la base completada de fichas y sus deltas de escena y VR mediante el flujo correspondiente, sin sobrescribir las ampliaciones de este cambio. Esta dependencia documental no requiere implementar de nuevo las fichas ni bloquea su extensión en el código existente.
