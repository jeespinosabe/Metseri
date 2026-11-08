import assert from 'node:assert/strict'
import { it } from 'node:test'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CUERPOS_CELESTES } from './cuerposCelestes.js'
import { LIBROS_POR_CUERPO } from './librosCuerposCelestes.js'
import { REGISTROS_BIBLIOGRAFICOS_EJEMPLO } from './registrosBibliograficosEjemplo.js'

const raizSrc = fileURLToPath(new URL('..', import.meta.url))

function listarArchivos(carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre)
    return statSync(ruta).isDirectory() ? listarArchivos(ruta) : [ruta]
  })
}

it('los ejemplos son libros reales en español con datos completos, marcadores de ejemplo e inmutables', () => {
  assert.ok(REGISTROS_BIBLIOGRAFICOS_EJEMPLO.length >= 4)
  assert.equal(new Set(REGISTROS_BIBLIOGRAFICOS_EJEMPLO.map((registro) => registro.id)).size, REGISTROS_BIBLIOGRAFICOS_EJEMPLO.length)
  assert.ok(Object.isFrozen(REGISTROS_BIBLIOGRAFICOS_EJEMPLO))
  for (const registro of REGISTROS_BIBLIOGRAFICOS_EJEMPLO) {
    assert.deepEqual(Object.keys(registro), ['id', 'titulo', 'autoria', 'editorial', 'anio', 'urlFicha', 'cuerposIds', 'fotografia'])
    assert.match(registro.id, /^ejemplo-\d+$/)
    assert.doesNotMatch(registro.titulo, /ejemplo|muestra/i)
    assert.doesNotMatch(registro.autoria, /ejemplo|muestra/i)
    assert.doesNotMatch(registro.titulo, /^(The|A|An) /, `${registro.id}: el título debe ser el de la edición en español`)
    assert.ok(typeof registro.editorial === 'string' && registro.editorial.trim() && !/muestra/i.test(registro.editorial), registro.id)
    assert.ok(Number.isInteger(registro.anio) && registro.anio > 1900 && registro.anio <= 2026, registro.id)
    assert.equal(new URL(registro.urlFicha).hostname, 'example.org')
    assert.ok(Object.isFrozen(registro) && Object.isFrozen(registro.cuerposIds))
  }
})

it('las portadas de los ejemplos se enlazan desde Open Library y el panel no conserva imágenes de ejemplo ni portada orbital', () => {
  const urls = REGISTROS_BIBLIOGRAFICOS_EJEMPLO.map((registro) => registro.fotografia?.url)
  assert.equal(new Set(urls).size, REGISTROS_BIBLIOGRAFICOS_EJEMPLO.length)
  for (const { id, fotografia } of REGISTROS_BIBLIOGRAFICOS_EJEMPLO) {
    assert.match(fotografia.url, /^https:\/\/covers\.openlibrary\.org\/b\/isbn\/97[89]\d{10}-L\.jpg$/, id)
    assert.ok(Object.isFrozen(fotografia) && Object.isFrozen(fotografia.encuadre), id)
    for (const eje of ['x', 'y']) assert.ok(fotografia.encuadre[eje] >= 0 && fotografia.encuadre[eje] <= 100, id)
  }
  assert.equal(existsSync(new URL('../../public/imagenes/librosEjemplo', import.meta.url)), false)
  const referencias = listarArchivos(raizSrc)
    .filter((ruta) => /\.(js|jsx|css)$/.test(ruta) && !/\.test\.js$/.test(ruta))
    .filter((ruta) => /librosEjemplo|panel-admin__orbita|panel-admin__planeta|panel-admin__cantidad-cuerpos|obtenerTonoPortada/.test(readFileSync(ruta, 'utf8')))
  assert.deepEqual(referencias, [])
})

it('cubren la relación Tierra-Luna, uno y varios cuerpos y un libro sin asociar', () => {
  const registros = REGISTROS_BIBLIOGRAFICOS_EJEMPLO
  assert.ok(registros.some((registro) => registro.cuerposIds.includes('tierra') && registro.cuerposIds.includes('luna')))
  assert.ok(registros.some((registro) => registro.cuerposIds.length === 1))
  assert.ok(registros.some((registro) => registro.cuerposIds.length > 2))
  assert.ok(registros.some((registro) => registro.cuerposIds.length === 0))
})

it('todos sus cuerpos existen en el catálogo local y no se repiten dentro de un libro', () => {
  const identificadores = new Set(CUERPOS_CELESTES.map((cuerpo) => cuerpo.id))
  for (const registro of REGISTROS_BIBLIOGRAFICOS_EJEMPLO) {
    assert.equal(new Set(registro.cuerposIds).size, registro.cuerposIds.length)
    registro.cuerposIds.forEach((id) => assert.ok(identificadores.has(id), `${registro.id}: ${id}`))
  }
})

it('solo el módulo administrativo importa los ejemplos; la escena y sus fichas no los conocen', () => {
  const importadores = listarArchivos(raizSrc)
    .filter((ruta) => /\.(js|jsx)$/.test(ruta) && !/\.test\.js$/.test(ruta))
    .filter((ruta) => readFileSync(ruta, 'utf8').includes('registrosBibliograficosEjemplo'))
    .map((ruta) => relative(raizSrc, ruta).replaceAll('\\', '/'))
  assert.deepEqual(importadores, ['componentes/moduloAdministrativo.jsx'])
  const librosPublicos = Object.values(LIBROS_POR_CUERPO).flat()
  for (const registro of REGISTROS_BIBLIOGRAFICOS_EJEMPLO) {
    assert.equal(librosPublicos.some((libro) => libro?.titulo === registro.titulo || libro?.url === registro.urlFicha), false)
  }
})
