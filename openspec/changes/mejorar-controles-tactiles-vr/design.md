# Design

## Context

Ver `proposal.md` para la motivación. La implementación actual ya ofrece las piezas necesarias:

- `contenidoFicha.js` genera páginas y zonas de controles, detecta acciones por coordenadas UV y limita la lectura entre sus extremos. La flecha Siguiente desaparece en la última página.
- `fichaCuerpoVr.js` representa una tarjeta compartida, obtiene el impacto del eje central de mirada y convierte ese impacto en una acción. Un impacto sin botón devuelve una acción nula que consume el tap.
- `campoEstelar.js` ejecuta las acciones y captura su objetivo antes de esperar el doble tap. Actualmente comprueba cuerpo y modo, pero no si se recompuso la lectura durante la espera.
- `gestosVr.js` distingue tap simple de doble tap con 300 ms; `controlesVista.js` cancela activaciones ante arrastre y otras interrupciones. Estas reglas se conservan.
- `efectoVisor.js` dibuja la cruz dentro del shader de corrección óptica; la cruz SVG de `punteroCruz.jsx` solo se monta en vista normal.
- La alternativa HTML de `fichaCuerpoCeleste.jsx` comparte acciones con la tarjeta y deshabilita Siguiente al terminar. Las indicaciones de `escenaEstelar.jsx` todavía dicen que tocar el texto mantiene la lectura.

Las especificaciones principales conservan reglas históricas de contenido vacío. El cambio completado `rellenar-fichas-con-contenido-publicado`, todavía sin archivar, actualiza ese contrato y el código ya muestra contenido publicado con continuaciones. El delta de este cambio para «Contenido completo en ambas vistas de VR» conserva esas reglas de contenido e incorpora únicamente la nueva navegación. Al sincronizar ambos cambios deberá aplicarse primero el de contenido o reconciliar el requisito compartido para evitar que su versión anterior restaure las reglas de navegación antiguas. No se modifican ni archivan sus artefactos en este trabajo. La conservación de controles que exigía ese cambio correspondía al alcance de su relleno de contenido; la modificación posterior de navegación está solicitada expresamente aquí.

## Goals / Non-Goals

**Goals:**

- Resolver una acción efectiva compartida por detección, puntero y ejecución para impedir que la señal visual contradiga el tap.
- Reutilizar el estado de lectura y la ruta de gestos existentes; mantener la oclusión del cielo y una sola acción por tap.
- Actualizar el puntero mediante el efecto óptico actual sin añadir una segunda capa visual en VR.

**Non-Goals:**

- Alterar el paginado del contenido, el seguimiento, los parámetros ópticos, la selección global o los controles de vista única.
- Incorporar detección por permanencia, gestos nuevos, recursos gráficos externos o dependencias.

## Decisions

### 1. Resolver las mitades sobre la tarjeta, después de los controles explícitos

Extender la resolución de acciones en `contenidoFicha.js` con el estado de lectura. Validar primero que el impacto pertenezca a la tarjeta; buscar después las zonas explícitas y, solo si ninguna coincide, usar su coordenada horizontal local: valores menores que la mitad corresponden a Anterior y desde la mitad a Siguiente. La línea central se asigna a la derecha como convención determinista, sin zona muerta.

Anterior en la primera página produce una acción nula, pero conserva el impacto para que `consumirToqueFicha` lo consuma. Un control explícito conserva prioridad incluso si cruza la línea central. Las páginas de continuación se recorren mediante el índice de página existente.

Se descarta dividir las coordenadas del dedo o cada ojo: en un visor el botón puede tocar lejos de la tarjeta y ambas vistas representan una misma acción de mirada. Se descarta superponer zonas grandes antes de los botones porque interceptaría pestañas y cierre.

### 2. Tratar el avance final como cierre de ficha

Conservar disponible el control de avance en todas las páginas y rotularlo «Cerrar →» en la última. Normalizar Siguiente a la acción efectiva de cierre cuando la lectura vigente esté en `total - 1`, tanto para las mitades como para el control y su alternativa HTML. El cierre usa `seleccion.quitarSeleccion()`, la misma ruta del cierre ×; no invoca la salida de VR ni intenta seleccionar el fondo.

`crearEstadoLectura` mantiene sus límites y `moverPagina` conserva su significado. No se interpreta cualquier `false` de movimiento como una orden de cerrar: también puede indicar una lectura inexistente o un objeto destruido. El límite final se comprueba explícitamente sobre una lectura válida. En la alternativa HTML, Anterior permanece deshabilitado al inicio y el control final queda habilitado, identificado como cierre y utilizable con teclado.

Se descarta el avance circular porque el usuario pidió salir al terminar. Se descarta cerrar al entrar en la última página: hace falta otro tap simple para poder leerla.

### 3. Capturar la acción y la vigencia de la lectura antes de esperar

Mantener `crearGestosVr` y sus 300 ms. `prepararActivacion` captura la acción efectiva, el cuerpo, la página y una revisión de la composición de lectura. Antes de ejecutarla comprueba que siguen vigentes, además de modo, contexto y ciclo de vida. La revisión cambia al sustituir o recomponer las páginas; un cambio de imagen, resaltado o dirección de mirada no la modifica. Esto evita que un cierre capturado sobre el final se aplique a una lectura nueva que llegó de la API o a otro paginado tras redimensionar.

El doble tap sigue cancelando la acción pendiente y recentrando con ficha y página intactas. La instrucción inicial mantiene su precedencia y su primer tap no prepara navegación. Los motivos actuales de cancelación de `controlesVista.js` se conservan. No se añaden temporizadores ni manejadores táctiles paralelos.

### 4. Dibujar un puntero contextual en el shader existente

Exponer al efecto del visor un estado visual limitado a cruz neutra, flecha izquierda, flecha derecha y cierre ×. Derivarlo de la acción efectiva de la tarjeta y su lectura; pestañas, objetivos ausentes, instrucción inicial y retroceso no disponible producen la cruz. Los controles Anterior/Siguiente comparten la figura de sus mitades, y × o el avance final muestran cierre.

`campoEstelar.js` actualiza ese estado al cambiar la mirada, lectura, contenido, selección, tamaño, diagonal, modo o visibilidad de la instrucción. Para evitar que quede obsoleto si la selección no cambia, comprobarlo también antes de cada dibujo necesario y marcar el render como pendiente cuando cambie. Mantener el redibujado bajo demanda y evitar realimentación entre detección y dibujo.

El shader usa coordenadas con signo para distinguir izquierda y derecha y conserva `pasoPuntero`, `centroPuntero` y la corrección por ojo actuales. El mismo estado visual alimenta ambos ojos; solo cambia la forma del símbolo. No se modifica el SVG de vista única ni se añade una superposición HTML: esa alternativa perdería la alineación óptica que ya ofrece el shader. Las figuras se trazan procedimentalmente, sin texturas o imágenes nuevas.

### 5. Explicar la navegación donde ya se informa de ella

Actualizar las indicaciones duplicadas por ojo y la descripción accesible de la escena en `escenaEstelar.jsx`: mirar izquierda para retroceder, derecha para avanzar y avanzar al final para cerrar. Conservar las instrucciones de doble tap y los controles generales. Mantener el texto inicial `INSTRUCCION_VR`, que explica selección y recentrado y sigue siendo válido. Actualizar únicamente los pasos relacionados de `README.md` y el rótulo/estado del control final de `fichaCuerpoCeleste.jsx`.

## Risks / Trade-offs

- [Un tap de lectura ahora cambia de página] → Mostrar la dirección antes del tap y actualizar las indicaciones; mantener el tap pendiente cancelable y la primera página sin retroceso.
- [La API o un cambio de tamaño sustituye el paginado durante la espera] → Invalidar la activación mediante revisión de lectura; las lecturas del sensor no la invalidan.
- [El cursor conserva una flecha al cerrar o cambiar de objetivo] → Recalcular el estado ante todas las invalidaciones y usar cruz neutra sin acción direccional.
- [Una figura no coincide con la acción o entre ojos] → Comprobar automáticamente el estado contextual compartido, la escala y los centros ópticos con distintas diagonales, orientaciones y densidades.
- [Sincronizar cambios completados sobrescribe el requisito común] → Conservar explícitamente el contenido publicado y aplicar las reglas de navegación de este cambio después del cambio de contenido.

## Migration Plan

No hay migraciones ni cambios de configuración. Durante la implementación, adaptar pruebas de `contenidoFicha.test.js`, `fichaCuerpoVr.test.js` y `gestosVr.test.js`; comprobar además ejecución del cierre, vigencia del tap y estado óptico mediante pruebas de integración proporcionadas al cambio. Verificar los controles accesibles con `fichaCuerpoCeleste.test.js`. Por indicación del usuario, la validación restante se realiza desde el ejecutor local de Node, sin abrir navegadores ni aplicaciones externas. Se comprueban estados de puntero, geometría, parámetros ópticos y recorridos de lectura con la escena y los rayos reales, sustituyendo DOM, Canvas y el dispositivo gráfico. Este método no se presenta como una nueva captura o ejecución del shader en GPU.

Ejecutar `npm test`, `npm run lint`, `npm run build` y la validación estricta de este cambio OpenSpec. Completar recorridos automatizados de Tierra y Luna con contenido disponible, en carga y con error, en tamaños compactos, horizontales y verticales. Verificar continuaciones, extremos, prioridad de pestañas y ×, avance final, doble tap, conservación de selección al redimensionar y regreso a vista única. Comprobar ambos ojos con diagonales de 5.5, 6.1 y 6.5 pulgadas y dos densidades de renderizado. Registrar el alcance y los resultados de estas pruebas en `verificacion.md`; el seguimiento incluye únicamente estas verificaciones locales solicitadas. Para revertir, restaurar únicamente el resolver, las rutas de acción, el puntero y los textos modificados por este cambio; el contenido y la configuración permanecen independientes. No se publica ni despliega desde este flujo.
