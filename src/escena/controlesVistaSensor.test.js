import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { crearControlesVista } from './controlesVista.js'

const cercaDe = (real, esperado, margen = 1e-9) =>
  assert.ok(Math.abs(real - esperado) <= margen, `${real} no está cerca de ${esperado}`)
const GRADOS = Math.PI / 180
const ORIENTACION_INICIAL = { giro: 0, inclinacion: 0, balanceo: 0 }

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
  return elemento
}

function emitirPuntero(elemento, tipo, propiedades) {
  elemento.dispatchEvent(
    Object.assign(new Event(tipo, { cancelable: true }), {
      pointerType: 'mouse',
      button: 0,
      pointerId: 1,
      ...propiedades,
    }),
  )
}

function emitirTecla(elemento, key) {
  elemento.dispatchEvent(Object.assign(new Event('keydown', { cancelable: true }), { key }))
}

// Sensor simulado: cada activación guarda su callback de lecturas y su promesa.
function crearSensorFalso() {
  const sensor = {
    activaciones: [],
    cancelaciones: 0,
    activar(alLectura) {
      let resolver
      const promesa = new Promise((ok) => {
        resolver = ok
      })
      sensor.activaciones.push({ alLectura, resolver })
      return promesa
    },
    cancelar() {
      sensor.cancelaciones += 1
    },
    ultimo: () => sensor.activaciones.at(-1),
  }
  return sensor
}

const lecturaVertical = (alpha, beta = 90, gamma = 0) => ({ alpha, beta, gamma })
const microtareas = () => new Promise((resolver) => setTimeout(resolver, 0))

function crearEntorno(opciones = {}) {
  const elemento = crearElementoSimulado()
  const sensor = crearSensorFalso()
  const avisos = []
  const cambios = []
  const controles = crearControlesVista({
    elemento,
    sensor,
    alAvisar: (estado) => avisos.push(estado),
    alCambiar: (orientacion) => cambios.push(orientacion),
    ...opciones,
  })
  return { elemento, sensor, avisos, cambios, controles }
}

describe('seguimiento con sensor', () => {
  it('la primera lectura conserva la orientación visible, incluido el balanceo (sin salto)', () => {
    const { elemento, sensor, cambios, controles } = crearEntorno()
    emitirTecla(elemento, 'ArrowLeft')
    emitirTecla(elemento, 'ArrowUp')
    controles.establecerOrientacion({ ...controles.obtenerOrientacion(), balanceo: 0.2 })
    const antes = controles.obtenerOrientacion()

    controles.entrarVr()
    assert.equal(controles.obtenerFuente(), 'solicitando')
    sensor.ultimo().alLectura(lecturaVertical(200, 70, 15))

    assert.equal(controles.obtenerFuente(), 'sensor')
    const despues = cambios.at(-1)
    cercaDe(despues.giro, antes.giro)
    cercaDe(despues.inclinacion, antes.inclinacion)
    cercaDe(despues.balanceo, antes.balanceo)
  })

  it('al girar el dispositivo la mirada gira lo mismo', () => {
    const { sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(100))
    const inicial = controles.obtenerOrientacion()
    sensor.ultimo().alLectura(lecturaVertical(130))
    cercaDe(controles.obtenerOrientacion().giro - inicial.giro, 30 * GRADOS)
    sensor.ultimo().alLectura(lecturaVertical(130, 110))
    assert.ok(controles.obtenerOrientacion().inclinacion > inicial.inclinacion)
  })

  it('compensa el ángulo de la pantalla en cada lectura', () => {
    let angulo = 0
    const { sensor, controles } = crearEntorno({ obtenerAnguloPantalla: () => angulo })
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(0, 90, 0))
    const antes = controles.obtenerOrientacion()
    angulo = 90
    sensor.ultimo().alLectura(lecturaVertical(0, 90, 0))
    const despues = controles.obtenerOrientacion()
    // Cambiar el ángulo solo balancea la cámara; el frente (giro e inclinación) no se altera.
    cercaDe(despues.giro, antes.giro)
    cercaDe(despues.inclinacion, antes.inclinacion)
    assert.ok(Math.abs(despues.balanceo - antes.balanceo) > 1)
  })

  it('recentrar con sensor activo fija el rumbo actual como frente y sigue rastreando', () => {
    const { sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(10, 80))
    sensor.ultimo().alLectura(lecturaVertical(70, 100))
    controles.recentrar()
    assert.equal(controles.obtenerFuente(), 'sensor')
    cercaDe(controles.obtenerOrientacion().giro, 0)
    const inclinacion = controles.obtenerOrientacion().inclinacion
    assert.ok(Math.abs(inclinacion) > 0.1, 'conserva la inclinación natural')

    sensor.ultimo().alLectura(lecturaVertical(100, 100)) // 30 grados más de giro
    cercaDe(controles.obtenerOrientacion().giro, 30 * GRADOS)
    cercaDe(controles.obtenerOrientacion().inclinacion, inclinacion)
  })

  it('recentrar sin sensor vuelve a la dirección inicial', () => {
    const { elemento, controles } = crearEntorno()
    emitirTecla(elemento, 'ArrowLeft')
    controles.recentrar()
    assert.deepEqual(controles.obtenerOrientacion(), ORIENTACION_INICIAL)
  })
})

describe('cambio a control manual con sensor', () => {
  it('un arrastre con el sensor activo pasa a manual conservando la orientación completa', () => {
    const { elemento, sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(40, 80, 25))
    sensor.ultimo().alLectura(lecturaVertical(55, 85, 30))
    const mostrada = controles.obtenerOrientacion()

    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    assert.equal(controles.obtenerFuente(), 'manual')
    assert.ok(sensor.cancelaciones >= 1)
    assert.deepEqual(controles.obtenerOrientacion(), mostrada)

    emitirPuntero(elemento, 'pointermove', { clientX: 20, clientY: 0 })
    assert.equal(controles.obtenerOrientacion().balanceo, mostrada.balanceo, 'conserva el balanceo')
    assert.notEqual(controles.obtenerOrientacion().giro, mostrada.giro)

    // el sensor ya no modifica la mirada
    const congelada = controles.obtenerOrientacion()
    sensor.ultimo().alLectura(lecturaVertical(300, 20))
    assert.deepEqual(controles.obtenerOrientacion(), congelada)
  })

  it('las flechas con el sensor pendiente cancelan la activación', async () => {
    const { elemento, sensor, avisos, controles } = crearEntorno()
    controles.entrarVr()
    emitirTecla(elemento, 'ArrowLeft')
    assert.equal(controles.obtenerFuente(), 'manual')
    const manual = controles.obtenerOrientacion()
    sensor.ultimo().alLectura(lecturaVertical(10, 10, 10)) // lectura tardía
    sensor.ultimo().resolver({ estado: 'activo' })
    await microtareas()
    assert.deepEqual(controles.obtenerOrientacion(), manual)
    assert.equal(controles.obtenerFuente(), 'manual')
    assert.deepEqual(avisos, [])
  })

  it('salir de VR deja la última orientación y los movimientos posteriores no la cambian', () => {
    const { sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(90, 100))
    const ultima = controles.obtenerOrientacion()
    controles.salirVr()
    assert.equal(controles.obtenerFuente(), 'manual')
    sensor.ultimo().alLectura(lecturaVertical(200, 30))
    assert.deepEqual(controles.obtenerOrientacion(), ultima)
  })

  it('salir mientras se espera: un permiso o lectura tardíos no reactivan el sensor', async () => {
    const { sensor, avisos, controles } = crearEntorno()
    controles.entrarVr()
    const intento = sensor.ultimo()
    controles.salirVr()
    assert.ok(sensor.cancelaciones >= 1)
    intento.alLectura(lecturaVertical(10, 80))
    intento.resolver({ estado: 'activo' })
    await microtareas()
    assert.equal(controles.obtenerFuente(), 'manual')
    assert.deepEqual(controles.obtenerOrientacion(), ORIENTACION_INICIAL)
    assert.deepEqual(avisos, [])
  })

  it('intentos repetidos: el resultado tardío de un intento anterior no cambia la vista ni avisa', async () => {
    const { sensor, avisos, controles } = crearEntorno()
    controles.entrarVr()
    const primero = sensor.ultimo()
    controles.salirVr()
    controles.entrarVr()
    const segundo = sensor.ultimo()
    assert.notEqual(primero, segundo)

    primero.alLectura(lecturaVertical(10, 80))
    primero.resolver({ estado: 'denegado' })
    await microtareas()
    assert.equal(controles.obtenerFuente(), 'solicitando', 'el segundo intento sigue esperando')
    assert.deepEqual(avisos, [])
    assert.deepEqual(controles.obtenerOrientacion(), ORIENTACION_INICIAL)

    segundo.alLectura(lecturaVertical(10, 80))
    assert.equal(controles.obtenerFuente(), 'sensor')
  })

  it('desmontar cancela el intento: nada se aplica después', async () => {
    const { sensor, avisos, cambios, controles } = crearEntorno()
    controles.entrarVr()
    const intento = sensor.ultimo()
    controles.destruir()
    intento.alLectura(lecturaVertical(10, 80))
    intento.resolver({ estado: 'denegado' })
    await microtareas()
    assert.equal(cambios.length, 0)
    assert.deepEqual(avisos, [])
  })
})

describe('alternativa manual ante fallos del sensor', () => {
  for (const estado of ['denegado', 'sin-soporte', 'contexto-inseguro', 'error', 'sin-datos']) {
    it(`${estado}: pasa a manual, conserva la vista y avisa una vez`, async () => {
      const { elemento, sensor, avisos, controles } = crearEntorno()
      emitirTecla(elemento, 'ArrowRight')
      const antes = controles.obtenerOrientacion()
      controles.entrarVr()
      sensor.ultimo().resolver({ estado })
      await microtareas()
      assert.equal(controles.obtenerFuente(), 'manual')
      assert.deepEqual(controles.obtenerOrientacion(), antes)
      assert.deepEqual(avisos, [estado])
      // sigue utilizable con arrastre
      emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
      emitirPuntero(elemento, 'pointermove', { clientX: 30, clientY: 0 })
      assert.notEqual(controles.obtenerOrientacion().giro, antes.giro)
      // una lectura posterior no sustituye al control manual
      const manual = controles.obtenerOrientacion()
      sensor.ultimo().alLectura(lecturaVertical(10, 80))
      assert.deepEqual(controles.obtenerOrientacion(), manual)
    })
  }

  it('sin sensor disponible en absoluto avisa y mantiene el control manual', () => {
    const elemento = crearElementoSimulado()
    const avisos = []
    const controles = crearControlesVista({ elemento, alAvisar: (estado) => avisos.push(estado) })
    controles.entrarVr()
    assert.equal(controles.obtenerFuente(), 'manual')
    assert.deepEqual(avisos, ['sin-soporte'])
  })

  it('una lectura con ceros es válida y activa el seguimiento', () => {
    const { sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura({ alpha: 0, beta: 0, gamma: 0 })
    assert.equal(controles.obtenerFuente(), 'sensor')
  })

  it('lecturas incompletas se ignoran sin cambiar de fuente', () => {
    const { sensor, cambios, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura({ alpha: null, beta: 10, gamma: 5 })
    assert.equal(controles.obtenerFuente(), 'solicitando')
    assert.equal(cambios.length, 0)
  })
})
