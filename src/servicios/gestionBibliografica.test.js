import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { guardarLibroAdministrativo } from './gestionBibliografica.js'

const fetchOriginal = globalThis.fetch
afterEach(() => { globalThis.fetch = fetchOriginal })

const responder = (estado, cuerpo) => { globalThis.fetch = async () => Response.json(cuerpo, { status: estado }) }

describe('errores de la API de libros (G3, VL-35 a VL-37)', () => {
  it('conserva el mensaje y adjunta `campos` cuando la API los devuelve', async () => {
    const campos = { editorial: 'Escribe la editorial del libro.', anio: 'Escribe un año entre 1450 y 2027.' }
    responder(400, { error: { codigo: 'LIBRO_INVALIDO', mensaje: 'Escribe la editorial del libro. Escribe un año entre 1450 y 2027.', campos } })
    await assert.rejects(guardarLibroAdministrativo({ titulo: 'x' }), (error) => {
      assert.equal(error.message, 'Escribe la editorial del libro. Escribe un año entre 1450 y 2027.')
      assert.deepEqual(error.campos, campos)
      return true
    })
  })

  it('un error sin `campos` solo trae el mensaje (se mostrará en el aviso general)', async () => {
    responder(503, { error: { codigo: 'BIBLIOGRAFIA_NO_DISPONIBLE', mensaje: 'No se pudo acceder a los libros. Inténtalo más tarde.' } })
    await assert.rejects(guardarLibroAdministrativo({ titulo: 'x' }), (error) => {
      assert.equal(error.message, 'No se pudo acceder a los libros. Inténtalo más tarde.')
      assert.equal('campos' in error, false)
      return true
    })
  })

  it('ignora un `campos` que no es un objeto', async () => {
    responder(400, { error: { codigo: 'LIBRO_INVALIDO', mensaje: 'Revisa los campos.', campos: ['x'] } })
    await assert.rejects(guardarLibroAdministrativo({ titulo: 'x' }), (error) => !('campos' in error))
  })
})
