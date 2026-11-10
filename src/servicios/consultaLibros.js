import recomendacionesCuradas from '../datos/recomendacionesCuradas.json' with { type: 'json' }

export function seleccionarLibrosPublicos(registros, cuerpoId, explicaciones = recomendacionesCuradas) {
  if (!Array.isArray(registros)) throw new Error('Respuesta bibliográfica inválida.')
  const vistos = new Set()
  return registros.filter((libro) => {
    if (!libro || typeof libro.libro_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(libro.libro_id)
      || typeof libro.titulo !== 'string' || !libro.titulo.trim() || libro.activo === false || libro.verificado === false) return false
    try {
      const url = new URL(libro.url_ficha)
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
    } catch { return false }
  }).sort((primero, segundo) => (primero.orden ?? 32767) - (segundo.orden ?? 32767)
    || primero.libro_id.localeCompare(segundo.libro_id)).filter((libro) => {
    const titulo = libro.titulo.trim().toLocaleLowerCase('es-MX')
    if (vistos.has(libro.libro_id) || vistos.has(titulo)) return false
    vistos.add(libro.libro_id)
    vistos.add(titulo)
    return true
  }).slice(0, 3).map((libro) => ({
    id: libro.libro_id, titulo: libro.titulo.trim(), url: libro.url_ficha,
    autor: typeof libro.autor === 'string' ? libro.autor : '',
    editorial: typeof libro.editorial === 'string' ? libro.editorial : '',
    anio: Number.isInteger(libro.anio) ? libro.anio : null,
    explicacion: typeof explicaciones[libro.libro_id]?.[cuerpoId] === 'string' ? explicaciones[libro.libro_id][cuerpoId] : '',
  }))
}

export function iniciarConsultaLibros(cuerpoId, alCambiar, { solicitar = fetch, plazoMs = 12000 } = {}) {
  const controlador = new AbortController()
  let vigente = true
  const terminar = (estado) => {
    if (!vigente) return
    vigente = false
    clearTimeout(temporizador)
    alCambiar(estado)
  }
  const temporizador = setTimeout(() => {
    controlador.abort()
    terminar({ fase: 'error', libros: [] })
  }, plazoMs)
  void Promise.resolve().then(async () => {
    if (!vigente) return
    alCambiar({ fase: 'cargando', libros: [] })
    try {
      const respuesta = await solicitar(`/api/cuerpos-celestes/${encodeURIComponent(cuerpoId)}/libros`, { signal: controlador.signal })
      if (!respuesta.ok) throw new Error('Libros no disponibles.')
      terminar({ fase: 'disponible', libros: seleccionarLibrosPublicos(await respuesta.json(), cuerpoId) })
    } catch { terminar({ fase: 'error', libros: [] }) }
  })
  return () => {
    vigente = false
    clearTimeout(temporizador)
    controlador.abort()
  }
}
