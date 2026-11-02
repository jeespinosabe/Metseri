import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { crearControlesVista, LIMITE_INCLINACION, normalizarGiro } from './controlesVista.js'
import { crearEstadoLectura } from './contenidoFicha.js'

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

describe('navegación manual combinada con sensor', () => {
  it('paginar con permiso pendiente y cerrar después de la primera lectura conserva el seguimiento', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const lectura = crearEstadoLectura()
    lectura.actualizar('tierra', 4)
    let accion = 'siguiente'
    const { elemento, sensor, controles } = crearEntorno({ alActivar: () => {
      if (accion === 'siguiente') lectura.mover(1)
      else lectura.actualizar(null, 0)
    } })
    controles.entrarVr()
    emitirPuntero(elemento, 'click', {})
    t.mock.timers.tick(300)
    assert.equal(controles.obtenerFuente(), 'solicitando')
    assert.equal(lectura.obtenerEstado().pagina, 1)
    sensor.ultimo().alLectura(lecturaVertical(30))
    accion = 'cerrar'
    emitirPuntero(elemento, 'click', {})
    t.mock.timers.tick(300)
    assert.equal(lectura.obtenerEstado().cuerpoId, null)
    assert.equal(controles.obtenerFuente(), 'sensor')
    sensor.ultimo().alLectura(lecturaVertical(60))
    cercaDe(controles.obtenerOrientacion().giro, 30 * GRADOS)
    controles.destruir()
  })
  it('tocar y seleccionar conserva el sensor activo y las lecturas posteriores', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const activaciones = []
    const { elemento, sensor, controles } = crearEntorno({ alActivar: (evento) => activaciones.push(evento) })
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(30))
    const cancelaciones = sensor.cancelaciones
    emitirPuntero(elemento, 'pointerdown', { clientX: 10, clientY: 10 })
    emitirPuntero(elemento, 'pointermove', { clientX: 12, clientY: 11 })
    emitirPuntero(elemento, 'pointerup', { clientX: 12, clientY: 11 })
    emitirPuntero(elemento, 'click', { clientX: 12, clientY: 11 })
    t.mock.timers.tick(300)
    assert.equal(activaciones.length, 1)
    assert.equal(controles.obtenerFuente(), 'sensor')
    assert.equal(sensor.cancelaciones, cancelaciones)
    sensor.ultimo().alLectura(lecturaVertical(60))
    cercaDe(controles.obtenerOrientacion().giro, 30 * GRADOS)
    controles.destruir()
  })

  it('un toque no cancela un permiso pendiente ni la llegada de la primera lectura', async () => {
    const { elemento, sensor, controles } = crearEntorno()
    controles.entrarVr()
    const cancelaciones = sensor.cancelaciones
    emitirPuntero(elemento, 'pointerdown', { clientX: 10, clientY: 10 })
    emitirPuntero(elemento, 'pointerup', { clientX: 10, clientY: 10 })
    emitirPuntero(elemento, 'click', { clientX: 10, clientY: 10 })
    assert.equal(controles.obtenerFuente(), 'solicitando')
    assert.equal(sensor.cancelaciones, cancelaciones)
    sensor.ultimo().resolver({ estado: 'activo' })
    sensor.ultimo().alLectura(lecturaVertical(50))
    await microtareas()
    assert.equal(controles.obtenerFuente(), 'sensor')
    controles.destruir()
  })

  it('el arrastre incorpora lecturas intercaladas y conserva un intento pendiente', async () => {
    const { elemento, sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(40))
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    sensor.ultimo().alLectura(lecturaVertical(60))
    emitirPuntero(elemento, 'pointermove', { clientX: 20, clientY: 0 })
    cercaDe(controles.obtenerOrientacion().giro, 20 * GRADOS + .1)
    assert.equal(controles.obtenerFuente(), 'sensor')
    sensor.ultimo().alLectura(lecturaVertical(80))
    emitirPuntero(elemento, 'pointermove', { clientX: 40, clientY: 0 })
    cercaDe(controles.obtenerOrientacion().giro, 40 * GRADOS + .2)
    emitirPuntero(elemento, 'pointerup', { clientX: 40, clientY: 0 })
    sensor.ultimo().alLectura(lecturaVertical(90))
    cercaDe(controles.obtenerOrientacion().giro, 50 * GRADOS + .2)
    controles.entrarVr()
    const pendiente = sensor.ultimo()
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    emitirPuntero(elemento, 'pointermove', { clientX: 20, clientY: 0 })
    const manual = controles.obtenerOrientacion()
    pendiente.alLectura(lecturaVertical(200))
    pendiente.resolver({ estado: 'activo' })
    await microtareas()
    assert.equal(controles.obtenerFuente(), 'sensor')
    cercaDe(controles.obtenerOrientacion().giro, manual.giro)
    cercaDe(controles.obtenerOrientacion().inclinacion, manual.inclinacion)
    controles.destruir()
  })

  it('un arrastre conserva el balanceo y la siguiente lectura no revierte el ajuste', () => {
    const { elemento, sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(40, 80, 25))
    sensor.ultimo().alLectura(lecturaVertical(55, 85, 30))
    const mostrada = controles.obtenerOrientacion()

    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    assert.equal(controles.obtenerFuente(), 'sensor', 'presionar no cancela el seguimiento')
    assert.deepEqual(controles.obtenerOrientacion(), mostrada)

    emitirPuntero(elemento, 'pointermove', { clientX: 20, clientY: 0 })
    assert.equal(controles.obtenerFuente(), 'sensor')
    assert.equal(sensor.cancelaciones, 1)
    assert.equal(controles.obtenerOrientacion().balanceo, mostrada.balanceo, 'conserva el balanceo')
    assert.notEqual(controles.obtenerOrientacion().giro, mostrada.giro)

    const ajustada = controles.obtenerOrientacion()
    sensor.ultimo().alLectura(lecturaVertical(55, 85, 30))
    for (const eje of ['giro', 'inclinacion', 'balanceo']) cercaDe(controles.obtenerOrientacion()[eje], ajustada[eje])
    // El sensor sigue modificando la mirada, también antes de soltar el dedo.
    sensor.ultimo().alLectura(lecturaVertical(300, 20))
    assert.notDeepEqual(controles.obtenerOrientacion(), ajustada)
    controles.destruir()
  })

  it('las flechas con el sensor pendiente conservan la activación sin salto', async () => {
    const { elemento, sensor, avisos, controles } = crearEntorno()
    controles.entrarVr()
    emitirTecla(elemento, 'ArrowLeft')
    assert.equal(controles.obtenerFuente(), 'solicitando')
    const manual = controles.obtenerOrientacion()
    sensor.ultimo().alLectura(lecturaVertical(10, 10, 10))
    sensor.ultimo().resolver({ estado: 'activo' })
    await microtareas()
    for (const eje of ['giro', 'inclinacion', 'balanceo']) cercaDe(controles.obtenerOrientacion()[eje], manual[eje])
    assert.equal(controles.obtenerFuente(), 'sensor')
    assert.deepEqual(avisos, [])
    controles.destruir()
  })

  for (const pointerType of ['mouse', 'touch']) {
    it(`combina ${pointerType}, flechas y sensor sin permisos ni cancelaciones adicionales`, () => {
      const { elemento, sensor, avisos, controles } = crearEntorno()
      controles.entrarVr()
      sensor.ultimo().alLectura(lecturaVertical(0))
      emitirPuntero(elemento, 'pointerdown', { pointerType, clientX: 0, clientY: 0 })
      emitirPuntero(elemento, 'pointermove', { pointerType, clientX: 100, clientY: 0 })
      emitirPuntero(elemento, 'pointerup', { pointerType, clientX: 100, clientY: 0 })
      emitirTecla(elemento, 'ArrowLeft')
      sensor.ultimo().alLectura(lecturaVertical(30))
      cercaDe(controles.obtenerOrientacion().giro, .6 + 30 * GRADOS)
      assert.equal(sensor.activaciones.length, 1)
      assert.equal(sensor.cancelaciones, 1)
      assert.deepEqual(avisos, [])
      controles.recentrar()
      cercaDe(controles.obtenerOrientacion().giro, 0)
      sensor.ultimo().alLectura(lecturaVertical(60))
      cercaDe(controles.obtenerOrientacion().giro, 30 * GRADOS)
      controles.destruir()
    })
  }

  it('limita los polos y permite vueltas completas sin perder el seguimiento', () => {
    const { elemento, sensor, controles } = crearEntorno()
    controles.entrarVr()
    sensor.ultimo().alLectura(lecturaVertical(0))
    emitirPuntero(elemento, 'pointerdown', { clientX: 0, clientY: 0 })
    emitirPuntero(elemento, 'pointermove', { clientX: 10000, clientY: 10000 })
    cercaDe(controles.obtenerOrientacion().giro, normalizarGiro(50))
    cercaDe(controles.obtenerOrientacion().inclinacion, LIMITE_INCLINACION)
    const antes = controles.obtenerOrientacion()
    sensor.ultimo().alLectura(lecturaVertical(0))
    cercaDe(controles.obtenerOrientacion().giro, antes.giro)
    cercaDe(controles.obtenerOrientacion().inclinacion, antes.inclinacion)
    assert.equal(controles.obtenerFuente(), 'sensor')
    controles.destruir()
  })

  it('un fallo tras navegar durante la espera conserva la vista y el aviso existente', async () => {
    const { elemento, sensor, controles, avisos } = crearEntorno()
    controles.entrarVr()
    emitirTecla(elemento, 'ArrowRight')
    const antes = controles.obtenerOrientacion()
    sensor.ultimo().resolver({ estado: 'sin-datos' })
    await microtareas()
    assert.deepEqual(controles.obtenerOrientacion(), antes)
    assert.deepEqual(avisos, ['sin-datos'])
    sensor.ultimo().alLectura(lecturaVertical(80))
    assert.deepEqual(controles.obtenerOrientacion(), antes)
    controles.destruir()
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
