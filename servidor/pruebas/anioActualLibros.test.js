import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validarLibro } from '../servicios/gestionLibros.js'

// Pruebas aportadas por el remoto (antes en gestionLibros.test.js), adaptadas a la regla vigente:
// el año de publicación va de 1450 al año actual + 1, y «hoy» se calcula en America/Mazatlan.
test('el año máximo sigue el año actual de America/Mazatlan (año actual + 1) en altas y ediciones', (contexto) => {
  // 2027-01-01 06:59:59 UTC todavía es el 31 de diciembre de 2026 en America/Mazatlan.
  contexto.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2027, 0, 1, 6, 59, 59) })
  const alta = { titulo: 'Libro', autores: ['Autora'], editorial: 'Editorial' }

  assert.deepEqual(validarLibro(alta), alta)
  assert.equal(validarLibro({ anio: null }, true).anio, null)
  assert.equal(validarLibro({ ...alta, anio: 1450 }).anio, 1450)
  assert.equal(validarLibro({ ...alta, anio: 2026 }).anio, 2026)
  assert.equal(validarLibro({ ...alta, anio: 2027 }).anio, 2027)
  assert.throws(() => validarLibro({ ...alta, anio: 2028 }), { estado: 400, codigo: 'LIBRO_INVALIDO' })
  for (const anio of [1449, 1000, 999, 2026.5, '2026', 2028]) {
    assert.throws(() => validarLibro({ anio }, true), { estado: 400, codigo: 'LIBRO_INVALIDO' })
  }

  // Un segundo después ya es el 1 de enero de 2027 en America/Mazatlan: el máximo pasa a 2028.
  contexto.mock.timers.tick(1000)
  assert.equal(validarLibro({ anio: 2028 }, true).anio, 2028)
  assert.throws(() => validarLibro({ anio: 2029 }, true), { estado: 400, codigo: 'LIBRO_INVALIDO' })
})
