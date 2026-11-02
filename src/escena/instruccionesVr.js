import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import { calcularOpticaVisor } from './perfilVisor.js'

export const INSTRUCCION_VR = 'Pulsa tap para seleccionar. Pulsa dos tap para recentrar.'
const DISTANCIA = 24
const ANCHO = 900
const ALTO = 240

export function crearInstruccionesVr({ alCambiarVisibilidad, alInvalidar } = {}) {
  const lienzo = document.createElement('canvas')
  lienzo.width = ANCHO
  lienzo.height = ALTO
  const contexto = lienzo.getContext('2d')
  contexto.fillStyle = '#14212f'
  contexto.fillRect(0, 0, ANCHO, ALTO)
  contexto.fillStyle = '#f1f5fa'
  contexto.font = '48px system-ui, sans-serif'
  contexto.textAlign = 'center'
  contexto.textBaseline = 'middle'
  contexto.fillText('Pulsa tap para seleccionar.', ANCHO / 2, 80)
  contexto.fillText('Pulsa dos tap para recentrar.', ANCHO / 2, 160)
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  const geometria = new PlaneGeometry(1, 1)
  const material = new MeshBasicMaterial({ map: textura, toneMapped: false, transparent: true, depthTest: false, depthWrite: false })
  const malla = new Mesh(geometria, material)
  malla.renderOrder = 20
  malla.visible = false
  let destruido = false

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

  return {
    malla,
    esVisible: () => malla.visible,
    actualizar,
    mostrar(camara) {
      if (destruido) return
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
