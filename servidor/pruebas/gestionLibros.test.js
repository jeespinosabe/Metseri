import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validarLibro } from '../servicios/gestionLibros.js'

test('el año de publicación se limita al año actual en altas y ediciones', (contexto) => {
  contexto.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2027, 0, 1, 6, 59, 59) })
  const alta = { titulo: 'Libro', autores: ['Autora'] }

  assert.deepEqual(validarLibro(alta), alta)
  assert.equal(validarLibro({ anio: null }, true).anio, null)
  assert.equal(validarLibro({ ...alta, anio: 1000 }).anio, 1000)
  assert.equal(validarLibro({ ...alta, anio: 2026 }).anio, 2026)
  assert.throws(() => validarLibro({ ...alta, anio: 2027 }), { estado: 400, codigo: 'LIBRO_INVALIDO' })
  for (const anio of [999, 2026.5, '2026', 2027]) {
    assert.throws(() => validarLibro({ anio }, true), { estado: 400, codigo: 'LIBRO_INVALIDO' })
  }

  contexto.mock.timers.tick(1000)
  assert.equal(validarLibro({ anio: 2027 }, true).anio, 2027)
  assert.throws(() => validarLibro({ anio: 2028 }, true), { estado: 400, codigo: 'LIBRO_INVALIDO' })
})
