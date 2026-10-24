import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect.js'
import { crearPlanetas, RADIO_PLANETAS } from './planetas.js'
import { crearDetectorPlanetas, crearSeleccionPlanetas } from './seleccionPlanetas.js'
import { crearProyeccionVista } from './proyeccionVista.js'
import { crearEtiquetasPlanetas } from './etiquetasPlanetas.js'

const COLOR_FONDO = 0x080b12
const RADIO_CIELO = 100
const LIMITE_PIXEL_RATIO = 1.5
const CAMPO_VISION_VERTICAL = 70
const SEMILLA_CIELO = 20241018

// Grupos de tamaño y brillo: una mayoría tenue y una minoría brillante.
const GRUPOS_ESTRELLAS = [
  { cantidad: 4200, tamano: 1.3, brilloMinimo: 0.3, brilloMaximo: 0.6 },
  { cantidad: 1500, tamano: 1.9, brilloMinimo: 0.55, brilloMaximo: 0.85 },
  { cantidad: 300, tamano: 2.9, brilloMinimo: 0.85, brilloMaximo: 1 },
]

// Tintes casi blancos con ligera variación fría o cálida.
const TINTES_ESTRELLAS = [
  [1, 1, 1],
  [0.82, 0.9, 1],
  [1, 0.93, 0.82],
]

function crearGeneradorAleatorio(semilla) {
  let estado = semilla >>> 0
  return function generarAleatorio() {
    estado = (estado + 0x6d2b79f5) >>> 0
    let valor = estado
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1)
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61)
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296
  }
}

function crearTexturaPunto() {
  const lienzo = document.createElement('canvas')
  lienzo.width = 64
  lienzo.height = 64
  const contexto = lienzo.getContext('2d')
  const gradiente = contexto.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradiente.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradiente.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)')
  gradiente.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)')
  gradiente.addColorStop(1, 'rgba(255, 255, 255, 0)')
  contexto.fillStyle = gradiente
  contexto.fillRect(0, 0, 64, 64)
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  return textura
}

// Distribución uniforme sobre la esfera, estable gracias a la semilla fija.
function crearGeometriaGrupo(grupo, generarAleatorio) {
  const posiciones = new Float32Array(grupo.cantidad * 3)
  const colores = new Float32Array(grupo.cantidad * 3)

  for (let indice = 0; indice < grupo.cantidad; indice += 1) {
    const altura = generarAleatorio() * 2 - 1
    const fase = generarAleatorio() * Math.PI * 2
    const radioHorizontal = Math.sqrt(1 - altura * altura)
    posiciones[indice * 3] = Math.cos(fase) * radioHorizontal * RADIO_CIELO
    posiciones[indice * 3 + 1] = altura * RADIO_CIELO
    posiciones[indice * 3 + 2] = Math.sin(fase) * radioHorizontal * RADIO_CIELO

    const brillo =
      grupo.brilloMinimo +
      generarAleatorio() * (grupo.brilloMaximo - grupo.brilloMinimo)
    const tinte =
      TINTES_ESTRELLAS[Math.floor(generarAleatorio() * TINTES_ESTRELLAS.length)]
    colores[indice * 3] = tinte[0] * brillo
    colores[indice * 3 + 1] = tinte[1] * brillo
    colores[indice * 3 + 2] = tinte[2] * brillo
  }

  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new BufferAttribute(posiciones, 3))
  geometria.setAttribute('color', new BufferAttribute(colores, 3))
  return geometria
}

/**
 * Crea la escena de estrellas dentro del contenedor y devuelve su interfaz.
 * Lanza un error si el navegador no puede crear el contexto gráfico.
 * `alPerderContexto` se invoca si el contexto gráfico se pierde después.
 */
export function crearCampoEstelar(contenedor, { alPerderContexto } = {}) {
  const renderizador = new WebGLRenderer({ antialias: true })
  const lienzo = renderizador.domElement
  lienzo.style.display = 'block'
  lienzo.style.width = '100%'
  lienzo.style.height = '100%'
  contenedor.appendChild(lienzo)

  const escena = new Scene()
  escena.background = new Color(COLOR_FONDO)

  const camara = new PerspectiveCamera(CAMPO_VISION_VERTICAL, 1, 0.1, 1000)

  const textura = crearTexturaPunto()
  const generarAleatorio = crearGeneradorAleatorio(SEMILLA_CIELO)
  const geometrias = []
  const materiales = []
  for (const grupo of GRUPOS_ESTRELLAS) {
    const geometria = crearGeometriaGrupo(grupo, generarAleatorio)
    const material = new PointsMaterial({
      size: grupo.tamano,
      sizeAttenuation: false,
      map: textura,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    geometrias.push(geometria)
    materiales.push(material)
    escena.add(new Points(geometria, material))
  }

  let planetas
  try {
    planetas = crearPlanetas()
  } catch (error) {
    geometrias.forEach((geometria) => geometria.dispose())
    materiales.forEach((material) => material.dispose())
    textura.dispose()
    renderizador.dispose()
    renderizador.forceContextLoss()
    lienzo.remove()
    throw error
  }
  escena.add(planetas.raiz, new AmbientLight(0xbac9dd, .38))
  const luz = new DirectionalLight(0xfff0d8, 3.1)
  const direccionLuz = new Vector3(-1.2, .8, 1.3)
  luz.position.copy(direccionLuz)
  escena.add(luz)
  // Convergencia cerca de los cuerpos apuntables, compartida por ambos ojos.
  camara.focus = RADIO_PLANETAS
  const proyeccion = crearProyeccionVista(escena)
  const etiquetas = crearEtiquetasPlanetas(contenedor, planetas.etiquetas)

  let efectoEstereo = null
  let modo = 'normal'
  let destruido = false
  let contextoPerdido = false
  let necesitaDibujo = true
  const seleccion = crearSeleccionPlanetas({
    detector: crearDetectorPlanetas({ camara, seleccionables: planetas.seleccionables, obtenerDireccion: proyeccion.obtenerDireccion }),
    alCambiar: (estado) => {
      planetas.actualizarAspecto(estado)
      etiquetas.actualizarAspecto(estado)
      necesitaDibujo = true
    },
  })

  function ajustarTamano() {
    const ancho = Math.max(1, contenedor.clientWidth)
    const alto = Math.max(1, contenedor.clientHeight)
    renderizador.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, LIMITE_PIXEL_RATIO),
    )
    renderizador.setSize(ancho, alto, false)
    restaurarAreaDibujo()
    proyeccion.ajustar(camara, ancho, alto, modo)
    necesitaDibujo = true
  }

  // StereoEffect deja el viewport en la mitad derecha; la vista única necesita todo el lienzo.
  function restaurarAreaDibujo() {
    const { x: ancho, y: alto } = renderizador.getSize(new Vector2())
    renderizador.setScissorTest(false)
    renderizador.setViewport(0, 0, ancho, alto)
  }

  function dibujarSiHaceFalta() {
    if (!necesitaDibujo) return
    necesitaDibujo = false
    etiquetas.actualizar(camara, modo, proyeccion.obtenerParametros(), contenedor.clientWidth, contenedor.clientHeight)
    if (modo === 'vr') efectoEstereo.render(escena, camara)
    else renderizador.render(escena, camara)
  }

  function iniciarCiclo() {
    necesitaDibujo = true
    renderizador.setAnimationLoop(dibujarSiHaceFalta)
  }

  function detenerCiclo() {
    renderizador.setAnimationLoop(null)
  }

  function alCambiarVisibilidad() {
    if (document.hidden) detenerCiclo()
    else iniciarCiclo()
  }

  function alContextoPerdido(evento) {
    evento.preventDefault()
    contextoPerdido = true
    detenerCiclo()
    if (!destruido && alPerderContexto) alPerderContexto()
  }

  const observador = new ResizeObserver(ajustarTamano)
  observador.observe(contenedor)
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
  lienzo.addEventListener('webglcontextlost', alContextoPerdido)

  ajustarTamano()
  if (!document.hidden) iniciarCiclo()

  return {
    lienzo,

    // Aplica la orientación de la cámara; la posición del observador es fija.
    establecerOrientacion(cuaternion) {
      if (destruido || contextoPerdido) return
      camara.quaternion.copy(cuaternion)
      luz.position.copy(direccionLuz).applyQuaternion(cuaternion)
      seleccion.actualizarMirada()
      necesitaDibujo = true
    },

    obtenerModo: () => modo,

    // 'normal' = vista única; 'vr' = dos vistas contiguas con la misma escena y cámara.
    establecerModo(nuevoModo) {
      if (destruido || contextoPerdido) return
      if (nuevoModo === modo) return
      if (nuevoModo === 'vr') efectoEstereo ??= new StereoEffect(renderizador)
      modo = nuevoModo
      proyeccion.ajustar(camara, contenedor.clientWidth, contenedor.clientHeight, modo)
      seleccion.establecerModo(modo)
      restaurarAreaDibujo()
      necesitaDibujo = true
    },

    obtenerOrientacion() {
      return new Quaternion().copy(camara.quaternion)
    },

    activar(evento) {
      if (destruido || contextoPerdido) return
      seleccion.activar(evento, lienzo.getBoundingClientRect())
    },

    destruir() {
      if (destruido) return
      destruido = true
      seleccion.destruir()
      etiquetas.destruir()
      detenerCiclo()
      observador.disconnect()
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      lienzo.removeEventListener('webglcontextlost', alContextoPerdido)
      geometrias.forEach((geometria) => geometria.dispose())
      materiales.forEach((material) => material.dispose())
      textura.dispose()
      planetas.destruir()
      renderizador.dispose()
      renderizador.forceContextLoss()
      lienzo.remove()
    },
  }
}
