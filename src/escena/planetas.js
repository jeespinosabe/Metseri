import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three'

export const RADIO_PLANETAS = 60
const GRADOS = Math.PI / 180

// Composición visual fija: no representa posiciones ni escalas astronómicas.
const PLANETAS = [
  { id: 'tierra', nombre: 'Tierra', tipo: 'Nuestro hogar', giro: 0, elevacion: 0, radio: 6.2, color: '#0b3c64' },
  { id: 'marte', nombre: 'Marte', tipo: '', giro: 45, elevacion: 18, radio: 4.2, color: '#b85935' },
  { id: 'jupiter', nombre: 'Júpiter', tipo: '', giro: 90, elevacion: -12, radio: 9.5, color: '#d1b18c' },
  { id: 'saturno', nombre: 'Saturno', tipo: '', giro: 140, elevacion: 22, radio: 11.5, color: '#d8c298' },
  { id: 'neptuno', nombre: 'Neptuno', tipo: '', giro: 180, elevacion: -18, radio: 5.2, color: '#2854b8' },
  { id: 'urano', nombre: 'Urano', tipo: '', giro: 225, elevacion: 26, radio: 5.7, color: '#86cccf' },
  { id: 'mercurio', nombre: 'Mercurio', tipo: '', giro: 270, elevacion: -20, radio: 3.5, color: '#93897e' },
  { id: 'venus', nombre: 'Venus', tipo: '', giro: 315, elevacion: 14, radio: 5, color: '#dfb678' },
]

function crearAleatorio(semilla) {
  let estado = semilla
  return function generarAleatorio() {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0
    return estado / 4294967296
  }
}

function dibujarContinente(contexto, puntos, color) {
  contexto.fillStyle = color
  contexto.beginPath()
  puntos.forEach(([x, y], indice) => {
    if (indice === 0) contexto.moveTo(x * 512, y * 256)
    else contexto.lineTo(x * 512, y * 256)
  })
  contexto.closePath()
  contexto.fill()
}

function crearTexturaPlaneta(planeta, indice) {
  const lienzo = document.createElement('canvas')
  lienzo.width = 1024
  lienzo.height = 512
  const contexto = lienzo.getContext('2d')
  contexto.scale(2, 2)
  const aleatorio = crearAleatorio(617 + indice * 231)
  contexto.fillStyle = planeta.color
  contexto.fillRect(0, 0, 512, 256)

  if (planeta.id === 'tierra') {
    dibujarContinente(contexto, [[.08,.24],[.14,.14],[.23,.16],[.29,.27],[.25,.37],[.21,.42],[.19,.52],[.15,.4],[.1,.37]], '#75985a')
    dibujarContinente(contexto, [[.22,.48],[.29,.52],[.32,.64],[.28,.8],[.25,.9],[.23,.73],[.2,.58]], '#648b45')
    dibujarContinente(contexto, [[.43,.39],[.49,.32],[.56,.37],[.59,.5],[.55,.66],[.5,.76],[.47,.62],[.44,.53]], '#b5a66b')
    dibujarContinente(contexto, [[.43,.32],[.46,.22],[.52,.26],[.56,.19],[.66,.16],[.78,.24],[.85,.34],[.8,.43],[.7,.4],[.67,.54],[.61,.4],[.56,.36],[.5,.3]], '#779258')
    dibujarContinente(contexto, [[.77,.67],[.84,.62],[.88,.69],[.85,.78],[.78,.76]], '#b5a16d')
    contexto.fillStyle = '#e2eef0'
    contexto.fillRect(0, 0, 512, 12)
    contexto.fillRect(0, 241, 512, 15)
    for (let nube = 0; nube < 70; nube += 1) {
      contexto.fillStyle = 'rgba(242, 248, 255, 0.32)'
      contexto.beginPath()
      contexto.ellipse(aleatorio() * 512, 20 + aleatorio() * 212, 5 + aleatorio() * 25, 1 + aleatorio() * 3, -.2, 0, Math.PI * 2)
      contexto.fill()
    }
  } else if (['jupiter', 'saturno', 'venus', 'urano', 'neptuno'].includes(planeta.id)) {
    for (let y = 0; y < 256; y += 1) {
      const contraste = planeta.id === 'jupiter' ? .3 : planeta.id === 'urano' ? .045 : .13
      const franja = Math.sin(y * .19 + Math.sin(y * .043) * 2) + Math.sin(y * 1.17) * .14
      contexto.fillStyle = franja > 0
        ? `rgba(255, 244, 215, ${Math.abs(franja) * contraste})`
        : `rgba(84, 57, 35, ${Math.abs(franja) * contraste})`
      contexto.beginPath()
      for (let x = 0; x <= 512; x += 8) {
        const onda = Math.sin(x / 512 * Math.PI * 6 + y * .12) * .7
        if (x === 0) contexto.moveTo(x, y + onda)
        else contexto.lineTo(x, y + onda)
      }
      for (let x = 512; x >= 0; x -= 8) {
        const onda = Math.sin(x / 512 * Math.PI * 6 + y * .12) * .7
        contexto.lineTo(x, y + onda + 1.7)
      }
      contexto.closePath()
      contexto.fill()
    }
    if (planeta.id === 'jupiter') {
      contexto.fillStyle = '#ae6248'
      contexto.beginPath()
      contexto.ellipse(263, 158, 25, 10, -.12, 0, Math.PI * 2)
      contexto.fill()
    }
  }

  // Moteado estable para evitar superficies uniformes o ruido animado.
  for (let detalle = 0; detalle < 1400; detalle += 1) {
    const x = aleatorio() * 512
    const y = aleatorio() * 256
    const rocoso = planeta.id === 'mercurio' || planeta.id === 'marte'
    const radio = rocoso ? 1 + aleatorio() * 5 : .4 + aleatorio()
    contexto.fillStyle = `rgba(${detalle % 2 ? '255,245,220' : '28,18,14'},${rocoso ? .13 : .035})`
    contexto.beginPath()
    contexto.ellipse(x, y, radio, radio * .65, 0, 0, Math.PI * 2)
    contexto.fill()
    if (rocoso && detalle % 4 === 0) {
      contexto.strokeStyle = 'rgba(255,235,210,.16)'
      contexto.stroke()
    }
  }
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  return textura
}

function crearTexturaAnillos() {
  const lienzo = document.createElement('canvas')
  lienzo.width = 1024
  lienzo.height = 1024
  const contexto = lienzo.getContext('2d')
  for (let radio = 270; radio < 512; radio += .65) {
    const distancia = radio / 512 * 2.35
    if (distancia > 1.98 && distancia < 2.09) continue
    const brillo = .86 + Math.sin(radio * .67) * .085 + Math.sin(radio * 2.4) * .045
    const opacidad = distancia < 1.42 ? .36 : .9
    contexto.strokeStyle = `rgba(${Math.round(222 * brillo)},${Math.round(207 * brillo)},${Math.round(174 * brillo)},${opacidad})`
    contexto.lineWidth = .8
    contexto.beginPath()
    contexto.arc(512, 512, radio, 0, Math.PI * 2)
    contexto.stroke()
  }
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  return textura
}

function crearMaterialResplandor(color) {
  const material = new MeshBasicMaterial({
    color, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending,
  })
  material.onBeforeCompile = (programa) => {
    const variables = 'varying vec3 normalResplandor; varying vec3 vistaResplandor;\n'
    programa.vertexShader = variables + programa.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\nnormalResplandor = normalMatrix * normal; vistaResplandor = -mvPosition.xyz;',
    )
    programa.fragmentShader = variables + programa.fragmentShader.replace(
      '#include <opaque_fragment>',
      'diffuseColor.a *= pow(1.0 - abs(dot(normalize(normalResplandor), normalize(vistaResplandor))), 3.2);\n#include <opaque_fragment>',
    )
  }
  return material
}

function crearTexturaHalo() {
  const lienzo = document.createElement('canvas')
  lienzo.width = 128
  lienzo.height = 128
  const contexto = lienzo.getContext('2d')
  const gradiente = contexto.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradiente.addColorStop(0, 'rgba(255,255,255,0)')
  gradiente.addColorStop(.4, 'rgba(255,255,255,0)')
  gradiente.addColorStop(.54, 'rgba(255,255,255,.75)')
  gradiente.addColorStop(.72, 'rgba(255,255,255,.16)')
  gradiente.addColorStop(1, 'rgba(255,255,255,0)')
  contexto.fillStyle = gradiente
  contexto.fillRect(0, 0, 128, 128)
  return new CanvasTexture(lienzo)
}

export function crearPlanetas() {
  const raiz = new Group()
  const seleccionables = []
  const etiquetas = []
  const cuerpos = new Map()
  const geometrias = new Set()
  const materiales = new Set()
  const texturas = new Set()
  let destruido = false

  function destruir() {
    if (destruido) return
    destruido = true
    raiz.removeFromParent()
    raiz.clear()
    geometrias.forEach((recurso) => recurso.dispose())
    materiales.forEach((recurso) => recurso.dispose())
    texturas.forEach((recurso) => recurso.dispose())
    cuerpos.clear()
    seleccionables.length = 0
    etiquetas.length = 0
  }

  try {
    const esfera = new SphereGeometry(1, 48, 32)
    geometrias.add(esfera)
    const texturaHalo = crearTexturaHalo()
    texturas.add(texturaHalo)

    PLANETAS.forEach((planeta, indice) => {
      const grupo = new Group()
      grupo.name = planeta.id
      const giro = planeta.giro * GRADOS
      const elevacion = planeta.elevacion * GRADOS
      grupo.position.set(
        -Math.sin(giro) * Math.cos(elevacion) * RADIO_PLANETAS,
        Math.sin(elevacion) * RADIO_PLANETAS,
        -Math.cos(giro) * Math.cos(elevacion) * RADIO_PLANETAS,
      )
      const textura = crearTexturaPlaneta(planeta, indice)
      texturas.add(textura)
      const material = new MeshStandardMaterial({
        map: textura,
        roughness: .95,
        metalness: 0,
        emissive: 0xc5e5ff,
        emissiveMap: textura,
        emissiveIntensity: 0,
      })
      materiales.add(material)
      const cuerpo = new Mesh(esfera, material)
      cuerpo.scale.setScalar(planeta.radio)
      cuerpo.rotation.y = -Math.PI / 2
      cuerpo.userData.planetaId = planeta.id
      grupo.add(cuerpo)
      seleccionables.push(cuerpo)
      const materialesCuerpo = [material]
      const contorno = []

      if (planeta.id === 'saturno') {
        const geometriaAnillos = new RingGeometry(1.24, 2.35, 160, 1)
        geometrias.add(geometriaAnillos)
        const texturaAnillos = crearTexturaAnillos()
        texturas.add(texturaAnillos)
        const materialAnillos = new MeshStandardMaterial({
          map: texturaAnillos, roughness: 1, side: DoubleSide,
          transparent: true, alphaTest: .08, depthWrite: false,
          emissive: 0xffebcf, emissiveMap: texturaAnillos, emissiveIntensity: .55,
        })
        materialAnillos.userData.intensidadBase = .55
        materiales.add(materialAnillos)
        materialesCuerpo.push(materialAnillos)
        const anillos = new Mesh(geometriaAnillos, materialAnillos)
        anillos.scale.setScalar(planeta.radio)
        anillos.userData.planetaId = planeta.id
        grupo.add(anillos)
        anillos.lookAt(new Vector3())
        anillos.rotateZ(.36)
        anillos.rotateX(-1.02)
        anillos.updateWorldMatrix(true, false)
        for (let muestra = 0; muestra < 48; muestra += 1) {
          const fase = muestra / 48 * Math.PI * 2
          contorno.push(new Vector3(Math.cos(fase) * 2.35, Math.sin(fase) * 2.35, 0).applyMatrix4(anillos.matrixWorld))
        }
        seleccionables.push(anillos)
      }

      const materialResplandor = crearMaterialResplandor(planeta.id === 'tierra' ? 0x70b5eb : 0xffdc9a)
      materiales.add(materialResplandor)
      const resplandor = new Mesh(esfera, materialResplandor)
      resplandor.scale.setScalar(planeta.radio * 1.035)
      const esTierra = planeta.id === 'tierra'
      resplandor.visible = esTierra
      materialResplandor.opacity = esTierra ? .22 : 0
      grupo.add(resplandor)

      const materialHalo = new SpriteMaterial({
        map: texturaHalo, color: planeta.id === 'tierra' ? 0x8edcff : 0xffdda8, transparent: true,
        blending: AdditiveBlending, depthWrite: false, opacity: .12,
      })
      materiales.add(materialHalo)
      const halo = new Sprite(materialHalo)
      halo.scale.setScalar(planeta.radio * (planeta.id === 'saturno' ? 5.2 : 3.8))
      halo.visible = false
      grupo.add(halo)
      cuerpos.set(planeta.id, { materiales: materialesCuerpo, halo, resplandor, esTierra, aspecto: 'normal' })
      raiz.add(grupo)
      etiquetas.push({ id: planeta.id, nombre: planeta.nombre, tipo: planeta.tipo, posicion: grupo.position, radio: planeta.radio, contorno })
    })
  } catch (error) {
    destruir()
    throw error
  }

  return {
    raiz,
    seleccionables,
    etiquetas,
    actualizarAspecto({ planetaApuntado, planetaSeleccionado }) {
      if (destruido) return
      cuerpos.forEach((cuerpo, id) => {
        const aspecto = id === planetaSeleccionado ? 'seleccionado' : id === planetaApuntado ? 'apuntado' : 'normal'
        if (aspecto === cuerpo.aspecto) return
        cuerpo.aspecto = aspecto
        cuerpo.materiales.forEach((material) => {
          material.emissiveIntensity = (material.userData.intensidadBase ?? 0) + (aspecto === 'seleccionado' ? .3 : aspecto === 'apuntado' ? .09 : 0)
        })
        cuerpo.halo.visible = aspecto === 'seleccionado'
        cuerpo.resplandor.visible = cuerpo.esTierra || aspecto !== 'normal'
        cuerpo.resplandor.material.opacity = aspecto === 'seleccionado' ? .9 : aspecto === 'apuntado' ? .45 : cuerpo.esTierra ? .22 : 0
      })
    },
    destruir,
  }
}
