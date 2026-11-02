import { obtenerDatosPrincipales } from '../datos/cuerposCelestes.js'
import { INVITACION_BIBLIOTECA } from '../datos/librosCuerposCelestes.js'
import { obtenerMensajeContenido } from '../servicios/consultaContenido.js'

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

export function crearPaginasFicha(cuerpo, contexto, { ancho = 800, alto = 720, contenido = { fase: 'cargando' } } = {}) {
  const margen = 32, inicio = 194, limite = alto - 132
  const anchoContenido = ancho - margen * 2
  const tamano = Math.max(16, Math.min(24, ancho / 32))
  const paso = Math.ceil(tamano * 1.4)
  const paginas = []
  let pagina, y
  function nuevaPagina(seccion) {
    pagina = { id: seccion.id, seccion: seccion.titulo, elementos: [] }
    paginas.push(pagina)
    y = inicio
  }
  function lineas(texto, fuente = tamano, espacio = anchoContenido) {
    contexto.font = `${fuente}px system-ui, sans-serif`
    return dividirLineas(texto, (fragmento) => contexto.measureText(fragmento).width, espacio)
  }
  function parrafo(texto, seccion, opciones = {}) {
    const altura = opciones.accion ? 44 : paso
    for (const linea of lineas(texto)) {
      if (y + altura > limite) nuevaPagina(seccion)
      pagina.elementos.push({ tipo: 'texto', texto: linea, x: margen, y, tamano, alto: altura, ...opciones })
      y += altura
    }
    y = Math.min(limite, y + 10)
  }
  function datosPrincipales(seccion) {
    const columna = (anchoContenido - 24) / 2
    const etiqueta = Math.max(13, Math.min(20, ancho / 36))
    const valor = Math.max(18, Math.min(32, ancho / 25))
    const unidad = Math.max(13, Math.min(18, ancho / 40))
    const datos = obtenerDatosPrincipales(cuerpo)
    for (let indice = 0; indice < datos.length; indice += 2) {
      const celdas = datos.slice(indice, indice + 2).map((dato, posicion) => {
        const elementos = []
        let desplazamiento = 0
        for (const [texto, fuente, tenue] of [[dato.etiqueta, etiqueta, true], [dato.valor === '' ? 'Dato no disponible' : dato.valor, valor, false], [dato.unidad, unidad, true], ...(dato.retrograda ? [['Rotación retrógrada', unidad, true]] : [])]) {
          for (const linea of lineas(texto, fuente, columna)) {
            elementos.push({ tipo: 'texto', texto: linea, x: margen + posicion * (columna + 24), y: desplazamiento, tamano: fuente, tenue })
            desplazamiento += Math.ceil(fuente * 1.25)
          }
          desplazamiento += 4
        }
        return { elementos, alto: desplazamiento }
      })
      const altoFila = Math.max(...celdas.map((celda) => celda.alto))
      if (altoFila > limite - inicio) {
        // En el lienzo mínimo, datos especialmente largos continúan en páginas de lectura.
        for (const dato of datos.slice(indice, indice + 2)) parrafo(`${dato.etiqueta}: ${dato.valor || 'Dato no disponible'} ${dato.unidad}${dato.retrograda ? '. Rotación retrógrada' : ''}`, seccion)
      } else {
        if (y + altoFila > limite) nuevaPagina(seccion)
        for (const celda of celdas) for (const elemento of celda.elementos) pagina.elementos.push({ ...elemento, y: y + elemento.y })
        y += altoFila + 12
      }
    }
  }
  for (const seccion of SECCIONES_FICHA) {
    nuevaPagina(seccion)
    if (contenido.fase !== 'disponible') {
      parrafo(obtenerMensajeContenido(contenido, cuerpo.nombre), seccion)
      if (contenido.fase === 'error') parrafo('Reintentar', seccion, { accion: 'reintentar', acento: true })
      continue
    }
    if (seccion.id === 'resumen') {
      if (cuerpo.subtitulo) parrafo(cuerpo.subtitulo, seccion, { acento: true })
      parrafo(cuerpo.descripcion || 'Descripción no disponible.', seccion)
    } else if (seccion.id === 'datos') datosPrincipales(seccion)
    else if (seccion.id === 'curiosidades') {
      for (const curiosidad of cuerpo.curiosidades.length ? cuerpo.curiosidades : ['No hay curiosidades publicadas para este cuerpo.']) parrafo(curiosidad, seccion)
    } else if (cuerpo.libros.length) {
      cuerpo.libros.forEach((libro, indice) => {
        parrafo(libro.titulo, seccion, { acento: true })
        if (libro.autor) parrafo(libro.autor, seccion)
        const edicion = [libro.editorial, libro.anio].filter((dato) => dato !== '' && dato !== null).join(' · ')
        if (edicion) parrafo(edicion, seccion)
        parrafo('Ver ficha', seccion, { accion: `libro:${indice}`, acento: true })
      })
    } else {
      parrafo(`Aún no hay libros verificados asociados a ${cuerpo.nombre}.`, seccion)
      parrafo(INVITACION_BIBLIOTECA, seccion)
    }
  }
  return paginas
}

export function obtenerSeccionesFicha(paginas) {
  return SECCIONES_FICHA.map((seccion) => ({ ...seccion, pagina: paginas.findIndex((pagina) => pagina.id === seccion.id) }))
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

export function obtenerZonasNavegacion(ancho, alto, pagina, total, secciones = SECCIONES_FICHA, seccionActual = secciones.findLast((seccion) => seccion.pagina <= pagina)?.id) {
  const anchoPestana = (ancho - 64 - 24) / SECCIONES_FICHA.length
  const anchoBoton = Math.min(148, (ancho - 96) / 2)
  return [
    { accion: 'cerrar', texto: '×', x: ancho - 62, y: 14, ancho: 46, alto: 46 },
    ...secciones.map((seccion, indice) => ({ accion: `seccion:${seccion.id}`, texto: seccion.nombre, x: 32 + indice * (anchoPestana + 8), y: 122, ancho: anchoPestana, alto: 44, actual: seccionActual === seccion.id })),
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
