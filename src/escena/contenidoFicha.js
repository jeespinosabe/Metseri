import { obtenerDatosPrincipales } from '../datos/cuerposCelestes.js'

export const SECCIONES_FICHA = [
  { id: 'resumen', nombre: 'Ficha', titulo: 'Presentación', pagina: 0 },
  { id: 'datos', nombre: 'Datos', titulo: 'Datos principales', pagina: 1 },
  { id: 'curiosidades', nombre: '¿Sabías?', titulo: '¿Sabías que...?', pagina: 2 },
  { id: 'libros', nombre: 'Libros', titulo: 'Descubrir libros', pagina: 3 },
]

export function dividirLineas(texto, medir, ancho) {
  const lineas = []
  let linea = ''
  for (const palabra of texto.trim().split(/\s+/u)) {
    if (linea && medir(`${linea} ${palabra}`) > ancho) { lineas.push(linea); linea = '' }
    let fragmento = ''
    for (const letra of palabra) {
      if (fragmento && medir(fragmento + letra) > ancho) {
        if (linea) { lineas.push(linea); linea = '' }
        lineas.push(fragmento)
        fragmento = ''
      }
      fragmento += letra
    }
    linea = linea ? `${linea} ${fragmento}` : fragmento
  }
  if (linea) lineas.push(linea)
  return lineas
}

export function crearPaginasFicha(cuerpo, _contexto, { ancho = 800, alto = 720 } = {}) {
  const margen = 32
  const inicio = 194
  const limite = alto - 108
  const paginas = SECCIONES_FICHA.map((seccion) => ({ id: seccion.id, seccion: seccion.titulo, elementos: [] }))
  const anchoContenido = ancho - margen * 2
  // Reservas estáticas, sin textos ni cifras de ejemplo ni animación de carga.
  function espacios(pagina, y, cantidad, alturaDisponible) {
    const paso = Math.min(40, alturaDisponible / cantidad)
    for (let indice = 0; indice < cantidad; indice += 1) pagina.elementos.push({ tipo: 'espacio', x: margen, y: y + indice * paso, ancho: anchoContenido * (indice === cantidad - 1 ? .68 : indice % 2 ? .92 : 1), alto: Math.min(12, paso * .32) })
  }
  espacios(paginas[0], inicio + 6, 4, limite - inicio)
  const filaAlto = (limite - inicio) / 2
  const columnaAncho = (anchoContenido - 24) / 2
  const tamanoEtiqueta = Math.min(23, Math.max(16, ancho / 34))
  obtenerDatosPrincipales(cuerpo).forEach((dato, indice) => {
    const x = margen + (indice % 2) * (columnaAncho + 24)
    const y = inicio + Math.floor(indice / 2) * filaAlto
    const valorY = y + tamanoEtiqueta + 9
    const altoValor = Math.min(42, Math.max(20, filaAlto * .24))
    paginas[1].elementos.push(
      { tipo: 'texto', texto: dato.etiqueta, x, y, tamano: tamanoEtiqueta, tenue: true },
      { tipo: 'espacio', x, y: valorY, ancho: columnaAncho * .65, alto: altoValor },
      { tipo: 'texto', texto: dato.unidad, x, y: valorY + altoValor + 8, tamano: Math.min(18, Math.max(13, ancho / 40)), tenue: true },
    )
  })
  for (const pagina of paginas.slice(2)) {
    pagina.elementos.push({ tipo: 'texto', texto: pagina.seccion, x: margen, y: inicio, tamano: Math.min(32, Math.max(22, ancho / 24)), acento: true })
    espacios(pagina, inicio + 52, 3, limite - inicio - 52)
  }
  return paginas
}

export function crearEstadoLectura(alCambiar = () => {}) {
  let cuerpoId = null
  let pagina = 0
  let total = 0
  function obtenerEstado() { return { cuerpoId, pagina, total } }
  function actualizar(id, cantidad, reiniciar = false) {
    const anterior = JSON.stringify(obtenerEstado())
    if (id !== cuerpoId || reiniciar) pagina = 0
    cuerpoId = id
    total = id ? cantidad : 0
    pagina = Math.max(0, Math.min(pagina, total - 1))
    if (JSON.stringify(obtenerEstado()) !== anterior) alCambiar(obtenerEstado())
  }
  function irA(destino) {
    if (!Number.isInteger(destino)) return false
    const nueva = Math.max(0, Math.min(total - 1, destino))
    if (!cuerpoId || nueva === pagina) return false
    pagina = nueva
    alCambiar(obtenerEstado())
    return true
  }
  return { obtenerEstado, actualizar, irA, mover: (desplazamiento) => irA(pagina + desplazamiento) }
}

export function obtenerZonasNavegacion(ancho, alto, pagina, total) {
  const anchoPestana = (ancho - 64 - 24) / SECCIONES_FICHA.length
  const anchoBoton = Math.min(148, (ancho - 96) / 2)
  return [
    { accion: 'cerrar', texto: '×', x: ancho - 62, y: 14, ancho: 46, alto: 46 },
    ...SECCIONES_FICHA.map((seccion, indice) => ({ accion: `seccion:${seccion.pagina}`, texto: seccion.nombre, x: 32 + indice * (anchoPestana + 8), y: 122, ancho: anchoPestana, alto: 44, actual: pagina === seccion.pagina })),
    ...(pagina > 0 ? [{ accion: 'anterior', texto: '← Anterior', x: 32, y: alto - 80, ancho: anchoBoton, alto: 54 }] : []),
    ...(pagina < total - 1 ? [{ accion: 'siguiente', texto: 'Siguiente →', x: ancho - 32 - anchoBoton, y: alto - 80, ancho: anchoBoton, alto: 54 }] : []),
  ]
}

export function detectarAccionFicha(uv, ancho, alto, zonas) {
  const x = uv.x * ancho
  const y = (1 - uv.y) * alto
  return zonas.find((zona) => x >= zona.x && x <= zona.x + zona.ancho && y >= zona.y && y <= zona.y + zona.alto)?.accion ?? null
}

export function consumirToqueFicha(objetivo, alAccionar) {
  if (!objetivo) return false
  if (objetivo.accion) alAccionar(objetivo.accion)
  return true
}
