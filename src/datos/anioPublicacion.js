// Año actual en la zona horaria de la Biblioteca (America/Mazatlan). Solo aporta «hoy»: el rango
// permitido del año de publicación vive en src/administracion/reglasLibro.js (1450 al año actual + 1).
const formatoAnio = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mazatlan', year: 'numeric' })

export function obtenerAnioActual() {
  return Number(formatoAnio.format(new Date()))
}
