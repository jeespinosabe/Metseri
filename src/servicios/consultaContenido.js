function textoDisponible(valor) {
  return typeof valor === 'string' && valor.trim() ? valor : ''
}

export function adaptarContenido(cuerpo, ficha) {
  if (!ficha || ficha.slug !== cuerpo.id || ficha.nombre !== cuerpo.nombre
    || ficha.tipo !== cuerpo.tipo || (cuerpo.tipo === 'satelite'
      ? ficha.planeta?.slug !== cuerpo.planetaId || ficha.planeta?.nombre !== cuerpo.planetaPrincipal
      : ficha.planeta !== null)) {
    throw new Error('La información no corresponde al cuerpo seleccionado.')
  }
  const editorial = ficha.contenido_ficha
  return {
    clasificacion: textoDisponible(ficha.clasificacion),
    subtitulo: textoDisponible(ficha.subtitulo),
    descripcion: textoDisponible(ficha.descripcion_breve),
    curiosidades: Array.isArray(ficha.curiosidades) ? ficha.curiosidades.filter(textoDisponible) : [],
    invitacion: textoDisponible(editorial?.descubrir_libros),
    datos: Array.from({ length: 4 }, (_, indice) => {
      const dato = editorial?.datos_principales?.[indice]
      const partes = textoDisponible(dato?.valor).match(/^(\d+(?: \d{3})*(?:,\d+)?)\s+(.+)$/u)
      return textoDisponible(dato?.etiqueta) && partes
        ? { etiqueta: dato.etiqueta, valor: partes[1], unidad: partes[2] }
        : null
    }),
  }
}

// Cada montaje de ficha tiene una sola consulta; cancelarla invalida tambien
// transportes que respondan despues de ignorar la señal de aborto.
export function iniciarConsultaContenido(cuerpo, alCambiar, { solicitar = fetch, plazoMs = 12000 } = {}) {
  const controlador = new AbortController()
  let vigente = true
  const temporizador = setTimeout(() => {
    if (!vigente) return
    vigente = false
    controlador.abort()
    alCambiar({ fase: 'error' })
  }, plazoMs)

  void Promise.resolve().then(async () => {
    if (!vigente) return
    alCambiar({ fase: 'cargando' })
    try {
      const respuesta = await solicitar(`/api/cuerpos-celestes/${encodeURIComponent(cuerpo.id)}`, {
        signal: controlador.signal,
      })
      if (!respuesta.ok) throw new Error('Contenido no disponible.')
      const ficha = adaptarContenido(cuerpo, await respuesta.json())
      if (vigente) alCambiar({ fase: 'disponible', ficha })
    } catch {
      if (vigente) alCambiar({ fase: 'error' })
    } finally {
      clearTimeout(temporizador)
    }
  })

  return () => {
    vigente = false
    clearTimeout(temporizador)
    controlador.abort()
  }
}
