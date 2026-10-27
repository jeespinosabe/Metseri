// Perfil publicado por HOMIDO: https://homido.com/setup/
// El GRAB centra la pantalla y usa lentes separadas 60 mm, a 40 mm del panel.
export const PERFIL_HOMIDO_GRAB = Object.freeze({
  nombre: 'HOMIDO GRAB',
  separacionLentes: 60,
  distanciaPantalla: 40,
  coeficientes: Object.freeze([.34, .10]),
  // HOMIDO anuncia un campo de visión de 100°: https://homido.com/homido-grab/
  semiCampoMaximo: 50 * Math.PI / 180,
})

export const DIAGONAL_PREDETERMINADA = 6
export const CLAVE_DIAGONAL = 'metseri-diagonal-pantalla'

export function esDiagonalValida(valor) {
  return Number.isFinite(valor) && valor >= 4 && valor <= 8
}

export function leerDiagonalPantalla() {
  try {
    const valor = Number(globalThis.localStorage?.getItem(CLAVE_DIAGONAL))
    if (esDiagonalValida(valor)) return valor
  } catch {
    // El almacenamiento puede no estar disponible en navegación privada.
  }
  return DIAGONAL_PREDETERMINADA
}

export function guardarDiagonalPantalla(valor) {
  if (!esDiagonalValida(valor)) return
  try {
    globalThis.localStorage?.setItem(CLAVE_DIAGONAL, String(valor))
  } catch {
    // La calibración sigue funcionando durante esta sesión.
  }
}

// Cardboard expresa la distorsión radial en unidades de tangente de ángulo.
// Esta función va de un punto físico del panel a la dirección de la escena.
export function distorsionarRadio(radio, perfil = PERFIL_HOMIDO_GRAB) {
  const cuadrado = radio * radio
  return radio * (1 + perfil.coeficientes[0] * cuadrado + perfil.coeficientes[1] * cuadrado * cuadrado)
}

export function calcularOpticaVisor({ ancho, alto, anchoPantalla = ancho, altoPantalla = alto, diagonal = DIAGONAL_PREDETERMINADA }, perfil = PERFIL_HOMIDO_GRAB) {
  const diagonalValida = esDiagonalValida(diagonal) ? diagonal : DIAGONAL_PREDETERMINADA
  const milimetrosPorPixel = diagonalValida * 25.4 / Math.max(1, Math.hypot(anchoPantalla, altoPantalla))
  const anchoFisico = Math.max(1, ancho) * milimetrosPorPixel
  const altoFisico = Math.max(1, alto) * milimetrosPorPixel
  const limite = Math.tan(perfil.semiCampoMaximo)
  const ojos = [-1, 1].map((signo) => {
    // Cada ojo ocupa media pantalla, pero su eje sigue el centro de su lente.
    const centroX = anchoFisico / 4 + signo * (perfil.separacionLentes / 2 - anchoFisico / 4)
    const centroY = altoFisico / 2
    const limitarCampo = (distancia) => Math.min(limite, distorsionarRadio(Math.max(1, distancia) / perfil.distanciaPantalla, perfil))
    return {
      centroX,
      centroY,
      desplazamiento: signo * perfil.separacionLentes / 2000,
      izquierda: limitarCampo(centroX),
      derecha: limitarCampo(anchoFisico / 2 - centroX),
      arriba: limitarCampo(centroY),
      abajo: limitarCampo(altoFisico - centroY),
    }
  })
  return { anchoFisico, altoFisico, milimetrosPorPixel, ojos }
}
