# Design

## Context

Metseri ya tiene los ocho planetas seleccionables, iluminación independiente para apuntado y selección, ficha React y una tarjeta CanvasTexture renderizada por StereoEffect. Se reutilizan los identificadores, las imágenes locales y sus créditos, la proyección inversa de selección, el clasificador de gestos, el sensor y el dibujo bajo demanda.

La referencia visual proporcionada requiere una cabecera más limpia, imagen pequeña en la esquina superior derecha, nombre grande, datos en dos columnas y curiosidades separadas por una línea. El contenido editorial definitivo todavía no está disponible: los textos y cifras de producción deben permanecer vacíos. La selección no cambia al recorrer la ficha.

## Goals / Non-Goals

**Goals:**
- Compartir identidad, etiquetas y espacios reservados entre pantalla y VR.
- Abrir la tarjeta frente a la mirada y permitir saltos directos entre secciones.
- Evitar cierres accidentales al tocar la lectura y conservar salida explícita y deselección fuera del panel.
- Mantener recursos locales, accesibilidad, sensor y limpieza existentes.

**Non-Goals:**
- Redactar descripciones, curiosidades, invitaciones bibliográficas o valores astronómicos reales.
- Modificar cuerpos, superficies, composición del cielo, PWA o WebXR.
- Añadir dependencias, animaciones de carga, temporizadores de mirada o nuevos gestos de sensor.

## Decisions

### 1. Identidad separada del contenido editorial pendiente

Los registros de cuerposCelestes.js conservan identificador, nombre, clasificación, imagen y procedencia. Subtítulo y descripción son cadenas vacías, curiosidades un arreglo vacío y datos numéricos null. El formateador distingue null de cero y devuelve valor vacío más etiqueta y unidad separadas. Un ejemplo sintético prueba el contrato de satélite; no se incorpora contenido lunar.

Las reservas son líneas y bloques discretos sin animación ni texto ficticio. La semántica accesible los identifica como espacios reservados. Los créditos de imagen quedan en un acceso separado. Mantener datos reales y ocultarlos solo mediante CSS permitiría que otra presentación o el lector de pantalla los revelase; por eso se vacían los registros editoriales.

### 2. Panel conforme a la referencia

FichaCuerpoCeleste presenta clasificación en verde tenue, nombre de mayor tamaño, miniatura junto al nombre, espacio para subtítulo y descripción, cuadrícula de datos con unidad bajo el valor y secciones de curiosidades/libros separadas por líneas. La miniatura reutiliza el recurso local y mezcla su fondo oscuro con el panel; no añade otro renderizador 3D.

El panel sigue siendo lateral en escritorio y desplazable en móvil, con cielo y controles fuera de su superficie. Conserva cierre, foco, acciones nativas, texto alternativo e independencia de los gestos del cielo. Una región accesible única también permite operar las acciones VR con teclado.

### 3. Cuatro secciones estables en VR

contenidoFicha.js define Ficha, Datos, ¿Sabías? y Libros. La primera contiene la identidad y el espacio de presentación; las otras muestran los datos reservados, las curiosidades y los libros. Se conserva el mismo estado de lectura y un único plano compartido entre las cámaras de los dos ojos. Los espacios no contienen texto educativo ni cifras.

La tarjeta aparece directamente frente a la orientación actual y queda fija en el mundo, orientada al observador. Recentrar la devuelve al frente conservando la sección. Esto evita el giro inicial hacia una ficha lateral y permite apuntar pestañas diferentes con el eje común; un panel que siguiera continuamente la cámara impediría alcanzar sus controles.

### 4. Controles por sección y cierre protegido

La franja superior tiene cuatro pestañas con nombres, estado actual persistente y resaltado al apuntar. Anterior y Siguiente aparecen abajo cuando existen; × mantiene un objetivo independiente arriba. La distribución genera las zonas accionables del mismo modo que las dibuja y la intersección UV usa el rayo central ya existente.

Una activación con control apuntado ejecuta solo esa acción. Un impacto en el área de lectura sin acción consume el toque conservando selección y sección. Fuera de la tarjeta continúa la deselección global existente; × también la quita explícitamente. No hay avance automático, espera por permanencia ni cancelación del sensor al tocar. El arrastre continúa siendo exclusivamente navegación.

### 5. Datos bibliográficos y ciclo de vida

Las asociaciones bibliográficas continúan vacías y preparadas para una incorporación posterior. La sección actual muestra solo su encabezado y espacio reservado; no se inventan libros ni se redacta una invitación temporal. Se conservan los validadores y la apertura explícita de registros configurables para su uso posterior.

El renderizador redibuja solo cuando cambia cuerpo, sección, dimensiones, imagen o acción apuntada. Desmontaje, pérdida de WebGL y reintento mantienen la limpieza de eventos, geometría, material, textura e imágenes tardías. No se reconstruye el campo para paginar.

## Risks / Trade-offs

- [Las reservas pueden confundirse con contenido cargándose] → No usar animación y nombrarlas como espacio reservado en la semántica.
- [Tocar para leer cerraba la tarjeta] → Consumir el impacto sin acción; separar cierre y deselección fuera del panel.
- [El visor tiene poco espacio horizontal] → Cuatro secciones, controles estables, ajuste al área por ojo y comprobación a 834 × 390.
- [Canvas carece de semántica textual] → Mantener una única región React accesible, con los mismos saltos de sección.
- [La capacidad planetaria base pertenece a un cambio anterior aún activo] → Ya se sincronizó la base; conservar el orden base seguido de este delta al finalizar, sin archivar automáticamente.

## Migration Plan

La actualización sustituye únicamente la presentación y contenido de ficha, sus controles VR, pruebas y documentación relacionadas. No requiere migración de servidor, almacenamiento ni publicación. Una futura entrega de contenido deberá incorporar textos y cifras a los campos vacíos y revisar su distribución. La comodidad óptica y el botón físico deben comprobarse cuando haya un teléfono y visor disponibles.
