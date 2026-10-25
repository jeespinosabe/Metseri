import assert from 'node:assert/strict'
import { it } from 'node:test'
import { existsSync, statSync } from 'node:fs'
import { CUERPOS_CELESTES, obtenerDatosPrincipales } from './cuerposCelestes.js'
import { abrirFichaBibliografica, obtenerLibrosCuerpo } from './librosCuerposCelestes.js'

it('los ocho cuerpos conservan su identidad e imagen y dejan vacío el contenido editorial', () => {
  assert.equal(CUERPOS_CELESTES.length, 8)
  assert.equal(new Set(CUERPOS_CELESTES.map((c) => c.id)).size, 8)
  for (const cuerpo of CUERPOS_CELESTES) {
    assert.equal(cuerpo.descripcion, '')
    assert.equal(cuerpo.subtitulo, '')
    assert.deepEqual(cuerpo.curiosidades, [])
    assert.ok(cuerpo.credito && cuerpo.imagenOriginal && cuerpo.imagenAlternativa)
    const ruta = new URL(`../../public${cuerpo.imagen}`, import.meta.url)
    assert.ok(existsSync(ruta))
    assert.ok(statSync(ruta).size < 100000)
    assert.equal(obtenerDatosPrincipales(cuerpo).length, 4)
    assert.ok(obtenerDatosPrincipales(cuerpo).every((dato) => dato.valor === '' && dato.unidad))
    assert.deepEqual(obtenerLibrosCuerpo(cuerpo.id), [])
  }
})

it('formatea rotación retrógrada y admite datos de un satélite sin añadirlo al catálogo', () => {
  const retrograda = obtenerDatosPrincipales({ tipo: 'planeta', rotacionHoras: -72 })
  assert.equal(retrograda[2].valor, '3')
  assert.equal(retrograda[2].unidad, 'días terrestres')
  assert.equal(retrograda[2].retrograda, true)
  const datos = obtenerDatosPrincipales({ tipo: 'satelite', planetaPrincipal: 'Planeta de prueba', diametroKm: 100, distanciaPlanetaKm: 5000, rotacionHoras: 72, orbitaDias: 3 })
  assert.equal(datos[1].etiqueta, 'Distancia al planeta')
  assert.equal(datos[1].valor, '5,000')
  assert.equal(datos[1].unidad, 'km')
  assert.equal(datos[3].valor, '3')
  assert.equal(datos[3].unidad, 'días terrestres')
  assert.equal(CUERPOS_CELESTES.filter((c) => c.tipo !== 'planeta').length, 0)
})

it('ofrece únicamente asociaciones utilizables y abre antes de salir de VR', () => {
  const valido = { titulo: 'Ficha sintética de prueba', url: 'https://example.org/ficha' }
  const asociaciones = { tierra: [valido, { titulo: 'Sin URL' }, { titulo: '', url: valido.url }, { titulo: 'Inseguro', url: 'javascript:alert(1)' }] }
  assert.deepEqual(obtenerLibrosCuerpo('tierra', asociaciones), [valido])
  const acciones = []
  const pestana = { opener: 'anterior' }
  assert.equal(abrirFichaBibliografica(valido, { abrir: (url) => { acciones.push(url); return pestana }, salirVr: () => acciones.push('salir') }), true)
  assert.deepEqual(acciones, [valido.url, 'salir'])
  assert.equal(pestana.opener, null)
  assert.equal(abrirFichaBibliografica(valido, { abrir: () => null }), false)
  assert.equal(abrirFichaBibliografica(asociaciones.tierra[3], { abrir: () => assert.fail('URL descartada') }), false)
})
