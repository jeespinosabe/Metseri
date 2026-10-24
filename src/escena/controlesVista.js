import { Euler, Quaternion } from 'three'
import {
  calcularCuaternionDispositivo,
  crearAlineacionHorizontal,
  crearAlineacionInicial,
  extraerOrientacion,
} from './orientacionDispositivo.js'

// Margen para no llegar exactamente a los polos y evitar voltear el horizonte.
export const LIMITE_INCLINACION = Math.PI / 2 - 0.02
const VUELTA_COMPLETA = Math.PI * 2
const RADIANES_POR_PIXEL = 0.005
const PASO_TECLADO = 0.1
export const UMBRAL_ARRASTRE = 6

export const ORIENTACION_INICIAL = Object.freeze({
  giro: 0,
  inclinacion: 0,
  balanceo: 0,
})

// Lleva el giro horizontal al rango (-PI, PI] para permitir vueltas completas.
export function normalizarGiro(giro) {
  const resto = ((((giro + Math.PI) % VUELTA_COMPLETA) + VUELTA_COMPLETA) % VUELTA_COMPLETA) - Math.PI
  return resto === -Math.PI ? Math.PI : resto
}

export function limitarInclinacion(inclinacion) {
  return Math.min(LIMITE_INCLINACION, Math.max(-LIMITE_INCLINACION, inclinacion))
}

export function ajustarOrientacion({ giro, inclinacion, balanceo = 0 }) {
  return {
    giro: normalizarGiro(giro),
    inclinacion: limitarInclinacion(inclinacion),
    balanceo: normalizarGiro(balanceo),
  }
}

// `giro` positivo mira hacia la izquierda; `inclinacion` positiva, hacia arriba.
// El balanceo (giro sobre el eje de la mirada) solo lo aporta el sensor.
export function calcularCuaternionVista({ giro, inclinacion, balanceo = 0 }) {
  return new Quaternion().setFromEuler(new Euler(inclinacion, giro, balanceo, 'YXZ'))
}

const DESPLAZAMIENTOS_TECLADO = {
  ArrowLeft: [1, 0],
  ArrowRight: [-1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
}

/**
 * Controla la dirección de la mirada. La fuente de control es una de:
 * - `manual`: arrastre (Pointer Events) y flechas del teclado;
 * - `solicitando`: se espera permiso o la primera lectura del sensor;
 * - `sensor`: la orientación del dispositivo dirige la mirada.
 *
 * Solo una fuente escribe la orientación a la vez. Un arrastre confirmado o las
 * flechas cancelan el sensor, conservando la orientación completa
 * mostrada. Cada entrada a VR es un intento con su propio número: salir, una
 * interacción manual o un nuevo intento invalidan promesas y lecturas tardías.
 *
 * Las flechas solo actúan cuando el propio `elemento` tiene el foco, de modo
 * que no interceptan botones u otros controles.
 */
export function crearControlesVista({
  elemento,
  alCambiar,
  alAvisar,
  alActivar,
  sensor,
  obtenerAnguloPantalla = () => 0,
  radianesPorPixel = RADIANES_POR_PIXEL,
  pasoTeclado = PASO_TECLADO,
}) {
  let orientacion = { ...ORIENTACION_INICIAL }
  let arrastre = null
  let fuente = 'manual'
  let intento = 0
  let alineacion = null
  let ultimoDispositivo = null
  let resultadoGesto = null
  let destruido = false
  const punterosActivos = new Set()

  function aplicar(nuevaOrientacion) {
    orientacion = ajustarOrientacion(nuevaOrientacion)
    alCambiar?.(orientacion)
  }

  function detenerSeguimiento() {
    intento += 1
    sensor?.cancelar()
    fuente = 'manual'
    alineacion = null
    ultimoDispositivo = null
  }

  // Una interacción manual toma el control sin mover la vista.
  function pasarAManual() {
    if (fuente !== 'manual') detenerSeguimiento()
  }

  function terminarArrastre() {
    if (!arrastre) return
    const { idPuntero } = arrastre
    arrastre = null
    if (elemento.hasPointerCapture?.(idPuntero)) {
      elemento.releasePointerCapture(idPuntero)
    }
  }

  function alPresionar(evento) {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return
    punterosActivos.add(evento.pointerId)
    if (arrastre || punterosActivos.size > 1) {
      if (arrastre) arrastre.invalidado = true
      return
    }
    resultadoGesto = null
    arrastre = {
      idPuntero: evento.pointerId,
      x: evento.clientX,
      y: evento.clientY,
      origenX: evento.clientX,
      origenY: evento.clientY,
      confirmado: false,
      invalidado: false,
    }
    elemento.focus?.({ preventScroll: true })
    elemento.setPointerCapture?.(evento.pointerId)
  }

  function alMover(evento) {
    if (!arrastre || arrastre.invalidado || evento.pointerId !== arrastre.idPuntero) return
    if (!Number.isFinite(evento.clientX) || !Number.isFinite(evento.clientY)) return
    if (!arrastre.confirmado) {
      if (Math.hypot(evento.clientX - arrastre.origenX, evento.clientY - arrastre.origenY) <= UMBRAL_ARRASTRE) return
      arrastre.confirmado = true
      pasarAManual()
    }
    const desplazamientoX = evento.clientX - arrastre.x
    const desplazamientoY = evento.clientY - arrastre.y
    if (desplazamientoX === 0 && desplazamientoY === 0) return
    arrastre.x = evento.clientX
    arrastre.y = evento.clientY
    aplicar({
      ...orientacion,
      giro: orientacion.giro + desplazamientoX * radianesPorPixel,
      inclinacion: orientacion.inclinacion + desplazamientoY * radianesPorPixel,
    })
  }

  function guardarResultado(evento, valido) {
    resultadoGesto = {
      valido,
      instante: evento.timeStamp,
    }
  }

  function alSoltar(evento) {
    punterosActivos.delete(evento.pointerId)
    if (!arrastre || evento.pointerId !== arrastre.idPuntero) return
    alMover(evento)
    guardarResultado(evento, !arrastre.confirmado && !arrastre.invalidado)
    terminarArrastre()
  }

  function alCancelar(evento) {
    punterosActivos.delete(evento.pointerId)
    if (!arrastre || evento.pointerId !== arrastre.idPuntero) return
    guardarResultado(evento, false)
    terminarArrastre()
  }

  // Una sola ruta activa: el click posterior al puntero, o el click aislado del visor.
  // La captura se libera después de clasificar el gesto; lostpointercapture no lo reescribe.
  function alHacerClic(evento) {
    if (destruido || arrastre || punterosActivos.size || evento.button !== 0) return
    const resultado = resultadoGesto
    const tiempo = resultado ? evento.timeStamp - resultado.instante : Infinity
    if (resultado && !resultado.valido && tiempo >= 0 && tiempo <= 1000) return
    resultadoGesto = null
    alActivar?.(evento)
  }

  function alPulsarTecla(evento) {
    if (evento.target !== elemento) return
    if (evento.altKey || evento.ctrlKey || evento.metaKey) return
    const desplazamiento = DESPLAZAMIENTOS_TECLADO[evento.key]
    if (!desplazamiento) return
    evento.preventDefault()
    pasarAManual()
    aplicar({
      ...orientacion,
      giro: orientacion.giro + desplazamiento[0] * pasoTeclado,
      inclinacion: orientacion.inclinacion + desplazamiento[1] * pasoTeclado,
    })
  }

  // La orientación mostrada es la alineación aplicada a la del dispositivo.
  function aplicarSeguimiento(cuaternionDispositivo) {
    const cuaternionVista = alineacion.clone().multiply(cuaternionDispositivo)
    aplicar(extraerOrientacion(cuaternionVista))
  }

  function alRecibirLectura(lectura, numeroIntento) {
    if (numeroIntento !== intento || fuente === 'manual') return
    const cuaternionDispositivo = calcularCuaternionDispositivo(
      lectura,
      obtenerAnguloPantalla(),
    )
    if (!cuaternionDispositivo) return
    ultimoDispositivo = cuaternionDispositivo
    if (fuente === 'solicitando') {
      // La primera lectura se alinea con lo que se ve, sin salto de cámara.
      alineacion = crearAlineacionInicial(
        calcularCuaternionVista(orientacion),
        cuaternionDispositivo,
      )
      fuente = 'sensor'
    }
    aplicarSeguimiento(cuaternionDispositivo)
  }

  function alResolverActivacion({ estado }, numeroIntento) {
    if (numeroIntento !== intento) return
    if (estado === 'activo' || estado === 'cancelado') return
    // Sin permiso, soporte o datos: se conserva lo mostrado y se pasa a manual.
    detenerSeguimiento()
    alAvisar?.(estado)
  }

  elemento.addEventListener('pointerdown', alPresionar)
  elemento.addEventListener('pointermove', alMover)
  elemento.addEventListener('pointerup', alSoltar)
  elemento.addEventListener('pointercancel', alCancelar)
  elemento.addEventListener('lostpointercapture', alCancelar)
  elemento.addEventListener('click', alHacerClic)
  elemento.addEventListener('keydown', alPulsarTecla)

  return {
    obtenerOrientacion: () => ({ ...orientacion }),
    obtenerFuente: () => fuente,
    estaArrastrando: () => arrastre !== null,
    establecerOrientacion: aplicar,

    /**
     * Recentrar. Con sensor activo, el rumbo actual del dispositivo pasa a ser
     * el frente y el seguimiento continúa con la inclinación natural; en otro
     * caso la mirada vuelve a la dirección inicial.
     */
    recentrar() {
      if (fuente === 'sensor' && ultimoDispositivo) {
        const alineacionHorizontal = crearAlineacionHorizontal(ultimoDispositivo)
        if (alineacionHorizontal) {
          alineacion = alineacionHorizontal
          aplicarSeguimiento(ultimoDispositivo)
        }
        return
      }
      aplicar(ORIENTACION_INICIAL)
    },

    /**
     * Intenta activar el sensor. Debe llamarse dentro del gesto de entrada a
     * VR: la petición de permiso se inicia de forma síncrona.
     */
    entrarVr() {
      terminarArrastre()
      punterosActivos.clear()
      resultadoGesto = null
      detenerSeguimiento()
      if (!sensor) {
        alAvisar?.('sin-soporte')
        return
      }
      const numeroIntento = intento
      fuente = 'solicitando'
      sensor
        .activar((lectura) => alRecibirLectura(lectura, numeroIntento))
        .then((resultado) => alResolverActivacion(resultado, numeroIntento))
    },

    /** Vuelve al control manual en la última orientación mostrada. */
    salirVr() {
      terminarArrastre()
      punterosActivos.clear()
      resultadoGesto = null
      detenerSeguimiento()
    },

    destruir() {
      destruido = true
      detenerSeguimiento()
      terminarArrastre()
      elemento.removeEventListener('pointerdown', alPresionar)
      elemento.removeEventListener('pointermove', alMover)
      punterosActivos.clear()
      resultadoGesto = null
      elemento.removeEventListener('pointerup', alSoltar)
      elemento.removeEventListener('pointercancel', alCancelar)
      elemento.removeEventListener('lostpointercapture', alCancelar)
      elemento.removeEventListener('click', alHacerClic)
      elemento.removeEventListener('keydown', alPulsarTecla)
    },
  }
}
