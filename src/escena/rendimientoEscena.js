import { calcularOpticaVisor, DIAGONAL_PREDETERMINADA, esDiagonalValida } from './perfilVisor.js'

export function calcularConfiguracionVisor({ ancho, alto, densidad = 1, diagonal = DIAGONAL_PREDETERMINADA,
  anchoPantalla = ancho, altoPantalla = alto, maxTextura = 4096, maxRenderbuffer = maxTextura, margenInferior = 80 }) {
  ancho = Math.max(1, ancho)
  alto = Math.max(1, alto)
  diagonal = esDiagonalValida(diagonal) ? diagonal : DIAGONAL_PREDETERMINADA
  const limiteGpu = Math.max(1, Math.min(maxTextura, maxRenderbuffer))
  const objetivo = Math.min(1.75, 1.5 * Math.max(1, diagonal / 6.9))
  const proporcion = Math.min(densidad || 1, objetivo, Math.sqrt(2_000_000 / (ancho * alto)), limiteGpu / Math.max(ancho, alto))
  return { ancho, alto, diagonal, proporcion, objetivo, margenInferior,
    maxTextura: Math.min(2048, maxTextura), factorTextura: 2,
    optica: calcularOpticaVisor({ ancho, alto, anchoPantalla, altoPantalla, diagonal }) }
}

export function limitarRasterizacion(ancho, alto, { factorTextura = 2, maxTextura = 2048 } = {}) {
  const factor = Math.min(factorTextura, maxTextura / ancho, maxTextura / alto, Math.sqrt(4_000_000 / (ancho * alto)))
  return { ancho: Math.max(1, Math.floor(ancho * factor)), alto: Math.max(1, Math.floor(alto * factor)), factor }
}

// El presupuesto acota el coste en pantallas densas y monitores grandes.
// La interfaz HTML conserva siempre la resolución nativa del dispositivo.
export function calcularDensidadRenderizado({ ancho, alto, densidad = 1, modo = 'normal', tactil = false, ...parametros }) {
  if (modo === 'vr') return calcularConfiguracionVisor({ ancho, alto, densidad, ...parametros }).proporcion
  const limite = tactil ? 1.25 : 1.5
  const presupuesto = 2_073_600
  return Math.min(densidad || 1, limite, Math.sqrt(presupuesto / (Math.max(1, ancho) * Math.max(1, alto))))
}
