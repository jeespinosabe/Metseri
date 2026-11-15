const formatoFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

export function etiquetaCopiaDescargada(fecha) {
  return `Copia del ${formatoFecha.format(fecha)}`
}
