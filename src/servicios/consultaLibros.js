import recomendacionesCuradas from '../datos/recomendacionesCuradas.json' with { type: 'json' }
import { consultarJsonPublico, iniciarConsultaPublica } from './consultaPublica.js'
import { presentarPortada } from './portadasLibros.js'

export function seleccionarLibrosPublicos(registros, cuerpoId, explicaciones = recomendacionesCuradas) {
  if (!Array.isArray(registros)) throw new Error('Respuesta bibliográfica inválida.')
  const vistos = new Set()
  return registros.filter((libro) => {
    if (!libro || typeof libro.libro_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(libro.libro_id)
      || typeof libro.titulo !== 'string' || !libro.titulo.trim() || libro.activo === false) return false
    return true
  }).sort((primero, segundo) => (primero.orden ?? 32767) - (segundo.orden ?? 32767)
    || primero.libro_id.localeCompare(segundo.libro_id)).filter((libro) => {
    const titulo = libro.titulo.trim().toLocaleLowerCase('es-MX')
    if (vistos.has(libro.libro_id) || vistos.has(titulo)) return false
    vistos.add(libro.libro_id)
    vistos.add(titulo)
    return true
  }).slice(0, 3).map((libro) => {
    const fotografia = presentarPortada(libro.portada, `/api/cuerpos-celestes/${encodeURIComponent(cuerpoId)}/libros/${libro.libro_id}/portada`)
    return {
      id: libro.libro_id, titulo: libro.titulo.trim(),
      autor: typeof libro.autor === 'string' ? libro.autor : '',
      editorial: typeof libro.editorial === 'string' ? libro.editorial : '',
      anio: Number.isInteger(libro.anio) ? libro.anio : null,
      explicacion: typeof explicaciones[libro.libro_id]?.[cuerpoId] === 'string' ? explicaciones[libro.libro_id][cuerpoId] : '',
      ...(fotografia && { fotografia }),
    }
  })
}

export function consultarLibros(cuerpoId, opciones) {
  return consultarJsonPublico(`/api/cuerpos-celestes/${encodeURIComponent(cuerpoId)}/libros`, (registros) => seleccionarLibrosPublicos(registros, cuerpoId), opciones)
}

export function iniciarConsultaLibros(cuerpoId, alCambiar, { leerCopia, ...opciones } = {}) {
  return iniciarConsultaPublica((signal) => consultarLibros(cuerpoId, { ...opciones, signal }), alCambiar, {
    campo: 'libros', estadoInicial: { libros: [] }, leerCopia,
  })
}
