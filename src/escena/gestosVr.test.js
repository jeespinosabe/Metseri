import assert from 'node:assert/strict'
import { it } from 'node:test'
import { crearGestosVr, INTERVALO_DOBLE_TAP_MS } from './gestosVr.js'
import { crearControlesVista } from './controlesVista.js'

it('el tap simple espera y conserva el objetivo capturado antes de mover la mirada', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let objetivo = 'luna'
  const acciones = []
  const gestos = crearGestosVr({
    prepararActivacion: () => {
      const capturado = objetivo
      return () => acciones.push(capturado)
    },
    alRecentrar: () => acciones.push('recentrar'),
  })
  gestos.pulsar({})
  objetivo = 'tierra'
  t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS - 1)
  assert.deepEqual(acciones, [])
  t.mock.timers.tick(1)
  assert.deepEqual(acciones, ['luna'])
})

it('dos taps recentran una sola vez, sin ejecutar la acción de ficha pendiente', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const acciones = []
  const gestos = crearGestosVr({ prepararActivacion: () => () => acciones.push('ficha'), alRecentrar: () => acciones.push('recentrar') })
  gestos.pulsar({})
  t.mock.timers.tick(100)
  gestos.pulsar({})
  t.mock.timers.tick(1000)
  assert.deepEqual(acciones, ['recentrar'])
  gestos.pulsar({})
  t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
  assert.deepEqual(acciones, ['recentrar', 'ficha'])
})

it('el tap que descarta la instrucción puede iniciar un doble tap', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let visible = true
  let recentrados = 0
  const gestos = crearGestosVr({ prepararActivacion: () => { visible = false; return null }, alRecentrar: () => { recentrados += 1 } })
  gestos.pulsar({})
  assert.equal(visible, false)
  gestos.pulsar({})
  t.mock.timers.tick(1000)
  assert.equal(recentrados, 1)
})

function crearEntorno(t) {
  const elemento = new EventTarget()
  const acciones = []
  let recibirLectura
  let cancelaciones = 0
  const controles = crearControlesVista({
    elemento,
    alActivar: () => acciones.push('activar'),
    alRecentrar: () => acciones.push('recentrar'),
    sensor: {
      activar: (recibir) => { recibirLectura = recibir; return Promise.resolve({ estado: 'activo' }) },
      cancelar: () => { cancelaciones += 1 },
    },
  })
  t.after(() => controles.destruir())
  function emitir(tipo, propiedades = {}) {
    elemento.dispatchEvent(Object.assign(new Event(tipo), { button: 0, pointerType: 'touch', pointerId: 1, clientX: 0, clientY: 0, ...propiedades }))
  }
  return { elemento, controles, acciones, emitir, leer: (alpha) => recibirLectura({ alpha, beta: 90, gamma: 0 }), cancelaciones: () => cancelaciones }
}

it('en vista normal dos clics son inmediatos y no recentran; en VR dos clics del visor conservan el sensor', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const entorno = crearEntorno(t)
  const { emitir, controles, acciones, leer } = entorno
  emitir('click')
  emitir('click')
  assert.deepEqual(acciones, ['activar', 'activar'])
  acciones.length = 0
  controles.entrarVr()
  leer(20)
  leer(60)
  const cancelaciones = entorno.cancelaciones()
  emitir('click', { clientX: 10 })
  emitir('click', { clientX: 900 })
  t.mock.timers.tick(1000)
  assert.deepEqual(acciones, ['recentrar'])
  assert.ok(Math.abs(controles.obtenerOrientacion().giro) < 1e-9)
  assert.equal(controles.obtenerFuente(), 'sensor')
  assert.equal(entorno.cancelaciones(), cancelaciones)
  leer(80)
  assert.ok(Math.abs(controles.obtenerOrientacion().giro - 20 * Math.PI / 180) < 1e-9)
})

for (const motivo of ['arrastre', 'cancelación', 'varios punteros', 'flechas', 'foco', 'salida', 'destrucción']) {
  it(`cancela un tap pendiente ante ${motivo}`, (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const { controles, emitir, acciones } = crearEntorno(t)
    controles.entrarVr()
    emitir('click')
    if (motivo === 'arrastre') {
      emitir('pointerdown')
      emitir('pointermove', { clientX: 20 })
      emitir('pointerup', { clientX: 20 })
      emitir('click')
    } else if (motivo === 'cancelación') {
      emitir('pointerdown')
      emitir('pointercancel')
      emitir('click')
    } else if (motivo === 'varios punteros') {
      emitir('pointerdown')
      emitir('pointerdown', { pointerId: 2 })
      emitir('pointerup')
      emitir('pointerup', { pointerId: 2 })
      emitir('click')
    } else if (motivo === 'flechas') emitir('keydown', { key: 'ArrowLeft' })
    else if (motivo === 'foco') emitir('blur')
    else if (motivo === 'salida') controles.salirVr()
    else controles.destruir()
    t.mock.timers.tick(1000)
    assert.deepEqual(acciones, [])
  })
}

it('doble tap durante permiso pendiente conserva el intento y alinea la primera lectura', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { controles, emitir, leer, acciones } = crearEntorno(t)
  controles.entrarVr()
  controles.establecerOrientacion({ giro: .6, inclinacion: .2 })
  emitir('click')
  emitir('click')
  assert.equal(controles.obtenerFuente(), 'solicitando')
  assert.deepEqual(acciones, ['recentrar'])
  leer(80)
  assert.equal(controles.obtenerFuente(), 'sensor')
  assert.ok(Math.abs(controles.obtenerOrientacion().giro) < 1e-9)
})
