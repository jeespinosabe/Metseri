import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import { calcularOpticaVisor } from './perfilVisor.js'
import { calcularDemostracionTapVr, dibujarDemostracionTapVr } from './demostracionTapVr.js'

const INDICACIONES = [
  ['Pulsa tap', 'para seleccionar.'],
  ['Pulsa dos tap', 'para recentrar.'],
]
export const INSTRUCCION_VR = INDICACIONES.flat().join(' ')
const DISTANCIA = 24
const ANCHO = 960
const ALTO = 340
const DEMOSTRACION_ESTATICA = { dobleTap: null, presion: .65, onda: null }
// Render del HOMIDO GRAB rojo del kit de prensa oficial: https://homido.com/grab/
const IMAGEN_VISOR = new URL('../assets/visorHomidoRojo.jpg', import.meta.url).href

export function crearInstruccionesVr({ alCambiarVisibilidad, alInvalidar } = {}) {
  const lienzo = document.createElement('canvas')
  lienzo.width = ANCHO
  lienzo.height = ALTO
  const contexto = lienzo.getContext('2d')
  const imagenVisor = document.createElement('img')
  imagenVisor.src = IMAGEN_VISOR
  const movimientoReducido = globalThis.window?.matchMedia?.('(prefers-reduced-motion: reduce)')

  // El aviso sigue disponible si la imagen aún no se ha decodificado.
  contexto.fillStyle = '#14212f'
  contexto.fillRect(0, 0, ANCHO, ALTO)
  contexto.fillStyle = '#f1f5fa'
  contexto.font = '48px system-ui, sans-serif'
  contexto.textAlign = 'center'
  contexto.textBaseline = 'middle'
  INDICACIONES.forEach((indicacion, indice) => {
    contexto.fillText(indicacion.join(' '), ANCHO / 2, 122 + 96 * indice)
  })
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  const geometria = new PlaneGeometry(1, 1)
  const material = new MeshBasicMaterial({ map: textura, toneMapped: false, transparent: true, depthTest: false, depthWrite: false })
  const malla = new Mesh(geometria, material)
  malla.renderOrder = 20
  malla.visible = false
  let destruido = false
  let inicioDemostracion = null
  let fotogramaAnterior = null

  function establecerVisible(visible) {
    if (malla.visible === visible) return
    malla.visible = visible
    alCambiarVisibilidad?.(visible)
    alInvalidar?.()
  }

  function actualizar(camara) {
    if (destruido || !malla.visible) return
    malla.position.set(0, 0, -DISTANCIA).applyQuaternion(camara.quaternion).add(camara.position)
    malla.quaternion.copy(camara.quaternion)
  }

  function actualizarAnimacion(tiempo = 0) {
    if (!malla.visible || !imagenVisor.complete || !imagenVisor.naturalWidth) return
    inicioDemostracion ??= tiempo
    const fotograma = movimientoReducido?.matches
      ? DEMOSTRACION_ESTATICA
      : calcularDemostracionTapVr(tiempo - inicioDemostracion)
    if (fotogramaAnterior && fotogramaAnterior.dobleTap === fotograma.dobleTap &&
        fotogramaAnterior.presion === fotograma.presion &&
        fotogramaAnterior.onda === fotograma.onda) return

    fotogramaAnterior = fotograma
    contexto.fillStyle = '#14212f'
    contexto.fillRect(0, 0, ANCHO, ALTO)
    dibujarDemostracionTapVr(contexto, imagenVisor, fotograma)
    INDICACIONES.forEach(([gesto, accion], indice) => {
      const filaActiva = fotograma.dobleTap === (indice === 1)
      const altura = 87 + 126 * indice
      contexto.fillStyle = filaActiva ? '#d7f6a9' : '#f1f5fa'
      contexto.font = '600 57px system-ui, sans-serif'
      contexto.fillText(gesto, 704, altura)
      contexto.fillStyle = '#d0dbe7'
      contexto.font = '46px system-ui, sans-serif'
      contexto.fillText(accion, 704, altura + 52)
    })
    textura.needsUpdate = true
    alInvalidar?.()
  }

  return {
    malla,
    esVisible: () => malla.visible,
    actualizar,
    actualizarAnimacion,
    mostrar(camara) {
      if (destruido) return
      inicioDemostracion = null
      fotogramaAnterior = null
      establecerVisible(true)
      actualizar(camara)
    },
    ocultar() { establecerVisible(false) },
    ajustar(parametros) {
      if (destruido) return
      const { ojos } = calcularOpticaVisor(parametros)
      // El frente no siempre cae en el centro de cada mitad. Respetar el
      // margen menor de ambos ojos, también con barras o una ventana reducida.
      const margenHorizontal = Math.min(...ojos.flatMap((ojo) => [
        ojo.izquierda - ojo.desplazamiento / DISTANCIA,
        ojo.derecha + ojo.desplazamiento / DISTANCIA,
      ]))
      const margenVertical = Math.min(...ojos.flatMap((ojo) => [ojo.arriba, ojo.abajo]))
      const anchoPanel = Math.min(28, 2 * DISTANCIA * .75 * margenHorizontal, 2 * DISTANCIA * .75 * margenVertical * ANCHO / ALTO)
      malla.scale.set(anchoPanel, anchoPanel * ALTO / ANCHO, 1)
      alInvalidar?.()
    },
    destruir() {
      if (destruido) return
      establecerVisible(false)
      destruido = true
      malla.removeFromParent()
      geometria.dispose()
      material.dispose()
      textura.dispose()
    },
  }
}
