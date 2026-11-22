import { CanvasTexture, Group, Sprite, SpriteMaterial, SRGBColorSpace, Vector3 } from 'three'
import { configurarTexturaLectura } from './lecturaVisor.js'
import { limitarRasterizacion } from './rendimientoEscena.js'
import { medirFuenteVisor, proyectarPuntoVisor, proyectarRectanguloVisor, rectangulosSeCruzan } from './proyeccionVisor.js'

// Tamaño proyectado, en píxeles de pantalla, que tienen todos los nombres en el visor.
const TAMANO_NOMBRE_VISOR = 14.2

// En VR los nombres forman parte de la escena para atravesar la corrección de lentes.
export function crearEtiquetasVisor(escena, planetas) {
  const raiz = new Group()
  raiz.visible = false
  escena.add(raiz)
  let configuracion = null
  const etiquetas = planetas.map((planeta) => {
    const lienzo = document.createElement('canvas')
    lienzo.width = 512
    lienzo.height = 160
    const contexto = lienzo.getContext('2d')
    let textura = new CanvasTexture(lienzo)
    textura.colorSpace = SRGBColorSpace
    const material = new SpriteMaterial({ map: textura, depthWrite: false, toneMapped: false })
    const sprite = new Sprite(material)
    raiz.add(sprite)
    sprite.userData.cuerpoId = planeta.id
    let factor = 1
    let anchoContenido = 512
    function dibujar(activa) {
      contexto.setTransform?.(factor, 0, 0, factor, 0, 0)
      contexto.clearRect(0, 0, 512, 160)
      contexto.textAlign = 'center'
      contexto.textBaseline = 'top'
      contexto.strokeStyle = '#080b12'
      contexto.lineWidth = 3
      contexto.lineJoin = 'round'
      contexto.fillStyle = activa ? '#cce89f' : '#aebcc9'
      contexto.font = '500 52px system-ui, sans-serif'
      contexto.strokeText?.(planeta.nombre, 256, 8, 500)
      contexto.fillText(planeta.nombre, 256, 8, 500)
      anchoContenido = Math.min(506, contexto.measureText(planeta.nombre).width + 6)
      textura.needsUpdate = true
    }
    dibujar(false)
    return { planeta, sprite, material, dibujar, obtenerAncho: () => anchoContenido, activa: false,
      ajustar() {
        const raster = limitarRasterizacion(512, 160, configuracion)
        factor = raster.factor
        if (lienzo.width !== raster.ancho || lienzo.height !== raster.alto) {
          lienzo.width = raster.ancho
          lienzo.height = raster.alto
          textura.dispose()
          textura = new CanvasTexture(lienzo)
          textura.colorSpace = SRGBColorSpace
          material.map = textura
          configurarTexturaLectura(textura)
          this.dibujar(this.activa)
        }
      },
      destruir() { textura.dispose(); material.dispose() },
    }
  })
  const punto = new Vector3()
  const vertice = new Vector3()
  return {
    ajustar(parametros) {
      configuracion = parametros
      etiquetas.forEach(etiqueta => etiqueta.ajustar())
    },
    actualizarAspecto({ planetaApuntado, planetaSeleccionado }) {
      etiquetas.forEach((etiqueta) => {
        const activa = etiqueta.planeta.id === planetaApuntado || etiqueta.planeta.id === planetaSeleccionado
        if (activa === etiqueta.activa) return
        etiqueta.activa = activa
        etiqueta.dibujar(activa)
      })
    },
    actualizar(camara, modo, ficha = null) {
      raiz.visible = modo === 'vr'
      if (!raiz.visible) return
      camara.updateWorldMatrix(true, false)
      const ocupados = []
      let cajasFicha = null
      if (configuracion && ficha?.visible) {
        ficha.updateWorldMatrix(true, false)
        const puntos = [-.5, 0, .5].flatMap(x => [-.5, 0, .5].map(y => new Vector3(x, y, 0)
          .applyMatrix4(ficha.matrixWorld).applyMatrix4(camara.matrixWorldInverse)))
        cajasFicha = [0, 1].map(indice => {
          const pantalla = puntos.map(p => proyectarPuntoVisor(p, configuracion, indice)).filter(Boolean)
          if (!pantalla.length) return null
          const x = Math.min(...pantalla.map(p => p.x)), y = Math.min(...pantalla.map(p => p.y))
          return { x, y, ancho: Math.max(...pantalla.map(p => p.x)) - x, alto: Math.max(...pantalla.map(p => p.y)) - y }
        })
      }
      // Los satélites se ubican primero para reservar su hueco antes que los demás nombres.
      const ordenadas = [...etiquetas].sort((a, b) => {
        const distanciaCentro = etiqueta => {
          punto.copy(etiqueta.planeta.posicion).applyMatrix4(camara.matrixWorldInverse)
          return punto.z < 0 ? Math.hypot(punto.x, punto.y) / -punto.z : Infinity
        }
        const distanciaA = distanciaCentro(a), distanciaB = distanciaCentro(b)
        if (Number.isFinite(distanciaA) && Number.isFinite(distanciaB) && Boolean(a.planeta.planetaId) !== Boolean(b.planeta.planetaId)) {
          return a.planeta.planetaId ? -1 : 1
        }
        return distanciaA - distanciaB
      })
      ordenadas.forEach(({ planeta, sprite, obtenerAncho }) => {
        punto.copy(planeta.posicion).applyMatrix4(camara.matrixWorldInverse)
        sprite.visible = punto.z < 0
        if (!sprite.visible) return
        if (configuracion && ![0, 1].some(indice => proyectarPuntoVisor(punto, configuracion, indice)?.visible)) {
          sprite.visible = false
          return
        }
        const distancia = punto.length()
        let abajo = punto.y - planeta.radio
        let arriba = punto.y + planeta.radio
        let izquierda = punto.x - planeta.radio
        let derecha = punto.x + planeta.radio
        planeta.contorno?.forEach((muestra) => {
          vertice.copy(muestra).applyMatrix4(camara.matrixWorldInverse)
          abajo = Math.min(abajo, vertice.y)
          arriba = Math.max(arriba, vertice.y)
          izquierda = Math.min(izquierda, vertice.x)
          derecha = Math.max(derecha, vertice.x)
        })
        if (configuracion && configuracion.ancho > configuracion.alto) {
          const hueco = distancia * .015
          const candidatos = []
          for (const desplazamiento of [0, -.55, .55]) {
            candidatos.push((ancho, alto) => ({ x: punto.x + ancho * desplazamiento, y: abajo - hueco - alto / 2 }))
            candidatos.push((ancho, alto) => ({ x: punto.x + ancho * desplazamiento, y: arriba + hueco + alto / 2 }))
          }
          candidatos.push(ancho => ({ x: izquierda - hueco - ancho / 2, y: punto.y }), ancho => ({ x: derecha + hueco + ancho / 2, y: punto.y }))
          // Una segunda fila permite separar satélites junto al borde inferior.
          for (const desplazamiento of [0, -.55, .55, -1.1, 1.1]) {
            candidatos.push((ancho, alto) => ({ x: punto.x + ancho * desplazamiento, y: arriba + hueco + alto * 1.5 }))
          }
          let posicion = null
          let cajas = null
          let ancho, alto
          for (const ubicar of candidatos) {
            ancho = distancia * .4
            alto = ancho * 160 / 512
            // Todos los nombres convergen al mismo tamaño proyectado, sin importar su distancia o posición.
            for (let paso = 0; paso < 6; paso += 1) {
              const candidato = ubicar(ancho, alto)
              const nombre = Math.min(...medirFuenteVisor({ x: candidato.x, y: candidato.y + alto * (.5 - 8 / 160), z: punto.z, tamano: alto * 52 / 160 }, configuracion))
              const ajuste = TAMANO_NOMBRE_VISOR / Math.max(.1, nombre)
              if (Math.abs(ajuste - 1) < .005) break
              ancho *= ajuste
              alto *= ajuste
            }
            const candidato = ubicar(ancho, alto)
            const altoContenido = 64
            const propuesta = proyectarRectanguloVisor({ x: candidato.x,
              y: candidato.y + alto * (.5 - (5 + altoContenido / 2) / 160), z: punto.z,
              ancho: ancho * obtenerAncho() / 512, alto: alto * altoContenido / 160 }, configuracion)
            const valida = propuesta.every((caja, indice) => caja?.visible && caja.x >= 8
              && caja.x + caja.ancho <= configuracion.ancho / 2 - 8 && caja.y >= 38
              && caja.y + caja.alto <= configuracion.alto - configuracion.margenInferior
              && !rectangulosSeCruzan(caja, cajasFicha?.[indice])
              && !ocupados.some(otra => rectangulosSeCruzan(caja, otra[indice], 3)))
            if (valida) { posicion = candidato; cajas = propuesta; break }
          }
          sprite.visible = Boolean(posicion)
          sprite.userData.cajas = cajas
          if (!posicion) return
          ocupados.push(cajas)
          punto.x = posicion.x
          punto.y = posicion.y
          sprite.scale.set(ancho, alto, 1)
          sprite.position.copy(punto).applyMatrix4(camara.matrixWorld)
          return
        }
        punto.y = abajo - distancia * .07
        sprite.position.copy(punto).applyMatrix4(camara.matrixWorld)
        sprite.scale.set(distancia * .4, distancia * .125, 1)
      })
    },
    destruir() {
      raiz.removeFromParent()
      etiquetas.forEach(etiqueta => etiqueta.destruir())
    },
  }
}
