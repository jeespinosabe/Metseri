# Tasks

## 1. Línea base integral

- [x] 1.1 Registrar la base y conservar cambios ajenos; instrumentar las cinco capturas del antes con los datos conocidos y marcar los desconocidos, verificando los originales mediante dimensiones y hashes.
- [x] 1.2 Reproducir las tres vistas del cielo y las fichas de Saturno, añadiendo poses centradas de los doce cuerpos; guardar diagonal, viewport, screen, DPR y resolución por ojo, distinguiendo referencia visual de comparación controlada.
- [x] 1.3 Incorporar medición proyectada de fuentes y diámetro de cuerpos con la óptica existente; probar ambos ojos y contrastar resultados con capturas, documentando línea base y tolerancias.

## 2. Política automática común

- [x] 2.1 Derivar una configuración de calidad integral desde diagonal, dimensiones, DPR y capacidades, usando la curva y presupuestos iniciales del diseño; verificar objetivos no decrecientes al pasar 6.9/7/8 pulgadas y límites uniformes cuando se satura la capacidad.
- [x] 2.2 Integrar el resultado en renderer, salida por ojo, ficha y etiquetas al entrar en VR, guardar diagonal o redimensionar; probar coherencia de ambos ojos, reutilización con entradas iguales y recuperación de la vista normal.
- [x] 2.3 Mantener Ajustar visor con solo diagonal, Guardar y Cancelar y la persistencia actual; comprobar teclado, coma decimal, rango 4–8, almacenamiento denegado y ausencia de selectores manuales o nuevas preferencias persistidas. Documentar la política calculada en la evidencia técnica.

## 3. Lectura de fichas y nombres

- [x] 3.1 Separar dimensiones lógicas y rasterización física en ficha y etiquetas, con factor inicial 2× y límites del diseño; probar que resolución no reduzca tamaño de letra ni altere páginas, posición, acciones UV o correspondencia entre ojos.
- [x] 3.2 Adaptar automáticamente tipografía y escala de ficha y etiquetas a la diagonal y área óptica útil; verificar los mínimos de 16/14 px CSS em en fichas y 14/12 en nombres/relaciones sin requerir apuntado o selección.
- [x] 3.3 Repartir contenido largo en continuaciones, manteniendo dos columnas y filas completas en Datos; reconstruir textos de los doce cuerpos y libros para comprobar integridad, y probar conservación de cuerpo/sección y cancelación de taps de una composición sustituida.
- [x] 3.4 Separar las etiquetas de parejas completamente visibles y mantenerlas dentro del área útil del visor, por encima de la barra inferior. Comprobar especialmente Tritón/Neptuno y Titán/Saturno, en ambos ojos y durante movimiento, y que la ficha pueda cubrir las etiquetas en su posición.
- [x] 3.5 Comparar filtros de texto en reposo y movimiento y conservar la opción que mejore definición sin parpadeo; probar recreación/liberación de texturas, creación diferida de etiquetas y actualización solo ante cambios relevantes. Guardar capturas y decisión de filtrado.

## 4. Cuerpos y cielo

- [x] 4.1 Medir muestreo de superficies y anillos en poses centradas y en los sectores de las capturas; ajustar resolución procedural solo donde falte detalle y dentro del presupuesto, probando rasgos de Tierra/Júpiter/Saturno y de los cuatro satélites sin cambiar semilla, geometría o posiciones.
- [x] 4.2 Revisar filtrado de cuerpos y anillos por separado del texto, con pruebas estáticas y en movimiento; verificar contornos, transparencia y separación de anillos y consumo de memoria, sin regeneración por fotograma.
- [x] 4.3 Compensar tamaño efectivo y muestreo de estrellas con la salida automática; comprobar misma cantidad, posiciones y variaciones de brillo, sin manchas, cuadrados, destellos o regeneración al variar diagonal. Documentar el detalle visible y la estabilidad del fondo.

## 5. Integración y aceptación física

- [x] 5.1 Ejecutar la matriz de diagonales 6.9/7/8 y DPR 1/2/3 con los tres viewports de referencia y salida en vertical; recorrer los doce cuerpos, sus nombres y cuatro secciones con API real, verificando navegación, oclusión y ausencia de errores.
- [x] 5.2 Generar el después equivalente de las cinco capturas e incluir una revisión centrada de todos los cuerpos; registrar lectura de nombres, relaciones, cifras y unidades y reconocimiento de formas, diferenciando recorte de borde de desenfoque.
- [ ] 5.3 Repetir identificación, lectura y 60 segundos de movimiento equivalente en los teléfonos disponibles, registrando modelo/navegador/visor y configuración calculada; verificar p95 dentro del 10 % de la base y ajustar la política automática si hace falta. Mantener pendiente la aceptación física cuando falte acceso y documentar límites sin introducir elecciones manuales.
- [ ] 5.4 Ejecutar suite completa, lint, compilación y validación estricta OpenSpec; revisar que el diff se limite a VR sin cambiar API, contenido o vista normal y actualizar el informe con resultados y aceptación de Sophia.

## Workflow follow-up

- Implementación iniciada por solicitud de Sophia mediante `apply`; resultados y capturas registrados en `informeNitidezVr.md`.
- Conservar el identificador existente aunque el alcance ahora sea integral. La tarea 5.3 requiere dispositivos físicos y 5.4 mantiene pendiente la aceptación de Sophia; sus comprobaciones técnicas están realizadas.
- No hacer commit ni push sin autorización expresa; respetar la selección de archivos que se solicite para un futuro commit.
- Sincronizar o archivar únicamente cuando se solicite y se satisfagan los criterios de aceptación.
