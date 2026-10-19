# Metseri

Experiencia de astronomía en el navegador. La primera versión muestra un cielo de estrellas envolvente, hecho con React, Vite y Three.js.

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

## Controles manuales

| Acción | Cómo |
| --- | --- |
| Mirar alrededor | Arrastra con el mouse o con un dedo sobre el cielo. Puedes dar la vuelta completa en horizontal; en vertical la mirada se detiene cerca de los polos. |
| Mirar con el teclado | Enfoca el cielo (con `Tab` o haciendo clic) y usa las flechas. Si el foco está en un botón, las flechas no se interceptan. |
| Recentrar | Pulsa **Recentrar** (abajo a la derecha) para volver a la dirección inicial. El cielo no cambia, solo la dirección de la mirada. |

El observador permanece siempre en el centro: no hay desplazamiento por el espacio ni movimiento automático.

### Puntero de cruz

Una cruz blanca fija en el centro indica hacia dónde apunta la mirada. En la vista dividida (VR) aparece una cruz en el centro de cada una de las dos vistas, en la misma posición relativa, de modo que con el visor se perciba como un solo puntero.

Por ahora es **solo una guía visual**: no selecciona nada, no activa acciones y no responde al toque, al mouse ni al teclado (no recibe el foco). Puedes arrastrar sobre ella como sobre cualquier otra parte del cielo. La interacción con el puntero está prevista para sprints posteriores.

## Vista dividida para visor móvil (VR)

El botón **Entrar VR** divide la pantalla en dos vistas contiguas, una por ojo, pensadas para un visor móvil tipo Cardboard. Ambas vistas muestran el mismo cielo y la misma dirección de mirada; al entrar y salir se conservan las estrellas y la dirección.

- **Entrar:** pulsa **Entrar VR**. La aplicación intenta además activar la pantalla completa y bloquear la orientación en horizontal, pero ambas cosas son opcionales: si el navegador no las permite o las rechaza, la vista dividida funciona igual dentro del área disponible.
- **Salir:** pulsa **Salir de VR** (centro, abajo) o la tecla `Escape`. También se vuelve a la vista única si abandonas la pantalla completa desde el navegador. Al salir solo se libera lo que la propia aplicación activó, no una pantalla completa que ya estuviera activa por otro motivo.
- **Teléfono en vertical:** se muestran las dos vistas y una indicación para girar el teléfono a horizontal; el control de salida sigue disponible.
- **Mirar alrededor en VR:** el arrastre con el dedo o el mouse y las flechas del teclado funcionan también en la vista dividida, igual que en la vista única. **Recentrar** vuelve a la dirección inicial.

Las dos vistas usan una proyección estéreo básica de Three.js (`StereoEffect`). **No hay calibración por modelo de visor ni de lentes**: la distancia entre ejes y el campo de visión son valores comunes, así que la alineación puede variar según el visor. La cruz se coloca en el centro de cada mitad de pantalla, sin ajustarla al centro óptico de las lentes de un visor concreto.

### Orientación del dispositivo y permiso

Al pulsar **Entrar VR** la aplicación intenta usar los sensores de orientación del teléfono para que ambas vistas sigan sus giros e inclinaciones:

- **Permiso:** solo se pide cuando el navegador lo exige (por ejemplo Safari en iPhone) y siempre desde el propio toque en **Entrar VR**, nunca al abrir la página. Si lo rechazas no se vuelve a pedir hasta que salgas de VR y entres de nuevo.
- **Primera lectura:** la vista no da un salto al activarse el sensor; parte de la dirección que ya veías.
- **Recentrar:** con el sensor activo, la dirección en la que apunta el teléfono pasa a ser el frente; el seguimiento continúa.
- **Alternativa manual:** si no hay sensor, el navegador no lo ofrece, se rechaza el permiso, la página no está en un contexto seguro (HTTPS) o no llegan lecturas válidas en los 2 segundos siguientes a habilitar el sensor (con la página visible), la vista dividida sigue disponible y se muestra un aviso breve ("Arrastra para mirar alrededor"). Entonces funcionan el arrastre con dedo o mouse y las flechas del teclado.
- Si empiezas a arrastrar o a usar las flechas mientras el sensor está activo, el control pasa a manual y conserva la orientación actual; el sensor no vuelve a moverla hasta que salgas de VR y entres otra vez.

Los sensores de orientación solo se entregan en un **contexto seguro**: `https://` o `http://localhost`. Un `http://192.168.x.x` desde el móvil mostrará la escena y el control manual, pero no los sensores.

### Probar los sensores desde un móvil

Sin la API Express ni ninguna configuración de instalación (PWA); solo el servidor de Vite:

1. Arranca la aplicación: `npm run dev`.
2. Abre la aplicación en el móvil con una de estas opciones:
   - **Android con cable USB** (Chrome, depuración USB activada): ejecuta `adb reverse tcp:5173 tcp:5173` y abre `http://localhost:5173` en el móvil. `localhost` cuenta como contexto seguro, así que no hace falta HTTPS.
   - **Un túnel con HTTPS válido** (Android o iPhone): por ejemplo `cloudflared tunnel --url http://localhost:5173 --http-host-header localhost:5173` o `ngrok http 5173 --host-header=localhost:5173`, y abre en el móvil la dirección `https://…` que muestre. Vite rechaza (error 403) las peticiones cuyo encabezado `Host` no sea el local, por eso se reescribe a `localhost:5173`.
3. Pulsa **Entrar VR** y acepta el permiso de orientación si el navegador lo solicita. Gira el teléfono: las dos vistas deben seguirlo. Para probar la alternativa manual, rechaza el permiso y arrastra con el dedo.

Los pasos 2 y 3 requieren un móvil físico y, en su caso, las herramientas indicadas (`adb`, `cloudflared` o `ngrok`), que no forman parte del proyecto. Los eventos de sensor simulados en un navegador de escritorio no acreditan la compatibilidad con un visor real.

## Alcance

- Las estrellas son una **representación visual generada**: no corresponden a posiciones astronómicas reales, y no hay planetas, constelaciones ni etiquetas.
- La escena funciona por completo en el cliente: no usa la API Express, catálogos ni imágenes remotas.
- Esta versión **no incluye instalación como aplicación (PWA) ni uso sin conexión**; quedan para un cambio posterior.
