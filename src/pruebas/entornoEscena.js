import { PerspectiveCamera, Vector3, Vector4 } from 'three'
import { crearCampoEstelar } from '../escena/campoEstelar.js'

// Solo se sustituyen DOM, Canvas 2D y el dispositivo WebGL. La escena,
// las mallas, la selección, los rayos y las acciones son los de producción.
export function prepararEntornoEscena(t) {
  let campo
  const originales = ['document', 'window', 'Image', 'ResizeObserver'].map((clave) => [clave, Object.getOwnPropertyDescriptor(globalThis, clave)])
  const noHacerNada = () => {}
  const contexto = {
    font: '', fillRect: noHacerNada, strokeRect: noHacerNada, clearRect: noHacerNada,
    beginPath: noHacerNada, moveTo: noHacerNada, lineTo: noHacerNada, bezierCurveTo: noHacerNada,
    closePath: noHacerNada, fill: noHacerNada, ellipse: noHacerNada, stroke: noHacerNada,
    scale: noHacerNada, arc: noHacerNada, fillText: noHacerNada, drawImage: noHacerNada,
    createRadialGradient: () => ({ addColorStop: noHacerNada }),
    measureText(texto) { return { width: texto.length * parseFloat(this.font) * .55 } },
  }
  function crearElemento() {
    return Object.assign(new EventTarget(), {
      style: {}, classList: { add: noHacerNada, toggle: noHacerNada },
      append: noHacerNada, appendChild: noHacerNada, remove: noHacerNada, setAttribute: noHacerNada,
      getContext: () => contexto,
      getBoundingClientRect() { return { left: 0, top: 0, right: this.clientWidth, bottom: this.clientHeight, width: this.clientWidth, height: this.clientHeight } },
      clientWidth: 900, clientHeight: 450,
    })
  }
  const documento = Object.assign(new EventTarget(), { hidden: false, createElement: crearElemento })
  const ventana = Object.assign(new EventTarget(), { devicePixelRatio: 1, screen: { width: 900, height: 450 } })
  let alRedimensionar
  for (const [clave, valor] of Object.entries({
    document: documento, window: ventana, Image: class ImagenSimulada {},
    ResizeObserver: class ObservadorSimulado {
      constructor(callback) { alRedimensionar = callback }
      observe() {}
      disconnect() {}
    },
  })) Object.defineProperty(globalThis, clave, { configurable: true, value: valor })
  t.after(() => {
    try { campo?.destruir() } finally {
      originales.forEach(([clave, descriptor]) => {
        if (descriptor) Object.defineProperty(globalThis, clave, descriptor)
        else delete globalThis[clave]
      })
    }
  })

  let ciclo
  let escenaPrincipal
  let destino = null
  let viewport = new Vector4()
  let recorte = new Vector4()
  let pruebaRecorte = false
  const punteros = []
  const contenedor = crearElemento()
  const lienzo = crearElemento()
  const renderizador = {
    domElement: lienzo, autoClear: true,
    setSize: (ancho, alto) => { lienzo.clientWidth = ancho; lienzo.clientHeight = alto },
    setPixelRatio: noHacerNada, getPixelRatio: () => 1,
    getSize: (vector) => vector.set(contenedor.clientWidth, contenedor.clientHeight),
    getRenderTarget: () => destino, setRenderTarget: (nuevo) => { destino = nuevo },
    getViewport: (vector) => vector.copy(viewport),
    setViewport: (...valores) => { viewport = valores[0]?.isVector4 ? valores[0].clone() : new Vector4(...valores) },
    getScissor: (vector) => vector.copy(recorte),
    setScissor: (...valores) => { recorte = valores[0]?.isVector4 ? valores[0].clone() : new Vector4(...valores) },
    getScissorTest: () => pruebaRecorte, setScissorTest: (valor) => { pruebaRecorte = valor },
    setAnimationLoop: (callback) => { ciclo = callback }, dispose: noHacerNada, forceContextLoss: noHacerNada,
    render(escena) {
      escena.updateMatrixWorld(true)
      const uniforme = escena.children[0]?.material?.uniforms?.tipoPuntero
      if (uniforme) punteros.push(uniforme.value)
      else escenaPrincipal = escena
    },
  }
  const lecturas = []
  campo = crearCampoEstelar(contenedor, { crearRenderizador: () => renderizador, alCambiarFicha: (lectura) => lecturas.push(lectura) })
  return {
    campo, punteros, dibujar: () => ciclo?.(), lectura: () => lecturas.at(-1),
    rectangulo: () => contenedor.getBoundingClientRect(),
    tarjeta: () => escenaPrincipal.children.find((nodo) => nodo.isMesh && nodo.geometry.type === 'PlaneGeometry' && !nodo.material.transparent),
    apuntarCuerpo(cuerpoId) {
      ciclo?.()
      const cuerpo = escenaPrincipal.getObjectByName(cuerpoId)
      const camara = new PerspectiveCamera()
      camara.lookAt(cuerpo.getWorldPosition(new Vector3()))
      campo.establecerOrientacion(camara.quaternion)
    },
    redimensionar(ancho, alto, { rotarPantalla = false } = {}) {
      contenedor.clientWidth = ancho
      contenedor.clientHeight = alto
      if (rotarPantalla) Object.assign(ventana.screen, { width: ancho, height: alto })
      alRedimensionar()
    },
  }
}
