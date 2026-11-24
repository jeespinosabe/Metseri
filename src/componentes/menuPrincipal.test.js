import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

// Pruebas de representación estática del Menú, de «Acerca de» y del banner. La interacción (abrir,
// cerrar, Escape, toque, VR, instalación y descarga reales) se verifica en el navegador (MN-04 a MN-22).
//
// Los componentes de instalar y descargar usan useSyncExternalStore sin getServerSnapshot, y React no
// puede renderizarlos en servidor así. Solo en esta prueba se agrega ese tercer argumento al código
// cargado; los archivos del proyecto no cambian. Se renderiza la versión de desarrollo.
const conSnapshotDeServidor = {
  name: 'snapshot-de-servidor-solo-prueba',
  enforce: 'pre',
  transform(codigo, id) {
    if (!/[\\/](dialogoAplicacionMetseri|descargaSinConexion)\.jsx/.test(id)) return null
    return codigo.replace(/useSyncExternalStore\(([A-Za-z]+),\s*([A-Za-z]+)\)/g, 'useSyncExternalStore($1, $2, $2)')
  },
}

let vite
let componentes
before(async () => {
  globalThis.window = { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }), isSecureContext: false, addEventListener() {}, removeEventListener() {} }
  vite = await createServer({ cacheDir: 'node_modules/.vite-pruebas-menu', plugins: [conSnapshotDeServidor], server: { middlewareMode: true, hmr: false, watch: null } })
  componentes = {
    ...(await vite.ssrLoadModule('/src/componentes/menuPrincipal.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/dialogoAcercaDe.jsx')),
    ...(await vite.ssrLoadModule('/src/datos/acercaDe.js')),
    ...(await vite.ssrLoadModule('/src/componentes/franjaInstitucional.jsx')),
  }
})
after(async () => {
  await vite?.close()
  delete globalThis.window
})

const nada = () => {}
const representar = (nombre, propiedades = {}) => renderToStaticMarkup(createElement(componentes[nombre], propiedades))
const menu = (abierto) => representar('MenuPrincipal', {
  abierto, botonRef: { current: null }, alAlternar: nada, alCerrar: nada, alAbrirAdministracion: nada, alAbrirAcerca: nada,
})
const contar = (html, texto) => html.split(texto).length - 1

describe('Acerca de (MN-16, MN-17)', () => {
  it('conserva los nombres de los desarrolladores tal como se indicaron', () => {
    assert.deepEqual([...componentes.DESARROLLADORES], [
      'Espinosa Benítez Jesús', 'Garay Ocegueda Francisco Daniel', 'García Vázquez Edgar Daniel', 'Gonzalez Zapete Sophia',
    ])
    assert.equal(componentes.CARRERA, 'Ingeniería en Sistemas Computacionales')
    assert.equal(componentes.INSTITUCION, 'Instituto Tecnológico de Tepic')
  })

  it('muestra los cuatro nombres, la carrera y la institución, y se puede cerrar', () => {
    const html = representar('DialogoAcercaDe', { abierto: false, alCerrar: nada })
    assert.ok(html.startsWith('<dialog'))
    assert.match(html, /<h2 id="[^"]+">Acerca de<\/h2>/)
    assert.ok(html.includes('aria-label="Cerrar"'))
    for (const nombre of ['Espinosa Benítez Jesús', 'Garay Ocegueda Francisco Daniel', 'García Vázquez Edgar Daniel', 'Gonzalez Zapete Sophia']) {
      assert.ok(html.includes(`<li>${nombre}</li>`), nombre)
    }
    assert.equal(contar(html, '<li>'), 4)
    assert.ok(html.includes('<p>Ingeniería en Sistemas Computacionales</p>'))
    assert.ok(html.includes('<p>Instituto Tecnológico de Tepic</p>'))
  })
})

describe('Menú del banner (MN-01, MN-02)', () => {
  it('es un control con nombre accesible que indica si está expandido y controla su panel', () => {
    const cerrado = menu(false)
    assert.match(cerrado, /<button[^>]*aria-label="Menú"[^>]*aria-expanded="false"[^>]*aria-controls="([^"]+)"/)
    const idPanel = cerrado.match(/aria-controls="([^"]+)"/)[1]
    assert.ok(cerrado.includes(`id="${idPanel}" class="menu-principal__panel" hidden=""`))
    const abierto = menu(true)
    assert.match(abierto, /aria-expanded="true"/)
    assert.equal(abierto.includes('menu-principal__panel" hidden'), false)
  })

  it('es un disclosure: no usa role="menu" porque contiene los botones existentes', () => {
    assert.equal(/role="menu(item)?"/.test(menu(true)), false)
  })

  it('ofrece, en este orden, Instalar Metseri, la descarga sin conexión, Administración y Acerca de', () => {
    const html = menu(true)
    const orden = ['Instalar Metseri', 'La descarga está disponible en la versión de producción.', 'href="/admin"', '>Acerca de<'].map((texto) => html.indexOf(texto))
    assert.ok(orden.every((posicion) => posicion >= 0), `faltan opciones: ${orden}`)
    assert.deepEqual([...orden].sort((a, b) => a - b), orden)
    assert.ok(html.includes('Administración'))
  })

  it('el panel permanece montado aunque el Menú esté cerrado (conserva el estado de la descarga)', () => {
    const cerrado = menu(false)
    for (const texto of ['Instalar Metseri', 'aplicacion-metseri__sin-conexion', 'href="/admin"', 'Acerca de']) assert.ok(cerrado.includes(texto), texto)
  })

  it('reutiliza los controles existentes con sus clases y textos', () => {
    const html = menu(true)
    assert.ok(html.includes('<section class="aplicacion-metseri__instalacion"><button class="aplicacion-metseri__opcion" type="button" aria-disabled="false">'))
    assert.ok(html.includes('<section class="aplicacion-metseri__sin-conexion">'))
  })
})

describe('banner sin accesos sueltos (MN-03, MN-27)', () => {
  let banner
  before(() => { banner = representar('FranjaInstitucional', { activa: true, alAbrirAdministracion: nada }) })

  it('Administración y la descarga ya no están sueltas en el banner', () => {
    assert.equal(banner.includes('franja-institucional__administracion'), false)
    assert.equal(banner.includes('franja-institucional__descarga'), false)
    assert.equal(banner.includes('aria-label="Instalar o descargar"'), false)
    assert.equal(banner.includes('aria-haspopup="dialog"'), false)
    assert.equal(banner.includes('Instalar o descargar'), false)
  })

  it('Administración aparece una sola vez y dentro del panel del Menú', () => {
    assert.equal(contar(banner, 'href="/admin"'), 1)
    assert.ok(banner.indexOf('href="/admin"') > banner.indexOf('menu-principal__panel'))
  })

  it('hay una sola instancia de instalar y de descargar y un solo diálogo (el de Acerca de)', () => {
    assert.equal(contar(banner, 'Instalar Metseri'), 1)
    assert.equal(contar(banner, 'aplicacion-metseri__sin-conexion'), 1)
    assert.equal(contar(banner, '<dialog'), 1)
    assert.ok(banner.includes('>Acerca de</h2>'))
  })

  it('mantiene la marca, los logos institucionales y el nombre de las acciones', () => {
    assert.ok(banner.includes('aria-label="Acciones de Metseri"'))
    assert.ok(banner.includes('alt="Biblioteca Pública Central Estatal Solón Argüello"'))
    assert.ok(banner.includes('alt="Instituto Tecnológico de Tepic"'))
    assert.ok(banner.includes('aria-label="Menú"'))
  })
})
