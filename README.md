# Metseri

Experiencia de astronomía en el navegador: un cielo de estrellas envolvente con los ocho planetas del sistema solar en 3D, hecho con React, Vite y Three.js.

## Cómo ejecutarla

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Abre la dirección que indica Vite (por defecto `http://localhost:5173`). La escena se ve directamente, sin pantalla de bienvenida y sin necesidad de conceder permisos.

Otros comandos disponibles:

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la versión ya compilada. |
| `npm run lint` | Revisa el código con ESLint. |
| `npm test` | Ejecuta las pruebas con el ejecutor de Node (`node --test`). |

## Cómo comprobar la escena base

1. Con `npm run dev` en marcha, abre la página en un navegador con WebGL.
2. Comprueba que ocupa toda la ventana, con fondo casi negro y estrellas de distinto tamaño y brillo.
3. Redimensiona la ventana: el cielo debe seguir cubriendo toda el área sin deformarse ni mostrar barras de desplazamiento.
4. Si el navegador no puede crear el contexto gráfico, o lo pierde, aparece un mensaje con el botón **Reintentar**.

### Planetas de la escena

Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno están repartidos alrededor del observador, a distintas alturas. La Tierra se ve al iniciar; recorre también los lados y la parte posterior para encontrar los demás. Sus superficies se generan en la aplicación: continentes y océanos, bandas, cráteres ilustrados y los anillos de Saturno permiten distinguir los cuerpos.

La disposición es compositiva: posiciones, distancias y tamaños no están a escala astronómica. Los planetas permanecen quietos y conservan su distribución al recentrar, redimensionar o cambiar de modo.

Cada planeta visible muestra su nombre junto al cuerpo. Las etiquetas acompañan la vista al girar y no bloquean el arrastre ni la selección; en VR aparece una copia por ojo. La vista única utiliza una proyección esférica que conserva los contornos circulares de los planetas también en los extremos de una pantalla ancha.

Las etiquetas se presentan sin cápsula: un punto y una guía discreta acompañan al nombre y su clasificación. Al apuntar o seleccionar, el nombre cambia de color y el cuerpo recibe un resplandor de contorno. No aparece un recuadro con «Haz clic para explorar». Los planetas tienen mayor presencia y relieve, y Saturno muestra bandas concéntricas y una separación entre sus anillos.

## Controles manuales

| Acción | Cómo |
| --- | --- |
| Mirar alrededor | Arrastra con el mouse o con un dedo sobre el cielo. Puedes dar la vuelta completa en horizontal; en vertical la mirada se detiene cerca de los polos. |
| Mirar con el teclado | Enfoca el cielo (con `Tab` o haciendo clic) y usa las flechas. Si el foco está en un botón, las flechas no se interceptan. |
| Recentrar | Pulsa **Recentrar** (abajo a la derecha) para volver a la dirección inicial. El cielo no cambia, solo la dirección de la mirada. |
| Apuntar en vista única | Pasa el mouse sobre un planeta: se ilumina sin abrir su ficha. Al apartarlo desaparece el brillo transitorio. La cruz central no sustituye al mouse. |
| Seleccionar en vista única | Haz clic o toca directamente un planeta, aunque esté fuera de la cruz central. Se ilumina de forma persistente y abre su ficha. |
| Cambiar la selección en vista única | Pulsa otro planeta para trasladarle la selección. Solo puede haber uno seleccionado. |
| Deseleccionar en vista única | Pulsa otra vez el planeta seleccionado, toca el fondo o usa el cierre de la ficha. |

El observador permanece siempre en el centro: no hay desplazamiento por el espacio ni movimiento automático.

Un arrastre cambia la mirada y nunca selecciona ni deselecciona, aunque comience o termine sobre un planeta. Las pequeñas oscilaciones de un toque se toleran sin mover la cámara. La selección se conserva al mirar a otro lado, recentrar y entrar o salir de VR; los botones superpuestos solo ejecutan su propia acción.

### Puntero de cruz

Una cruz blanca fija en el centro indica hacia dónde apunta la mirada. En la vista dividida (VR) aparece una cruz en el centro de cada una de las dos vistas, en la misma posición relativa, de modo que con el visor se perciba como un solo puntero.

La cruz es una guía visual que no recibe el foco ni intercepta gestos: puedes tocar o arrastrar sobre ella como sobre cualquier otra parte del cielo. En vista única seleccionas en la posición del mouse o del dedo; en VR, la dirección de la cruz sirve como referencia para apuntar a un planeta.

## Vista dividida para visor móvil (VR)

El botón **Entrar VR** divide la pantalla en dos vistas contiguas, una por ojo, pensadas para un visor móvil tipo Cardboard. Ambas vistas comparten el cielo, los planetas, la dirección de mirada y la selección; al entrar y salir se conservan todos ellos.

- **Entrar:** pulsa **Entrar VR**. La aplicación intenta además activar la pantalla completa y bloquear la orientación en horizontal, pero ambas cosas son opcionales: si el navegador no las permite o las rechaza, la vista dividida funciona igual dentro del área disponible.
- **Salir:** pulsa **Salir de VR** (centro, abajo) o la tecla `Escape`. También se vuelve a la vista única si abandonas la pantalla completa desde el navegador. Al salir solo se libera lo que la propia aplicación activó, no una pantalla completa que ya estuviera activa por otro motivo.
- **Teléfono en vertical:** se muestran las dos vistas y una indicación para girar el teléfono a horizontal; el control de salida sigue disponible.
- **Mirar alrededor en VR:** el arrastre con el dedo o el mouse y las flechas del teclado funcionan también en la vista dividida, igual que en la vista única. **Recentrar** vuelve a la dirección inicial.

Las dos vistas usan una proyección estéreo básica de Three.js (`StereoEffect`). **No hay calibración por modelo de visor ni de lentes**: la distancia entre ejes y el campo de visión son valores comunes, así que la alineación puede variar según el visor. La cruz se coloca en el centro de cada mitad de pantalla, sin ajustarla al centro óptico de las lentes de un visor concreto.

### Seleccionar con el botón del visor

1. Mira un planeta: se resalta mientras le apuntas. Mirarlo por sí solo no lo selecciona ni hay un temporizador de permanencia.
2. Sin selección previa, toca **cualquier zona de la escena**, en cualquiera de las dos mitades, o pulsa el botón táctil del visor. Se selecciona el planeta apuntado, aunque el toque quede lejos de su representación. Su iluminación aumenta y aparece un halo persistente.
3. Puedes mirar a otro lado: el planeta conserva la selección.
4. La ficha aparece frente a ti. Mira una pestaña (**Ficha**, **Datos**, **¿Sabías?**, **Libros**) y toca para ir directamente a esa sección. También puedes usar las flechas **Anterior** y **Siguiente**. La sección actual queda marcada en ambos ojos.
5. Tocar mirando el área de lectura mantiene la ficha abierta. Para cerrar, apunta a **×** y toca. Mirar fuera de la tarjeta y tocar conserva la deselección global: el primer toque cierra la ficha y solo uno posterior puede seleccionar otro planeta.

Cuando deseleccionas sin dejar de mirar el cuerpo, desaparece el halo de selección y queda únicamente el resaltado por mirada. Tocar mirando el fondo sin selección previa no selecciona nada, aunque el dedo caiga sobre un planeta lateral. Recentrar y entrar o salir de VR conservan la selección y no cuentan como toques de selección.

Los toques de selección y deselección **mantienen el seguimiento por sensores**, incluso si todavía se espera el permiso o la primera lectura. El arrastre confirmado o las flechas pasan a control manual. Las mismas reglas de mirada y toque funcionan sin sensor, apuntando mediante arrastre o teclado.

### Orientación del dispositivo y permiso

Al pulsar **Entrar VR** la aplicación intenta usar los sensores de orientación del teléfono para que ambas vistas sigan sus giros e inclinaciones:

- **Permiso:** solo se pide cuando el navegador lo exige (por ejemplo Safari en iPhone) y siempre desde el propio toque en **Entrar VR**, nunca al abrir la página. Si lo rechazas no se vuelve a pedir hasta que salgas de VR y entres de nuevo.
- **Primera lectura:** la vista no da un salto al activarse el sensor; parte de la dirección que ya veías.
- **Recentrar:** con el sensor activo, la dirección en la que apunta el teléfono pasa a ser el frente; el seguimiento continúa.
- **Alternativa manual:** si no hay sensor, el navegador no lo ofrece, se rechaza el permiso, la página no está en un contexto seguro (HTTPS) o no llegan lecturas válidas en los 2 segundos siguientes a habilitar el sensor (con la página visible), la vista dividida sigue disponible y se muestra un aviso breve ("Arrastra para mirar alrededor"). Entonces funcionan el arrastre con dedo o mouse y las flechas del teclado.
- Si se reconoce un arrastre real o usas las flechas mientras el sensor está activo, el control pasa a manual y conserva la orientación actual; el sensor no vuelve a moverla hasta que salgas de VR y entres otra vez. Una pulsación sin arrastre no cancela el sensor.

Los sensores de orientación solo se entregan en un **contexto seguro**: `https://` o `http://localhost`. Un `http://192.168.x.x` desde el móvil mostrará la escena y el control manual, pero no los sensores.

### Probar los sensores desde un móvil

Sin la API Express ni ninguna configuración de instalación (PWA); solo el servidor de Vite:

1. Arranca la aplicación: `npm run dev`.
2. Abre la aplicación en el móvil con una de estas opciones:
   - **Android con cable USB** (Chrome, depuración USB activada): ejecuta `adb reverse tcp:5173 tcp:5173` y abre `http://localhost:5173` en el móvil. `localhost` cuenta como contexto seguro, así que no hace falta HTTPS.
   - **Un túnel con HTTPS válido** (Android o iPhone): por ejemplo `cloudflared tunnel --url http://localhost:5173 --http-host-header localhost:5173` o `ngrok http 5173 --host-header=localhost:5173`, y abre en el móvil la dirección `https://…` que muestre. Vite rechaza (error 403) las peticiones cuyo encabezado `Host` no sea el local, por eso se reescribe a `localhost:5173`.
3. Pulsa **Entrar VR** y acepta el permiso de orientación si el navegador lo solicita. Gira el teléfono: las dos vistas deben seguirlo. Para probar la alternativa manual, rechaza el permiso y arrastra con el dedo.
4. Con el visor, apunta a un planeta y usa su botón táctil: comprueba selección con halo en ambos ojos y que la cabeza sigue dirigiendo la vista. Mira al fondo y pulsa de nuevo: debe desaparecer la selección. Repite mirando otro planeta; el primer toque quita la selección anterior y el siguiente selecciona el nuevo objetivo.
5. Comprueba los ocho cuerpos, anillos y superficies, rota la pantalla, recentra y repite entrada/salida y regreso desde segundo plano. Repite la selección con sensores rechazados y control manual. Registra navegador, dispositivo y visor empleados; las comprobaciones físicas que no se realicen deben quedar pendientes.

Los pasos 2 y 3 requieren un móvil físico y, en su caso, las herramientas indicadas (`adb`, `cloudflared` o `ngrok`), que no forman parte del proyecto. Los eventos de sensor simulados en un navegador de escritorio no acreditan la compatibilidad con un visor real.

## Alcance

- Las estrellas y los ocho planetas son una **representación visual generada**, sin posiciones ni escalas astronómicas reales. Hay nombres y fichas educativas; no hay órbitas, rotación automática, Sol, lunas ni constelaciones.
- La escena funciona por completo en el cliente: no usa la API Express, catálogos ni imágenes remotas.
- Esta versión **no incluye instalación como aplicación (PWA) ni uso sin conexión**; quedan para un cambio posterior.

## Fichas educativas

La ficha sigue la referencia visual: clasificación discreta, nombre grande, imagen pequeña arriba a la derecha, espacio para subtítulo y descripción, cuatro datos en dos columnas, curiosidades y libros separados por líneas. Los créditos de imagen quedan aparte.

Por ahora los textos y cifras están **vacíos** en producción. Se conservan nombre, clasificación, imagen, encabezados, etiquetas y unidades. Los espacios reservados son estáticos: no son una carga de red ni textos de ejemplo. Los campos están en src/datos/cuerposCelestes.js: subtitulo y descripcion vacíos, curiosidades sin entradas y los cuatro valores numéricos en null. El formateador conserva la distinción entre falta de valor y cero.

En escritorio se muestra un panel lateral; en móvil conserva desplazamiento propio. El cierre devuelve el foco al cielo. Desplazar o usar flechas dentro del panel no gira la escena. Apuntar no abre ni sustituye la ficha, y la selección conserva su iluminación al apartar el mouse o la mirada.

En VR la tarjeta aparece **frente a la mirada** y sus pestañas permiten elegir una sección sin pasar por las anteriores. El área de lectura no reacciona a toques; las flechas y × son acciones separadas. Recentrar recupera la tarjeta al frente conservando la sección y selección. Entrar o salir de VR conserva el cuerpo y reinicia la sección. Mirar un control sin tocar no lo activa; un toque mantiene el sensor activo o pendiente y un arrastre confirmado sigue pasando a control manual.

Las imágenes optimizadas de public/imagenes/planetas/ se sirven localmente y conservan su URL original, texto alternativo y crédito. No se añaden satélites a la escena; se mantiene preparado su contrato de datos para otro cambio.

### Descubrir libros

Se conserva el encabezado y el espacio del contenido, sin invitaciones, títulos o enlaces de ejemplo. LIBROS_POR_CUERPO, en src/datos/librosCuerposCelestes.js, permanece vacío. Cuando se incorpore contenido definitivo, cada asociación real identificará título y URL HTTP/HTTPS de la ficha bibliográfica de la Biblioteca «Solón Argüello». Los validadores no aceptan títulos o destinos vacíos y no consultan existencias ni préstamos.

### Comprobar las fichas

Revisar los ocho cuerpos, ausencia de textos/cifras y disposición del panel. En VR comprobar apertura al frente, estado de pestaña actual, salto directo entre secciones, flechas, cierre ×, toque inofensivo sobre lectura y deselección mirando fuera. Repetir con teclado/arrastre, sensor denegado, recentrado y cambio de modo. Las comprobaciones del navegador no acreditan la comodidad óptica, sensores reales ni botón físico; requieren teléfono y visor cuando estén disponibles.
