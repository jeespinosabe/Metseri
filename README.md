# Metseri

Experiencia de astronomía en el navegador: un cielo de estrellas envolvente con los ocho planetas del sistema solar y cuatro satélites naturales en 3D, hecho con React, Vite y Three.js.

## Cómo ejecutarla

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Abre la dirección que indica Vite (por defecto `http://localhost:5173`). La escena se ve directamente, sin pantalla de bienvenida y sin necesidad de conceder permisos.

`npm run dev` inicia la interfaz y la API en la misma terminal, con los mensajes identificados como `interfaz` y `api`. La API se reinicia automáticamente al editar sus archivos. Para rellenar las fichas con el contenido publicado, configura `.env` según la sección de la API.

Deja esa terminal abierta y usa `Ctrl+C` para detener ambos servidores. Si uno de los procesos termina, también se detiene el otro. Vite dirige `/api` al `PORT` del proceso o del archivo `.env` (3000 si no se configura). Con `PORT=3001`, la API y Vite utilizan puertos distintos. No hace falta volver a cargar datos en Supabase para iniciar la aplicación.

Otros comandos disponibles:

| Comando | Qué hace |
| --- | --- |
| `npm run dev:interfaz` | Inicia únicamente Vite. |
| `npm run dev:api` | Inicia únicamente la API con reinicio automático al editar el backend. |
| `npm run start:api` | Inicia únicamente la API sin reinicio automático. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la versión ya compilada. |
| `npm run lint` | Revisa el código con ESLint. |
| `npm test` | Ejecuta las pruebas con el ejecutor de Node (`node --test`). |

## Cómo comprobar la escena base

1. Con `npm run dev` en marcha, abre la página en un navegador con WebGL.
2. Comprueba que ocupa toda la ventana, con fondo casi negro y estrellas de distinto tamaño y brillo.
3. Redimensiona la ventana: el cielo debe seguir cubriendo toda el área sin deformarse ni mostrar barras de desplazamiento.
4. Si el navegador no puede crear el contexto gráfico, o lo pierde, aparece un mensaje con el botón **Reintentar**.

### Planetas y satélites de la escena

Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno están repartidos alrededor del observador, a distintas alturas. La Tierra se ve al iniciar; recorre también los lados y la parte posterior para encontrar los demás. Sus superficies se generan en la aplicación: continentes y océanos, bandas, cráteres ilustrados y los anillos de Saturno permiten distinguir los cuerpos.

La escena se completa con Luna junto a la Tierra, Europa junto a Júpiter, Titán junto a Saturno y Tritón junto a Neptuno. Cada luna tiene una superficie ilustrada propia y menor tamaño que su planeta; Titán queda separado de los anillos de Saturno. Puedes apuntar y seleccionar individualmente los doce cuerpos.

La disposición es compositiva: posiciones, distancias y tamaños no están a escala astronómica. Los doce cuerpos permanecen quietos y conservan su distribución al recentrar, redimensionar o cambiar de modo.

Cada cuerpo visible muestra su nombre; las lunas indican además «Satélite de …» y el nombre de su planeta. Las etiquetas acompañan la vista al girar y no bloquean el arrastre ni la selección; en VR aparece una copia por ojo. La vista única utiliza una proyección esférica que conserva los contornos circulares también en los extremos de una pantalla ancha.

Las etiquetas se presentan sin cápsula: un punto y una guía discreta acompañan al nombre y su clasificación. Al apuntar o seleccionar, el nombre cambia de color y el cuerpo recibe un resplandor de contorno. No aparece un recuadro con «Haz clic para explorar». Los planetas tienen mayor presencia y relieve, y Saturno muestra bandas concéntricas y una separación entre sus anillos.

## Controles manuales

| Acción | Cómo |
| --- | --- |
| Mirar alrededor | Arrastra con el mouse o con un dedo sobre el cielo. Puedes dar la vuelta completa en horizontal; en vertical la mirada se detiene cerca de los polos. |
| Mirar con el teclado | Enfoca el cielo (con `Tab` o haciendo clic) y usa las flechas. Si el foco está en un botón, las flechas no se interceptan. |
| Recentrar | Pulsa **Recentrar** (abajo a la derecha) para volver a la dirección inicial. El cielo no cambia, solo la dirección de la mirada. |
| Apuntar en vista única | Pasa el mouse sobre un planeta: se ilumina sin abrir su ficha. Al apartarlo desaparece el brillo transitorio. El cursor determina el objetivo. |
| Seleccionar en vista única | Haz clic o toca directamente un planeta, aunque esté fuera del centro. Se ilumina de forma persistente y abre su ficha. |
| Cambiar la selección en vista única | Pulsa otro planeta para trasladarle la selección. Solo puede haber uno seleccionado. |
| Deseleccionar en vista única | Pulsa otra vez el planeta seleccionado, toca el fondo o usa el cierre de la ficha. |

Estas acciones también se aplican a las cuatro lunas. Hay una sola selección y una sola ficha entre los doce cuerpos: pulsar directamente una luna después de un planeta cambia la selección y presenta los datos de esa luna.

El observador permanece siempre en el centro: no hay desplazamiento por el espacio ni movimiento automático.

Un arrastre cambia la mirada y nunca selecciona ni deselecciona, aunque comience o termine sobre un planeta. Las pequeñas oscilaciones de un toque se toleran sin mover la cámara. La selección se conserva al mirar a otro lado, recentrar y entrar o salir de VR; los botones superpuestos solo ejecutan su propia acción.

### Puntero de mirada

En escritorio, con entrada principal precisa y hover, se usa el cursor del mouse y no aparece una cruz central, incluso en una ventana estrecha. En vista única táctil se conserva una cruz blanca fija en el centro. En VR aparece una cruz por ojo, alineada con los centros ópticos del HOMIDO GRAB y con la dirección común de mirada. La posición depende del tamaño físico de la pantalla; no tiene por qué coincidir con el centro de cada mitad.

El puntero es una guía visual que no recibe el foco ni intercepta gestos: puedes tocar o arrastrar sobre él como sobre cualquier otra parte del cielo. En vista única seleccionas en la posición del mouse o del dedo; en VR, su dirección sirve como referencia para apuntar a un planeta. Sobre la ficha VR cambia a flecha izquierda o derecha según la acción disponible, y a × cuando el tap cerrará la ficha. Las pestañas, la mitad izquierda de la primera página y el cielo mantienen la cruz neutra. Ambos ojos muestran la misma figura con la corrección óptica existente.

## Vista dividida para visor móvil (VR)

El botón **Entrar VR** presenta dos vistas, una por ojo, con el perfil óptico del **HOMIDO GRAB**, compatible con Google Cardboard. Ambas vistas comparten el cielo, los planetas, la dirección de mirada y la selección; al entrar y salir se conservan todos ellos.

Después de entrar en VR y antes de colocar el teléfono en el visor, pulsa **Ajustar visor** abajo e indica la **diagonal de pantalla de tu celular en pulgadas**, según su fabricante (por ejemplo, 5.5 o 6.1). El valor inicial de 6 pulgadas es una estimación, no una detección del teléfono. Puedes usar punto o coma decimal; el ajuste se conserva en este navegador cuando su almacenamiento está disponible. Coloca el teléfono centrado en el GRAB y en horizontal; usa pantalla completa para que las barras del navegador no alteren la alineación física. Si el navegador no permite pantalla completa, la vista sigue disponible, pero la alineación puede requerir ocultar sus barras y ajustar la colocación del teléfono.

- **Entrar:** pulsa **Entrar VR**. La aplicación intenta activar pantalla completa y orientación horizontal cuando estén disponibles, sin convertirlas en requisito.
- **Instrucción inicial:** cada entrada muestra en ambos ojos «Pulsa tap para seleccionar. Pulsa dos tap para recentrar.». Un tap en cualquier punto del cielo la cierra sin seleccionar un cuerpo.
- **Recentrar en VR:** pulsa dos tap rápidos (hasta 300 ms entre ellos) en cualquier punto del cielo o pulsa dos veces el botón táctil del visor. Recupera la ficha conservando cuerpo y sección, sin seleccionar ni activar sus controles. Con sensor activo continúa el seguimiento; sin sensor vuelve a la orientación inicial. En vista normal se conserva el botón **Recentrar**.
- **Ajustar visor:** aparece abajo únicamente en VR y conserva el formulario anterior con entrada decimal, **Guardar** y **Cancelar**. No hay ajuste mediante mirada.
- **Salir:** pulsa **Salir de VR** abajo o usa la tecla `Escape`. También se vuelve a vista única si abandonas la pantalla completa desde el navegador. Solo se libera lo adquirido por la experiencia.
- **Mirada y gestos:** mirar sin tocar no activa; un arrastre no selecciona. El tap simple en VR espera 300 ms para descartar un segundo tap y activa el objetivo que mirabas al tocar, aunque el sensor mueva la mirada durante la espera. El doble tap solo recentra. La selección en vista normal es inmediata.
- **Teléfono en vertical:** se conservan las dos vistas, los controles y una indicación para girar el teléfono a horizontal.
- **Mirar alrededor en VR:** arrastre con dedo o mouse y flechas ajustan la mirada sin interrumpir el sensor activo o pendiente. Sin sensor utilizable permiten apuntar a los cuerpos y a la ficha. Los botones HTML conservan su alternativa con teclado.

Cada ojo se renderiza a una textura con una perspectiva asimétrica y después recibe la compensación radial de las lentes. Se usan los [parámetros publicados por HOMIDO](https://homido.com/setup/) para el GRAB: separación de 60 mm, distancia de pantalla a lente de 40 mm, alineación vertical central y coeficientes de distorsión 0.34 y 0.10. El campo se limita a los [100° anunciados para el GRAB](https://homido.com/homido-grab/). La escena, las fichas, los nombres de los planetas, las cruces y la instrucción inicial VR atraviesan la corrección óptica. Los botones HTML permanecen abajo para usarlos fuera del visor. Los bordes negros y la curvatura de la imagen sin el visor son parte de esta compensación.

El perfil está integrado en la web: no hace falta escanear un QR en otra aplicación y los ajustes guardados en la aplicación Cardboard no se transfieren automáticamente a este navegador. La alineación y comodidad finales deben comprobarse con el teléfono real dentro del GRAB.

### Seleccionar con el botón del visor

1. Mira un planeta: se resalta mientras le apuntas. Mirarlo por sí solo no lo selecciona ni hay un temporizador de permanencia.
2. Sin selección previa, toca **cualquier zona de la escena**, en cualquiera de las dos mitades, o pulsa el botón táctil del visor. Se selecciona el planeta apuntado, aunque el toque quede lejos de su representación. Su iluminación aumenta y aparece un halo persistente.
3. Puedes mirar a otro lado: el planeta conserva la selección.
4. La ficha aparece frente a ti. Mira su mitad izquierda y toca para retroceder una página, o su mitad derecha para avanzar una página, incluidas las continuaciones de una sección. La línea central pertenece a la derecha; mirar a la izquierda en la primera página consume el tap sin cambiarla ni cerrar. La dirección se decide por la mirada sobre la tarjeta, independientemente de dónde toque el dedo o el botón del visor.
5. También puedes mirar una pestaña (**Ficha**, **Datos**, **¿Sabías?**, **Libros**) y tocar para ir directamente a esa sección, o usar **Anterior** y **Siguiente**. Las pestañas y **×** tienen prioridad sobre la mitad que ocupan; cada tap ejecuta solo una acción. La sección actual queda marcada en ambos ojos.
6. En la última página, avanzar otra vez desde la mitad derecha cierra la ficha y quita la selección sin salir de VR. El control **Siguiente** se convierte en **Cerrar →**, también accesible con teclado; el puntero indica × antes de cerrar. Puedes usar **×** en cualquier página. Mirar fuera de la tarjeta y tocar conserva la deselección global: el primer toque cierra la ficha y solo uno posterior puede seleccionar otro planeta. El doble tap sigue recentrando sin paginar ni cerrar, incluso al final de la lectura.

Cuando deseleccionas sin dejar de mirar el cuerpo, desaparece el halo de selección y queda únicamente el resaltado por mirada. Tocar mirando el fondo sin selección previa no selecciona nada, aunque el dedo caiga sobre un planeta lateral. Recentrar y entrar o salir de VR conservan la selección y no cuentan como toques de selección.

Los toques, el arrastre y las flechas **mantienen el seguimiento por sensores**, incluso si todavía se espera el permiso o la primera lectura. La intervención manual ajusta la dirección sin que la lectura siguiente la revierta; los giros del teléfono siguen funcionando también durante el arrastre. Las mismas reglas de mirada y toque funcionan sin sensor, apuntando mediante arrastre o teclado.

### Orientación del dispositivo y permiso

Al pulsar **Entrar VR** la aplicación intenta usar los sensores de orientación del teléfono para que ambas vistas sigan sus giros e inclinaciones:

- **Permiso:** solo se pide cuando el navegador lo exige (por ejemplo Safari en iPhone) y siempre desde el propio toque en **Entrar VR**, nunca al abrir la página. Si lo rechazas no se vuelve a pedir hasta que salgas de VR y entres de nuevo.
- **Primera lectura:** la vista no da un salto al activarse el sensor; parte de la dirección que ya veías.
- **Recentrar:** con el sensor activo, el rumbo actual del teléfono pasa a ser el frente, se retiran los ajustes manuales acumulados y se conserva su inclinación natural; el seguimiento continúa. Sin sensor se vuelve a la dirección inicial.
- **Alternativa manual:** si no hay sensor, el navegador no lo ofrece, se rechaza el permiso, la página no está en un contexto seguro (HTTPS) o no llegan lecturas válidas en los 2 segundos siguientes a habilitar el sensor (con la página visible), la vista dividida sigue disponible y se muestra un aviso breve ("Arrastra para mirar alrededor"). Entonces funcionan el arrastre con dedo o mouse y las flechas del teclado.
- **Combinar entradas:** arrastrar con dedo o mouse o usar las flechas ajusta la mirada sin cancelar el sensor activo ni una solicitud pendiente. La primera lectura conserva la última dirección visible. No hace falta salir y volver a entrar ni repetir permisos; usar otro control no provoca el aviso de sensor no disponible.

Los sensores de orientación solo se entregan en un **contexto seguro**: `https://` o `http://localhost`. Un `http://192.168.x.x` desde el móvil mostrará la escena y el control manual, pero no los sensores.

### Probar los sensores desde un móvil

Sin la API Express ni ninguna configuración de instalación (PWA); solo el servidor de Vite:

1. Arranca solo la interfaz: `npm run dev:interfaz`.
2. Abre la aplicación en el móvil con una de estas opciones:
   - **Android con cable USB** (Chrome, depuración USB activada): ejecuta `adb reverse tcp:5173 tcp:5173` y abre `http://localhost:5173` en el móvil. `localhost` cuenta como contexto seguro, así que no hace falta HTTPS.
   - **Un túnel con HTTPS válido** (Android o iPhone): por ejemplo `cloudflared tunnel --url http://localhost:5173 --http-host-header localhost:5173` o `ngrok http 5173 --host-header=localhost:5173`, y abre en el móvil la dirección `https://…` que muestre. Vite rechaza (error 403) las peticiones cuyo encabezado `Host` no sea el local, por eso se reescribe a `localhost:5173`.
3. Pulsa **Entrar VR** y acepta el permiso de orientación si el navegador lo solicita. Gira el teléfono: las dos vistas deben seguirlo. Para probar la alternativa manual, rechaza el permiso y arrastra con el dedo.
4. Con el visor, apunta a un planeta y usa su botón táctil: comprueba selección con halo en ambos ojos y que la cabeza sigue dirigiendo la vista. Mira al fondo y pulsa de nuevo: debe desaparecer la selección. Repite mirando otro planeta; el primer toque quita la selección anterior y el siguiente selecciona el nuevo objetivo.
5. Comprueba los doce cuerpos, anillos y superficies, incluidas Luna–Tierra, Europa–Júpiter, Titán–Saturno y Tritón–Neptuno. Apunta a cada luna, toca lejos de su imagen y verifica su ficha y planeta principal en ambos ojos. Tocar mirando fuera de la ficha quita la selección; un toque posterior puede seleccionar otro cuerpo. Rota la pantalla, recentra y repite entrada/salida y regreso desde segundo plano. Repite la selección con sensores rechazados y control manual. Registra navegador, dispositivo y visor empleados; las comprobaciones físicas que no se realicen deben quedar pendientes.
6. Con sensor activo, arrastra con dedo y después gira el teléfono: debe seguir el movimiento sin salir y volver a entrar. Repite con lecturas durante el arrastre y con flechas de teclado cuando esté disponible. Repite antes de aceptar el permiso y antes de la primera lectura: al activarse no debe saltar la vista.
7. Al entrar en VR, comprueba que la instrucción se lee en ambos ojos y que un tap en cualquier mitad de pantalla la cierra sin seleccionar. Con una ficha de planeta y otra de luna, mira la izquierda y la derecha de la tarjeta y toca lejos de ella: verifica retroceso y avance de una página, incluidas continuaciones, con la flecha correspondiente en ambos ojos. En la primera página, la izquierda no cambia la lectura; al final, la derecha y **Cerrar →** cierran la ficha permaneciendo en VR. Comprueba la prioridad de pestañas y **×**, el cierre final con teclado y el regreso del foco a la exploración. Haz doble tap al final: solo debe recentrar conservando cuerpo y página. Repite al girar la pantalla y ajustar la diagonal, y prueba el botón físico del visor. Comprueba Ajustar visor y Salir de VR abajo, y Recentrar sin Ajustar visor en vista normal. Vuelve a entrar y comprueba que aparece otra vez la instrucción.

Los pasos 2 y 3 requieren un móvil físico y, en su caso, las herramientas indicadas (`adb`, `cloudflared` o `ngrok`), que no forman parte del proyecto. Los eventos de sensor simulados en un navegador de escritorio no acreditan la compatibilidad con un visor real.

## Alcance

- Las estrellas, los ocho planetas y las cuatro lunas son una **representación visual generada**, sin posiciones ni escalas astronómicas reales. Hay nombres y fichas educativas; no hay órbitas, rotación automática, Sol, otros satélites ni constelaciones.
- La escena, su selección y sus imágenes funcionan en el cliente. El contenido educativo de las fichas en vista normal y VR se consulta mediante la API Express; no se consulta un catálogo externo ni se cargan imágenes remotas.
- Esta versión **no incluye instalación como aplicación (PWA) ni uso sin conexión**; quedan para un cambio posterior.

## Fichas educativas

La ficha sigue la referencia visual: clasificación discreta, nombre grande, imagen pequeña arriba a la derecha, espacio para subtítulo y descripción, cuatro datos en dos columnas, curiosidades y libros separados por líneas. Los créditos de imagen quedan aparte.

En vista normal, seleccionar un cuerpo consulta `GET /api/cuerpos-celestes/:slug` y rellena su descripción, clasificación, cuatro datos y curiosidades dentro del diseño existente. Se conservan los textos, etiquetas, cifras, unidades y notas del PDF del equipo almacenados en Supabase. `contenido_ficha.datos_principales` es la fuente de presentación: no se sustituyen los días solares por rotación ni se recalculan los años aproximados. El subtítulo ausente conserva su reserva.

Mientras se consulta aparece «Cargando información…» en el espacio de descripción. Si la API falla, se informa la indisponibilidad y se mantienen la identidad, imagen y cierre; cerrar y volver a seleccionar permite intentarlo de nuevo. Cambiar de cuerpo descarta la respuesta anterior. Los datos locales de `src/datos/cuerposCelestes.js` conservan su contenido editorial vacío y no simulan una respuesta remota.

En escritorio se muestra un panel lateral; en móvil conserva desplazamiento propio. El cierre devuelve el foco al cielo. Desplazar o usar flechas dentro del panel no gira la escena. Apuntar no abre ni sustituye la ficha, y la selección conserva su iluminación al apartar el mouse o la mirada.

En VR se rellena la tarjeta con el mismo contenido publicado de la vista normal, conservando su apariencia, optica y controles. Si una seccion no cabe, las flechas actuales permiten leer sus continuaciones sin recortar texto; las cuatro pestañas siguen llevando al inicio de su seccion. La tarjeta aparece **frente a la mirada** y sus pestañas permiten elegir una sección sin pasar por las anteriores. El área de lectura no reacciona a toques; las flechas y × son acciones separadas. Recentrar recupera la tarjeta al frente conservando la sección y selección. Entrar o salir de VR conserva el cuerpo y reinicia la sección. Mirar un control sin tocar no lo activa; los toques, el arrastre y las flechas de navegación mantienen el sensor activo o pendiente. Cambiar de modo conserva la consulta y el contenido del cuerpo seleccionado.

Las imágenes optimizadas de `public/imagenes/planetas/` y `public/imagenes/satelites/` se sirven localmente y conservan su URL original, texto alternativo y crédito. Las cuatro lunas tienen fichas propias que identifican su planeta principal tanto en pantalla como en VR. Las fotos de los satélites proceden de NASA, Galileo, Cassini y Voyager 2; las copias locales se han recortado y reducido para las fichas.

Los registros locales de satélite usan `tipo: 'satelite'`, `planetaId` y `planetaPrincipal`. En vista normal, sus datos editoriales muestran diámetro medio, distancia orbital media desde su planeta, período de rotación y período orbital, tal como aparecen en el PDF. No se exige distancia al Sol ni se sustituye la ficha por la de su planeta principal. Los valores numéricos locales siguen en `null`; el relleno publicado se mantiene separado.

### Descubrir libros

Se conserva el encabezado y la ubicación existentes. En vista normal y VR se presenta la invitacion del PDF correspondiente al cuerpo elegido, recibida en `contenido_ficha.descubrir_libros`, aunque `libros` sea `[]`. Se accede desplazando el panel y se puede volver hacia arriba o cerrar con los controles actuales; no se añaden botones o pantallas.

Los dos libros provisionales de la carga anterior se retiraron durante la corrección de contenido. La biblioteca todavía no ha entregado su catálogo: no se agregan títulos, portadas o enlaces de relleno. `LIBROS_POR_CUERPO`, en `src/datos/librosCuerposCelestes.js`, permanece vacío y conserva su contrato futuro de título y URL HTTP/HTTPS válida. La incorporación y comprobación de títulos reales corresponde a su avance posterior.

### Comprobar las fichas

Con API y Vite activos, seleccionar un planeta y una luna, cotejar sus textos y datos con el PDF y recorrer hasta «Descubrir libros». Volver hacia arriba, cambiar de selección y cerrar: nunca deben mezclarse dos cuerpos ni reabrirse una ficha por una respuesta tardía. Con la API detenida, la escena y el cierre siguen disponibles y se informa que no puede recuperarse el contenido.

Como regresión, comprobar que entrar y salir de VR mantiene el cuerpo, el contenido publicado y los controles anteriores. Las capturas y la demostración de este avance corresponden al navegador; las evidencias se guardan en `evidencias/rellenarFichas/` y se describen en el informe del cambio OpenSpec. El rediseño movil y la evaluacion de comodidad fisica siguen en sus tareas posteriores. El relleno informativo del visor si forma parte de este cambio.

## API de consulta de contenido

El backend Express es un proceso independiente de Vite; `npm run dev` inicia ambos juntos. Requiere Node.js 22.12 o posterior compatible con Vite (también Node 24). La escena conserva sus identidades locales y utiliza la API unicamente para rellenar las fichas en ambos modos; no se agregan cuerpos a la escena.

### Organización del backend

```text
api/
  index.js                         # Crea Express y monta las rutas.
  rutas/
    contenidoCeleste.js            # Endpoints, validación HTTP y respuestas.
  servicios/
    consultaSupabase.js            # Consultas públicas y errores de Supabase.
  pruebas/
    consultaContenido.test.js      # Contratos HTTP y consultas simuladas.
    inicioServidor.test.js         # Manejo del puerto ocupado al arrancar.
  herramientas/
    comprobarSupabase.js           # Comprobación explícita con la base real.
```

`server.js`, en la raíz del proyecto, conserva el arranque del servidor. Las rutas utilizan el servicio de consulta; las pruebas y herramientas están separadas del código que atiende peticiones. `npm test` descubre las pruebas en su nueva carpeta y `npm run test:integracion` ejecuta la herramienta de comprobación real.

### Configurar y ejecutar

1. Copia `.env.example` como `.env` en la raíz del proyecto y completa `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. En PowerShell puedes usar `Copy-Item .env.example .env` si todavía no existe `.env`.
2. Obtén la URL del proyecto en Supabase, **Integrations > Data API**, y la clave pública `sb_publishable_…` en **Settings > API Keys**. Se utiliza la clave pública para respetar los permisos del visitante y RLS; no una clave secreta o `service_role`.
3. Ejecuta `npm run dev` para iniciar la interfaz y la API. Para iniciar únicamente el backend, usa `npm run start:api`, o `npm run dev:api` para reiniciar automáticamente al editarlo. `PORT` es opcional y por defecto vale 3000.

### Despliegue en Vercel

El proyecto publica la interfaz Vite y la función Express en el mismo dominio. `vercel.json`, junto a `package.json`, reenvía `/api/:path*` a la función `/api` exportada por `api/index.js`. Express atiende las rutas completas, como `/api/estado` y `/api/cuerpos-celestes/tierra/libros`. La regla se limita a la API y conserva las rutas de la interfaz, los archivos compilados y las imágenes locales. Consulta la [documentación de reescrituras de Vercel](https://vercel.com/docs/routing/rewrites).

Para configurar el proyecto en Vercel:

1. Usa la raíz del repositorio, donde están `package.json`, `vercel.json` y `api/`, y el framework **Vite**. El comando de compilación es `npm run build` y el directorio de salida es `dist`.
2. En **Settings > Environment Variables**, configura `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` con los valores del proyecto Supabase para **Production**. La clave debe ser pública, con formato `sb_publishable_…`, como exige el servicio actual. Para probar una URL de Preview, configura también ese entorno.
3. Conserva esos nombres sin prefijo `VITE_`: la conexión se utiliza en el servidor. El archivo `.env` local está ignorado por Git y no configura automáticamente las variables de Vercel. `PORT` corresponde al arranque local; no es la dirección de la API publicada.
4. Publica una versión que incluya `vercel.json`. Si agregas o cambias variables, vuelve a desplegar desde **Deployments > … > Redeploy** para que se apliquen a una nueva versión. Revisa que estés probando la URL de ese despliegue. Consulta la [configuración de variables de Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables).

`npm run dev` inicia los dos servidores en tu computadora. El proxy `server.proxy` de Vite solo actúa en desarrollo; no sustituye las reglas de Vercel ni es el comando de compilación de producción. `server.js` conserva el arranque local; Vercel ejecuta la aplicación exportada por `api/index.js` como función.

#### Comprobar el despliegue

Para la URL de prueba actual, ejecuta en PowerShell:

```powershell
curl.exe -i https://metseri-prueba.vercel.app/api/estado
curl.exe -i https://metseri-prueba.vercel.app/api/cuerpos-celestes
curl.exe -i https://metseri-prueba.vercel.app/api/cuerpos-celestes/tierra
curl.exe -i https://metseri-prueba.vercel.app/api/cuerpos-celestes/tierra/libros
curl.exe -i https://metseri-prueba.vercel.app/api/cuerpos-celestes/luna
```

Sustituye el dominio si utilizas otra URL. Interpreta el estado HTTP y el tipo de contenido juntos:

| Respuesta | Qué comprueba o indica |
| --- | --- |
| `/api/estado`: 200 y JSON con `proyecto`, `mensaje` y `estado` | La ruta llega a Express; todavía no comprueba Supabase. |
| Listado y ficha: 200 y JSON | Comprueba el contenido real cotejando UUID y slug entre ambos. Un listado vacío no demuestra recuperación de una ficha. |
| Libros: 200 y un arreglo JSON | La ruta anidada funciona; `[]` es válido si el cuerpo publicado no tiene libros visibles. |
| 404 con texto `NOT_FOUND` de Vercel | La plataforma no está resolviendo esa ruta hacia la API; revisa que el despliegue incluya `vercel.json`. |
| HTML de la interfaz al consultar `/api/...` | La ruta de API está resolviéndose hacia la página; revisa las reglas de enrutamiento. |
| 503 JSON con `CONFIGURACION_NO_DISPONIBLE` | La API responde, pero faltan variables de Supabase o sus valores no cumplen el formato esperado. Revisa el entorno y vuelve a desplegar si cambias variables. |
| 503 JSON con `CONTENIDO_NO_DISPONIBLE` | La API responde, pero falló la consulta a Supabase; revisa conectividad, recursos y permisos de lectura. |
| 404 JSON con `CUERPO_NO_ENCONTRADO` | La API responde y no encuentra un cuerpo público con ese slug. |
| 400 JSON con `SLUG_INVALIDO` | La API recibió un identificador inválido, por ejemplo `TIERRA` en mayúsculas. |

Finalmente, abre la raíz del sitio y selecciona Tierra y Luna. Comprueba que las fichas reciben su contenido, que la escena y las imágenes siguen disponibles y que las peticiones de datos usan `/api` del mismo dominio. Las comprobaciones locales y las de Vercel se registran por separado en `verificacion.md` del cambio OpenSpec: una compilación o prueba local correcta no acredita que el dominio ya publique esa versión. No hace falta volver a ejecutar SQL ni publicar registros para comprobar el enrutamiento.

### Acceso administrativo

El formulario está disponible en `/admin`. Configura `ADMIN_USUARIO` y `ADMIN_CONTRASENA` en `.env` antes de iniciar la API; usa una contraseña propia de al menos 12 caracteres y no la guardes en Git. En desarrollo, ejecuta `npm run dev` para iniciar la interfaz y la API juntas. Vite reenvía `/api` al servidor local de Express.

La sesión la crea y valida Express mediante una cookie `HttpOnly`, `SameSite=Strict`, válida durante ocho horas. La ruta `GET /api/admin` requiere sesión; el navegador también comprueba la sesión al abrir directamente `/admin`. Si falta la configuración, el acceso se rechaza con `503`; las credenciales incorrectas reciben `401`. La sesión se guarda en memoria del proceso y se invalida al cerrar sesión o reiniciar la API, por lo que este almacenamiento debe sustituirse por una sesión compartida si se despliega con varias instancias.

Para comprobar el flujo, inicia sesión con los valores configurados, prueba una contraseña incorrecta, abre `/admin` en una ventana privada y, ya autenticado, cierra sesión e intenta consultar `GET /api/admin` otra vez. Las respuestas esperadas son respectivamente acceso autorizado, error de credenciales, formulario sin sesión y `401` tras cerrar sesión.

#### Panel bibliográfico (vista previa)

Tras iniciar sesión en `/admin` o `/admin/`, la pantalla inicial es el listado de **Registros bibliográficos**. Sin sesión se muestra primero «Verificando acceso…» y después el formulario de acceso; el panel no tiene una entrada alternativa. La cabecera ofrece **Volver a la exploración** (abre la escena en `/`) y **Cerrar sesión**; la navegación compacta ofrece **Registros bibliográficos** y **Agregar libro**.

El panel es una vista previa de la interfaz. Sus registros de ejemplo se definen en `src/datos/registrosBibliograficosEjemplo.js`. Provisionalmente, sus portadas se enlazan por ISBN desde el servicio de portadas de Open Library (`covers.openlibrary.org`), sin copiarlas al proyecto; para retirarlas basta con dejar `fotografia: null` en cada registro. Solo los importa el módulo administrativo; no aparecen en las fichas, en VR ni en la API de consulta. Aparte de esas imágenes de portada, las únicas peticiones reales del panel son las de sesión (`GET`, `POST` y `DELETE /api/admin/sesion`).

- **Búsqueda y filtro:** la búsqueda por título o autoría ignora mayúsculas, tildes y espacios exteriores, y se combina con el filtro por cuerpo celeste. La cantidad de resultados se actualiza y **Limpiar filtros** recupera todos los registros. Una búsqueda sin coincidencias se distingue de un catálogo vacío.
- **Agregar libro y Editar:** comparten el formulario con los campos Título, Autoría y URL de la ficha bibliográfica (obligatorios), y Editorial y Año de publicación (opcionales). Los errores aparecen al abandonar un campo modificado y desaparecen al corregirlo: título y autoría no admiten solo espacios, la URL debe ser absoluta con `http://` o `https://`, y el año, si se indica, debe ser un entero de 1 a 9999.
- **Relaciones:** el formulario permite marcar cero, uno o varios de los doce cuerpos locales, agrupados en planetas y satélites; cada satélite indica su planeta principal. Sin selección se muestra «Sin asociar». Las relaciones usan los identificadores locales de `cuerposCelestes.js` y solo existen en el borrador.
- **Borradores temporales:** los cambios de un formulario se descartan al cancelar, volver al listado, recargar la página o cerrar sesión; no se guardan en el navegador. **Guardar libro** y **Guardar cambios** están deshabilitados y pulsar Enter no envía el formulario. Volver al listado conserva la búsqueda y el filtro de esa visita.
- **Eliminar:** abre un diálogo de confirmación con el título del libro y las relaciones que se retirarían. Se cierra con Cancelar, Cerrar o Escape, devolviendo el foco al botón Eliminar del registro. El botón **Eliminar libro** del diálogo está deshabilitado: la eliminación real queda pendiente y ningún registro desaparece del listado.

Para revisar el panel, inicia sesión, combina una búsqueda con un cuerpo celeste, abre Agregar libro y Editar, provoca y corrige errores de validación, marca y desmarca cuerpos, cancela y abre la confirmación de eliminación. Los registros deben seguir igual y la pestaña Red de las herramientas del navegador solo debe mostrar peticiones de sesión y las imágenes de portada. La conexión con un catálogo administrativo real y la habilitación del guardado o la eliminación requieren un cambio posterior con su propia API.

`.env` está ignorado por Git. El ejemplo solo contiene marcadores; las variables no llevan prefijo `VITE_`. Los comandos cargan `.env` con Node y siguen funcionando si el archivo no existe: `/api/estado` está disponible y las rutas de contenido indican configuración pendiente. El proxy de Vite reutiliza `PORT` sin exportar credenciales al navegador. Reinicia Vite y la API después de cambiar ese puerto. No se añade CORS para otros orígenes.

### Rutas y respuestas

| Método y ruta | Respuesta exitosa |
| --- | --- |
| `GET /api/estado` | 200 con el estado actual del servidor; no comprueba la conexión a Supabase. |
| `GET /api/cuerpos-celestes` | 200 con un arreglo de planetas y satélites publicados, ordenados por `orden` y `slug`. |
| `GET /api/cuerpos-celestes/:slug` | 200 con la ficha completa del cuerpo publicado. |
| `GET /api/cuerpos-celestes/:slug/libros` | 200 con sus libros verificados y activos, ordenados por `orden` y `libro_id`. |

Ejemplos en PowerShell (sustituye `tierra` por un slug que ya esté publicado):

```powershell
curl.exe -i http://localhost:3000/api/estado
curl.exe -i http://localhost:3000/api/cuerpos-celestes
curl.exe -i http://localhost:3000/api/cuerpos-celestes/tierra
curl.exe -i http://localhost:3000/api/cuerpos-celestes/tierra/libros
```

El listado conserva `id` (UUID), `slug`, `nombre`, `clasificacion`, `subtitulo`, `tipo`, `planeta_id`, `planeta_slug`, `orden`, `imagen_path` e `imagen_alt`. La ficha contiene `id`, `slug`, `nombre`, `clasificacion`, `subtitulo`, `tipo`, `planeta`, `imagen`, `descripcion_breve`, `datos_principales`, `curiosidades` y `libros`. El endpoint de libros conserva `libro_id`, `titulo`, `autor`, `editorial`, `anio`, `url_ficha` y `orden`; `autor` presenta los autores en el orden de autoría almacenado.

Las rutas reciben el **slug**, por ejemplo `tierra`, y no el UUID de la base. El frontend conserva sus identificadores locales y coteja slug, nombre, tipo y planeta anfitrión antes de rellenar la ficha. El JSON conserva los nombres `snake_case` de la base y los valores `null`, sin sustituirlos por cero. Los números normalizados mantienen las unidades de sus campos; el día solar está separado en `dia_solar_horas`. La propiedad adicional `contenido_ficha` contiene los cuatro datos editoriales con sus cifras, unidades y notas originales, y la invitación bibliográfica; es la fuente que utiliza la presentación del navegador.

Un listado sin contenido público o un cuerpo público sin libros produce `200` con `[]`. Un cuerpo inexistente o sin publicar produce la misma respuesta `404`, también en su ruta de libros. Los errores tienen esta forma:

```json
{ "error": { "codigo": "CUERPO_NO_ENCONTRADO", "mensaje": "No se encontró el cuerpo celeste." } }
```

| Estado | Código | Causa |
| --- | --- | --- |
| 400 | `SLUG_INVALIDO` | El slug no cumple `^[a-z0-9]+(-[a-z0-9]+)*$`. |
| 404 | `CUERPO_NO_ENCONTRADO` | Cuerpo inexistente o no visible. |
| 405 | `METODO_NO_PERMITIDO` | Método distinto de GET/HEAD en las rutas de contenido; `Allow: GET, HEAD`. |
| 503 | `CONFIGURACION_NO_DISPONIBLE` | URL o clave pública ausente o inválida. |
| 503 | `CONTENIDO_NO_DISPONIBLE` | Fallo de red, permisos, respuesta remota inválida o plazo de consulta agotado. |

Cada consulta externa tiene un plazo de cinco segundos. La ruta de libros comprueba primero la existencia pública del cuerpo y después consulta sus asociaciones; puede realizar dos consultas. Los errores no se convierten en listas vacías ni devuelven claves o mensajes internos de Supabase.

### Recursos y permisos de Supabase

La API reutiliza el esquema ya existente mediante GET a la Data API: listado en `v_cuerpos_exploracion`, ficha en `rpc/ficha_cuerpo?p_slug=…` y libros en `v_libros_por_cuerpo`, filtrados por `cuerpo_slug`. Sus vistas y función usan `security_invoker`; RLS permite únicamente cuerpos publicados y libros verificados y activos. No se ejecutan escrituras o migraciones ni se cambia la publicación o las políticas.

La corrección de contenido del PDF ya publica los doce cuerpos y retira los dos libros provisionales; puede consultarse en `bd/README.md`. No vuelvas a ejecutar la semilla ni el SQL de corrección para comprobar o iniciar la API. Una ficha no inventa descripciones, curiosidades, libros o cifras faltantes. La función SQL no incorpora los créditos de imagen; el frontend conserva sus créditos locales. Para un catálogo que supere el límite de filas de la Data API será necesario ampliar el contrato con paginación.

### Comprobar la integración real

`npm test` ejecuta las pruebas locales con transportes simulados, sin credenciales ni peticiones externas. La comprobación remota se ejecuta expresamente:

1. Configura las dos variables de Supabase en `.env`.
2. En el Table Editor identifica un cuerpo **ya publicado** y copia su `slug` en `CUERPO_PRUEBA_SLUG` y su UUID `id` en `CUERPO_PRUEBA_ID`. Si no existe ninguno, la recuperación positiva queda pendiente hasta disponer de contenido público; este procedimiento no publica registros.
3. Ejecuta `npm run test:integracion`. No necesitas arrancar antes `server.js`: la comprobación inicia temporalmente la aplicación en un puerto local libre y la cierra al terminar.

La comprobación exige coincidencia de UUID y slug entre la configuración, el listado y la ficha, y consulta también los libros. Termina con código distinto de cero si faltan variables, el listado está vacío o no puede recuperar el registro. Si no hay libros, informa que la rama con libros reales sigue sin verificarse. Esta comprobación no demuestra por sí sola la exclusión de todos los borradores o libros ocultos: esa evidencia se registra por separado cuando existan casos conocidos.

Ante `503`, revisa URL, tipo de clave, Data API habilitada, recursos existentes, privilegios de lectura y conectividad. Ante `[]` o `404` con una conexión válida, revisa el estado de publicación y las políticas RLS. Una respuesta vacía no acredita la recuperación de información almacenada. Registra los resultados en `verificacion.md` del cambio OpenSpec y mantén pendiente su tarea de conexión real hasta obtener evidencia positiva.

### Probar la API con Postman

La dirección raíz del backend (`http://localhost:PUERTO/`) no tiene una ruta registrada y responde `Cannot GET /`. Para consultar el estado utiliza `/api/estado`; para ver también la interfaz, inicia ambos servidores con `npm run dev` en lugar del arranque independiente de la API y abre la dirección que muestre Vite, normalmente el puerto 5173. Usa puertos distintos para ambos servidores: la API tiene 3000 por defecto y puede configurarse en otro puerto libre, por ejemplo `PORT=3001` en `.env`. Reinicia los servidores después de cambiar `PORT`.

Si el puerto ya está ocupado, el servidor informa el conflicto y termina con código 1. Un arranque correcto mantiene la terminal ejecutándose y muestra la URL de la API.

1. Ejecuta `npm run start:api` para iniciar solo el backend, o `npm run dev` para iniciar también la interfaz. Deja esa terminal ejecutándose mientras envías las consultas. Si ya está en marcha, utiliza ese proceso sin iniciar otra API en el mismo puerto.
2. En Postman utiliza **Import** y selecciona `postman/consultasMetseri.postman_collection.json`. También puedes arrastrar el archivo a la aplicación ([guía de importación](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-data/)).
3. En las variables de la colección ajusta `urlBase` al puerto del mensaje del servidor. La colección incluye `http://localhost:3001` como ejemplo. `slugCuerpo` tiene `tierra` y debe identificar un cuerpo publicado.
4. Abre **01 - Estado del servidor** y pulsa **Send**; debe responder 200 con el estado de Metseri. Después prueba listado, ficha y libros, o ejecuta la colección completa con **Run**.

Las seis peticiones son GET y tienen 12 comprobaciones. Las últimas dos esperan 400 y 404 respectivamente y se consideran correctas cuando devuelven esos errores. Un cuerpo público sin libros devuelve `[]`. En estas peticiones no necesitas Body ni claves de Supabase; la configuración de conexión permanece en el servidor.

También puedes ejecutarlas con Postman CLI, en otra terminal mientras el backend sigue activo:

```powershell
postman collection run postman/consultasMetseri.postman_collection.json
```

Si tu API usa otro puerto, cambia `urlBase` en la colección o pásalo al ejecutar: `postman collection run postman/consultasMetseri.postman_collection.json --env-var urlBase=http://localhost:3000`.


### Probar desde el telefono mediante el tunel de VS Code

Con API y Vite activos, comparte el puerto **5173**, el que sirve la interfaz. Las peticiones a `/api` viajan por ese mismo tunel y Vite las reenvia al backend configurado en `PORT`; no necesitas exponer otro puerto ni claves de Supabase al telefono. Conserva los permisos actuales del tunel. Si es privado, el telefono necesita la sesion autorizada para abrirlo.

Recarga la pagina del telefono despues de actualizar el codigo. Selecciona Tierra o Luna y entra en VR: Ficha, Datos, ¿Sabias? y Libros deben mostrar su informacion. Tambien puedes seleccionar directamente estando en VR. El ajuste de pantalla se expresa como **diagonal en pulgadas** y no controla la carga de datos. No hace falta modificar ese ajuste ni ejecutar SQL para recuperar las fichas.
