import assert from 'node:assert/strict'
import { it } from 'node:test'
import { adaptarFicha } from '../servicios/consultaContenido.js'
import { crearFichaPrueba } from '../pruebas/fichasPrueba.js'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { consumirToqueFicha, crearEstadoLectura, crearPaginasFicha, detectarAccionFicha, dividirLineas, obtenerSeccionesFicha, obtenerZonasNavegacion } from './contenidoFicha.js'

const contexto = { font: '', measureText(texto) { return { width: texto.length * parseFloat(this.font) * .55 } } }

for (const [ancho, alto] of [[320, 440], [750, 624], [900, 1000]]) {
  it(`secciones ${ancho} × ${alto}: contenido de los doce cuerpos completo y dentro del área de lectura`, () => {
    for (const local of CUERPOS_CELESTES) {
      const cuerpo = adaptarFicha(crearFichaPrueba(local), local)
      const paginas = crearPaginasFicha(cuerpo, contexto, { ancho, alto, contenido: { fase: 'disponible' } })
      assert.ok(paginas.length >= 4)
      assert.equal(new Set(paginas.map((p) => p.id)).size, 4)
      const texto = paginas.flatMap((p) => p.elementos.map((e) => e.texto)).join(' ')
      assert.ok(texto.includes(cuerpo.descripcion))
      assert.ok(texto.includes(cuerpo.libros[0].titulo))
      assert.doesNotMatch(texto, /NaN|undefined|espacio reservado/)
      assert.ok(paginas.some((pagina) => pagina.elementos.some((elemento) => elemento.accion === 'libro:0')))
      for (const pagina of paginas) for (const elemento of pagina.elementos) {
        assert.equal(elemento.tipo, 'texto')
        assert.ok(elemento.y >= 194)
        assert.ok(elemento.y + (elemento.alto ?? elemento.tamano * 1.2) <= alto - 132)
        contexto.font = `${elemento.tamano}px system-ui`
        assert.ok(elemento.x + contexto.measureText(elemento.texto).width <= ancho - 32 + .1)
      }
    }
  })
}

it('parte palabras largas sin perder caracteres ni duplicar espacios', () => {
  assert.equal(dividirLineas('abcdefghijklmnop', (t) => t.length, 5).join(''), 'abcdefghijklmnop')
  assert.deepEqual(dividirLineas('uno dos tres', (t) => t.length, 7), ['uno dos', 'tres'])
})

it('las lunas y planetas presentan sus distancias y periodos correctos al cambiar la lectura', () => {
  const lectura = crearEstadoLectura()
  for (const local of CUERPOS_CELESTES.filter((c) => c.tipo === 'satelite')) {
    const cuerpo = adaptarFicha(crearFichaPrueba(local), local)
    const paginas = crearPaginasFicha(cuerpo, contexto, { contenido: { fase: 'disponible' } })
    lectura.actualizar(cuerpo.id, paginas.length)
    const texto = paginas.filter((p) => p.id === 'datos').flatMap((p) => p.elementos.map((e) => e.texto)).join(' ')
    assert.match(texto, /Distancia al planeta/)
    assert.match(texto, /Período de rotación/)
    assert.match(texto, /Período orbital/)
    assert.doesNotMatch(texto, /Distancia al Sol|Un año dura/)
    lectura.irA(paginas.length - 1)
    lectura.actualizar(local.planetaId, 4)
    assert.deepEqual(lectura.obtenerEstado(), { cuerpoId: local.planetaId, pagina: 0, total: 4 })
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

it('acciones UV coinciden con botones habilitados; texto y bordes externos no activan', () => {
  const zonas = obtenerZonasNavegacion(800, 720, 0, 4)
  assert.ok(!zonas.some((z) => z.accion === 'anterior'))
  for (const zona of zonas) {
    const uv = { x: (zona.x + zona.ancho / 2) / 800, y: 1 - (zona.y + zona.alto / 2) / 720 }
    assert.equal(detectarAccionFicha(uv, 800, 720, zonas), zona.accion)
  }
  assert.equal(detectarAccionFicha({ x: .5, y: .5 }, 800, 720, zonas), null)
  assert.equal(detectarAccionFicha({ x: -.1, y: .05 }, 800, 720, zonas), null)
  assert.ok(!obtenerZonasNavegacion(800, 720, 3, 4).some((z) => z.accion === 'siguiente'))
  assert.equal(zonas.filter((z) => z.accion.startsWith('seccion:')).length, 4)
})

it('salto directo de sección y toques de lectura no cierran ni avanzan por accidente', () => {
  const lectura = crearEstadoLectura()
  lectura.actualizar('saturno', 4)
  const acciones = []
  const ejecutar = (accion) => { acciones.push(accion); if (accion.startsWith('seccion:')) lectura.irA(['resumen', 'datos', 'curiosidades', 'libros'].indexOf(accion.slice(8))) }
  assert.equal(consumirToqueFicha({ accion: null }, ejecutar), true)
  assert.deepEqual(acciones, [])
  assert.equal(lectura.obtenerEstado().pagina, 0)
  assert.equal(consumirToqueFicha({ accion: 'seccion:libros' }, ejecutar), true)
  assert.equal(lectura.obtenerEstado().pagina, 3)
  assert.equal(lectura.obtenerEstado().cuerpoId, 'saturno')
  assert.equal(consumirToqueFicha(null, ejecutar), false, 'fuera de la ficha conserva la ruta de deselección')
  assert.equal(lectura.irA(NaN), false)
})

it('pagina textos largos sin perder caracteres y resuelve Libros por identidad de sección', () => {
  const cuerpo = adaptarFicha(crearFichaPrueba(CUERPOS_CELESTES[2]), CUERPOS_CELESTES[2])
  cuerpo.descripcion = 'Texto científico de prueba para una descripción extensa. '.repeat(30)
  cuerpo.libros = Array.from({ length: 8 }, (_, i) => ({ ...cuerpo.libros[0], titulo: `Libro ${i} ` + 'abcdefghijklmnop'.repeat(8) }))
  const paginas = crearPaginasFicha(cuerpo, contexto, { ancho: 320, alto: 440, contenido: { fase: 'disponible' } })
  const resumen = paginas.filter((p) => p.id === 'resumen').flatMap((p) => p.elementos.map((e) => e.texto)).join(' ')
  assert.ok(resumen.includes(cuerpo.descripcion.trim()))
  const libros = paginas.filter((p) => p.id === 'libros')
  const texto = libros.flatMap((p) => p.elementos.map((e) => e.texto)).join('').replace(/\s/g, '')
  for (const libro of cuerpo.libros) assert.ok(texto.includes(libro.titulo.replace(/\s/g, '')))
  assert.equal(libros.flatMap((p) => p.elementos).filter((e) => e.accion?.startsWith('libro:')).length, 8)
  const secciones = obtenerSeccionesFicha(paginas)
  assert.ok(secciones.find((s) => s.id === 'libros').pagina > 3)
  const inicio = secciones.find((s) => s.id === 'libros').pagina
  assert.ok(obtenerZonasNavegacion(320, 440, inicio + 1, paginas.length, secciones).find((z) => z.accion === 'seccion:libros').actual)
})

it('distingue estados remotos de libros vacíos y ofrece reintento también en VR', () => {
  const local = CUERPOS_CELESTES[2]
  for (const fase of ['cargando', 'no-disponible', 'error']) {
    const paginas = crearPaginasFicha(local, contexto, { contenido: { fase } })
    const texto = paginas.flatMap((p) => p.elementos.map((e) => e.texto)).join(' ')
    assert.doesNotMatch(texto, /Aún no hay libros/)
    assert.equal(paginas.some((p) => p.elementos.some((e) => e.accion === 'reintentar')), fase === 'error')
  }
  const cuerpo = adaptarFicha(crearFichaPrueba(local), local)
  cuerpo.libros = []
  const texto = crearPaginasFicha(cuerpo, contexto, { contenido: { fase: 'disponible' } }).filter((p) => p.id === 'libros').flatMap((p) => p.elementos.map((e) => e.texto)).join(' ')
  assert.match(texto, /Aún no hay libros verificados asociados a Tierra/)
  assert.match(texto, /Solón Argüello/)
})
