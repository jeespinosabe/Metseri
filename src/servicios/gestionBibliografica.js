import { presentarLibroAdministrativo } from '../administracion/registrosBibliograficos.js'

const RUTA_LIBROS = '/api/admin/libros'

async function solicitarLibros(ruta, { method = 'GET', datos, signal } = {}) {
  let respuesta
  try {
    respuesta = await fetch(ruta, {
      method, credentials: 'same-origin', cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
      ...(datos && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) }),
    })
  } catch {
    throw new Error(method === 'GET' ? 'No se pudo consultar el catálogo. Inténtalo de nuevo.'
      : 'No se pudo confirmar el cambio. Revisa el listado antes de volver a intentarlo.')
  }
  if (respuesta.status === 204) return
  if (respuesta.status === 401) throw new Error('La sesión administrativa venció. Vuelve a iniciar sesión.')
  const contenido = await respuesta.json().catch(() => null)
  if (!respuesta.ok) throw new Error(contenido?.error?.mensaje || 'La API de libros no está disponible.')
  return contenido
}

export async function listarLibrosAdministrativos(signal) {
  const libros = new Map()
  const limite = 100
  for (let desplazamiento = 0; ; desplazamiento += limite) {
    const pagina = await solicitarLibros(`${RUTA_LIBROS}?limite=${limite}&desplazamiento=${desplazamiento}`, { signal })
    if (!Array.isArray(pagina)) throw new Error('La API devolvió un catálogo inválido.')
    for (const libro of pagina.map(presentarLibroAdministrativo)) libros.set(libro.id, libro)
    if (pagina.length < limite) return [...libros.values()]
  }
}

export async function guardarLibroAdministrativo(datos, id) {
  const ruta = id ? `${RUTA_LIBROS}/${encodeURIComponent(id)}` : RUTA_LIBROS
  return presentarLibroAdministrativo(await solicitarLibros(ruta, { method: id ? 'PATCH' : 'POST', datos }))
}

export function eliminarLibroAdministrativo(id) {
  return solicitarLibros(`${RUTA_LIBROS}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
