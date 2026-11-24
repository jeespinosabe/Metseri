import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { crearAplicacion } from '../../api/index.js'
import { crearGestionLibros, ErrorLibros, validarLibro } from '../servicios/gestionLibros.js'

// El año se fija para no depender del reloj: el máximo es 2027.
const ANIO = 2026
const valido = (cambios = {}) => ({ titulo: 'Cosmos', autores: ['Carl Sagan'], editorial: 'Planeta', anio: 2020, ...cambios })
const validar = (datos, parcial = false) => validarLibro(datos, parcial, { anioActual: ANIO })
const rechazo = (datos, parcial = false) => {
  try { validar(datos, parcial) } catch (error) { return error }
  assert.fail('Se esperaba un rechazo')
}

describe('validarLibro: libro válido y normalización (VL-38, VL-47)', () => {
  it('acepta un libro correcto y lo devuelve normalizado', () => {
    assert.deepEqual(validar(valido({ titulo: '  Cosmos    infinito ', editorial: ' Fondo   de  Cultura ', autores: [' Ana ', 'Beto'] })), {
      titulo: 'Cosmos infinito', editorial: 'Fondo de Cultura', autores: ['Ana', 'Beto'], anio: 2020,
    })
  })

  it('el año es opcional', () => {
    assert.equal(validar(valido({ anio: null })).anio, null)
    const sinAnio = valido()
    delete sinAnio.anio
    assert.equal('anio' in validar(sinAnio), false)
  })

  it('conserva los demás campos permitidos', () => {
    const libro = validar(valido({ activo: false, cuerpos: [{ slug: 'tierra', orden: 2 }], url_ficha: 'https://example.org/libro' }))
    assert.equal(libro.activo, false)
    assert.deepEqual(libro.cuerpos, [{ slug: 'tierra', orden: 2 }])
    assert.equal(libro.url_ficha, 'https://example.org/libro')
  })
})

describe('validarLibro: rechazos por campo con error.campos (G3, VL-39 a VL-45)', () => {
  it('POST sin editorial', () => {
    const sinEditorial = valido()
    delete sinEditorial.editorial
    const error = rechazo(sinEditorial)
    assert.equal(error.estado, 400)
    assert.equal(error.codigo, 'LIBRO_INVALIDO')
    assert.equal(error.message, 'Escribe la editorial del libro.')
    assert.deepEqual(error.campos, { editorial: 'Escribe la editorial del libro.' })
  })

  it('POST con editorial nula, vacía o de espacios', () => {
    for (const editorial of [null, '', '   ', 5]) assert.equal(rechazo(valido({ editorial })).campos.editorial, 'Escribe la editorial del libro.')
  })

  it('varios errores: un mensaje por campo y el mensaje general los reúne', () => {
    const error = rechazo(valido({ titulo: 'a'.repeat(250), editorial: '', anio: 1200 }))
    assert.deepEqual(Object.keys(error.campos), ['titulo', 'editorial', 'anio'])
    assert.equal(error.campos.titulo, 'El título admite hasta 200 caracteres.')
    assert.equal(error.campos.editorial, 'Escribe la editorial del libro.')
    assert.equal(error.campos.anio, 'Escribe un año entre 1450 y 2027.')
    assert.equal(error.message, Object.values(error.campos).join(' '))
  })

  it('autoría inválida indica la línea (índice dentro de la lista)', () => {
    assert.equal(rechazo(valido({ autores: ['#Ana'] })).campos.autores, 'El nombre de autor de la línea 1 debe empezar con una letra, no con «#».')
    assert.equal(rechazo(valido({ autores: ['Ana', '3Beto'] })).campos.autores, 'El nombre de autor de la línea 2 debe empezar con una letra, no con «3».')
    assert.equal(rechazo(valido({ autores: ['A'] })).campos.autores, 'El nombre de autor de la línea 1 debe tener al menos 2 caracteres.')
    assert.equal(rechazo(valido({ autores: ['A'.repeat(101)] })).campos.autores, 'El nombre de autor de la línea 1 admite hasta 100 caracteres.')
    assert.equal(rechazo(valido({ autores: ['Ana', 'ana'] })).campos.autores, 'Escribe cada nombre una sola vez.')
    assert.equal(rechazo(valido({ autores: [] })).campos.autores, 'Escribe el autor del libro.')
    assert.equal(rechazo(valido({ autores: 'Ana' })).campos.autores, 'Escribe el autor del libro.')
    assert.ok(rechazo(valido({ autores: Array.from({ length: 51 }, (_, i) => `Autor${'x'.repeat(i + 1)}`) })).campos.autores.includes('50'))
  })

  it('POST sin título ni autores', () => {
    const error = rechazo({ editorial: 'Planeta' })
    assert.deepEqual(error.campos, { titulo: 'Escribe el título del libro.', autores: 'Escribe el autor del libro.' })
  })

  it('texto limpio (G1): controles y texto sin letra ni dígito', () => {
    assert.equal(rechazo(valido({ titulo: 'Cosmos\ninfinito' })).campos.titulo, 'El título no admite saltos de línea ni caracteres de control.')
    assert.equal(rechazo(valido({ editorial: 'Fondo\tde' })).campos.editorial, 'La editorial no admite saltos de línea ni caracteres de control.')
    assert.equal(rechazo(valido({ titulo: '!!!' })).campos.titulo, 'El título debe contener al menos una letra o un número.')
    assert.equal(rechazo(valido({ editorial: '....' })).campos.editorial, 'La editorial debe contener al menos una letra o un número.')
  })

  it('año: rango con el máximo vigente y formato', () => {
    assert.equal(validar(valido({ anio: 1450 })).anio, 1450)
    assert.equal(validar(valido({ anio: 2027 })).anio, 2027)
    for (const anio of [1449, 1000, 2028, 2100]) assert.equal(rechazo(valido({ anio })).campos.anio, 'Escribe un año entre 1450 y 2027.', String(anio))
    for (const anio of [20, 999, 2020.5, '2020', 'dos mil', 12345]) assert.equal(rechazo(valido({ anio })).campos.anio, 'Escribe el año con cuatro cifras, por ejemplo 2020.', String(anio))
  })

  it('rechazos sin campo no incluyen `campos` (VL-45)', () => {
    for (const datos of [valido({ desconocido: 1 }), valido({ activo: 'si' }), valido({ url_ficha: 'ftp://x' }), valido({ cuerpos: 'tierra' }), {}, null, []]) {
      const error = rechazo(datos)
      assert.equal(error.codigo, 'LIBRO_INVALIDO')
      assert.equal('campos' in error, false)
    }
    assert.equal(rechazo(valido({ portada: 'x' })).codigo, 'PORTADA_INVALIDA')
  })
})

describe('validarLibro: edición parcial (VL-42 a VL-44)', () => {
  it('PATCH que borra la editorial', () => {
    for (const editorial of [null, '', '   ']) assert.equal(rechazo({ editorial }, true).campos.editorial, 'Escribe la editorial del libro.')
  })

  it('PATCH de un campo no exige los demás', () => {
    assert.deepEqual(validar({ activo: false }, true), { activo: false })
    assert.deepEqual(validar({ titulo: ' Otro   título ' }, true), { titulo: 'Otro título' })
    assert.deepEqual(validar({ anio: 2027 }, true), { anio: 2027 })
    assert.deepEqual(validar({ anio: null }, true), { anio: null })
  })

  it('PATCH con año máx. + 2 se rechaza', () => {
    assert.equal(rechazo({ anio: 2028 }, true).campos.anio, 'Escribe un año entre 1450 y 2027.')
  })

  it('PATCH de autores aplica las reglas de autoría', () => {
    assert.deepEqual(validar({ autores: ['Ana'] }, true), { autores: ['Ana'] })
    assert.ok(rechazo({ autores: ['#Ana'] }, true).campos.autores)
  })
})

describe('API de libros por HTTP (VL-38 a VL-48)', () => {
  const entorno = { SUPABASE_URL: 'https://proyecto.example.invalid', SUPABASE_SECRET_KEY: 'sb_secret_prueba' }
  const autenticacion = { exigirAdministrador: (_peticion, _respuesta, siguiente) => siguiente() }
  const ID = '0b9c1f4a-6c1d-4f43-9d7c-6f0e4d2a1b11'

  async function conAplicacion(respuestaRpc, ejecutar) {
    const llamadas = []
    const solicitar = async (url, opciones) => {
      llamadas.push({ funcion: url.pathname.split('/').pop(), cuerpo: JSON.parse(opciones.body) })
      return respuestaRpc()
    }
    const servidor = crearAplicacion({ autenticacion, gestionLibros: crearGestionLibros({ entorno, solicitar }) }).listen(0)
    await new Promise((resolver) => servidor.once('listening', resolver))
    try { await ejecutar(`http://127.0.0.1:${servidor.address().port}/api/admin/libros`, llamadas) } finally {
      await new Promise((resolver, rechazar) => servidor.close((error) => error ? rechazar(error) : resolver()))
    }
  }
  const enviar = (url, metodo, cuerpo) => fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })

  it('POST válido responde 201 con Location y envía el texto normalizado a la base', async () => {
    await conAplicacion(() => Response.json({ id: ID }), async (url, llamadas) => {
      const respuesta = await enviar(url, 'POST', valido({ titulo: 'Cosmos    infinito', editorial: ' Fondo   de Cultura ' }))
      assert.equal(respuesta.status, 201)
      assert.equal(respuesta.headers.get('location'), `/api/admin/libros/${ID}`)
      assert.equal(llamadas.length, 1)
      assert.equal(llamadas[0].cuerpo.p_datos.titulo, 'Cosmos infinito')
      assert.equal(llamadas[0].cuerpo.p_datos.editorial, 'Fondo de Cultura')
    })
  })

  it('POST inválido responde 400 con codigo, mensaje y campos, sin llamar a la base', async () => {
    await conAplicacion(() => assert.fail('No debe llamar a la base'), async (url, llamadas) => {
      const respuesta = await enviar(url, 'POST', valido({ titulo: 'a'.repeat(250), editorial: '', anio: 1200 }))
      assert.equal(respuesta.status, 400)
      const { error } = await respuesta.json()
      assert.equal(error.codigo, 'LIBRO_INVALIDO')
      assert.deepEqual(Object.keys(error.campos), ['titulo', 'editorial', 'anio'])
      assert.equal(error.mensaje, Object.values(error.campos).join(' '))
      assert.equal(llamadas.length, 0)
    })
  })

  it('un cliente que solo lee codigo y mensaje sigue funcionando (VL-46)', async () => {
    await conAplicacion(() => assert.fail('No debe llamar a la base'), async (url) => {
      const { error } = await (await enviar(url, 'POST', valido({ editorial: null }))).json()
      const { codigo, mensaje } = error
      assert.deepEqual([codigo, mensaje], ['LIBRO_INVALIDO', 'Escribe la editorial del libro.'])
    })
  })

  it('un rechazo sin campo responde 400 sin `campos`', async () => {
    await conAplicacion(() => assert.fail('No debe llamar a la base'), async (url) => {
      const { error } = await (await enviar(url, 'POST', valido({ desconocido: true }))).json()
      assert.equal(error.codigo, 'LIBRO_INVALIDO')
      assert.equal('campos' in error, false)
    })
  })

  it('PATCH que borra la editorial responde 400; PATCH de un campo válido, 200', async () => {
    await conAplicacion(() => Response.json({ id: ID }), async (url, llamadas) => {
      const malo = await enviar(`${url}/${ID}`, 'PATCH', { editorial: null })
      assert.equal(malo.status, 400)
      assert.equal((await malo.json()).error.campos.editorial, 'Escribe la editorial del libro.')
      assert.equal(llamadas.length, 0)
      const bueno = await enviar(`${url}/${ID}`, 'PATCH', { activo: false })
      assert.equal(bueno.status, 200)
      assert.deepEqual(llamadas[0].cuerpo.p_datos, { activo: false })
    })
  })

  it('un duplicado tras normalizar responde 409 LIBRO_DUPLICADO (VL-47 y VL-48)', async () => {
    await conAplicacion(() => Response.json({ code: '23505' }, { status: 409 }), async (url, llamadas) => {
      for (const titulo of ['Cosmos infinito', 'Cosmos    infinito']) {
        const respuesta = await enviar(url, 'POST', valido({ titulo }))
        assert.equal(respuesta.status, 409)
        assert.equal((await respuesta.json()).error.codigo, 'LIBRO_DUPLICADO')
      }
      assert.equal(llamadas[0].cuerpo.p_datos.titulo, llamadas[1].cuerpo.p_datos.titulo)
    })
  })

  it('ErrorLibros solo expone campos cuando los hay', () => {
    assert.equal('campos' in new ErrorLibros(400, 'X', 'm', {}), false)
    assert.deepEqual(new ErrorLibros(400, 'X', 'm', { titulo: 't' }).campos, { titulo: 't' })
  })
})
