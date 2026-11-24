import { LinearFilter } from 'three'
import { medirFuenteVisor, proyectarRectanguloVisor } from './proyeccionVisor.js'
import { distorsionarRadio, PERFIL_HOMIDO_GRAB } from './perfilVisor.js'

export const DISTANCIA_FICHA_VR = 44
export const PROPORCION_TAMANO_FICHA_VR = .9
const ANCHO_MINIMO_PARA_REDUCIR_FICHA_PX = 260

export function configurarTexturaLectura(textura) {
  textura.minFilter = LinearFilter
  textura.magFilter = LinearFilter
  textura.generateMipmaps = false
}

// Botón de cierre de la ficha en el visor: ocupa la esquina superior derecha del encabezado.
export function zonaCerrarVr(ancho) {
  return { x: ancho - 80, y: 14, ancho: 64, alto: 64 }
}

// Filas del encabezado: categoría, nombre y pestañas, siempre por debajo del botón de cierre.
export function calcularFilasEncabezado(ancho, tipografia, altoPestana, lineasCategoria = 1) {
  const cerrar = zonaCerrarVr(ancho)
  const tituloY = 14 + lineasCategoria * tipografia.categoria * 1.05 + 2
  const pestanasY = Math.max(tituloY + tipografia.titulo + 4, cerrar.y + cerrar.alto + 8)
  return { tituloY, pestanasY, inicio: Math.ceil(pestanasY + altoPestana + 8) }
}

export function calcularPresentacionFicha(configuracion) {
  const ancho = 900
  const alto = 800
  const distancia = DISTANCIA_FICHA_VR
  const desplazamientoPantalla = (configuracion.margenInferior - 40) / 2 * configuracion.optica.milimetrosPorPixel
  const desplazamientoY = distorsionarRadio(desplazamientoPantalla / PERFIL_HOMIDO_GRAB.distanciaPantalla) * distancia
  let minimo = 0
  let maximo = .12
  // Ajustar el plano completo al campo óptico común, reservando los controles HTML.
  for (let paso = 0; paso < 28; paso += 1) {
    const escala = (minimo + maximo) / 2
    const cajas = proyectarRectanguloVisor({ y: desplazamientoY, z: -distancia, ancho: ancho * escala, alto: alto * escala }, configuracion)
    if (cajas.every(c => c?.visible && c.x >= 12 && c.x + c.ancho <= configuracion.ancho / 2 - 12
      && c.y >= 40 && c.y + c.alto <= configuracion.alto - configuracion.margenInferior)) minimo = escala
    else maximo = escala
  }
  const escalaDisponible = minimo * .98
  // Una ventana reducida puede dejar los ejes físicos fuera del viewport.
  if (escalaDisponible < .00001) return null
  const cajasDisponibles = proyectarRectanguloVisor({ y: desplazamientoY, z: -distancia,
    ancho: ancho * escalaDisponible, alto: alto * escalaDisponible }, configuracion)
  const anchoDisponible = Math.min(...cajasDisponibles.map(caja => caja.ancho))
  // En ventanas estrechas se conserva el espacio que necesitan los datos y las pestañas.
  const proporcion = Math.min(1, Math.max(PROPORCION_TAMANO_FICHA_VR, ANCHO_MINIMO_PARA_REDUCIR_FICHA_PX / anchoDisponible))
  const escala = escalaDisponible * proporcion
  let pixelesPorUnidad = Infinity
  for (const x of [ancho * .25, ancho * .5, ancho * .75]) for (const y of [220, alto * .5, alto - 120]) {
    const medidas = medirFuenteVisor({ x: (x - ancho / 2) * escala, y: desplazamientoY + (alto / 2 - y) * escala,
      z: -distancia, tamano: escala }, configuracion)
    pixelesPorUnidad = Math.min(pixelesPorUnidad, ...medidas)
  }
  pixelesPorUnidad = Math.max(.05, pixelesPorUnidad)
  const fuente = (px, inicioMedicion = 220) => {
    let tamano = px / pixelesPorUnidad
    // Ajustar el em completo al tamaño objetivo en ambos ojos, incluso en los bordes.
    for (let paso = 0; paso < 4; paso += 1) {
      let minimo = Infinity
      for (const x of [32, 225, 450, 675, 868]) for (const y of [inicioMedicion, 400, 500, 680]) {
        minimo = Math.min(minimo, ...medirFuenteVisor({ x: (x - ancho / 2) * escala,
          y: desplazamientoY + (alto / 2 - y) * escala, z: -distancia, tamano: tamano * escala }, configuracion))
      }
      const ajuste = px / minimo
      tamano *= ajuste
      if (Math.abs(ajuste - 1) < .0001) break
    }
    return Math.ceil(tamano * 4) / 4
  }
  const fuentesEncabezado = { titulo: fuente(21.5), categoria: fuente(12), pestana: fuente(12) }
  const navegacion = fuente(14)
  const altoControl = Math.ceil(navegacion * 1.35 + 12)
  const altoPestana = Math.ceil(fuentesEncabezado.pestana * 1.35 + 10)
  const { tituloY, pestanasY, inicio } = calcularFilasEncabezado(ancho, fuentesEncabezado, altoPestana)
  const inicioMedicion = Math.min(inicio, 220)
  const tipografia = { ...fuentesEncabezado, navegacion, nota: fuente(12),
    parrafo: fuente(16, inicioMedicion), etiqueta: fuente(14, inicioMedicion), unidad: fuente(14, inicioMedicion),
    valor: fuente(17.5, inicioMedicion), seccion: fuente(17.5, inicioMedicion) }
  const pie = altoControl + 28
  return { ancho, alto, escala, desplazamientoY, pixelesPorUnidad, tipografia, tituloY, pestanasY, altoControl, altoPestana, inicio, pie,
    margen: 32 }
}
