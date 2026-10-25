import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Vector3 } from 'three'
import { crearFichaCuerpoVr } from './fichaCuerpoVr.js'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { obtenerZonasNavegacion } from './contenidoFicha.js'
import { etiquetaCubiertaPorFicha } from './etiquetasPlanetas.js'

function preparar(t) {
  const anteriores = ['document', 'Image'].map((clave) => [clave, Object.getOwnPropertyDescriptor(globalThis, clave)])
  const imagenes = []
  let dibujos = 0
  const contexto = { font: '', fillRect() { dibujos += 1 }, strokeRect() {}, fillText() {}, drawImage() {}, measureText(texto) { return { width: texto.length * parseFloat(this.font) * .5 } } }
  const lienzo = { width: 0, height: 0, getContext: () => contexto }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => lienzo } })
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: class ImagenSimulada { constructor() { imagenes.push(this) } } })
  t.after(() => anteriores.forEach(([clave, descriptor]) => { if (descriptor) Object.defineProperty(globalThis, clave, descriptor); else delete globalThis[clave] }))
  const cambios = []
  const ficha = crearFichaCuerpoVr({ alCambiarLectura: (estado) => cambios.push(estado) })
  t.after(() => ficha.destruir())
  return { ficha, cambios, imagenes, lienzo, obtenerDibujos: () => dibujos }
}

it('un plano compartido permite apuntar acciones reales y conserva la lectura al reubicar', (t) => {
  const { ficha, lienzo } = preparar(t)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.ajustar(900, 450)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  assert.equal(ficha.malla.visible, false)
  ficha.establecerModo('vr')
  ficha.reubicar(camara)
  assert.equal(ficha.malla.visible, true)
  assert.equal(ficha.detectar(camara)?.accion, null, 'aparece enfrente, con la cruz sobre la lectura y no sobre un botón')
  const { pagina, total } = ficha.obtenerLectura()
  const zona = obtenerZonasNavegacion(lienzo.width, lienzo.height, pagina, total).find((z) => z.accion === 'siguiente')
  const punto = new Vector3((zona.x + zona.ancho / 2) / lienzo.width - .5, .5 - (zona.y + zona.alto / 2) / lienzo.height, 0)
  ficha.malla.localToWorld(punto)
  camara.lookAt(punto)
  assert.equal(ficha.detectar(camara).accion, 'siguiente')
  ficha.moverPagina(1)
  const despues = ficha.obtenerLectura().pagina
  ficha.reubicar(camara)
  assert.equal(ficha.obtenerLectura().pagina, despues)
  ficha.mostrarSeccion(3)
  assert.equal(ficha.obtenerLectura().pagina, 3)
  assert.equal(ficha.mostrarSeccion(3), false)
  ficha.establecerModo('normal')
  assert.equal(ficha.malla.visible, false)
  assert.equal(ficha.obtenerLectura().pagina, 0)
})

it('sin cambios no redibuja; libera cada recurso una vez e ignora imágenes tardías', (t) => {
  const { ficha, imagenes, obtenerDibujos } = preparar(t)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  const dibujoAntes = obtenerDibujos()
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  assert.equal(obtenerDibujos(), dibujoAntes)
  const tardia = imagenes[0].onload
  ficha.establecerCuerpo(CUERPOS_CELESTES[1])
  const actual = obtenerDibujos()
  tardia()
  assert.equal(obtenerDibujos(), actual)
  const recursos = [ficha.malla.geometry, ficha.malla.material, ficha.malla.material.map]
  const liberados = recursos.map(() => 0)
  recursos.forEach((r, i) => r.addEventListener('dispose', () => { liberados[i] += 1 }))
  const callback = imagenes[1].onload
  ficha.destruir(); ficha.destruir(); callback()
  assert.deepEqual(liberados, [1, 1, 1])
  assert.equal(ficha.malla.visible, false)
  assert.equal(imagenes[1].onload, null)
})

it('las etiquetas cubiertas por la tarjeta no atraviesan el texto y las demás se conservan', () => {
  const camara = new PerspectiveCamera(70, 1, .1, 1000)
  camara.updateMatrixWorld(true)
  const plano = new Mesh(new PlaneGeometry(10, 10), new MeshBasicMaterial())
  plano.position.z = -10
  assert.equal(etiquetaCubiertaPorFicha({ x: 400, y: 400 }, plano, camara, 800, 800), true)
  assert.equal(etiquetaCubiertaPorFicha({ x: 10, y: 20 }, plano, camara, 800, 800), false)
  plano.visible = false
  assert.equal(etiquetaCubiertaPorFicha({ x: 400, y: 400 }, plano, camara, 800, 800), false)
  plano.geometry.dispose(); plano.material.dispose()
})
