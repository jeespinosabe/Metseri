import { obtenerLibrosCuerpo } from '../datos/librosCuerposCelestes.js'

const textoOpcional = (valor) => typeof valor === 'string' ? valor.trim() : ''
const numeroOpcional = (valor) => typeof valor === 'number' && Number.isFinite(valor) ? valor : null

export function adaptarFicha(datos, cuerpo) {
  if (!datos || datos.slug !== cuerpo.id || datos.tipo !== cuerpo.tipo
    || typeof datos.id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(datos.id)
    || !textoOpcional(datos.nombre) || !Array.isArray(datos.curiosidades) || !Array.isArray(datos.libros)
    || !datos.curiosidades.every((texto) => typeof texto === 'string')
    || (datos.datos_principales !== null && (typeof datos.datos_principales !== 'object' || Array.isArray(datos.datos_principales)))
    || (cuerpo.tipo === 'satelite' ? datos.planeta?.slug !== cuerpo.planetaId : datos.planeta !== null)) {
    throw new Error('Ficha incompatible con la selección')
  }
  const principales = datos.datos_principales ?? {}
  return {
    ...cuerpo,
    idRemoto: datos.id,
    clasificacion: textoOpcional(datos.clasificacion) || cuerpo.clasificacion,
    subtitulo: textoOpcional(datos.subtitulo),
    descripcion: textoOpcional(datos.descripcion_breve),
    diametroKm: numeroOpcional(principales.diametro_km),
    distanciaSolMillonesKm: cuerpo.tipo === 'planeta' ? numeroOpcional(principales.distancia_sol_millones_km) : undefined,
    distanciaPlanetaKm: cuerpo.tipo === 'satelite' ? numeroOpcional(principales.distancia_planeta_km) : undefined,
    rotacionHoras: numeroOpcional(principales.rotacion_horas),
    orbitaDias: numeroOpcional(principales.orbita_dias),
    curiosidades: datos.curiosidades.map(textoOpcional).filter(Boolean),
    libros: obtenerLibrosCuerpo(cuerpo.id, { [cuerpo.id]: datos.libros }).map((libro) => ({
      titulo: libro.titulo.trim(), url: libro.url,
      autor: textoOpcional(libro.autor), editorial: textoOpcional(libro.editorial),
      anio: Number.isInteger(libro.anio) ? libro.anio : null,
    })),
  }
}

export function obtenerMensajeContenido(estado, nombre) {
  if (estado?.fase === 'no-disponible') return `La ficha de ${nombre} no está disponible.`
  if (estado?.fase === 'error') return 'No pudimos cargar esta ficha. Inténtalo de nuevo.'
  return `Cargando ficha de ${nombre}…`
}

export function crearConsultaContenido({ solicitar = fetch, plazoMs = 12000,
  programar = setTimeout, cancelarTemporizador = clearTimeout } = {}) {
  let estado = { slug: null, fase: 'sin-seleccion', ficha: null }
  let cuerpo = null
  let version = 0
  let cancelarPendiente = () => {}
  let destruida = false
  const oyentes = new Set()
  function publicar(nuevo) { estado = nuevo; oyentes.forEach((oyente) => oyente()) }

  async function consultar(nuevoCuerpo, forzar = false) {
    if (destruida || (!forzar && cuerpo?.id === nuevoCuerpo?.id)) return
    const actual = ++version
    cancelarPendiente()
    cuerpo = nuevoCuerpo
    if (!cuerpo) { publicar({ slug: null, fase: 'sin-seleccion', ficha: null }); return }
    const seleccionado = cuerpo
    const control = new AbortController()
    const temporizador = programar(() => control.abort(), plazoMs)
    cancelarPendiente = () => { cancelarTemporizador(temporizador); control.abort() }
    publicar({ slug: cuerpo.id, fase: 'cargando', ficha: null })
    let alCancelar
    try {
      // La cancelación también termina la espera si el transporte no respeta AbortSignal.
      const cancelacion = new Promise((_, rechazar) => {
        alCancelar = () => rechazar(new Error('Consulta cancelada'))
        control.signal.addEventListener('abort', alCancelar, { once: true })
      })
      const consulta = (async () => {
        const respuesta = await solicitar(`/api/cuerpos-celestes/${encodeURIComponent(seleccionado.id)}`, {
          method: 'GET', headers: { Accept: 'application/json' }, signal: control.signal,
        })
        if (respuesta.status === 404) return { fase: 'no-disponible', ficha: null }
        if (!respuesta.ok) throw new Error('Consulta no disponible')
        return { fase: 'disponible', ficha: adaptarFicha(await respuesta.json(), seleccionado) }
      })()
      const resultado = await Promise.race([consulta, cancelacion])
      if (actual === version && !destruida) publicar({ slug: seleccionado.id, ...resultado })
    } catch {
      if (actual === version && !destruida) publicar({ slug: seleccionado.id, fase: 'error', ficha: null })
    } finally {
      cancelarTemporizador(temporizador)
      control.signal.removeEventListener('abort', alCancelar)
    }
  }
  return {
    obtenerEstado: () => estado,
    suscribirse(oyente) { oyentes.add(oyente); return () => oyentes.delete(oyente) },
    seleccionar: consultar,
    reintentar: () => cuerpo && consultar(cuerpo, true),
    cancelar() { return consultar(null) },
    destruir() { consultar(null); destruida = true; oyentes.clear() },
  }
}
