# Instrucciones del proyecto

- Siempre explica al usuario qué cambios hiciste.
- No hagas commit ni push salvo que el usuario lo autorice expresamente.
- Cambia únicamente lo solicitado y lo necesario para atenderlo; no modifiques código ajeno al alcance.

## Nombres del código y los archivos

- Usa nombres en español, descriptivos y en camelCase para las funciones, los métodos y los archivos propios del proyecto. Ejemplos: `verPacientes`, `obtenerUsuario`, `escenaEstelar.jsx` y `controlesVista.js`.
- Usa nombres en español para las clases y los componentes propios, respetando la capitalización que establezca su convención. Por ejemplo, el componente React `EscenaEstelar` puede vivir en `escenaEstelar.jsx`.
- Conserva los nombres de plantilla o establecidos por convención, como `App` y `main`, y los nombres fijos requeridos por herramientas, como `package.json`, `README.md` o los artefactos de OpenSpec.
- Conserva los identificadores definidos por APIs nativas y dependencias externas; no traduzcas sus contratos.
- Nombra los cambios de OpenSpec en español, con nombres descriptivos y en kebab-case, como `agregar-escena-estelar-inmersiva`: solo letras de la `a` a la `z` en minúsculas, números y guiones simples, sin espacios, tildes ni `ñ`. Esta convención de identificadores es la excepción a camelCase; los nombres fijos de los artefactos de OpenSpec se conservan.

## Referencia tecnológica

El usuario ha utilizado las siguientes tecnologías en proyectos similares. Sirven como referencia para elegir soluciones según las necesidades de cada cambio; su mención no establece que todas estén instaladas, configuradas o incluidas en el alcance de Metseri. Comprueba el estado real del repositorio al planificar.

- Base actual de la interfaz: JavaScript, React, HTML y CSS, con Vite como herramienta de desarrollo y compilación y Node.js/npm para herramientas y dependencias.
- Escenas y recursos gráficos: Three.js sobre WebGL y Canvas 2D para generar texturas o resplandores mediante código.
- Orientación y VR: Device Orientation API para el móvil, con dos vistas generadas por Three.js para un visor móvil; WebXR como referencia cuando un cambio requiera sesiones inmersivas en equipos compatibles.
- Instalación y uso sin conexión: `vite-plugin-pwa` y Workbox.
- Interfaz: Lucide React para iconos y Fontsource para alojar en la aplicación las fuentes DM Sans y Manrope.
- Publicación y dominios: Vercel para alojamiento y HTTPS; Porkbun/DNS para el dominio y sus registros. Esta referencia no acredita una configuración actual de publicación o DNS.

Para el primer cambio `agregar-escena-estelar-inmersiva` se acordó implementar únicamente la escena 360 y VR móvil. Su propuesta contempla Three.js/WebGL y orientación del dispositivo sobre la base existente; la instalación PWA y el uso sin conexión se aplazaron expresamente. Los iconos, las fuentes, WebXR y la publicación se evaluarán cuando el alcance de un cambio los necesite.
