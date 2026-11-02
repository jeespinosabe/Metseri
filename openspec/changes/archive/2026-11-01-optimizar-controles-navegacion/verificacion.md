# Verificación de optimizar-controles-navegacion

## Comprobaciones finales

- `npm test`: 175 pruebas aprobadas, sin fallos ni omisiones. Los casos HTTP se ejecutaron con acceso a sus servidores locales.
- `npm run lint`: aprobado.
- `npm run build`: aprobado. Vite conserva el aviso de paquete JavaScript mayor de 500 kB.
- `openspec validate optimizar-controles-navegacion --strict --no-interactive`: válido.
- `git diff --check`: sin errores de espacios.

Las pruebas cubren combinación de sensor, arrastre de mouse o tacto y flechas, lecturas intercaladas, balanceo, límites, permiso pendiente y eventos obsoletos. Las regresiones nuevas cubren tap simple diferido, captura del objetivo antes de esperar, doble tap sin acciones de ficha, continuidad del sensor activo o pendiente, clics normales inmediatos y cancelación por arrastre, múltiples punteros, cancelación, foco, flechas, salida y destrucción. La instrucción se verifica con reentrada, distintos tamaños, márgenes de los dos ojos y liberación idempotente de recursos.

## Navegador

Se comprobó la aplicación en el Chromium integrado de Codex con una página temporal que simula únicamente la indisponibilidad opcional de pantalla completa para evitar cambios de tamaño durante la automatización. Esa página se retira de la entrega.

- En vista normal aparecen Recentrar y Entrar VR; no aparece Ajustar visor.
- En VR aparecen Ajustar visor y Salir de VR abajo; no hay botón Recentrar ni botones generales dentro de la escena.
- Al entrar aparece el texto exacto en ambos ojos. Un tap lejos del cuerpo apuntado lo cierra sin abrir ficha; el siguiente tap simple abre Tierra por la mirada.
- Se abrió Datos de Tierra mediante mirada y tap. Un doble clic sobre el cielo recuperó la ficha al frente conservando Tierra y Datos (2/4), sin paginar ni deseleccionar.
- Ajustar visor abre el formulario anterior con diagonal 6, Guardar y Cancelar; Cancelar vuelve a VR. No se modificó el formulario ni la calibración guardada.
- Salir de VR conserva Tierra en la ficha normal y restaura los botones normales. Volver a entrar muestra de nuevo la instrucción, también sobre una ficha existente.
- La comprobación de ventana reducida 844 × 390 reveló recorte por el desplazamiento de los ejes ópticos de la pantalla calibrada. Se corrigió el tamaño de la instrucción usando el menor margen de ambos ojos y se verificó completa; las pruebas incluyen diagonales de 4 y 8 pulgadas.
- Se mantiene la regla ya comprobada que oculta la cruz en escritorio y conserva las guías táctil y ópticas. La continuidad física del sensor se verifica numéricamente con lecturas simuladas, sin atribuirle validación de hardware.

## Validación física pendiente

No se dispuso de teléfono ni HOMIDO GRAB conectado. Quedan pendientes sensor físico por HTTPS, botón táctil real, legibilidad y comodidad óptica con visor. Las simulaciones y pruebas numéricas no acreditan esos resultados. Registrar teléfono, navegador, visor y resultado cuando se realice esa comprobación.
