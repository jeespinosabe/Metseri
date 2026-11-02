import assert from 'node:assert/strict'
import { it } from 'node:test'
import { existsSync, statSync } from 'node:fs'
import { CUERPOS_CELESTES, obtenerCuerpoCeleste, obtenerDatosPrincipales } from './cuerposCelestes.js'
import { abrirFichaBibliografica, obtenerLibrosCuerpo } from './librosCuerposCelestes.js'

it('los doce registros locales conservan identidad e imagen sin duplicar el contenido editorial remoto', () => {
  assert.equal(CUERPOS_CELESTES.length, 12)
  assert.equal(new Set(CUERPOS_CELESTES.map((c) => c.id)).size, 12)
  assert.equal(CUERPOS_CELESTES.filter((c) => c.tipo === 'planeta').length, 8)
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

it('relaciona las cuatro lunas con sus planetas y presenta datos propios sin inventar valores', () => {
  const parejas = { luna: 'tierra', europa: 'jupiter', titan: 'saturno', triton: 'neptuno' }
  assert.deepEqual(CUERPOS_CELESTES.filter((c) => c.tipo === 'satelite').map((c) => c.id), Object.keys(parejas))
  for (const [id, planetaId] of Object.entries(parejas)) {
    const cuerpo = obtenerCuerpoCeleste(id)
    const planeta = obtenerCuerpoCeleste(planetaId)
    assert.equal(cuerpo.planetaId, planeta.id)
    assert.equal(cuerpo.planetaPrincipal, planeta.nombre)
    assert.ok(cuerpo.clasificacion.includes(planeta.nombre))
    assert.equal(cuerpo.distanciaPlanetaKm, null)
    assert.equal(cuerpo.distanciaSolMillonesKm, undefined)
    const datos = obtenerDatosPrincipales(cuerpo)
    assert.deepEqual(datos.map((dato) => dato.etiqueta), ['Diámetro', 'Distancia al planeta', 'Período de rotación', 'Período orbital'])
    assert.deepEqual(datos.map((dato) => dato.unidad), ['km', 'km', 'horas', 'días terrestres'])
    assert.ok(datos.every((dato) => dato.valor === ''))
  }
})

it('formatea rotación retrógrada y admite valores de un satélite', () => {
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
  const salida = []
  assert.equal(abrirFichaBibliografica(valido, { abrir: () => { throw new Error('Bloqueado') }, salirVr: () => salida.push('salir') }), false)
  assert.deepEqual(salida, ['salir'])
  assert.equal(abrirFichaBibliografica(asociaciones.tierra[3], { abrir: () => assert.fail('URL descartada') }), false)
})

it('los periodos publicados mantienen unidades, ausencia y cero sin llamar día solar a la rotación', () => {
  const datos = obtenerDatosPrincipales({ tipo: 'planeta', diametroKm: 0, rotacionHoras: -5832.5, orbitaDias: 4331 })
  assert.equal(datos[0].valor, '0')
  assert.equal(datos[1].valor, '')
  assert.equal(datos[2].etiqueta, 'Período de rotación')
  assert.equal(datos[2].valor, '243.02')
  assert.equal(datos[2].retrograda, true)
  assert.equal(datos[3].etiqueta, 'Período orbital')
  assert.equal(datos[3].valor, '11.86')
  assert.equal(datos[3].unidad, 'años terrestres')
})
