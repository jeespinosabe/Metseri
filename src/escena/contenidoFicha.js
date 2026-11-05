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

function crearPaginasPublicadas(cuerpo, contexto, ancho, alto, contenido) {
  const paginas = []
  const margen = 32
  const inicio = 194
  const limite = alto - 108
  const anchoContenido = ancho - margen * 2
  const tamano = Math.min(24, Math.max(16, ancho / 32))
  function lineas(texto, fuente, espacio = anchoContenido) {
    contexto.font = `${fuente}px system-ui, sans-serif`
    return dividirLineas(texto, (valor) => contexto.measureText(valor).width, espacio)
  }
  function nuevaPagina(seccion, titulo = false) {
    const pagina = { id: seccion.id, seccion: seccion.titulo, elementos: [] }
    paginas.push(pagina)
    if (titulo) pagina.elementos.push({ tipo: 'texto', texto: seccion.titulo, x: margen, y: inicio, tamano: Math.min(32, Math.max(22, ancho / 24)), acento: true })
    return pagina
  }
  function parrafos(seccion, textos, titulo = false) {
    let pagina = nuevaPagina(seccion, titulo)
    let y = inicio + (titulo ? 52 : 6)
    for (const texto of textos) {
      for (const linea of lineas(texto, tamano)) {
        if (y + tamano * 1.2 > limite) {
          pagina = nuevaPagina(seccion, titulo)
          y = inicio + (titulo ? 52 : 6)
        }
        pagina.elementos.push({ tipo: 'texto', texto: linea, x: margen, y, tamano })
        y += tamano * 1.4
      }
      y += 16
    }
  }
  if (contenido.fase !== 'disponible') {
    const mensaje = contenido.fase === 'error'
      ? 'No se pudo cargar la información. Cierra la ficha y vuelve a seleccionar el cuerpo.'
      : 'Cargando información...'
    SECCIONES_FICHA.forEach((seccion) => parrafos(seccion, [mensaje]))
    return paginas
  }
  const ficha = contenido.ficha
  parrafos(SECCIONES_FICHA[0], [ficha.descripcion || 'Información no disponible.'])
  const columna = (anchoContenido - 24) / 2
  const fuenteEtiqueta = Math.min(18, Math.max(16, ancho / 40))
  const fuenteValor = Math.min(28, Math.max(22, ancho / 28))
  const fuenteUnidad = Math.min(16, Math.max(13, ancho / 48))
  const datos = obtenerDatosPrincipales(cuerpo).map((dato, indice) => ficha.datos[indice] ?? dato)
  let pagina = nuevaPagina(SECCIONES_FICHA[1])
  let y = inicio
  for (let fila = 0; fila < 4; fila += 2) {
    const bloques = datos.slice(fila, fila + 2).map((dato, indice) => {
      const elementos = []
      let posicion = 0
      const x = margen + indice * (columna + 24)
      function agregarTexto(texto, fuente, tenue) {
        if (texto) {
          for (const linea of lineas(texto, fuente, columna)) {
            elementos.push({ tipo: 'texto', texto: linea, x, y: posicion, tamano: fuente, tenue })
            posicion += fuente * 1.2
          }
        } else {
          elementos.push({ tipo: 'espacio', x, y: posicion, ancho: columna * .65, alto: 20 })
          posicion += 24
        }
      }
      agregarTexto(dato.etiqueta, fuenteEtiqueta, true)
      posicion += 6
      contexto.font = `${fuenteValor}px system-ui, sans-serif`
      const anchoValor = contexto.measureText(dato.valor).width
      contexto.font = `${fuenteUnidad}px system-ui, sans-serif`
      const anchoUnidad = contexto.measureText(dato.unidad).width
      // Compartir la línea deja espacio para las duraciones en la segunda fila.
      if (dato.valor && dato.unidad && anchoValor + 8 + anchoUnidad <= columna) {
        elementos.push(
          { tipo: 'texto', texto: dato.valor, x, y: posicion, tamano: fuenteValor },
          { tipo: 'texto', texto: dato.unidad, x: x + anchoValor + 8, y: posicion + fuenteValor - fuenteUnidad, tamano: fuenteUnidad, tenue: true },
        )
        posicion += fuenteValor * 1.2
      } else {
        agregarTexto(dato.valor, fuenteValor, false)
        posicion += 4
        agregarTexto(dato.unidad, fuenteUnidad, true)
      }
      return { elementos, alto: posicion }
    })
    const altoFila = Math.max(...bloques.map((bloque) => bloque.alto))
    if (y + altoFila > limite && y > inicio) {
      pagina = nuevaPagina(SECCIONES_FICHA[1])
      y = inicio
    }
    for (const bloque of bloques) for (const elemento of bloque.elementos) {
      pagina.elementos.push({ ...elemento, y: elemento.y + y })
    }
    y += altoFila + 12
  }
  parrafos(SECCIONES_FICHA[2], ficha.curiosidades.length ? ficha.curiosidades : ['Información no disponible.'], true)
  parrafos(SECCIONES_FICHA[3], [ficha.invitacion || 'Información no disponible.'], true)
  return paginas
}

export function crearPaginasFicha(cuerpo, contexto, { ancho = 800, alto = 720, contenido = null } = {}) {
  if (contenido) return crearPaginasPublicadas(cuerpo, contexto, ancho, alto, contenido)
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

export function obtenerZonasNavegacion(ancho, alto, pagina, total, paginas = null) {
  const anchoPestana = (ancho - 64 - 24) / SECCIONES_FICHA.length
  const anchoBoton = Math.min(148, (ancho - 96) / 2)
  return [
    { accion: 'cerrar', texto: '×', x: ancho - 62, y: 14, ancho: 46, alto: 46 },
    ...SECCIONES_FICHA.map((seccion, indice) => ({ accion: `seccion:${seccion.pagina}`, texto: seccion.nombre, x: 32 + indice * (anchoPestana + 8), y: 122, ancho: anchoPestana, alto: 44, actual: paginas ? paginas[pagina]?.id === seccion.id : pagina === seccion.pagina })),
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
