import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Euler, Quaternion, Vector3 } from 'three'
import {
  calcularCuaternionDispositivo,
  calcularRumbo,
  crearAlineacionHorizontal,
  crearAlineacionInicial,
  crearSensorOrientacion,
  esLecturaValida,
  extraerOrientacion,
} from './orientacionDispositivo.js'
import { calcularCuaternionVista } from './controlesVista.js'

const GRADOS = Math.PI / 180
const cercaDe = (real, esperado, margen = 1e-6) =>
  assert.ok(Math.abs(real - esperado) <= margen, `${real} no está cerca de ${esperado}`)
const frenteDe = (cuaternion) => new Vector3(0, 0, -1).applyQuaternion(cuaternion)
const arribaDe = (cuaternion) => new Vector3(0, 1, 0).applyQuaternion(cuaternion)
const igualesComoRotacion = (a, b) => Math.abs(a.dot(b)) > 1 - 1e-9
const anguloEntre = (a, b) => (Math.acos(Math.min(1, Math.max(-1, a.dot(b)))) * 180) / Math.PI

describe('conversión de alpha, beta y gamma a cuaterniones', () => {
  it('teléfono vertical frente al horizonte: mira al frente sin inclinar', () => {
    const q = calcularCuaternionDispositivo({ alpha: 0, beta: 90, gamma: 0 })
    assert.ok(frenteDe(q).distanceTo(new Vector3(0, 0, -1)) < 1e-9)
    assert.ok(arribaDe(q).distanceTo(new Vector3(0, 1, 0)) < 1e-9)
  })

  it('alpha gira el horizonte: positivo hacia la izquierda', () => {
    const q = calcularCuaternionDispositivo({ alpha: 90, beta: 90, gamma: 0 })
    assert.ok(frenteDe(q).distanceTo(new Vector3(-1, 0, 0)) < 1e-9)
    cercaDe(calcularRumbo(q), Math.PI / 2)
  })

  it('beta inclina la mirada hacia arriba o hacia abajo', () => {
    cercaDe(frenteDe(calcularCuaternionDispositivo({ alpha: 0, beta: 135, gamma: 0 })).y, Math.sin(45 * GRADOS))
    cercaDe(frenteDe(calcularCuaternionDispositivo({ alpha: 0, beta: 45, gamma: 0 })).y, -Math.sin(45 * GRADOS))
    cercaDe(frenteDe(calcularCuaternionDispositivo({ alpha: 0, beta: 0, gamma: 0 })).y, -1)
  })

  it('gamma inclina la mirada respecto del plano del teléfono y alpha no mueve el punto cenital', () => {
    const plano = frenteDe(calcularCuaternionDispositivo({ alpha: 0, beta: 0, gamma: 0 }))
    const inclinado = frenteDe(calcularCuaternionDispositivo({ alpha: 0, beta: 0, gamma: 30 }))
    cercaDe(anguloEntre(plano, inclinado), 30, 1e-6)
    const girado = frenteDe(calcularCuaternionDispositivo({ alpha: 123, beta: 0, gamma: 0 }))
    assert.ok(plano.distanceTo(girado) < 1e-9)
  })

  it('un cambio de alpha gira alrededor de la vertical sin voltear el horizonte', () => {
    const q = calcularCuaternionDispositivo({ alpha: 40, beta: 90, gamma: 0 })
    cercaDe(arribaDe(q).y, 1)
  })

  it('devuelve el mismo cuaternión en vertical y en horizontal para la misma pose física', () => {
    // Pose física de referencia en el marco de la especificación (Z arriba): Rz(alpha)·Rx(beta)·Ry(gamma).
    const poseVertical = new Quaternion().setFromEuler(new Euler(70 * GRADOS, 10 * GRADOS, 30 * GRADOS, 'ZXY'))
    const lecturaDe = (poseFisica) => {
      const euler = new Euler().setFromQuaternion(poseFisica, 'ZXY')
      return { alpha: euler.z / GRADOS, beta: euler.x / GRADOS, gamma: euler.y / GRADOS }
    }

    for (const angulo of [90, 180, 270]) {
      // Girar el teléfono en el plano de su pantalla `angulo` grados en sentido antihorario.
      const poseGirada = poseVertical
        .clone()
        .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angulo * GRADOS))
      const vertical = calcularCuaternionDispositivo(lecturaDe(poseVertical), 0)
      const girado = calcularCuaternionDispositivo(lecturaDe(poseGirada), angulo)
      assert.ok(igualesComoRotacion(vertical, girado), `pantalla a ${angulo} grados`)
    }
  })

  it('sin compensar la pantalla, el giro de 90 grados sería un giro artificial', () => {
    const lectura = { alpha: 20, beta: 80, gamma: 10 }
    const sinCompensar = calcularCuaternionDispositivo(lectura, 0)
    const compensado = calcularCuaternionDispositivo(lectura, 90)
    assert.ok(!igualesComoRotacion(sinCompensar, compensado))
    // La compensación solo balancea la cámara sobre su eje de mirada: el frente no cambia.
    assert.ok(frenteDe(sinCompensar).distanceTo(frenteDe(compensado)) < 1e-9)
  })

  it('cruza de 359 a 0 grados sin saltos', () => {
    const rumbos = [358, 359, 0, 1, 2].map((alpha) =>
      calcularRumbo(calcularCuaternionDispositivo({ alpha, beta: 90, gamma: 0 })),
    )
    for (let i = 1; i < rumbos.length; i += 1) {
      let diferencia = rumbos[i] - rumbos[i - 1]
      diferencia = Math.atan2(Math.sin(diferencia), Math.cos(diferencia))
      cercaDe(diferencia, GRADOS, 1e-9)
    }
    const antes = frenteDe(calcularCuaternionDispositivo({ alpha: 359, beta: 90, gamma: 0 }))
    const despues = frenteDe(calcularCuaternionDispositivo({ alpha: 0, beta: 90, gamma: 0 }))
    cercaDe(anguloEntre(antes, despues), 1, 1e-6)
  })

  it('acepta ceros como valores válidos', () => {
    assert.equal(esLecturaValida({ alpha: 0, beta: 0, gamma: 0 }), true)
    assert.notEqual(calcularCuaternionDispositivo({ alpha: 0, beta: 0, gamma: 0 }), null)
    assert.equal(esLecturaValida({ alpha: 0, beta: 90, gamma: 0 }), true)
  })

  it('rechaza lecturas incompletas, nulas o no finitas', () => {
    const invalidas = [
      null,
      undefined,
      {},
      { alpha: 1, beta: 2 },
      { alpha: null, beta: 2, gamma: 3 },
      { alpha: 1, beta: null, gamma: 3 },
      { alpha: 1, beta: 2, gamma: undefined },
      { alpha: NaN, beta: 2, gamma: 3 },
      { alpha: 1, beta: Infinity, gamma: 3 },
      { alpha: 1, beta: 2, gamma: -Infinity },
      { alpha: '1', beta: 2, gamma: 3 },
    ]
    for (const lectura of invalidas) {
      assert.equal(esLecturaValida(lectura), false, JSON.stringify(lectura))
      assert.equal(calcularCuaternionDispositivo(lectura), null)
    }
  })

  it('un ángulo de pantalla inválido se trata como cero', () => {
    const lectura = { alpha: 10, beta: 80, gamma: 5 }
    const base = calcularCuaternionDispositivo(lectura, 0)
    assert.ok(igualesComoRotacion(base, calcularCuaternionDispositivo(lectura, undefined)))
    assert.ok(igualesComoRotacion(base, calcularCuaternionDispositivo(lectura, NaN)))
  })
})

describe('alineación con la orientación visible', () => {
  const lectura = { alpha: 50, beta: 100, gamma: 12 }

  it('la primera lectura conserva la orientación visible, incluido el balanceo', () => {
    const dispositivo = calcularCuaternionDispositivo(lectura, 0)
    const visible = calcularCuaternionVista({ giro: 0.8, inclinacion: -0.3, balanceo: 0.2 })
    const alineacion = crearAlineacionInicial(visible, dispositivo)
    const resultado = alineacion.clone().multiply(dispositivo)
    assert.ok(igualesComoRotacion(resultado, visible))
  })

  it('recentrar pone el frente horizontal en cero y conserva la inclinación natural', () => {
    const dispositivo = calcularCuaternionDispositivo(lectura, 0)
    const alineacion = crearAlineacionHorizontal(dispositivo)
    const resultado = alineacion.clone().multiply(dispositivo)
    cercaDe(calcularRumbo(resultado), 0, 1e-9)
    cercaDe(frenteDe(resultado).y, frenteDe(dispositivo).y, 1e-9)
    cercaDe(arribaDe(resultado).y, arribaDe(dispositivo).y, 1e-9)
  })

  it('recentrar no está definido cuando el dispositivo apunta en vertical', () => {
    const haciaArriba = calcularCuaternionDispositivo({ alpha: 0, beta: 180, gamma: 0 }, 0)
    assert.equal(crearAlineacionHorizontal(haciaArriba), null)
  })

  it('extraerOrientacion es la inversa de calcularCuaternionVista', () => {
    const original = { giro: 1.1, inclinacion: 0.4, balanceo: -0.25 }
    const extraida = extraerOrientacion(calcularCuaternionVista(original))
    cercaDe(extraida.giro, original.giro, 1e-9)
    cercaDe(extraida.inclinacion, original.inclinacion, 1e-9)
    cercaDe(extraida.balanceo, original.balanceo, 1e-9)
  })
})

// ---------- Negociación del sensor ----------

function crearReloj() {
  let ahora = 0
  let siguiente = 1
  const pendientes = new Map()
  return {
    setTimeout(funcion, ms) {
      const id = siguiente
      siguiente += 1
      pendientes.set(id, { funcion, instante: ahora + ms })
      return id
    },
    clearTimeout: (id) => pendientes.delete(id),
    ahora: () => ahora,
    avanzar(ms) {
      const limite = ahora + ms
      for (;;) {
        const vencidos = [...pendientes.entries()]
          .filter(([, t]) => t.instante <= limite)
          .sort((a, b) => a[1].instante - b[1].instante)
        if (vencidos.length === 0) break
        const [id, tarea] = vencidos[0]
        pendientes.delete(id)
        ahora = tarea.instante
        tarea.funcion()
      }
      ahora = limite
    },
    pendientes: () => pendientes.size,
  }
}

function crearEntornoSensor({ conApi = true, permiso = 'sin-solicitud', segura = true } = {}) {
  const ventana = new EventTarget()
  ventana.isSecureContext = segura
  const llamadas = { permiso: 0 }
  const control = { resolverPermiso: null, rechazarPermiso: null }
  if (conApi) {
    ventana.DeviceOrientationEvent = function DeviceOrientationEvent() {}
    if (permiso !== 'sin-solicitud') {
      ventana.DeviceOrientationEvent.requestPermission = () => {
        llamadas.permiso += 1
        if (permiso === 'lanza') throw new Error('no permitido')
        return new Promise((resolver, rechazar) => {
          control.resolverPermiso = resolver
          control.rechazarPermiso = rechazar
          if (permiso === 'granted' || permiso === 'denied') resolver(permiso)
          if (permiso === 'rechaza') rechazar(new Error('fallo'))
        })
      }
    }
  }
  const documento = new EventTarget()
  documento.visibilityState = 'visible'
  documento.cambiarVisibilidad = (estado) => {
    documento.visibilityState = estado
    documento.dispatchEvent(new Event('visibilitychange'))
  }
  const reloj = crearReloj()
  const lecturas = []
  const sensor = crearSensorOrientacion({ ventana, documento, temporizadores: reloj })
  const emitir = (lectura) =>
    ventana.dispatchEvent(Object.assign(new Event('deviceorientation'), lectura))
  const escuchas = () => {
    let contador = 0
    const original = ventana.addEventListener.bind(ventana)
    ventana.addEventListener = (tipo, ...resto) => {
      if (tipo === 'deviceorientation') contador += 1
      return original(tipo, ...resto)
    }
    return () => contador
  }
  return { ventana, documento, reloj, sensor, emitir, llamadas, control, lecturas, escuchas, alLectura: (l) => lecturas.push(l) }
}

const microtareas = () => new Promise((resolver) => setTimeout(resolver, 0))

describe('activación del sensor con permiso', () => {
  it('inicia la petición de permiso de forma síncrona, dentro del gesto', () => {
    const e = crearEntornoSensor({ permiso: 'granted' })
    e.sensor.activar(e.alLectura)
    assert.equal(e.llamadas.permiso, 1, 'requestPermission se llama antes de cualquier espera')
  })

  it('permiso concedido: se activa con la primera lectura válida y entrega lecturas', async () => {
    const e = crearEntornoSensor({ permiso: 'granted' })
    const resultado = e.sensor.activar(e.alLectura)
    await microtareas()
    e.emitir({ alpha: 10, beta: 80, gamma: 5 })
    assert.deepEqual(await resultado, { estado: 'activo' })
    e.emitir({ alpha: 11, beta: 81, gamma: 6 })
    assert.equal(e.lecturas.length, 2)
    assert.deepEqual(e.lecturas[1], { alpha: 11, beta: 81, gamma: 6 })
  })

  it('permiso rechazado: manual, sin escuchar el sensor y sin repetir la petición', async () => {
    const e = crearEntornoSensor({ permiso: 'denied' })
    assert.deepEqual(await e.sensor.activar(e.alLectura), { estado: 'denegado' })
    e.emitir({ alpha: 10, beta: 80, gamma: 5 })
    e.reloj.avanzar(10_000)
    assert.equal(e.lecturas.length, 0)
    assert.equal(e.llamadas.permiso, 1)
  })

  it('error al pedir permiso (promesa rechazada o excepción)', async () => {
    const rechazado = crearEntornoSensor({ permiso: 'rechaza' })
    assert.deepEqual(await rechazado.sensor.activar(rechazado.alLectura), { estado: 'error' })
    const lanza = crearEntornoSensor({ permiso: 'lanza' })
    assert.deepEqual(await lanza.sensor.activar(lanza.alLectura), { estado: 'error' })
  })

  it('API ausente o contexto no seguro: manual sin pedir nada', async () => {
    const sinApi = crearEntornoSensor({ conApi: false })
    assert.deepEqual(await sinApi.sensor.activar(sinApi.alLectura), { estado: 'sin-soporte' })
    const insegura = crearEntornoSensor({ permiso: 'granted', segura: false })
    assert.deepEqual(await insegura.sensor.activar(insegura.alLectura), { estado: 'contexto-inseguro' })
    assert.equal(insegura.llamadas.permiso, 0)
  })

  it('navegador sin requestPermission: escucha y se activa al recibir datos válidos', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(500)
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    assert.deepEqual(await resultado, { estado: 'activo' })
  })

  it('ausencia de eventos: tras dos segundos pasa a manual y la lectura tardía se ignora', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(1999)
    e.reloj.avanzar(1)
    assert.deepEqual(await resultado, { estado: 'sin-datos' })
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    assert.equal(e.lecturas.length, 0, 'la lectura tardía no sustituye al control manual')
    assert.equal(e.reloj.pendientes(), 0)
  })

  it('lecturas nulas, incompletas o no numéricas no activan y agotan el plazo', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.emitir({ alpha: null, beta: null, gamma: null })
    e.emitir({ alpha: 1, beta: 2, gamma: null })
    e.emitir({ alpha: 'a', beta: 2, gamma: 3 })
    e.emitir({ alpha: NaN, beta: 2, gamma: 3 })
    e.reloj.avanzar(2000)
    assert.deepEqual(await resultado, { estado: 'sin-datos' })
    assert.equal(e.lecturas.length, 0)
  })

  it('una lectura con ceros es válida y activa el sensor', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.emitir({ alpha: 0, beta: 0, gamma: 0 })
    assert.deepEqual(await resultado, { estado: 'activo' })
    assert.deepEqual(e.lecturas, [{ alpha: 0, beta: 0, gamma: 0 }])
  })

  it('el tiempo del permiso pendiente no cuenta para el plazo', async () => {
    const e = crearEntornoSensor({ permiso: 'pendiente' })
    const resultado = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(60_000) // el usuario tarda un minuto en decidir
    e.control.resolverPermiso('granted')
    await microtareas()
    e.reloj.avanzar(1500)
    e.emitir({ alpha: 5, beta: 5, gamma: 5 })
    assert.deepEqual(await resultado, { estado: 'activo' })
  })

  it('el plazo de dos segundos empieza al concederse el permiso', async () => {
    const e = crearEntornoSensor({ permiso: 'pendiente' })
    const resultado = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(30_000)
    e.control.resolverPermiso('granted')
    await microtareas()
    e.reloj.avanzar(2000)
    assert.deepEqual(await resultado, { estado: 'sin-datos' })
  })

  it('solo cuenta el tiempo con la página visible', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(1500)
    e.documento.cambiarVisibilidad('hidden')
    e.reloj.avanzar(60_000) // en segundo plano no se agota
    e.documento.cambiarVisibilidad('visible')
    e.reloj.avanzar(400)
    e.emitir({ alpha: 1, beta: 1, gamma: 1 })
    assert.deepEqual(await resultado, { estado: 'activo' })
  })

  it('al volver de segundo plano solo queda el tiempo restante', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(1500)
    e.documento.cambiarVisibilidad('hidden')
    e.reloj.avanzar(10_000)
    e.documento.cambiarVisibilidad('visible')
    e.reloj.avanzar(500)
    assert.deepEqual(await resultado, { estado: 'sin-datos' })
  })
})

describe('cancelación de intentos del sensor', () => {
  it('salir mientras el permiso está pendiente: un permiso tardío no reactiva el sensor', async () => {
    const e = crearEntornoSensor({ permiso: 'pendiente' })
    const contarEscuchas = e.escuchas()
    const resultado = e.sensor.activar(e.alLectura)
    e.sensor.cancelar()
    assert.deepEqual(await resultado, { estado: 'cancelado' })
    e.control.resolverPermiso('granted')
    await microtareas()
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    assert.equal(contarEscuchas(), 0, 'no vuelve a escuchar')
    assert.equal(e.lecturas.length, 0)
  })

  it('salir mientras espera la primera lectura: lecturas posteriores no cambian nada', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.sensor.cancelar()
    assert.deepEqual(await resultado, { estado: 'cancelado' })
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    e.reloj.avanzar(5000)
    assert.equal(e.lecturas.length, 0)
    assert.equal(e.reloj.pendientes(), 0)
  })

  it('con el sensor activo, cancelar detiene la entrega de lecturas', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const resultado = e.sensor.activar(e.alLectura)
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    await resultado
    e.sensor.cancelar()
    e.emitir({ alpha: 4, beta: 5, gamma: 6 })
    assert.equal(e.lecturas.length, 1)
  })

  it('intentos repetidos: el permiso tardío de un intento anterior no tiene efecto', async () => {
    const e = crearEntornoSensor({ permiso: 'pendiente' })
    const primero = e.sensor.activar(e.alLectura)
    const resolverPrimero = e.control.resolverPermiso
    const segundo = e.sensor.activar(e.alLectura)
    assert.deepEqual(await primero, { estado: 'cancelado' })
    // el primer intento obtiene permiso tarde: ya no es vigente
    resolverPrimero('granted')
    await microtareas()
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    assert.equal(e.lecturas.length, 0, 'solo el segundo intento podría activar, y aún espera permiso')
    e.control.resolverPermiso('granted')
    await microtareas()
    e.emitir({ alpha: 7, beta: 8, gamma: 9 })
    assert.deepEqual(await segundo, { estado: 'activo' })
    assert.deepEqual(e.lecturas, [{ alpha: 7, beta: 8, gamma: 9 }])
  })

  it('tras agotar el plazo, una nueva activación explícita sí vuelve a intentarlo', async () => {
    const e = crearEntornoSensor({ permiso: 'sin-solicitud' })
    const primero = e.sensor.activar(e.alLectura)
    e.reloj.avanzar(2000)
    assert.deepEqual(await primero, { estado: 'sin-datos' })
    const segundo = e.sensor.activar(e.alLectura)
    e.emitir({ alpha: 1, beta: 2, gamma: 3 })
    assert.deepEqual(await segundo, { estado: 'activo' })
  })
})
