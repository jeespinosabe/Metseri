import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Vector3 } from 'three'
import { crearFichaCuerpoVr } from './fichaCuerpoVr.js'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { obtenerZonasNavegacion } from './contenidoFicha.js'
import { etiquetaCubiertaPorFicha } from './etiquetasPlanetas.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido } from '../servicios/consultaContenido.js'

function preparar(t) {
  const anteriores = ['document', 'Image'].map((clave) => [clave, Object.getOwnPropertyDescriptor(globalThis, clave)])
  const imagenes = []
  let dibujos = 0
  const textos = []
  const contexto = { font: '', fillRect() { dibujos += 1 }, strokeRect() {}, fillText(texto) { textos.push(texto) }, drawImage() {}, measureText(texto) { return { width: texto.length * parseFloat(this.font) * .5 } } }
  const lienzo = { width: 0, height: 0, getContext: () => contexto }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => lienzo } })
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: class ImagenSimulada { constructor() { imagenes.push(this) } } })
  t.after(() => anteriores.forEach(([clave, descriptor]) => { if (descriptor) Object.defineProperty(globalThis, clave, descriptor); else delete globalThis[clave] }))
  const cambios = []
  const ficha = crearFichaCuerpoVr({ alCambiarLectura: (estado) => cambios.push(estado) })
  t.after(() => ficha.destruir())
  return { ficha, cambios, imagenes, lienzo, textos, obtenerDibujos: () => dibujos }
}

it('rellena el Canvas, conserva Libros al llegar la API y navega continuaciones con las mismas pestañas', (t) => {
  const { ficha, cambios, textos, obtenerDibujos } = preparar(t)
  const cuerpo = CUERPOS_CELESTES.find((registro) => registro.id === 'luna')
  const fuente = FICHAS_PRUEBA.find((registro) => registro.slug === cuerpo.id)
  const contenido = { fase: 'disponible', ficha: adaptarContenido(cuerpo, fuente) }
  ficha.ajustar(350, 200)
  ficha.establecerCuerpo(cuerpo)
  ficha.establecerModo('vr')
  ficha.mostrarSeccion(3)
  ficha.establecerContenido(contenido)
  assert.equal(cambios.at(-1).seccion, 'libros')
  assert.ok(ficha.obtenerLectura().pagina > 3)
  ficha.mostrarSeccion(0)
  textos.length = 0
  ficha.establecerModo('vr')
  while (cambios.at(-1).seccion === 'resumen') {
    if (!ficha.moverPagina(1)) break
  }
  assert.ok(textos.some((texto) => texto.includes('La Luna')))
  const cantidad = obtenerDibujos()
  ficha.establecerContenido(contenido)
  assert.equal(obtenerDibujos(), cantidad)
  ficha.mostrarSeccion(3)
  ficha.ajustar(900, 450)
  assert.equal(cambios.at(-1).seccion, 'libros')
  ficha.establecerModo('normal')
  assert.equal(ficha.obtenerLectura().pagina, 0)
  ficha.establecerModo('vr')
  assert.equal(cambios.at(-1).seccion, 'resumen')
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  assert.equal(ficha.obtenerLectura().total, 4)
  ficha.destruir()
  const ultimo = obtenerDibujos()
  ficha.establecerContenido(contenido)
  assert.equal(obtenerDibujos(), ultimo)
})

it('carga y error aparecen dentro del visor y no impiden cerrar o cambiar seccion', (t) => {
  const { ficha, textos, cambios } = preparar(t)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  ficha.establecerModo('vr')
  ficha.establecerContenido({ fase: 'cargando' })
  assert.ok(textos.includes('Cargando información...'))
  ficha.establecerContenido({ fase: 'error' })
  ficha.mostrarSeccion(3)
  assert.equal(cambios.at(-1).seccion, 'libros')
  assert.ok(textos.join(' ').includes('No se pudo cargar la información.'))
  ficha.establecerCuerpo(null)
  assert.equal(ficha.malla.visible, false)
})

it('cada luna conserva identidad, relación e imagen al navegar y alternar modos', (t) => {
  const { ficha, textos, imagenes } = preparar(t)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.establecerModo('vr')
  for (const cuerpo of CUERPOS_CELESTES.filter((registro) => registro.tipo === 'satelite')) {
    textos.length = 0
    ficha.establecerCuerpo(cuerpo)
    ficha.reubicar(camara)
    assert.ok(textos.includes(cuerpo.nombre))
    assert.ok(textos.includes(cuerpo.clasificacion.toUpperCase()))
    assert.equal(imagenes.at(-1).src, cuerpo.imagen)
    assert.deepEqual(ficha.obtenerLectura(), { cuerpoId: cuerpo.id, pagina: 0, total: 4 })
    ficha.mostrarSeccion(1)
    assert.ok(textos.includes('Distancia al planeta'))
    ficha.mostrarSeccion(3)
    ficha.reubicar(camara)
    assert.equal(ficha.obtenerLectura().pagina, 3)
    ficha.establecerModo('normal')
    assert.equal(ficha.obtenerLectura().cuerpoId, cuerpo.id)
    assert.equal(ficha.obtenerLectura().pagina, 0)
    assert.equal(ficha.malla.visible, false)
    ficha.establecerModo('vr')
    ficha.establecerCuerpo(CUERPOS_CELESTES.find((registro) => registro.id === cuerpo.planetaId))
    assert.equal(ficha.obtenerLectura().cuerpoId, cuerpo.planetaId)
  }
})

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
