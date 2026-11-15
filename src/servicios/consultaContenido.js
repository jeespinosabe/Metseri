import { consultarJsonPublico, iniciarConsultaPublica } from './consultaPublica.js'

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

export function consultarContenido(cuerpo, opciones) {
  return consultarJsonPublico(`/api/cuerpos-celestes/${encodeURIComponent(cuerpo.id)}`, (ficha) => adaptarContenido(cuerpo, ficha), opciones)
}

export function iniciarConsultaContenido(cuerpo, alCambiar, { leerCopia, ...opciones } = {}) {
  return iniciarConsultaPublica((signal) => consultarContenido(cuerpo, { ...opciones, signal }), alCambiar, {
    campo: 'ficha', leerCopia,
  })
}
