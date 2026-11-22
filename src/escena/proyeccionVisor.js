import { PERFIL_HOMIDO_GRAB } from './perfilVisor.js'

// Inversa del mismo polinomio radial que utiliza la pasada de lentes.
function invertirRadio(radio) {
  let valor = radio
  const [a, b] = PERFIL_HOMIDO_GRAB.coeficientes
  for (let paso = 0; paso < 8; paso += 1) {
    const cuadrado = valor * valor
    valor -= (valor * (1 + a * cuadrado + b * cuadrado * cuadrado) - radio)
      / (1 + 3 * a * cuadrado + 5 * b * cuadrado * cuadrado)
  }
  return valor
}

// El punto está en coordenadas de cámara; x es local a la mitad de cada ojo.
export function proyectarPuntoVisor(punto, configuracion, indice = 0) {
  const { optica, ancho, alto } = configuracion
  const ojo = optica.ojos[indice]
  const profundidad = -punto.z
  if (profundidad <= 0) return null
  const x = (punto.x - ojo.desplazamiento) / profundidad
  const y = punto.y / profundidad
  const radio = Math.hypot(x, y)
  const escala = radio ? invertirRadio(radio) / radio : 1
  const px = (x * escala * PERFIL_HOMIDO_GRAB.distanciaPantalla + ojo.centroX) / optica.milimetrosPorPixel
  const py = alto - (y * escala * PERFIL_HOMIDO_GRAB.distanciaPantalla + ojo.centroY) / optica.milimetrosPorPixel
  return { x: px, y: py, visible: x >= -ojo.izquierda && x <= ojo.derecha
    && y >= -ojo.abajo && y <= ojo.arriba && px >= 0 && px <= ancho / 2 && py >= 0 && py <= alto }
}

export function proyectarRectanguloVisor({ x = 0, y = 0, z, ancho, alto }, configuracion) {
  return [0, 1].map((indice) => {
    const puntos = []
    for (const dx of [-.5, 0, .5]) for (const dy of [-.5, 0, .5]) {
      const punto = proyectarPuntoVisor({ x: x + ancho * dx, y: y + alto * dy, z }, configuracion, indice)
      if (!punto) return null
      puntos.push(punto)
    }
    const izquierda = Math.min(...puntos.map(p => p.x))
    const arriba = Math.min(...puntos.map(p => p.y))
    return { x: izquierda, y: arriba, ancho: Math.max(...puntos.map(p => p.x)) - izquierda,
      alto: Math.max(...puntos.map(p => p.y)) - arriba, visible: puntos.every(p => p.visible) }
  })
}

export function medirFuenteVisor({ x = 0, y = 0, z, tamano }, configuracion) {
  return [0, 1].map((indice) => {
    const inicio = proyectarPuntoVisor({ x, y, z }, configuracion, indice)
    const fin = proyectarPuntoVisor({ x, y: y - tamano, z }, configuracion, indice)
    return inicio && fin ? Math.abs(fin.y - inicio.y) : 0
  })
}

export function rectangulosSeCruzan(a, b, margen = 0) {
  return a && b && a.x < b.x + b.ancho + margen && a.x + a.ancho + margen > b.x
    && a.y < b.y + b.alto + margen && a.y + a.alto + margen > b.y
}
