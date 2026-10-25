import assert from 'node:assert/strict'
import { it } from 'node:test'
import { crearApuntadoMouse } from './apuntadoMouse.js'
import { crearSeleccionPlanetas } from './seleccionPlanetas.js'

function crearEntorno(t) {
  const elemento = new EventTarget()
  const documento = new EventTarget()
  const ventana = new EventTarget()
  const rectangulo = { left: 100, top: 50, right: 500, bottom: 350, width: 400, height: 300 }
  const cambios = []
  let visible = elemento
  elemento.getBoundingClientRect = () => ({ ...rectangulo })
  elemento.contains = (objetivo) => objetivo === elemento
  documento.elementFromPoint = () => visible
  const apuntado = crearApuntadoMouse({ elemento, documento, ventana, alActualizar: (posicion, area) => cambios.push({ posicion, area }) })
  t.after(() => apuntado.destruir())
  const emitir = (tipo, propiedades = {}) => elemento.dispatchEvent(Object.assign(new Event(tipo), { pointerType: 'mouse', clientX: 200, clientY: 150, ...propiedades }))
  return { elemento, documento, ventana, rectangulo, cambios, apuntado, emitir, cubrir: () => { visible = {} } }
}

it('actualiza sin clic, recalcula el rectángulo con mouse inmóvil y descarta superficies cubiertas', (t) => {
  const { apuntado, emitir, cambios, rectangulo, cubrir } = crearEntorno(t)
  emitir('pointermove')
  assert.deepEqual(cambios.at(-1).posicion, { clientX: 200, clientY: 150 })
  rectangulo.width = 450
  apuntado.recalcular()
  assert.equal(cambios.at(-1).area.width, 450)
  cubrir()
  apuntado.recalcular()
  assert.equal(cambios.at(-1).posicion, null)
})

it('salir, cancelar, perder foco y ocultar la página limpian el apuntado', (t) => {
  const { emitir, cambios, ventana, documento } = crearEntorno(t)
  for (const tipo of ['pointerleave', 'pointercancel']) {
    emitir('pointermove'); emitir(tipo)
    assert.equal(cambios.at(-1).posicion, null)
  }
  emitir('pointermove'); ventana.dispatchEvent(new Event('blur'))
  assert.equal(cambios.at(-1).posicion, null)
  emitir('pointermove'); documento.hidden = true; documento.dispatchEvent(new Event('visibilitychange'))
  assert.equal(cambios.at(-1).posicion, null)
})

it('captura fuera del lienzo y toque no dejan hover; destruir retira los eventos', (t) => {
  const { apuntado, emitir, cambios } = crearEntorno(t)
  emitir('pointermove', { clientX: 600 })
  assert.equal(cambios.at(-1).posicion, null)
  emitir('pointermove'); emitir('pointerdown', { pointerType: 'touch' })
  assert.equal(cambios.at(-1).posicion, null)
  const antes = cambios.length
  emitir('pointermove', { pointerType: 'touch' })
  assert.equal(cambios.length, antes)
  apuntado.destruir()
  const final = cambios.length
  emitir('pointermove')
  assert.equal(cambios.length, final)
})

it('mouse, selección y mirada permanecen independientes al cambiar de objetivo y modo', () => {
  let objetivo = 'tierra'
  const cambios = []
  const seleccion = crearSeleccionPlanetas({ detector: { detectarPosicion: () => objetivo, detectarMirada: () => 'saturno' }, alCambiar: (estado) => cambios.push(estado) })
  seleccion.actualizarMouse({ clientX: 1, clientY: 1 }, {})
  assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'tierra', planetaSeleccionado: null })
  seleccion.activar({}, {})
  objetivo = 'marte'
  seleccion.actualizarMirada()
  assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'marte', planetaSeleccionado: 'tierra' })
  seleccion.quitarSeleccion()
  assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'marte', planetaSeleccionado: null })
  seleccion.establecerModo('vr')
  assert.equal(seleccion.obtenerEstado().planetaApuntado, 'saturno')
  seleccion.establecerModo('normal')
  assert.equal(seleccion.obtenerEstado().planetaApuntado, null)
  const cantidad = cambios.length
  seleccion.actualizarMouse(null, {})
  assert.equal(cambios.length, cantidad)
  seleccion.destruir()
})
