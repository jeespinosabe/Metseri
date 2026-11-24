import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

// Prueba de caracterización (MN-26): fija el marcado del diálogo «Instalar o descargar» tal como estaba
// ANTES de mover la instalación a un componente exportado. Debe seguir pasando sin modificarse.
//
// El diálogo y DescargaSinConexion usan useSyncExternalStore sin getServerSnapshot, y React no puede
// renderizarlos en servidor así. Solo en esta prueba se agrega ese tercer argumento al código cargado;
// los archivos del proyecto no cambian. Se renderiza la versión de desarrollo (import.meta.env.PROD
// es falso), por lo que no cubre los avisos de producción: esos los cubren los casos MN manuales.
const conSnapshotDeServidor = {
  name: 'snapshot-de-servidor-solo-prueba',
  enforce: 'pre',
  transform(codigo, id) {
    if (!/[\\/](dialogoAplicacionMetseri|descargaSinConexion)\.jsx/.test(id)) return null
    return codigo.replace(/useSyncExternalStore\(([A-Za-z]+),\s*([A-Za-z]+)\)/g, 'useSyncExternalStore($1, $2, $2)')
  },
}

const MARCADO_ANTERIOR = '<dialog class="aplicacion-metseri" aria-labelledby="_R_0_"><header class="aplicacion-metseri__cabecera"><h2 id="_R_0_">Instalar o descargar</h2><form method="dialog"><button class="aplicacion-metseri__cerrar" type="submit" aria-label="Cerrar"><span aria-hidden="true">×</span></button></form></header><section class="aplicacion-metseri__instalacion"><button class="aplicacion-metseri__opcion" type="button" aria-disabled="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="3"></rect><path d="M12 8v8m-3-3 3 3 3-3"></path></svg>Instalar Metseri</button><div aria-live="polite"></div></section><section class="aplicacion-metseri__sin-conexion"><p>La descarga está disponible en la versión de producción.</p></section></dialog>'

let vite
let modulo
before(async () => {
  globalThis.window = { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }), isSecureContext: false, addEventListener() {}, removeEventListener() {} }
  vite = await createServer({ cacheDir: 'node_modules/.vite-pruebas-dialogo', plugins: [conSnapshotDeServidor], server: { middlewareMode: true, hmr: false, watch: null } })
  modulo = await vite.ssrLoadModule('/src/componentes/dialogoAplicacionMetseri.jsx')
})
after(async () => {
  await vite?.close()
  delete globalThis.window
})

describe('diálogo «Instalar o descargar» (MN-26)', () => {
  const representar = (abierto) => renderToStaticMarkup(createElement(modulo.DialogoAplicacionMetseri, { abierto, alCerrar() {} }))

  it('su marcado no cambia al mover la instalación a un componente exportado', () => {
    assert.equal(representar(false), MARCADO_ANTERIOR)
  })

  it('el marcado es el mismo con el diálogo abierto o cerrado antes de interactuar', () => {
    assert.equal(representar(true), MARCADO_ANTERIOR)
  })

  it('conserva los textos y controles que ven las personas', () => {
    const html = representar(false)
    for (const texto of ['Instalar o descargar', 'Instalar Metseri', 'aria-label="Cerrar"', 'La descarga está disponible en la versión de producción.']) {
      assert.ok(html.includes(texto), texto)
    }
    assert.equal(html.split('Instalar Metseri').length - 1, 1)
  })
})
