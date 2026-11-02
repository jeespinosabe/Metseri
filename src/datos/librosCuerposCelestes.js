// Incorporar aquí exclusivamente títulos y URLs de fichas reales de la biblioteca.
export const LIBROS_POR_CUERPO = {}
export const INVITACION_BIBLIOTECA = 'Sigue explorando en los libros físicos de la Biblioteca «Solón Argüello».'
export const MENSAJE_ENLACES_PENDIENTES = 'Próximamente podrás consultar aquí las fichas bibliográficas de los libros relacionados.'

export function obtenerLibrosCuerpo(id, asociaciones = LIBROS_POR_CUERPO) {
  return (asociaciones[id] ?? []).filter((libro) => {
    if (typeof libro?.titulo !== 'string' || !libro.titulo.trim()) return false
    try {
      return ['https:', 'http:'].includes(new URL(libro.url).protocol)
    } catch {
      return false
    }
  })
}

export function abrirFichaBibliografica(libro, { abrir = window.open.bind(window), salirVr = () => {} } = {}) {
  if (!obtenerLibrosCuerpo('actual', { actual: [libro] }).length) return false
  // Síncrono: conservar el gesto que permite abrir una pestaña, antes de liberar VR.
  const pestana = abrir(libro.url, '_blank')
  if (pestana) pestana.opener = null
  salirVr()
  return Boolean(pestana)
}
