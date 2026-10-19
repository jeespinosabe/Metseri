import { Euler, Quaternion, Vector3 } from 'three'

const EJE_VERTICAL = new Vector3(0, 1, 0)
const EJE_PANTALLA = new Vector3(0, 0, 1)
const DIRECCION_FRENTE = new Vector3(0, 0, -1)
// La cámara mira por la parte trasera del dispositivo, no por su borde superior.
const GIRO_CAMARA_TRASERA = new Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2)
const PLAZO_PRIMERA_LECTURA_MS = 2000

const aRadianes = (grados) => (grados * Math.PI) / 180
const esNumeroFinito = (valor) => typeof valor === 'number' && Number.isFinite(valor)

// Los ángulos iguales a cero son válidos; se rechaza lo nulo, incompleto o no finito.
export function esLecturaValida(lectura) {
  return (
    Boolean(lectura) &&
    esNumeroFinito(lectura.alpha) &&
    esNumeroFinito(lectura.beta) &&
    esNumeroFinito(lectura.gamma)
  )
}

/**
 * Convierte una lectura `alpha`/`beta`/`gamma` (en grados, orden Z-X'-Y'' de la
 * especificación de orientación) en el cuaternión de la cámara, compensando el
 * ángulo de la pantalla. Se construye un cuaternión completo para no integrar
 * ángulos Euler de forma acumulativa. Devuelve `null` si la lectura no es válida.
 */
export function calcularCuaternionDispositivo(lectura, anguloPantalla = 0) {
  if (!esLecturaValida(lectura)) return null
  const compensacion = esNumeroFinito(anguloPantalla) ? anguloPantalla : 0
  const cuaternion = new Quaternion().setFromEuler(
    new Euler(
      aRadianes(lectura.beta),
      aRadianes(lectura.alpha),
      -aRadianes(lectura.gamma),
      'YXZ',
    ),
  )
  cuaternion.multiply(GIRO_CAMARA_TRASERA)
  cuaternion.multiply(
    new Quaternion().setFromAxisAngle(EJE_PANTALLA, -aRadianes(compensacion)),
  )
  return cuaternion
}

// Rumbo horizontal de la mirada; positivo hacia la izquierda, como `giro`.
export function calcularRumbo(cuaternion) {
  const frente = DIRECCION_FRENTE.clone().applyQuaternion(cuaternion)
  return Math.atan2(-frente.x, -frente.z)
}

/** Descompone un cuaternión en giro, inclinación y balanceo (orden YXZ). */
export function extraerOrientacion(cuaternion) {
  const euler = new Euler().setFromQuaternion(cuaternion, 'YXZ')
  return { giro: euler.y, inclinacion: euler.x, balanceo: euler.z }
}

/** Alineación que hace coincidir la primera lectura con la orientación visible. */
export function crearAlineacionInicial(cuaternionVisible, cuaternionDispositivo) {
  return cuaternionVisible.clone().multiply(cuaternionDispositivo.clone().invert())
}

/**
 * Alineación solo horizontal: la dirección actual del dispositivo pasa a ser el
 * frente y la inclinación sigue la del dispositivo. Devuelve `null` si el
 * dispositivo apunta casi en vertical y el rumbo no está definido.
 */
export function crearAlineacionHorizontal(cuaternionDispositivo) {
  const frente = DIRECCION_FRENTE.clone().applyQuaternion(cuaternionDispositivo)
  if (Math.hypot(frente.x, frente.z) < 1e-6) return null
  return new Quaternion().setFromAxisAngle(
    EJE_VERTICAL,
    -calcularRumbo(cuaternionDispositivo),
  )
}

/**
 * Negocia el acceso al sensor de orientación a partir de una acción del usuario.
 *
 * `activar(alLectura)` debe llamarse dentro del gesto del usuario: la petición
 * de permiso, si el navegador la exige, se inicia de forma síncrona. La promesa
 * devuelta se resuelve con `{ estado }`:
 * `activo`, `denegado`, `sin-soporte`, `contexto-inseguro`, `error`,
 * `sin-datos` (sin lectura válida en el plazo) o `cancelado`.
 * Tras `activo`, cada lectura válida se entrega a `alLectura` hasta `cancelar()`.
 *
 * El plazo cuenta solo cuando se pueden recibir datos (tras resolver el permiso)
 * y solo mientras la página es visible. Cada intento tiene una generación: tras
 * `cancelar()` o un nuevo `activar()`, ninguna promesa ni lectura tardía de un
 * intento anterior tiene efecto.
 */
export function crearSensorOrientacion({
  ventana = globalThis.window,
  documento = globalThis.document,
  plazoMs = PLAZO_PRIMERA_LECTURA_MS,
  temporizadores = {
    setTimeout: (...argumentos) => globalThis.setTimeout(...argumentos),
    clearTimeout: (...argumentos) => globalThis.clearTimeout(...argumentos),
    ahora: () => globalThis.performance.now(),
  },
} = {}) {
  let generacion = 0
  let cancelarIntento = null

  function cancelar() {
    generacion += 1
    const cancelarAnterior = cancelarIntento
    cancelarIntento = null
    cancelarAnterior?.()
  }

  function activar(alLectura) {
    cancelar()
    const miGeneracion = generacion

    return new Promise((resolver) => {
      let resuelto = false
      let retirarEscuchas = () => {}

      const finalizar = (estado) => {
        if (resuelto) return
        resuelto = true
        resolver({ estado })
      }
      const vigente = () => miGeneracion === generacion

      cancelarIntento = () => {
        retirarEscuchas()
        finalizar('cancelado')
      }

      const ConstructorOrientacion = ventana?.DeviceOrientationEvent
      if (!ConstructorOrientacion) return finalizar('sin-soporte')
      if (ventana.isSecureContext === false) return finalizar('contexto-inseguro')

      function habilitar() {
        let activo = false
        let restanteMs = plazoMs
        let inicioTramo = null
        let temporizador = null

        const paginaVisible = () => documento?.visibilityState !== 'hidden'

        function pausarPlazo() {
          if (temporizador === null) return
          temporizadores.clearTimeout(temporizador)
          temporizador = null
          restanteMs -= temporizadores.ahora() - inicioTramo
        }

        function reanudarPlazo() {
          if (activo || temporizador !== null || !paginaVisible()) return
          inicioTramo = temporizadores.ahora()
          temporizador = temporizadores.setTimeout(alAgotarPlazo, Math.max(0, restanteMs))
        }

        function alAgotarPlazo() {
          temporizador = null
          if (!vigente() || activo) return
          retirarEscuchas()
          finalizar('sin-datos')
        }

        function alCambiarVisibilidad() {
          if (paginaVisible()) reanudarPlazo()
          else pausarPlazo()
        }

        function alRecibirOrientacion(evento) {
          if (!vigente()) return
          const lectura = { alpha: evento.alpha, beta: evento.beta, gamma: evento.gamma }
          if (!esLecturaValida(lectura)) return
          if (!activo) {
            activo = true
            pausarPlazo()
            finalizar('activo')
          }
          alLectura(lectura)
        }

        retirarEscuchas = () => {
          pausarPlazo()
          ventana.removeEventListener('deviceorientation', alRecibirOrientacion)
          documento?.removeEventListener('visibilitychange', alCambiarVisibilidad)
        }

        ventana.addEventListener('deviceorientation', alRecibirOrientacion)
        documento?.addEventListener('visibilitychange', alCambiarVisibilidad)
        reanudarPlazo()
      }

      if (typeof ConstructorOrientacion.requestPermission !== 'function') {
        habilitar()
        return undefined
      }

      // La petición se inicia ahora mismo, dentro del gesto, antes de cualquier espera.
      let solicitud
      try {
        solicitud = Promise.resolve(ConstructorOrientacion.requestPermission())
      } catch {
        return finalizar('error')
      }
      solicitud.then(
        (respuesta) => {
          if (!vigente()) return
          if (respuesta === 'granted') habilitar()
          else finalizar('denegado')
        },
        () => {
          if (vigente()) finalizar('error')
        },
      )
      return undefined
    })
  }

  return { activar, cancelar }
}
