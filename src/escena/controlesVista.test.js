import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Vector3 } from 'three'
import {
  LIMITE_INCLINACION,
  UMBRAL_ARRASTRE,
  ajustarOrientacion,
  calcularCuaternionVista,
  crearControlesVista,
  limitarInclinacion,
  normalizarGiro,
} from './controlesVista.js'

function crearElementoSimulado() {
  const elemento = new EventTarget()
  const capturas = new Set()
  elemento.setPointerCapture = (id) => capturas.add(id)
  elemento.releasePointerCapture = (id) => {
    if (capturas.delete(id)) {
      elemento.dispatchEvent(Object.assign(new Event('lostpointercapture'), { pointerId: id }))
    }
  }
  elemento.hasPointerCapture = (id) => capturas.has(id)
  elemento.capturas = capturas
  return elemento
}

function emitirPuntero(elemento, tipo, propiedades) {
  const evento = Object.assign(new Event(tipo, { cancelable: true }), {
    pointerType: 'mouse',
    button: 0,
    pointerId: 1,
    ...propiedades,
  })
  elemento.dispatchEvent(evento)
  return evento
}

function emitirTecla(elemento, key, propiedades = {}) {
  const evento = Object.assign(new Event('keydown', { cancelable: true }), { key, ...propiedades })
  elemento.dispatchEvent(evento)
  return evento
}

const cercaDe = (real, esperado, margen = 1e-9) =>
  assert.ok(Math.abs(real - esperado) <= margen, `${real} no está cerca de ${esperado}`)

describe('límites de la cámara', () => {
  it('limita la inclinación cerca de los polos sin voltear el horizonte', () => {
    assert.equal(limitarInclinacion(10), LIMITE_INCLINACION)
    assert.equal(limitarInclinacion(-10), -LIMITE_INCLINACION)
    assert.equal(limitarInclinacion(0.3), 0.3)
    assert.ok(LIMITE_INCLINACION < Math.PI / 2)
  })

  it('permite rotación horizontal completa normalizando el giro', () => {
    cercaDe(normalizarGiro(Math.PI * 2), 0)
    cercaDe(normalizarGiro(Math.PI * 2 + 0.5), 0.5)
    cercaDe(normalizarGiro(-Math.PI * 2 - 0.5), -0.5)
    assert.equal(normalizarGiro(Math.PI), Math.PI)
    assert.equal(normalizarGiro(-Math.PI), Math.PI)
    const { giro } = ajustarOrientacion({ giro: 7 * Math.PI, inclinacion: 0 })
    assert.ok(giro > -Math.PI && giro <= Math.PI)
  })

  it('la dirección es la misma tras una vuelta completa', () => {
    const delante = new Vector3(0, 0, -1)
    const inicial = delante.clone().applyQuaternion(calcularCuaternionVista({ giro: 0.7, inclinacion: 0.2 }))
    const tras = delante
      .clone()
      .applyQuaternion(calcularCuaternionVista(ajustarOrientacion({ giro: 0.7 + Math.PI * 2, inclinacion: 0.2 })))
    assert.ok(inicial.distanceTo(tras) < 1e-9)
  })

  it('giro positivo mira a la izquierda e inclinación positiva hacia arriba', () => {
    const delante = new Vector3(0, 0, -1)
    const izquierda = delante.clone().applyQuaternion(calcularCuaternionVista({ giro: Math.PI / 2, inclinacion: 0 }))
    assert.ok(izquierda.x < -0.99)
    const arriba = delante.clone().applyQuaternion(calcularCuaternionVista({ giro: 0, inclinacion: 1 }))
    assert.ok(arriba.y > 0)
  })

  it('mantiene el horizonte nivelado: sin giro sobre el eje de la mirada', () => {
    const derecha = new Vector3(1, 0, 0)
    const resultado = derecha
      .clone()
      .applyQuaternion(calcularCuaternionVista({ giro: 1.2, inclinacion: LIMITE_INCLINACION }))
    cercaDe(resultado.y, 0)
  })
})

describe('arrastre con Pointer Events', () => {
  it('cambia la orientación al arrastrar y la conserva al soltar', () => {
    const elemento = crearElementoSimulado()
    const cambios = []
    const controles = crearControlesVista({ elemento, alCambiar: (o) => cambios.push(o), radianesPorPixel: 0.01 })

    emitirPuntero(elemento, 'pointerdown', { clientX: 100, clientY: 100 })
    assert.ok(elemento.capturas.has(1), 'captura el puntero')
    emitirPuntero(elemento, 'pointermove', { clientX: 150, clientY: 80 })
    emitirPuntero(elemento, 'pointerup', {})

    cercaDe(controles.obtenerOrientacion().giro, 0.5)
    cercaDe(controles.obtenerOrientacion().inclinacion, -0.2)
    assert.equal(controles.estaArrastrando(), false)
    assert.equal(elemento.capturas.size, 0)

    emitirPuntero(elemento, 'pointermove', { clientX: 400, clientY: 400 })
    assert.equal(cambios.length, 1, 'mover sin arrastre no cambia la orientación')
    controles.destruir()
  })

  it('libera el arrastre con pointercancel', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento })
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0, pointerType: 'touch' })
    assert.equal(controles.estaArrastrando(), true)
    emitirPuntero(elemento, 'pointercancel', { pointerType: 'touch' })
    assert.equal(controles.estaArrastrando(), false)
    assert.equal(elemento.capturas.size, 0)
    const antes = controles.obtenerOrientacion()
    emitirPuntero(elemento, 'pointermove', { clientX: 300, clientY: 300, pointerType: 'touch' })
    assert.deepEqual(controles.obtenerOrientacion(), antes)
    controles.destruir()
  })

  it('libera el arrastre al perder la captura', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento })
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    emitirPuntero(elemento, 'lostpointercapture', {})
    assert.equal(controles.estaArrastrando(), false)
    controles.destruir()
  })

  it('ignora botones secundarios del mouse y punteros adicionales', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento })
    emitirPuntero(elemento, 'pointerdown', { button: 2, clientX: 0, clientY: 0 })
    assert.equal(controles.estaArrastrando(), false)

    emitirPuntero(elemento, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0, pointerType: 'touch' })
    emitirPuntero(elemento, 'pointerdown', { pointerId: 2, clientX: 0, clientY: 0, pointerType: 'touch' })
    emitirPuntero(elemento, 'pointermove', { pointerId: 2, clientX: 200, clientY: 200, pointerType: 'touch' })
    assert.deepEqual(controles.obtenerOrientacion(), { giro: 0, inclinacion: 0, balanceo: 0 })
    controles.destruir()
  })

  it('limita la inclinación aunque el arrastre sea enorme y da la vuelta horizontal', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento, radianesPorPixel: 0.01 })
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    emitirPuntero(elemento, 'pointermove', { clientX: 1000, clientY: 5000 })
    const { giro, inclinacion } = controles.obtenerOrientacion()
    assert.equal(inclinacion, LIMITE_INCLINACION)
    assert.ok(giro > -Math.PI && giro <= Math.PI)
    controles.destruir()
  })

  it('deja de escuchar al destruirse', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento })
    controles.destruir()
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    assert.equal(controles.estaArrastrando(), false)
  })
})

describe('toques, clics y separación del arrastre', () => {
  function crearEntorno() {
    const elemento = crearElementoSimulado()
    const activaciones = []
    const controles = crearControlesVista({ elemento, alActivar: (evento) => activaciones.push(evento) })
    return { elemento, controles, activaciones }
  }

  function tocar(elemento, x = 100, y = 100) {
    emitirPuntero(elemento, 'pointerdown', { clientX: x, clientY: y, pointerType: 'touch' })
    emitirPuntero(elemento, 'pointerup', { clientX: x, clientY: y, pointerType: 'touch' })
    emitirPuntero(elemento, 'click', { clientX: x, clientY: y })
  }

  it('un toque con oscilación produce una sola activación sin mover la mirada', () => {
    const { elemento, controles, activaciones } = crearEntorno()
    emitirPuntero(elemento, 'pointerdown', { clientX: 100, clientY: 100 })
    emitirPuntero(elemento, 'pointermove', { clientX: 103, clientY: 104 })
    emitirPuntero(elemento, 'pointerup', { clientX: 103, clientY: 104 })
    assert.equal(activaciones.length, 0, 'la única ruta de activación es click')
    emitirPuntero(elemento, 'click', { clientX: 103, clientY: 104 })
    assert.equal(activaciones.length, 1)
    assert.deepEqual(controles.obtenerOrientacion(), { giro: 0, inclinacion: 0, balanceo: 0 })
    assert.equal(elemento.capturas.size, 0)
    controles.destruir()
  })

  it('acumula el movimiento inicial y un arrastre de ida y vuelta nunca activa', () => {
    const { elemento, controles, activaciones } = crearEntorno()
    emitirPuntero(elemento, 'pointerdown', { clientX: 100, clientY: 100 })
    emitirPuntero(elemento, 'pointermove', { clientX: 100 + UMBRAL_ARRASTRE, clientY: 100 })
    cercaDe(controles.obtenerOrientacion().giro, 0)
    emitirPuntero(elemento, 'pointermove', { clientX: 120, clientY: 100 })
    cercaDe(controles.obtenerOrientacion().giro, .1)
    emitirPuntero(elemento, 'pointermove', { clientX: 100, clientY: 100 })
    emitirPuntero(elemento, 'pointerup', { clientX: 100, clientY: 100 })
    emitirPuntero(elemento, 'click', { clientX: 100, clientY: 100 })
    assert.equal(activaciones.length, 0)
    tocar(elemento)
    assert.equal(activaciones.length, 1, 'el siguiente gesto válido funciona')
    controles.destruir()
  })

  for (const tipo of ['pointercancel', 'lostpointercapture']) {
    it(`${tipo} no activa y permite recuperarse en el siguiente toque`, () => {
      const { elemento, controles, activaciones } = crearEntorno()
      emitirPuntero(elemento, 'pointerdown', { clientX: 100, clientY: 100 })
      emitirPuntero(elemento, tipo, { clientX: 100, clientY: 100 })
      emitirPuntero(elemento, 'click', { clientX: 100, clientY: 100 })
      assert.equal(activaciones.length, 0)
      tocar(elemento)
      assert.equal(activaciones.length, 1)
      controles.destruir()
    })
  }

  it('un segundo dedo invalida la activación aunque se suelte antes del primero', () => {
    const { elemento, controles, activaciones } = crearEntorno()
    emitirPuntero(elemento, 'pointerdown', { clientX: 100, clientY: 100, pointerType: 'touch' })
    emitirPuntero(elemento, 'pointerdown', { pointerId: 2, clientX: 200, clientY: 100, pointerType: 'touch' })
    emitirPuntero(elemento, 'pointerup', { pointerId: 2, clientX: 200, clientY: 100 })
    emitirPuntero(elemento, 'pointerup', { clientX: 100, clientY: 100 })
    emitirPuntero(elemento, 'click', { clientX: 200, clientY: 100 })
    emitirPuntero(elemento, 'click', { clientX: 100, clientY: 100 })
    assert.equal(activaciones.length, 0)
    tocar(elemento)
    assert.equal(activaciones.length, 1)
    controles.destruir()
  })

  it('admite el clic aislado del visor, ignora botones secundarios y deja de activar al destruir', () => {
    const { elemento, controles, activaciones } = crearEntorno()
    emitirPuntero(elemento, 'click', { clientX: 10, clientY: 20 })
    emitirPuntero(elemento, 'click', { clientX: 10, clientY: 20, button: 2 })
    assert.equal(activaciones.length, 1)
    controles.destruir()
    tocar(elemento)
    emitirPuntero(elemento, 'click', { clientX: 10, clientY: 20 })
    assert.equal(activaciones.length, 1)
  })
})

describe('teclado y recentrado', () => {
  it('las flechas giran la mirada y no desplazan la página', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento, pasoTeclado: 0.1 })
    const izquierda = emitirTecla(elemento, 'ArrowLeft')
    emitirTecla(elemento, 'ArrowUp')
    assert.equal(izquierda.defaultPrevented, true)
    cercaDe(controles.obtenerOrientacion().giro, 0.1)
    cercaDe(controles.obtenerOrientacion().inclinacion, 0.1)
    emitirTecla(elemento, 'ArrowRight')
    emitirTecla(elemento, 'ArrowDown')
    cercaDe(controles.obtenerOrientacion().giro, 0)
    cercaDe(controles.obtenerOrientacion().inclinacion, 0)
    controles.destruir()
  })

  it('no intercepta teclas que provienen de otro elemento ni con modificadores', () => {
    const elemento = crearElementoSimulado()
    const controles = crearControlesVista({ elemento })
    const boton = new EventTarget()
    const desdeBoton = Object.assign(new Event('keydown', { cancelable: true, bubbles: true }), { key: 'ArrowLeft' })
    boton.dispatchEvent(desdeBoton)
    assert.equal(desdeBoton.defaultPrevented, false)

    const conModificador = emitirTecla(elemento, 'ArrowLeft', { ctrlKey: true })
    const otraTecla = emitirTecla(elemento, 'Enter')
    assert.equal(conModificador.defaultPrevented, false)
    assert.equal(otraTecla.defaultPrevented, false)
    assert.deepEqual(controles.obtenerOrientacion(), { giro: 0, inclinacion: 0, balanceo: 0 })
    controles.destruir()
  })

  it('recentrar vuelve a la dirección inicial sin tocar nada más', () => {
    const elemento = crearElementoSimulado()
    const cambios = []
    const controles = crearControlesVista({ elemento, alCambiar: (o) => cambios.push(o) })
    emitirTecla(elemento, 'ArrowLeft')
    emitirTecla(elemento, 'ArrowUp')
    controles.recentrar()
    assert.deepEqual(controles.obtenerOrientacion(), { giro: 0, inclinacion: 0, balanceo: 0 })
    assert.deepEqual(cambios.at(-1), { giro: 0, inclinacion: 0, balanceo: 0 })
    controles.destruir()
  })
})
