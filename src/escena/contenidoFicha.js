import { obtenerDatosPrincipales } from '../datos/cuerposCelestes.js'
import { etiquetaCopiaDescargada } from '../servicios/fechaDescarga.js'
import { calcularFilasEncabezado, zonaCerrarVr } from './lecturaVisor.js'

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

function crearPaginasPublicadas(cuerpo, contexto, ancho, alto, contenido, presentacion) {
  const paginas = []
  const margen = presentacion?.margen ?? 32
  const fuentes = presentacion?.tipografia
  const tieneCopia = contenido.fechaDescarga != null || contenido.bibliografia?.fechaDescarga != null
  const inicio = (presentacion?.inicio ?? 194) + (presentacion && tieneCopia ? fuentes.nota * 1.2 + 4 : 0)
  const limite = alto - (presentacion?.pie ?? 108)
  const anchoContenido = ancho - margen * 2
  const tamano = fuentes?.parrafo ?? Math.min(24, Math.max(16, ancho / 32))
  const tamanoSeccion = fuentes?.seccion ?? Math.min(32, Math.max(22, ancho / 24))
  const espacioTitulo = fuentes ? tamanoSeccion * 1.3 + 12 : 52
  function lineas(texto, fuente, espacio = anchoContenido, negrita = false) {
    contexto.font = `${negrita ? '700 ' : ''}${fuente}px system-ui, sans-serif`
    return dividirLineas(texto, (valor) => contexto.measureText(valor).width, espacio)
  }
  function nuevaPagina(seccion, titulo = false) {
    const pagina = { id: seccion.id, seccion: seccion.titulo, elementos: [] }
    paginas.push(pagina)
    const fechaDescarga = seccion.id === 'libros' ? contenido.bibliografia?.fechaDescarga : contenido.fechaDescarga
    if (fechaDescarga != null) {
      pagina.elementos.push({ tipo: 'texto', texto: etiquetaCopiaDescargada(fechaDescarga), x: margen,
        y: presentacion?.inicio ?? 173, tamano: fuentes?.nota ?? 16, tenue: true })
    }
    if (titulo) pagina.elementos.push({ tipo: 'texto', texto: seccion.titulo, x: margen, y: inicio, tamano: tamanoSeccion, acento: true })
    return pagina
  }
  function parrafos(seccion, textos, titulo = false) {
    let pagina = nuevaPagina(seccion, titulo)
    let y = inicio + (titulo ? espacioTitulo : 6)
    for (const texto of textos) {
      for (const linea of lineas(texto, tamano)) {
        if (y + tamano * 1.2 > limite) {
          pagina = nuevaPagina(seccion, titulo)
          y = inicio + (titulo ? espacioTitulo : 6)
        }
        pagina.elementos.push({ tipo: 'texto', texto: linea, x: margen, y, tamano })
        y += tamano * 1.4
      }
      y += 16
    }
  }
  function agregarLibros() {
    const seccion = SECCIONES_FICHA[3]
    const bibliografia = contenido.bibliografia
    const invitacion = contenido.ficha?.invitacion
    if (!bibliografia) { parrafos(seccion, [invitacion || 'Información no disponible.'], true); return }
    const libros = bibliografia.fase === 'disponible' ? bibliografia.libros : []
    const mensajes = !libros.length && invitacion ? [invitacion] : []
    if (bibliografia.fase === 'cargando') mensajes.push('Cargando recomendaciones...')
    else if (bibliografia.fase === 'error') mensajes.push('No se pudieron cargar los libros. Cierra la ficha y vuelve a abrirla para intentarlo de nuevo.')
    else if (libros.length < 3) {
      mensajes.push(!libros.length && bibliografia.fechaDescarga != null
        ? 'La copia descargada no contiene recomendaciones.' : 'Estamos preparando más recomendaciones.')
    }
    if (mensajes.length) parrafos(seccion, mensajes, true)
    libros.forEach((libro, indice) => {
      let pagina = nuevaPagina(seccion)
      let y = inicio + 6
      const x = margen + 34
      function numerar() {
        pagina.elementos.push({ tipo: 'texto', texto: String(indice + 1).padStart(2, '0'), x: margen, y, tamano: tamano * .8, acento: true })
      }
      numerar()
      for (const bloque of [
        { texto: libro.titulo, negrita: true },
        { texto: libro.autor },
        { texto: [libro.editorial, libro.anio].filter(Boolean).join(' · '), tenue: true },
      ]) {
        if (!bloque.texto) continue
        for (const linea of lineas(bloque.texto, tamano, anchoContenido - 34, bloque.negrita)) {
          if (y + tamano * 1.2 > limite) {
            pagina = nuevaPagina(seccion)
            y = inicio + 6
            numerar()
          }
          pagina.elementos.push({ tipo: 'texto', ...bloque, texto: linea, x, y, tamano })
          y += tamano * 1.4
        }
        y += 16
      }
    })
  }
  if (contenido.fase !== 'disponible') {
    const mensaje = contenido.fase === 'error'
      ? 'No se pudo cargar la información. Cierra la ficha y vuelve a seleccionar el cuerpo.'
      : 'Cargando información...'
    SECCIONES_FICHA.forEach((seccion) => {
      if (seccion.id === 'libros' && contenido.bibliografia) agregarLibros()
      else parrafos(seccion, [mensaje])
    })
    return paginas
  }
  const ficha = contenido.ficha
  parrafos(SECCIONES_FICHA[0], [ficha.descripcion || 'Información no disponible.'])
  const columna = (anchoContenido - 24) / 2
  const fuenteEtiqueta = fuentes?.etiqueta ?? Math.min(18, Math.max(16, ancho / 40))
  const fuenteValor = fuentes?.valor ?? Math.min(28, Math.max(22, ancho / 28))
  const fuenteUnidad = fuentes?.unidad ?? Math.min(16, Math.max(13, ancho / 48))
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
      const palabrasUnidad = dato.unidad.trim().split(/\s+/u)
      let prefijoUnidad = ''
      if (presentacion && dato.valor && dato.unidad) {
        while (palabrasUnidad.length && anchoValor + 8 + contexto.measureText([prefijoUnidad, palabrasUnidad[0]].filter(Boolean).join(' ')).width <= columna) {
          prefijoUnidad = [prefijoUnidad, palabrasUnidad.shift()].filter(Boolean).join(' ')
        }
      }
      // Compartir la línea deja espacio para las duraciones en la segunda fila.
      if (dato.valor && dato.unidad && (anchoValor + 8 + anchoUnidad <= columna || prefijoUnidad)) {
        elementos.push(
          { tipo: 'texto', texto: dato.valor, x, y: posicion, tamano: fuenteValor },
          { tipo: 'texto', texto: prefijoUnidad || dato.unidad, x: x + anchoValor + 8, y: posicion + fuenteValor - fuenteUnidad, tamano: fuenteUnidad, tenue: true },
        )
        posicion += fuenteValor * 1.2
        if (prefijoUnidad && palabrasUnidad.length) agregarTexto(palabrasUnidad.join(' '), fuenteUnidad, true)
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
  agregarLibros()
  return paginas
}

// La categoría es el último tramo de la clasificación y se muestra en mayúsculas.
export const obtenerTextoCategoria = (cuerpo) => cuerpo.clasificacion.split('·').at(-1).trim().toUpperCase()

const HUECO_ENCABEZADO = 12
const ANCHO_MINIMO_IMAGEN = 48
const ANCHO_RESERVADO_IMAGEN = 72
const ANCHO_MAXIMO_IMAGEN = 130
const ALTO_MAXIMO_IMAGEN = 84
const FRACCION_MAXIMA_ENCABEZADO = .45

function recortarTexto(texto, medir, ancho) {
  let recorte = texto
  while (recorte.length > 1 && medir(`${recorte}…`) > ancho) recorte = recorte.slice(0, -1)
  return `${recorte.trimEnd()}…`
}

// Reparte categoría, nombre, pestañas e imagen del encabezado sin que se superpongan.
// Las fuentes no se reducen: si la categoría no cabe junto a la imagen, pasa a otra línea.
// medir(texto, tamano) devuelve el ancho del texto en unidades lógicas de la ficha.
export function calcularEncabezadoFicha(presentacion, { categoria, nombre }, medir) {
  const { ancho, alto: altoFicha, tipografia, margen, altoPestana } = presentacion
  const cerrar = zonaCerrarVr(ancho)
  const derecha = cerrar.x - HUECO_ENCABEZADO
  const medirCategoria = (texto) => medir(texto, tipografia.categoria)
  const anchoLinea = derecha - margen - HUECO_ENCABEZADO - ANCHO_RESERVADO_IMAGEN
  const lineas = dividirLineas(categoria, medirCategoria, anchoLinea)
  let lineasCategoria = lineas.length ? lineas : ['']
  let filas = calcularFilasEncabezado(ancho, tipografia, altoPestana, lineasCategoria.length)
  const unaLinea = calcularFilasEncabezado(ancho, tipografia, altoPestana, 1)
  if (lineasCategoria.length > 1 && filas.inicio > Math.max(altoFicha * FRACCION_MAXIMA_ENCABEZADO, unaLinea.inicio)) {
    // Con fuentes muy grandes el encabezado dejaría sin espacio a la lectura: una sola línea recortada.
    lineasCategoria = [recortarTexto(categoria, medirCategoria, anchoLinea)]
    filas = unaLinea
  }
  const anchoTexto = Math.max(...lineasCategoria.map(medirCategoria), medir(nombre, tipografia.titulo))
  const izquierda = Math.max(margen + anchoTexto + HUECO_ENCABEZADO, derecha - ANCHO_MAXIMO_IMAGEN)
  // La imagen ocupa la franja libre entre el borde superior y las pestañas, a la izquierda del botón de cierre.
  const franja = filas.pestanasY - HUECO_ENCABEZADO / 2 - cerrar.y
  const alto = Math.min(ALTO_MAXIMO_IMAGEN, franja)
  const cajaImagen = derecha - izquierda >= ANCHO_MINIMO_IMAGEN && alto >= ANCHO_MINIMO_IMAGEN
    ? { x: izquierda, y: cerrar.y + (franja - alto) / 2, ancho: derecha - izquierda, alto } : null
  return { lineasCategoria, ...filas, cajaImagen }
}

export function crearPaginasFicha(cuerpo, contexto, { ancho = 800, alto = 720, contenido = null, presentacion = null } = {}) {
  if (contenido) return crearPaginasPublicadas(cuerpo, contexto, ancho, alto, contenido, presentacion)
  if (presentacion) return crearPaginasPublicadas(cuerpo, contexto, ancho, alto, { fase: 'cargando' }, presentacion)
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

export function obtenerZonasNavegacion(ancho, alto, pagina, total, paginas = null, presentacion = null) {
  const anchoPestana = (ancho - 64 - 24) / SECCIONES_FICHA.length
  const anchoBoton = Math.min(presentacion ? 300 : 148, (ancho - 96) / 2)
  const altoControl = presentacion?.altoControl ?? 54
  const pieY = presentacion ? alto - altoControl - 20 : alto - 80
  return [
    { accion: 'cerrar', texto: '×', ...(presentacion ? zonaCerrarVr(ancho) : { x: ancho - 62, y: 14, ancho: 46, alto: 46 }) },
    ...SECCIONES_FICHA.map((seccion, indice) => ({ accion: `seccion:${seccion.pagina}`, texto: seccion.nombre, x: 32 + indice * (anchoPestana + 8), y: presentacion?.pestanasY ?? 122, ancho: anchoPestana, alto: presentacion?.altoPestana ?? 44, actual: paginas ? paginas[pagina]?.id === seccion.id : pagina === seccion.pagina })),
    ...(pagina > 0 ? [{ accion: 'anterior', texto: '← Anterior', x: 32, y: pieY, ancho: anchoBoton, alto: altoControl }] : []),
    ...(total > 0 ? [{ accion: 'siguiente', texto: pagina === total - 1 ? 'Cerrar →' : 'Siguiente →', x: ancho - 32 - anchoBoton, y: pieY, ancho: anchoBoton, alto: altoControl }] : []),
  ]
}

export function resolverAccionFicha(accion, { pagina, total }) {
  if (!Number.isInteger(total) || total <= 0 || !Number.isInteger(pagina) || pagina < 0 || pagina >= total) return null
  if (accion === 'anterior' && pagina === 0) return null
  if (accion === 'siguiente' && pagina === total - 1) return 'cerrar'
  return accion ?? null
}

export function detectarAccionFicha(uv, ancho, alto, zonas, lectura) {
  if (!Number.isFinite(uv?.x) || !Number.isFinite(uv?.y) || uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) return null
  const x = uv.x * ancho
  const y = (1 - uv.y) * alto
  const accion = zonas.find((zona) => x >= zona.x && x <= zona.x + zona.ancho && y >= zona.y && y <= zona.y + zona.alto)?.accion
    ?? (uv.x < .5 ? 'anterior' : 'siguiente')
  return resolverAccionFicha(accion, lectura)
}

export function consumirToqueFicha(objetivo, alAccionar) {
  if (!objetivo) return false
  if (objetivo.accion) alAccionar(objetivo.accion)
  return true
}
