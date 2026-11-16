const MAXIMO_BYTES_PORTADA = 768 * 1024

export function decodificarPortada(datos) {
  if (typeof datos !== 'string' || datos.length > MAXIMO_BYTES_PORTADA * 4 / 3 || /[^A-Za-z0-9+/=]/.test(datos)) return null
  const imagen = Buffer.from(datos, 'base64')
  if (imagen.length < 5 || imagen.toString('base64') !== datos
    || imagen[0] !== 0xff || imagen[1] !== 0xd8 || imagen[2] !== 0xff
    || imagen.at(-2) !== 0xff || imagen.at(-1) !== 0xd9) return null
  return imagen
}

export function responderPortada(respuesta, datos) {
  const imagen = decodificarPortada(datos)
  if (!imagen) return respuesta.sendStatus(404)
  return respuesta.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }).type('jpeg').send(imagen)
}
