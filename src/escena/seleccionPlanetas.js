import { Raycaster, Vector2 } from 'three'

/** Solo las mallas incluidas son objetivos; estrellas y halos quedan fuera. */
export function crearDetectorPlanetas({ camara, seleccionables, obtenerDireccion }) {
  const rayo = new Raycaster()
  const coordenadas = new Vector2()

  function detectar() {
    camara.updateWorldMatrix(true, false)
    seleccionables.forEach((malla) => malla.updateWorldMatrix(true, false))
    const direccion = obtenerDireccion?.(coordenadas)
    if (direccion) {
      rayo.ray.origin.setFromMatrixPosition(camara.matrixWorld)
      rayo.ray.direction.copy(direccion).transformDirection(camara.matrixWorld)
    } else rayo.setFromCamera(coordenadas, camara)
    return rayo.intersectObjects(seleccionables, false)[0]?.object.userData.planetaId ?? null
  }

  return {
    detectarMirada() {
      coordenadas.set(0, 0)
      return detectar()
    },
    detectarPosicion({ clientX, clientY }, rectangulo) {
      if (!(rectangulo.width > 0 && rectangulo.height > 0)) return null
      const x = (clientX - rectangulo.left) / rectangulo.width
      const y = (clientY - rectangulo.top) / rectangulo.height
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null
      coordenadas.set(x * 2 - 1, 1 - y * 2)
      return detectar()
    },
  }
}

/** Mirar y seleccionar son independientes. En VR, deseleccionar tiene prioridad. */
export function crearSeleccionPlanetas({ detector, alCambiar } = {}) {
  let modo = 'normal'
  let planetaApuntado = null
  let planetaSeleccionado = null
  let posicionMouse = null
  let rectanguloMouse = null
  let destruido = false

  function obtenerEstado() {
    return { planetaApuntado, planetaSeleccionado }
  }

  function notificar(antes) {
    if (antes.planetaApuntado !== planetaApuntado || antes.planetaSeleccionado !== planetaSeleccionado) {
      alCambiar?.(obtenerEstado())
    }
  }

  function actualizarMirada() {
    if (destruido) return
    const antes = obtenerEstado()
    planetaApuntado = modo === 'vr' ? detector.detectarMirada()
      : posicionMouse ? detector.detectarPosicion(posicionMouse, rectanguloMouse) : null
    notificar(antes)
  }

  return {
    obtenerEstado,
    actualizarMirada,
    actualizarMouse(posicion, rectangulo) {
      if (destruido || modo !== 'normal') return
      posicionMouse = posicion
      rectanguloMouse = rectangulo
      actualizarMirada()
    },
    quitarSeleccion() {
      if (destruido) return
      const antes = obtenerEstado()
      planetaSeleccionado = null
      notificar(antes)
    },
    establecerModo(nuevoModo) {
      if (destruido) return
      modo = nuevoModo
      posicionMouse = null
      actualizarMirada()
    },
    activar(evento, rectangulo) {
      if (destruido) return
      const antes = obtenerEstado()
      if (modo === 'vr') {
        planetaApuntado = detector.detectarMirada()
        planetaSeleccionado = planetaSeleccionado ? null : planetaApuntado
      } else {
        const objetivo = detector.detectarPosicion(evento, rectangulo)
        planetaSeleccionado = objetivo === planetaSeleccionado ? null : objetivo
      }
      notificar(antes)
    },
    destruir() {
      destruido = true
      posicionMouse = null
      planetaApuntado = null
      planetaSeleccionado = null
    },
  }
}
