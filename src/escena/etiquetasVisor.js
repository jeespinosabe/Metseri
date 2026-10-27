import { CanvasTexture, Group, Sprite, SpriteMaterial, SRGBColorSpace, Vector3 } from 'three'

// En VR los nombres forman parte de la escena para atravesar la corrección de lentes.
export function crearEtiquetasVisor(escena, planetas) {
  const raiz = new Group()
  raiz.visible = false
  escena.add(raiz)
  const etiquetas = planetas.map((planeta) => {
    const lienzo = document.createElement('canvas')
    lienzo.width = 512
    lienzo.height = 128
    const contexto = lienzo.getContext('2d')
    const textura = new CanvasTexture(lienzo)
    textura.colorSpace = SRGBColorSpace
    const material = new SpriteMaterial({ map: textura, depthWrite: false, toneMapped: false })
    const sprite = new Sprite(material)
    raiz.add(sprite)
    function dibujar(activa) {
      contexto.clearRect(0, 0, 512, 128)
      contexto.textAlign = 'center'
      contexto.fillStyle = activa ? '#cce89f' : '#aebcc9'
      contexto.font = '52px system-ui, sans-serif'
      contexto.fillText(planeta.nombre, 256, 57, 500)
      contexto.fillStyle = '#71808f'
      contexto.font = '28px system-ui, sans-serif'
      contexto.fillText(planeta.tipo.toUpperCase(), 256, 109, 500)
      textura.needsUpdate = true
    }
    dibujar(false)
    return { planeta, sprite, textura, material, dibujar }
  })
  const punto = new Vector3()
  const vertice = new Vector3()
  return {
    actualizarAspecto({ planetaApuntado, planetaSeleccionado }) {
      etiquetas.forEach(({ planeta, dibujar }) => dibujar(planeta.id === planetaApuntado || planeta.id === planetaSeleccionado))
    },
    actualizar(camara, modo) {
      raiz.visible = modo === 'vr'
      if (!raiz.visible) return
      camara.updateWorldMatrix(true, false)
      etiquetas.forEach(({ planeta, sprite }) => {
        punto.copy(planeta.posicion).applyMatrix4(camara.matrixWorldInverse)
        sprite.visible = punto.z < 0
        if (!sprite.visible) return
        const distancia = punto.length()
        let abajo = punto.y - planeta.radio
        planeta.contorno?.forEach((muestra) => {
          vertice.copy(muestra).applyMatrix4(camara.matrixWorldInverse)
          abajo = Math.min(abajo, vertice.y)
        })
        punto.y = abajo - distancia * .07
        sprite.position.copy(punto).applyMatrix4(camara.matrixWorld)
        sprite.scale.set(distancia * .4, distancia * .1, 1)
      })
    },
    destruir() {
      raiz.removeFromParent()
      etiquetas.forEach(({ textura, material }) => { textura.dispose(); material.dispose() })
    },
  }
}
