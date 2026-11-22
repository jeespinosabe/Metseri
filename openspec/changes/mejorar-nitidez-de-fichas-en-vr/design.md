# Design

## Context

Ver [proposal.md](proposal.md) para la meta y [informeNitidezVr.md](informeNitidezVr.md) para diagnóstico y evidencia. Base: `fb6c5e0`.

La calibración actual solo persiste la diagonal. El cambio conserva ese contrato y deriva automáticamente la presentación de fichas, etiquetas, cuerpos y cielo; no añade preferencias ni claves que migrar.

El renderer limita VR a densidad 1.25 y 1.5 megapíxeles. Cada ojo usa una textura intermedia reutilizada y luego una pasada óptica. Las fichas usan Canvas de hasta 900 px; las etiquetas VR, Canvas de 512 × 128 y sprites con escala relativa a la distancia. Los cuerpos tienen texturas procedurales de 1024 × 512, anillos de 1024 × 1024 y una esfera compartida de 48 × 32 segmentos. El cielo usa 6000 puntos en tres grupos y una textura radial de 64 × 64.

Las nuevas capturas muestran etiquetas pequeñas y suaves, superficies con poco detalle aparente y etiquetas inferiores que coinciden con la barra de botones. Los cuerpos que están en el borde pueden quedar recortados naturalmente por el campo visual; esto no acredita por sí solo un error de geometría.

## Goals / Non-Goals

**Goals:**

- Un único dato de calibración elegido por el visitante: la diagonal real.
- Una política automática común para todos los elementos visibles y ambos ojos.
- Lectura e identificación verificables al aumentar las pulgadas, con límites de carga y memoria.
- Mantener estables interacción, distribución, identidad, selección y lectura durante los cambios.

**Non-Goals:**

- No introducir selectores manuales, un asistente de calibración nuevo, WebXR, SDF/MSDF ni un motor alternativo.
- No cambiar posiciones, radios relativos o contenido científico para simular más nitidez.
- No garantizar que el software añada píxeles físicos o corrija un visor ópticamente incompatible.
- No modificar la experiencia normal ni las figuras y reglas del puntero.

## Decisions

### 1. Una política automática compartida

Calcular una configuración derivada de diagonal validada, viewport, dimensiones de screen, DPR y límites reales de textura/renderbuffer. Pasarla a la salida por ojo, ficha, etiquetas y recursos gráficos que la necesiten. No persistir preferencias de calidad: la configuración se deriva cada vez que se entra en VR, se guarda una diagonal o cambia el área disponible.

Separar los parámetros ópticos de los de rasterización: usar la diagonal real en la proyección y compensar la lectura de acuerdo con el tamaño final. No falsear la separación de lentes ni el campo para que todo parezca más grande.

Punto de partida para validar: densidad objetivo `1.5 × max(1, diagonal / 6.9)`, limitada por DPR, máximo 1.75, dos megapíxeles de salida total y capacidades GPU. En igualdad de los demás factores, el objetivo no disminuye al aumentar las pulgadas; puede estabilizarse cuando alcanza un límite. Por ejemplo, el objetivo previo a los límites pasa de 1.5 a aproximadamente 1.74 entre 6.9 y 8. Esta curva es una decisión inicial de ingeniería sujeta al presupuesto físico de rendimiento, no una promesa de FPS.

El límite 1.75 es un techo, no una obligación de aplicarlo a cualquier equipo. Durante implementación se contrastarán densidad, memoria y tiempos con el dispositivo de referencia y se afinarán los coeficientes antes de cerrar aceptación, conservando la respuesta automática y los requisitos de lectura. Cualquier reducción por capacidad se registra en la evidencia técnica; no abre un selector al usuario.

Recalcular solo ante cambios pertinentes y reutilizar la configuración si las entradas son iguales. No añadir un controlador de calidad que oscile continuamente a partir de FPS en reposo: la escena dibuja bajo demanda. El formulario permanece con diagonal, Guardar y Cancelar; Guardar aplica la nueva configuración integral y Cancelar mantiene la vigente.

### 2. Legibilidad calculada después de la óptica

Medir el em proyectado en ambos ojos utilizando la transformación de la escena y la corrección radial. En la matriz horizontal, usar como criterio del proyecto al menos 16 px CSS em para párrafos de ficha, 14 para sus etiquetas/unidades y nombres del cielo, y 12 para relaciones o subtítulos de etiquetas del cielo. No son umbrales universales de confort VR; requieren revisión física.

La adaptación automática ajusta fuentes y escala de las superficies de lectura para compensar el cambio de pulgadas. Medir en poses de referencia con cada cuerpo centrado o su pareja completamente visible; no exigir leer un cuerpo que ya está fuera del campo visual. Los nombres deben ser legibles también sin apuntado o selección.

Recomponer las fichas con continuaciones, manteniendo dos columnas y filas completas en Datos. Conservar cuerpo, sección y continuación válida, y cancelar taps vinculados a una composición sustituida. Mantener el encabezado VR sin franja.

En etiquetas, calcular su tamaño y posición en el área óptica útil compartida por ambos ojos. Reservar la zona ocupada por los botones inferiores y las zonas seguras; desplazar la etiqueta sobre el cuerpo cuando no quepa debajo, sin mover el cuerpo. Evitar solapamientos entre una pareja completamente visible y respetar la oclusión por ficha. Mantener color de apuntado/selección y una sola lectura accesible.

### 3. Texto con resolución independiente de su diseño

Usar coordenadas lógicas para márgenes, tipografía, saltos y acciones. Rasterizar inicialmente ficha y etiquetas a 2×, de manera uniforme, con máximos de 2048 píxeles por lado, cuatro megapíxeles por textura y límites del hardware. En etiquetas, un backing store mayor no debe encoger ni duplicar el sprite ni sus letras.

UV y zonas accionables de ficha se resuelven en dimensiones lógicas. Recrear y liberar la textura al cambiar sus dimensiones físicas, conservando colorSpace y opciones de filtrado; reutilizarla si estas no cambian. Mantener etiquetas diferidas hasta entrar en VR y actualizar sus texturas solo cuando cambien contenido, resaltado o configuración.

Alternativa descartada como solución única: elevar el Canvas sin cambiar el tamaño proyectado de letras diminutas. SDF/MSDF y una pasada independiente de interfaz quedan diferidos.

### 4. Cuerpos y anillos dentro de la misma mejora

La resolución por ojo debe beneficiar al mundo completo. Registrar para los doce cuerpos el diámetro proyectado, fuente de textura y detalle visible en una pose centrada. Conservar geometría, posiciones, colores y rasgos distintivos; no aumentar segmentos ni agrandar cuerpos de forma indiscriminada.

Si se identifica un cuello de muestreo de superficie en un cuerpo grande y visible, evaluar una textura procedural de mayor resolución, hasta 2048 × 1024, conservando la misma semilla y composición lógica. Mantener 1024 × 512 si ya aporta detalle suficiente. Preparar o reutilizar recursos en cambios de configuración, nunca regenerarlos en cada movimiento. No aplicar una promoción global a los doce cuerpos sin medir su memoria.

Para los anillos, conservar transparencia, separación y forma; comparar muestreo y, si aporta beneficio medido, anisotropía acotada por hardware. No desactivar sus mipmaps como consecuencia de una decisión tomada para texto.

### 5. Cielo estable y filtrado por tipo de recurso

Conservar semilla, cantidad y posiciones de las estrellas, fondo oscuro y diferencias de brillo. Revisar la resolución intermedia y el tamaño efectivo de puntos después de la óptica para evitar que cambios de densidad los conviertan en manchas, cuadrados o parpadeo. Mantener el halo suave intencional de una estrella distinguible del desenfoque adicional. No simular nitidez aumentando brillo, cantidad de estrellas o ruido.

Comparar filtro actual y LinearFilter sin mipmaps para ficha/etiquetas con la misma pose y movimiento. Elegir según lectura y estabilidad temporal. Evaluar cuerpos/anillos/estrellas por separado, sin aplicar NearestFilter o un enfoque global a todos. Mantener inicialmente el MSAA existente durante esas comparaciones para aislar variables.

### 6. Evidencia del antes y aceptación integral

Conservar los cinco originales aportados sin reescalarlos ni editarlos. Las tres capturas nuevas definen escenas de referencia: Tierra/Venus/Luna; Saturno/Titán/Neptuno/Tritón; y Marte/Júpiter/Europa/Luna. Su diagonal exacta, DPR y pose numérica no fueron informados: no atribuirlos por el aspecto de una imagen.

Al generar un después, registrar pose, diagonal, viewport, screen, DPR, salida por ojo, fuentes, texturas y límites aplicados. Usar poses equivalentes con los rasgos estudiados visibles; comparar a escala nativa y distinguir referencia visual de comparación controlada. Añadir la pose centrada de cada cuerpo para no confundir recorte de borde con nitidez.

Matriz: diagonales 6.9, 7 y 8; viewports 844 × 390, 1045 × 552 y 1381 × 645; DPR 1, 2 y 3. Añadir las dimensiones reales de las tres nuevas capturas (1377 × 630, 1375 × 627 y 1371 × 624) como escenarios visuales cuando se reproduzca su área, sin asumir que coinciden con su viewport original. Comprobar salida en vertical.

Comparar una secuencia de movimiento de 60 segundos en el mismo dispositivo. El percentil 95 del intervalo de fotograma no debe empeorar más de un 10 % frente a la línea base de ese caso; registrar también cuadros dibujados y tiempos GPU si están disponibles. No usar FPS de reposo como prueba de fluidez. Si no se pueden satisfacer simultáneamente lectura y ese presupuesto, la aceptación permanece abierta y se documenta el límite, sin trasladar al visitante una elección de calidad.

## Risks / Trade-offs

- **Aumentar resolución cuesta memoria y relleno** → presupuestos, reutilización y pruebas físicas; no aplicar el DPR nativo sin límites.
- **El hardware puede impedir más resolución al aumentar pulgadas** → mantener mínimos de texto con composición y escala; registrar la saturación del límite y no prometer detalle físico inexistente.
- **Etiquetas mayores pueden tapar parejas** → posicionamiento dentro del área útil de ambos ojos y pruebas de oclusión con barra y ficha.
- **Más letra produce más páginas** → continuaciones con texto íntegro y continuidad de sección.
- **Filtros de texto pueden perjudicar estrellas o anillos** → decisiones por recurso y comparaciones en movimiento.
- **Una imagen suave puede formar parte del estilo procedural** → conservar identidad y evaluar detalle recuperable, no confundir nitidez con realismo fotográfico.
- **Restricciones históricas de conservación del diseño** → la excepción de tamaños se limita a VR; no se cambia la vista normal ni el contrato bibliográfico actual.
- **Compatibilidad óptica desconocida** → conservar parámetros del perfil y registrar el visor físico antes de afirmar compatibilidad.

## Migration Plan

No hay migración de datos ni preferencias nuevas. Conservar la clave de diagonal y su valor inicial actual cuando falte o sea inválido. La configuración automática se vuelve a calcular, no se almacena como elección del visitante. Publicar mediante el flujo PWA existente sin sustituir una sesión de lectura a mitad de estado. Revertir el cambio recupera el comportamiento anterior conservando la diagonal.

## Open Questions

- Modelos exactos de los dos teléfonos de aproximadamente 7 pulgadas, navegador y visor para completar la bitácora física.
- Pose, diagonal y métricas de las tres nuevas capturas: se conservan como evidencia visual del antes; su reproducción instrumentada se registra durante implementación.
- Selección final de filtros y ajustes de la curva automática: experimentos ya delimitados en tareas, sujetos a los mismos requisitos de lectura, estabilidad y presupuesto.
