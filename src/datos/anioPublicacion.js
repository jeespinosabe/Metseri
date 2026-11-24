export const ANIO_MINIMO_PUBLICACION = 1000

const formatoAnio = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mazatlan', year: 'numeric' })

export function obtenerAnioActual() {
  return Number(formatoAnio.format(new Date()))
}

export function esAnioPublicacionValido(anio, anioActual = obtenerAnioActual()) {
  return Number.isInteger(anio) && anio >= ANIO_MINIMO_PUBLICACION && anio <= anioActual
}
