import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { crearPantallaInmersiva } from './pantallaInmersiva.js'

function crearDiferido() {
  let resolver
  let rechazar
  const promesa = new Promise((ok, ko) => {
    resolver = ok
    rechazar = ko
  })
  return { promesa, resolver, rechazar }
}

// Documento, elemento y orientación simulados con registro de llamadas.
function crearEntorno({ pantallaCompleta = 'ok', bloqueo = 'ok', conPantallaCompleta = true, conBloqueo = true } = {}) {
  const documento = new EventTarget()
  documento.fullscreenElement = null
  const llamadas = { requestFullscreen: 0, exitFullscreen: 0, lock: 0, unlock: 0 }
  const elemento = {}
  const pendientes = { pantallaCompleta: [], bloqueo: [] }

  function finalizarPantallaCompleta() {
    documento.fullscreenElement = elemento
    documento.dispatchEvent(new Event('fullscreenchange'))
  }

  documento.exitFullscreen = async () => {
    llamadas.exitFullscreen += 1
    documento.fullscreenElement = null
    documento.dispatchEvent(new Event('fullscreenchange'))
  }
  if (conPantallaCompleta) {
    elemento.requestFullscreen = () => {
      llamadas.requestFullscreen += 1
      if (pantallaCompleta === 'rechazar') return Promise.reject(new Error('rechazada'))
      if (pantallaCompleta === 'manual') {
        const diferido = crearDiferido()
        pendientes.pantallaCompleta.push(diferido)
        return diferido.promesa.then(finalizarPantallaCompleta)
      }
      finalizarPantallaCompleta()
      return Promise.resolve()
    }
  }

  const orientacion = {
    unlock: () => {
      llamadas.unlock += 1
    },
  }
  if (conBloqueo) {
    orientacion.lock = () => {
      llamadas.lock += 1
      if (bloqueo === 'rechazar') return Promise.reject(new Error('NotSupportedError'))
      if (bloqueo === 'manual') {
        const diferido = crearDiferido()
        pendientes.bloqueo.push(diferido)
        return diferido.promesa
      }
      return Promise.resolve()
    }
  }
  return { documento, elemento, orientacion, llamadas, pendientes }
}

const crear = (entorno, extra = {}) =>
  crearPantallaInmersiva({ elemento: entorno.elemento, documento: entorno.documento, orientacion: entorno.orientacion, ...extra })

const esperarMicrotareas = () => new Promise((resolver) => setTimeout(resolver, 0))

describe('pantalla completa y bloqueo como mejoras opcionales', () => {
  it('adquiere pantalla completa y bloqueo, y al salir libera ambos', async () => {
    const entorno = crearEntorno()
    const pantalla = crear(entorno)
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: true, bloqueo: true })
    await pantalla.liberar()
    assert.deepEqual(pantalla.obtenerEstado(), { pantallaCompleta: false, bloqueo: false })
    assert.equal(entorno.llamadas.exitFullscreen, 1)
    assert.equal(entorno.llamadas.unlock, 1)
    await pantalla.destruir()
  })

  it('una solicitud de pantalla completa rechazada no lanza y no intenta el bloqueo', async () => {
    const entorno = crearEntorno({ pantallaCompleta: 'rechazar' })
    const pantalla = crear(entorno)
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: false, bloqueo: false })
    assert.equal(entorno.llamadas.lock, 0)
    await pantalla.liberar()
    assert.equal(entorno.llamadas.exitFullscreen, 0)
    assert.equal(entorno.llamadas.unlock, 0)
    await pantalla.destruir()
  })

  it('un bloqueo rechazado conserva la pantalla completa y solo libera esa', async () => {
    const entorno = crearEntorno({ bloqueo: 'rechazar' })
    const pantalla = crear(entorno)
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: true, bloqueo: false })
    await pantalla.liberar()
    assert.equal(entorno.llamadas.exitFullscreen, 1)
    assert.equal(entorno.llamadas.unlock, 0, 'no desbloquea lo que no bloqueó')
    await pantalla.destruir()
  })

  it('VR sigue disponible cuando faltan ambas capacidades', async () => {
    const entorno = crearEntorno({ conPantallaCompleta: false, conBloqueo: false })
    const pantalla = crear(entorno)
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: false, bloqueo: false })
    await pantalla.liberar()
    await pantalla.destruir()
  })

  it('funciona sin API de orientación de pantalla (p. ej. entornos sin screen.orientation)', async () => {
    const entorno = crearEntorno()
    const pantalla = crearPantallaInmersiva({
      elemento: entorno.elemento,
      documento: entorno.documento,
      orientacion: undefined,
    })
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: true, bloqueo: false })
    await pantalla.destruir()
  })

  it('deshace una pantalla completa que se resuelve tarde, tras salir de VR', async () => {
    const entorno = crearEntorno({ pantallaCompleta: 'manual' })
    const pantalla = crear(entorno)
    const solicitud = pantalla.solicitar()
    await esperarMicrotareas()
    await pantalla.liberar() // el usuario sale antes de que el navegador conteste
    entorno.pendientes.pantallaCompleta[0].resolver()
    await solicitud
    assert.deepEqual(pantalla.obtenerEstado(), { pantallaCompleta: false, bloqueo: false })
    assert.equal(entorno.documento.fullscreenElement, null, 'no se queda en pantalla completa')
    assert.equal(entorno.llamadas.lock, 0, 'no intenta bloquear tras salir')
    await pantalla.destruir()
  })

  it('deshace un bloqueo que se resuelve tarde, tras salir de VR', async () => {
    const entorno = crearEntorno({ bloqueo: 'manual' })
    const pantalla = crear(entorno)
    const solicitud = pantalla.solicitar()
    await esperarMicrotareas()
    await pantalla.liberar()
    entorno.pendientes.bloqueo[0].resolver()
    await solicitud
    assert.equal(pantalla.obtenerEstado().bloqueo, false)
    assert.equal(entorno.llamadas.unlock, 1, 'desbloquea el resultado tardío')
    await pantalla.destruir()
  })

  it('una nueva entrada mientras llega un resultado tardío conserva lo adquirido', async () => {
    const entorno = crearEntorno({ pantallaCompleta: 'manual' })
    const pantalla = crear(entorno)
    const primera = pantalla.solicitar()
    await esperarMicrotareas()
    await pantalla.liberar()
    const segunda = pantalla.solicitar()
    await esperarMicrotareas()
    entorno.pendientes.pantallaCompleta.forEach((diferido) => diferido.resolver())
    await Promise.all([primera, segunda])
    assert.equal(pantalla.obtenerEstado().pantallaCompleta, true)
    assert.equal(entorno.documento.fullscreenElement, entorno.elemento)
    await pantalla.destruir()
  })

  it('con pantalla completa preexistente no la adquiere ni la cierra al salir', async () => {
    const entorno = crearEntorno()
    entorno.documento.fullscreenElement = {} // otra parte ya la había activado
    const pantalla = crear(entorno)
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: false, bloqueo: true })
    assert.equal(entorno.llamadas.requestFullscreen, 0)
    await pantalla.liberar()
    assert.equal(entorno.llamadas.exitFullscreen, 0, 'no cierra la pantalla completa ajena')
    assert.notEqual(entorno.documento.fullscreenElement, null)
    assert.equal(entorno.llamadas.unlock, 1, 'sí libera el bloqueo propio')
    await pantalla.destruir()
  })

  it('avisa una sola vez si el navegador abandona la pantalla completa adquirida', async () => {
    const entorno = crearEntorno()
    let avisos = 0
    const pantalla = crear(entorno, { alAbandonarPantallaCompleta: () => { avisos += 1 } })
    await pantalla.solicitar()
    // El usuario sale desde el navegador (p. ej. gesto del sistema)
    entorno.documento.fullscreenElement = null
    entorno.documento.dispatchEvent(new Event('fullscreenchange'))
    assert.equal(avisos, 1)
    assert.deepEqual(pantalla.obtenerEstado(), { pantallaCompleta: false, bloqueo: false })
    assert.equal(entorno.llamadas.unlock, 1)
    entorno.documento.dispatchEvent(new Event('fullscreenchange'))
    assert.equal(avisos, 1)
    await pantalla.destruir()
  })

  it('no avisa cuando la propia experiencia sale de la pantalla completa', async () => {
    const entorno = crearEntorno()
    let avisos = 0
    const pantalla = crear(entorno, { alAbandonarPantallaCompleta: () => { avisos += 1 } })
    await pantalla.solicitar()
    await pantalla.liberar()
    assert.equal(avisos, 0)
    await pantalla.destruir()
  })

  it('no avisa por una pantalla completa preexistente que se cierra', async () => {
    const entorno = crearEntorno()
    entorno.documento.fullscreenElement = {}
    let avisos = 0
    const pantalla = crear(entorno, { alAbandonarPantallaCompleta: () => { avisos += 1 } })
    await pantalla.solicitar()
    entorno.documento.fullscreenElement = null
    entorno.documento.dispatchEvent(new Event('fullscreenchange'))
    assert.equal(avisos, 0)
    await pantalla.destruir()
  })

  it('destruir libera lo adquirido, deja de escuchar y no vuelve a solicitar', async () => {
    const entorno = crearEntorno()
    const pantalla = crear(entorno)
    await pantalla.solicitar()
    await pantalla.destruir()
    assert.equal(entorno.llamadas.exitFullscreen, 1)
    assert.deepEqual(await pantalla.solicitar(), { pantallaCompleta: false, bloqueo: false })
    assert.equal(entorno.llamadas.requestFullscreen, 1)
  })
})
