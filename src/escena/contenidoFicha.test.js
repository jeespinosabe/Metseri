import assert from 'node:assert/strict'
import { it } from 'node:test'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { consumirToqueFicha, crearEstadoLectura, crearPaginasFicha, detectarAccionFicha, dividirLineas, obtenerZonasNavegacion } from './contenidoFicha.js'

const contexto = { font: '', measureText(texto) { return { width: texto.length * parseFloat(this.font) * .55 } } }

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

it('parte palabras largas sin perder caracteres ni duplicar espacios', () => {
  assert.equal(dividirLineas('abcdefghijklmnop', (t) => t.length, 5).join(''), 'abcdefghijklmnop')
  assert.deepEqual(dividirLineas('uno dos tres', (t) => t.length, 7), ['uno dos', 'tres'])
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
