const MAXIMO_BYTES_PORTADA = 768 * 1024
const MAXIMO_LADO_PORTADA = 1200

export function presentarPortada(portada, ruta) {
  if (typeof portada?.version !== 'string' || ![portada.x, portada.y].every((valor) => Number.isInteger(valor) && valor >= 0 && valor <= 100)) return null
  return { url: `${ruta}?v=${encodeURIComponent(portada.version)}`, version: portada.version, encuadre: { x: portada.x, y: portada.y } }
}

export async function prepararPortadaEnvio({ archivo, x, y }) {
  try {
    const imagen = await createImageBitmap(archivo)
    const lienzo = document.createElement('canvas')
    try {
      const escala = Math.min(1, MAXIMO_LADO_PORTADA / Math.max(imagen.width, imagen.height))
      lienzo.width = Math.max(1, Math.round(imagen.width * escala))
      lienzo.height = Math.max(1, Math.round(imagen.height * escala))
      const contexto = lienzo.getContext('2d', { alpha: false })
      contexto.fillStyle = '#fff'
      contexto.fillRect(0, 0, lienzo.width, lienzo.height)
      contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
    } finally {
      imagen.close()
    }

    let portada = await new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', 0.84))
    if (portada?.size > MAXIMO_BYTES_PORTADA) {
      portada = await new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', 0.68))
    }
    if (portada?.type !== 'image/jpeg' || !portada.size || portada.size > MAXIMO_BYTES_PORTADA) throw new Error()
    const datos = await new Promise((resolver, rechazar) => {
      const lector = new FileReader()
      lector.onload = () => resolver(lector.result.split(',')[1])
      lector.onerror = rechazar
      lector.readAsDataURL(portada)
    })
    return { datos, x, y }
  } catch {
    throw new Error('No se pudo preparar la portada. Selecciona una imagen JPG, PNG o WebP válida.')
  }
}
