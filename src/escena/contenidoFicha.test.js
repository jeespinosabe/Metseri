import assert from 'node:assert/strict'
import { it } from 'node:test'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { calcularEncabezadoFicha, consumirToqueFicha, crearEstadoLectura, crearPaginasFicha, detectarAccionFicha, dividirLineas, obtenerTextoCategoria, obtenerZonasNavegacion, resolverAccionFicha } from './contenidoFicha.js'
import { calcularPresentacionFicha, zonaCerrarVr } from './lecturaVisor.js'
import { calcularConfiguracionVisor } from './rendimientoEscena.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido } from '../servicios/consultaContenido.js'

const contexto = { font: '', measureText(texto) { return { width: texto.length * parseFloat(this.font) * .55 } } }

for (const [ancho, alto] of [[320, 440], [700, 440], [760, 440], [860, 440], [900, 550], [750, 624], [900, 1000]]) {
  it(`contenido publicado ${ancho} × ${alto}: doce fichas completas sin recorte ni controles nuevos`, () => {
    for (const fuente of FICHAS_PRUEBA) {
      const cuerpo = CUERPOS_CELESTES.find((registro) => registro.id === fuente.slug)
      const ficha = adaptarContenido(cuerpo, fuente)
      const paginas = crearPaginasFicha(cuerpo, contexto, { ancho, alto, contenido: { fase: 'disponible', ficha } })
      const textoSeccion = (id) => paginas.filter((pagina) => pagina.id === id).flatMap((pagina) => pagina.elementos.filter((e) => e.tipo === 'texto' && !e.acento).map((e) => e.texto)).join(' ')
      assert.equal(textoSeccion('resumen'), ficha.descripcion)
      assert.equal(textoSeccion('curiosidades'), ficha.curiosidades.join(' '))
      assert.equal(textoSeccion('libros'), ficha.invitacion)
      for (const dato of ficha.datos) assert.ok(textoSeccion('datos').includes(`${dato.etiqueta} ${dato.valor} ${dato.unidad}`))
      if (ancho === 320) assert.ok(paginas.length > 4)
      for (const [indice, pagina] of paginas.entries()) {
        for (const e of pagina.elementos) {
          assert.ok(e.y >= 194)
          assert.ok(e.y + (e.alto ?? e.tamano * 1.2) <= alto - 100, `${fuente.slug}: ${pagina.id} ${e.texto}`)
          if (e.texto) {
            contexto.font = `${e.tamano}px system-ui`
            assert.ok(e.x + contexto.measureText(e.texto).width <= ancho - 32 + .01, `${fuente.slug}: ${e.texto}`)
          }
        }
        const zonas = obtenerZonasNavegacion(ancho, alto, indice, paginas.length, paginas)
        assert.equal(zonas.filter((z) => z.actual).length, 1)
        assert.equal(zonas.filter((z) => z.accion.startsWith('seccion:')).length, 4)
      }
    }
  })
}

it('Datos muestra diámetro, distancia y ambas duraciones en una sola página VR compacta', () => {
  for (const [ancho, alto] of [[700, 440], [760, 440], [860, 440], [900, 550]]) {
    for (const fuente of FICHAS_PRUEBA) {
      const cuerpo = CUERPOS_CELESTES.find((registro) => registro.id === fuente.slug)
      const ficha = adaptarContenido(cuerpo, fuente)
      const paginas = crearPaginasFicha(cuerpo, contexto, { ancho, alto, contenido: { fase: 'disponible', ficha } })
      const datos = paginas.filter((pagina) => pagina.id === 'datos')
      assert.equal(datos.length, 1, `${cuerpo.nombre}: ${ancho} × ${alto}`)
      const textos = datos[0].elementos.map((elemento) => elemento.texto).join(' ')
      for (const dato of ficha.datos) assert.ok(textos.includes(`${dato.etiqueta} ${dato.valor} ${dato.unidad}`))
    }
  }
})

it('en VR la fecha identifica la sección descargada sin cubrir la navegación', () => {
  const cuerpo = CUERPOS_CELESTES[0]
  const ficha = adaptarContenido(cuerpo, FICHAS_PRUEBA.find(({ slug }) => slug === cuerpo.id))
  const fechaDescarga = Date.UTC(2026, 10, 15, 14)
  const opciones = { ancho: 320, alto: 440 }
  for (const estado of [
    { fase: 'disponible', ficha, fechaDescarga, bibliografia: { fase: 'error', libros: [] } },
    { fase: 'error', bibliografia: { fase: 'disponible', libros: [], fechaDescarga } },
  ]) {
    const paginas = crearPaginasFicha(cuerpo, contexto, { ...opciones, contenido: estado })
    for (const pagina of paginas) {
      const etiqueta = pagina.elementos.find((elemento) => elemento.texto?.startsWith('Copia del '))
      assert.equal(Boolean(etiqueta), pagina.id === 'libros' ? !estado.fechaDescarga : Boolean(estado.fechaDescarga))
      if (etiqueta) {
        assert.ok(etiqueta.y > 166 && etiqueta.y + etiqueta.tamano * 1.2 < 194)
        contexto.font = etiqueta.tamano + 'px system-ui'
        assert.ok(contexto.measureText(etiqueta.texto).width <= opciones.ancho - 64)
      }
    }
  }
})

for (const [ancho, alto] of [[320, 440], [750, 624], [900, 1000]]) {
  it(`secciones ${ancho} × ${alto}: reservas vacías y contenido dentro del área de lectura`, () => {
    for (const cuerpo of CUERPOS_CELESTES) {
      const paginas = crearPaginasFicha(cuerpo, contexto, { ancho, alto })
      assert.equal(paginas.length, 4)
      assert.ok(paginas.every((p) => p.elementos.some((e) => e.tipo === 'espacio')))
      const texto = paginas.flatMap((p) => p.elementos.map((e) => e.texto ?? '')).join(' ')
      assert.doesNotMatch(texto, /\d|NaN|undefined|NASA|Solón/)
      assert.equal(new Set(paginas.map((p) => p.seccion)).size, 4)
      for (const pagina of paginas) for (const elemento of pagina.elementos) {
        assert.ok(elemento.y >= 194)
        assert.ok(elemento.y + (elemento.alto ?? elemento.tamano * 1.2) <= alto - 100)
        if (elemento.texto) {
          contexto.font = `${elemento.tamano}px system-ui`
          assert.ok(contexto.measureText(elemento.texto).width <= ancho - 64)
        }
      }
    }
  })
}

const medirMayusculas = (texto, tamano) => texto.length * tamano * .65
const cruzan = (a, b) => a && b && a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y

it('el encabezado separa categoría, nombre, imagen, cierre y pestañas sin reducir las fuentes', () => {
  for (const [ancho, alto, diagonal] of [[740, 360, 5.5], [844, 390, 6.9], [932, 430, 7], [1381, 645, 6.1], [1920, 900, 5.5]]) {
    const base = calcularPresentacionFicha(calcularConfiguracionVisor({ ancho, alto, diagonal, densidad: 3 }))
    const cerrar = zonaCerrarVr(base.ancho)
    for (const cuerpo of CUERPOS_CELESTES) {
      const mensaje = `${ancho}×${alto} ${diagonal}" ${cuerpo.id}`
      const encabezado = calcularEncabezadoFicha(base, { categoria: obtenerTextoCategoria(cuerpo), nombre: cuerpo.nombre }, medirMayusculas)
      const presentacion = { ...base, ...encabezado }
      const f = base.tipografia
      const zonas = obtenerZonasNavegacion(base.ancho, base.alto, 0, 4, null, presentacion)
        .filter((zona) => zona.accion === 'cerrar' || zona.accion.startsWith('seccion:'))
      const textos = [
        ...encabezado.lineasCategoria.map((linea, indice) => ({ x: 32, y: 20 + indice * f.categoria * 1.05, ancho: medirMayusculas(linea, f.categoria), alto: f.categoria })),
        { x: 30, y: encabezado.tituloY, ancho: medirMayusculas(cuerpo.nombre, f.titulo), alto: f.titulo },
      ]
      assert.ok(encabezado.pestanasY >= cerrar.y + cerrar.alto, `${mensaje}: las pestañas quedan debajo del botón de cierre`)
      assert.ok(encabezado.cajaImagen, `${mensaje}: la imagen conserva su espacio`)
      for (const zona of zonas) {
        assert.ok(!cruzan(encabezado.cajaImagen, zona), `${mensaje}: la imagen no toca ${zona.accion}`)
        for (const texto of textos) assert.ok(!cruzan(texto, zona), `${mensaje}: el texto no toca ${zona.accion}`)
      }
      for (const texto of textos) {
        assert.ok(!cruzan(texto, encabezado.cajaImagen), `${mensaje}: el texto no toca la imagen`)
        assert.ok(texto.x + texto.ancho <= cerrar.x, `${mensaje}: el texto no llega al botón de cierre`)
      }
      assert.ok(encabezado.cajaImagen.y + encabezado.cajaImagen.alto <= encabezado.inicio, `${mensaje}: la imagen no invade el contenido`)
      assert.equal(encabezado.inicio, Math.ceil(encabezado.pestanasY + base.altoPestana + 8))
    }
  }
})

it('una categoría larga pasa a otra línea y, con fuentes enormes, se recorta antes de tapar la lectura', () => {
  const base = calcularPresentacionFicha(calcularConfiguracionVisor({ ancho: 740, alto: 360, diagonal: 8, densidad: 3 }))
  const categoria = 'SATÉLITE NATURAL DE LA TIERRA'
  const unaLinea = calcularEncabezadoFicha(base, { categoria: 'LUNA', nombre: 'Luna' }, medirMayusculas)
  const envuelta = calcularEncabezadoFicha(base, { categoria, nombre: 'Luna' }, medirMayusculas)
  assert.equal(unaLinea.lineasCategoria.length, 1)
  assert.ok(envuelta.lineasCategoria.length > 1)
  assert.equal(envuelta.lineasCategoria.join(' '), categoria, 'no se pierde ninguna palabra')
  assert.ok(envuelta.inicio > unaLinea.inicio)
  const enorme = { ...base, tipografia: { ...base.tipografia, categoria: 140, titulo: 250 } }
  const recortada = calcularEncabezadoFicha(enorme, { categoria, nombre: 'Luna' }, medirMayusculas)
  assert.equal(recortada.lineasCategoria.length, 1)
  assert.match(recortada.lineasCategoria[0], /…$/u)
  assert.equal(recortada.inicio, calcularEncabezadoFicha(enorme, { categoria: 'LUNA', nombre: 'Luna' }, medirMayusculas).inicio)
})

it('parte palabras largas sin perder caracteres ni duplicar espacios', () => {
  assert.equal(dividirLineas('abcdefghijklmnop', (t) => t.length, 5).join(''), 'abcdefghijklmnop')
  assert.deepEqual(dividirLineas('uno dos tres', (t) => t.length, 7), ['uno dos', 'tres'])
})

it('las cuatro fichas de satélite usan sus datos y cambiar a un planeta reinicia la lectura', () => {
  const lectura = crearEstadoLectura()
  for (const cuerpo of CUERPOS_CELESTES.filter((registro) => registro.tipo === 'satelite')) {
    const paginas = crearPaginasFicha(cuerpo, contexto)
    lectura.actualizar(cuerpo.id, paginas.length)
    lectura.irA(1)
    const textos = paginas[1].elementos.filter((elemento) => elemento.tipo === 'texto').map((elemento) => elemento.texto)
    assert.ok(textos.includes('Distancia al planeta'))
    assert.ok(textos.includes('Período de rotación'))
    assert.ok(textos.includes('Período orbital'))
    assert.ok(!textos.includes('Distancia al Sol'))
    assert.ok(paginas.every((pagina) => pagina.elementos.some((elemento) => elemento.tipo === 'espacio')))
    const planeta = CUERPOS_CELESTES.find((registro) => registro.id === cuerpo.planetaId)
    lectura.actualizar(planeta.id, 4)
    assert.deepEqual(lectura.obtenerEstado(), { cuerpoId: planeta.id, pagina: 0, total: 4 })
    const datosPlaneta = crearPaginasFicha(planeta, contexto)[1].elementos.map((elemento) => elemento.texto)
    assert.ok(datosPlaneta.includes('Distancia al Sol'))
    assert.ok(datosPlaneta.includes('Un año dura'))
  }
})

it('lectura conserva página al recentrar, reinicia al cambiar cuerpo/modo y limita ambos extremos', () => {
  const cambios = []
  const estado = crearEstadoLectura((valor) => cambios.push(valor))
  estado.actualizar('tierra', 5)
  assert.equal(estado.mover(-1), false)
  estado.mover(1)
  estado.actualizar('tierra', 5)
  assert.equal(estado.obtenerEstado().pagina, 1)
  estado.actualizar('tierra', 5, true)
  assert.equal(estado.obtenerEstado().pagina, 0)
  estado.mover(100)
  assert.equal(estado.obtenerEstado().pagina, 4)
  assert.equal(estado.mover(1), false)
  estado.actualizar('marte', 4)
  assert.equal(estado.obtenerEstado().pagina, 0)
  estado.actualizar(null, 0)
  assert.deepEqual(estado.obtenerEstado(), { cuerpoId: null, pagina: 0, total: 0 })
  assert.equal(estado.mover(1), false)
  assert.ok(cambios.length > 0)
})

it('acciones UV priorizan botones y navegan por mitades locales, con el centro a la derecha', () => {
  const zonas = obtenerZonasNavegacion(800, 720, 0, 4)
  const lectura = { pagina: 0, total: 4 }
  assert.ok(!zonas.some((z) => z.accion === 'anterior'))
  for (const zona of zonas) {
    const uv = { x: (zona.x + zona.ancho / 2) / 800, y: 1 - (zona.y + zona.alto / 2) / 720 }
    assert.equal(detectarAccionFicha(uv, 800, 720, zonas, lectura), zona.accion)
  }
  const detectar = (uv, pagina = 0) => detectarAccionFicha(uv, 800, 720, obtenerZonasNavegacion(800, 720, pagina, 4), { pagina, total: 4 })
  assert.equal(detectar({ x: .5, y: .5 }), 'siguiente')
  assert.equal(detectar({ x: .499, y: .5 }), null)
  assert.equal(detectar({ x: .499, y: .5 }, 1), 'anterior')
  assert.equal(detectar({ x: .9, y: .5 }, 2), 'siguiente')
  assert.equal(detectar({ x: .9, y: .5 }, 3), 'cerrar')
  for (const uv of [{ x: -.1, y: .5 }, { x: 1.1, y: .5 }, { x: .5, y: -.1 }, { x: .5, y: 1.1 }, { x: NaN, y: .5 }, null]) {
    assert.equal(detectar(uv), null)
  }
  assert.equal(zonas.filter((z) => z.accion.startsWith('seccion:')).length, 4)
})

it('el avance final ofrece cierre y los controles explícitos conservan prioridad en ambas mitades', () => {
  const lectura = { pagina: 3, total: 4 }
  const zonas = obtenerZonasNavegacion(800, 720, lectura.pagina, lectura.total)
  assert.equal(zonas.find((zona) => zona.accion === 'siguiente').texto, 'Cerrar →')
  for (const zona of zonas) {
    const uv = { x: (zona.x + zona.ancho / 2) / 800, y: 1 - (zona.y + zona.alto / 2) / 720 }
    assert.equal(detectarAccionFicha(uv, 800, 720, zonas, lectura), zona.accion === 'siguiente' ? 'cerrar' : zona.accion)
  }
  assert.equal(resolverAccionFicha('siguiente', { pagina: 0, total: 1 }), 'cerrar')
  for (const estado of [{ pagina: 0, total: 0 }, { pagina: 4, total: 4 }, { pagina: -1, total: 4 }]) {
    assert.equal(resolverAccionFicha('siguiente', estado), null)
  }
})

it('salto directo de sección y retroceso no disponible consumen un solo toque', () => {
  const lectura = crearEstadoLectura()
  lectura.actualizar('saturno', 4)
  const acciones = []
  const ejecutar = (accion) => { acciones.push(accion); if (accion.startsWith('seccion:')) lectura.irA(Number(accion.slice(8))) }
  assert.equal(consumirToqueFicha({ accion: null }, ejecutar), true)
  assert.deepEqual(acciones, [])
  assert.equal(lectura.obtenerEstado().pagina, 0)
  assert.equal(consumirToqueFicha({ accion: 'seccion:3' }, ejecutar), true)
  assert.equal(lectura.obtenerEstado().pagina, 3)
  assert.equal(lectura.obtenerEstado().cuerpoId, 'saturno')
  assert.equal(consumirToqueFicha(null, ejecutar), false, 'fuera de la ficha conserva la ruta de deselección')
  assert.equal(lectura.irA(NaN), false)
})
