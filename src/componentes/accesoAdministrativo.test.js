import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

// Pruebas de representación estática del acceso administrativo y de su botón para mostrar la
// contraseña. La interacción (alternar, foco, selección, teclado y toque) se verifica en el navegador.
let vite
let modulo
before(async () => {
  vite = await createServer({ cacheDir: 'node_modules/.vite-pruebas-acceso', server: { middlewareMode: true, hmr: false, watch: null } })
  modulo = await vite.ssrLoadModule('/src/componentes/accesoAdministrativo.jsx')
})
after(async () => { await vite?.close() })

const nada = () => {}
const campo = (propiedades = {}) => renderToStaticMarkup(createElement(modulo.CampoContrasena, {
  visible: false, valor: '', alCambiar: nada, alAlternar: nada, entradaRef: { current: null }, ...propiedades,
}))
const acceso = () => renderToStaticMarkup(createElement(modulo.AccesoAdministrativo, { alIniciarSesion: nada }))

describe('acceso administrativo: contraseña oculta por defecto', () => {
  it('el campo es de tipo password y conserva el autocompletado', () => {
    const html = acceso()
    assert.match(html, /<input[^>]*id="admin-contrasena"[^>]*type="password"/)
    assert.match(html, /<input[^>]*type="password"[^>]*autoComplete="current-password"/)
    assert.match(html, /<input[^>]*id="admin-usuario"[^>]*autoComplete="username"/)
    assert.equal(html.includes('type="text"'), false)
  })

  it('el botón del ojo no envía el formulario: sigue habiendo un solo botón de envío', () => {
    const html = acceso()
    assert.equal(html.split('type="submit"').length - 1, 1)
    assert.match(html, /<button[^>]*class="admin-acceso__ojo"[^>]*type="button"/)
  })

  it('el botón se anuncia como «Mostrar contraseña» y no está pulsado', () => {
    const html = acceso()
    assert.match(html, /<button[^>]*aria-label="Mostrar contraseña"[^>]*aria-pressed="false"/)
    assert.match(html, /<button[^>]*title="Mostrar contraseña"/)
  })

  it('la etiqueta sigue asociada al campo y el botón queda dentro del mismo contenedor', () => {
    const html = acceso()
    assert.match(html, /<label for="admin-contrasena">Contraseña<\/label>/)
    const contenedor = html.match(/<div class="admin-acceso__campo-contrasena">(.*?)<\/div>/s)?.[1] ?? ''
    assert.ok(contenedor.indexOf('<input') >= 0 && contenedor.indexOf('<button') > contenedor.indexOf('<input'))
  })
})

describe('campo de contraseña: icono y estados', () => {
  it('oculta: ojo abierto, aria-hidden, stroke currentColor y sin dependencias', () => {
    const html = campo({ visible: false })
    assert.match(html, /<input[^>]*type="password"/)
    const svg = html.match(/<svg[^>]*>.*?<\/svg>/s)?.[0] ?? ''
    assert.match(svg, /aria-hidden="true"/)
    assert.match(svg, /stroke="currentColor"/)
    assert.match(svg, /focusable="false"/)
    assert.ok(svg.includes('<circle'), 'el ojo abierto lleva pupila')
    assert.equal(svg.includes('M2 2l20 20'), false, 'sin trazo tachado')
    assert.equal(html.split('<svg').length - 1, 1)
  })

  it('visible: type="text", ojo tachado y «Ocultar contraseña» pulsado', () => {
    const html = campo({ visible: true })
    assert.match(html, /<input[^>]*type="text"/)
    assert.equal(html.includes('type="password"'), false)
    assert.match(html, /<button[^>]*aria-label="Ocultar contraseña"[^>]*aria-pressed="true"/)
    const svg = html.match(/<svg[^>]*>.*?<\/svg>/s)?.[0] ?? ''
    assert.ok(svg.includes('M2 2l20 20'), 'el ojo tachado lleva la diagonal')
    assert.equal(svg.includes('<circle'), false)
    assert.match(svg, /aria-hidden="true"/)
  })

  it('en ambos estados conserva autocompletado y evita corrección ortográfica y mayúsculas automáticas', () => {
    for (const visible of [false, true]) {
      const html = campo({ visible })
      assert.match(html, /<input[^>]*autoComplete="current-password"/)
      assert.match(html, /<input[^>]*spellCheck="false"/)
      assert.match(html, /<input[^>]*autoCapitalize="none"/)
      assert.match(html, /<input[^>]*required=""/)
    }
  })

  it('no repite la contraseña fuera del valor del campo', () => {
    const html = campo({ visible: true, valor: 'clave-de-prueba-123' })
    assert.equal(html.split('clave-de-prueba-123').length - 1, 1)
    assert.match(html, /<input[^>]*value="clave-de-prueba-123"/)
  })
})

describe('estilos del botón del ojo', () => {
  const css = readFileSync(new URL('./temaAdministrativo.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  const bloque = (selector) => css.match(new RegExp(`${selector.replace(/[.[\]]/g, '\\$&')} \\{([^}]*)\\}`))?.[1] ?? ''

  it('mide al menos 44 px y queda alineado a la derecha del campo', () => {
    const reglas = bloque('.admin-acceso__tarjeta .admin-acceso__ojo')
    assert.match(reglas, /width: 44px/)
    assert.match(reglas, /height: 44px/)
    assert.match(reglas, /position: absolute/)
    assert.match(reglas, /inset-inline-end: \d+px/)
  })

  it('el texto del campo no queda tapado: relleno derecho mayor que el botón', () => {
    const reglas = bloque('.admin-acceso__tarjeta .admin-acceso__campo-contrasena input')
    const relleno = Number(reglas.match(/padding-inline-end: (\d+)px/)?.[1])
    assert.ok(relleno >= 46, `padding-inline-end ${relleno}`)
  })

  it('tiene foco visible', () => {
    assert.match(css, /\.admin-acceso__ojo:focus-visible \{[^}]*outline: 2px solid/)
  })
})
