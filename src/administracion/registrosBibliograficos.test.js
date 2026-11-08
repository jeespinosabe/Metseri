import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { REGISTROS_BIBLIOGRAFICOS_EJEMPLO } from '../datos/registrosBibliograficosEjemplo.js'
import {
  alternarCuerpo, calcularMarcoEncuadre, calcularTamanoVistaFotografia, crearBorradorLibro, crearRegistroVistaPrevia,
  filtrarRegistros, formatearAnio, formatearEditorial, PROPORCION_PORTADA, TAMANO_MAXIMO_FOTOGRAFIA, validarArchivoFotografia,
  hayCriteriosActivos, normalizarTexto, obtenerCuerposRelacionados, validarBorradorLibro, validarCampoLibro,
} from './registrosBibliograficos.js'

const REGISTROS = Object.freeze([
  Object.freeze({ id: 'a', titulo: 'Órbitas de la Luna', autoria: 'Autoría Ñandú', editorial: 'Muestra', anio: 2020, urlFicha: 'https://example.org/a', cuerposIds: Object.freeze(['tierra', 'luna']) }),
  Object.freeze({ id: 'b', titulo: 'Manual de Júpiter', autoria: 'Equipo Ejemplo', editorial: null, anio: null, urlFicha: 'https://example.org/b', cuerposIds: Object.freeze(['jupiter', 'europa']) }),
  Object.freeze({ id: 'c', titulo: 'Cuaderno general', autoria: 'Persona de muestra', editorial: '', anio: 1999, urlFicha: 'https://example.org/c', cuerposIds: Object.freeze([]) }),
])
const ids = (registros) => registros.map((registro) => registro.id)

describe('búsqueda y filtro de registros', () => {
  it('normaliza mayúsculas, tildes y espacios exteriores', () => {
    assert.equal(normalizarTexto('  ÓRBITAS de JÚPITER  '), 'orbitas de jupiter')
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: '  orbitas ' })), ['a'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'JUPITER' })), ['b'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'ñandu' })), ['a'])
  })

  it('busca por título o por autoría', () => {
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'cuaderno' })), ['c'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'muestra' })), ['c'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'equipo ejemplo' })), ['b'])
  })

  it('un libro con varias relaciones coincide con cualquiera de sus cuerpos y aparece una sola vez', () => {
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { cuerpoId: 'tierra' })), ['a'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { cuerpoId: 'luna' })), ['a'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { cuerpoId: 'europa' })), ['b'])
  })

  it('combina búsqueda y cuerpo, e informa la ausencia de coincidencias', () => {
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'luna', cuerpoId: 'luna' })), ['a'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'luna', cuerpoId: 'jupiter' })), [])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { busqueda: 'inexistente' })), [])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS, { cuerpoId: 'marte' })), [])
  })

  it('sin criterios devuelve todos los registros y conserva la colección original', () => {
    const copia = structuredClone(REGISTROS)
    const resultado = filtrarRegistros(REGISTROS, { busqueda: '   ', cuerpoId: '' })
    assert.deepEqual(ids(resultado), ['a', 'b', 'c'])
    assert.notEqual(resultado, REGISTROS)
    filtrarRegistros(REGISTROS, { busqueda: 'luna', cuerpoId: 'tierra' })
    assert.deepEqual(REGISTROS, copia)
  })

  it('identifica cuándo hay criterios activos', () => {
    assert.equal(hayCriteriosActivos({ busqueda: '  ', cuerpoId: '' }), false)
    assert.equal(hayCriteriosActivos({ busqueda: 'a', cuerpoId: '' }), true)
    assert.equal(hayCriteriosActivos({ busqueda: '', cuerpoId: 'luna' }), true)
  })

  it('funciona con los ejemplos del panel sin modificarlos', () => {
    const copia = structuredClone(REGISTROS_BIBLIOGRAFICOS_EJEMPLO)
    assert.deepEqual(ids(filtrarRegistros(REGISTROS_BIBLIOGRAFICOS_EJEMPLO, { cuerpoId: 'tierra' })), ['ejemplo-1', 'ejemplo-5'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS_BIBLIOGRAFICOS_EJEMPLO, { busqueda: '  SAGAN ', cuerpoId: 'marte' })), ['ejemplo-4'])
    assert.deepEqual(ids(filtrarRegistros(REGISTROS_BIBLIOGRAFICOS_EJEMPLO, { busqueda: 'odisea', cuerpoId: 'europa' })), ['ejemplo-2'])
    assert.deepEqual(structuredClone(REGISTROS_BIBLIOGRAFICOS_EJEMPLO), copia)
  })
})

describe('presentación de registros', () => {
  it('ordena las relaciones según el catálogo local y omite identificadores desconocidos', () => {
    assert.deepEqual(obtenerCuerposRelacionados(['luna', 'tierra', 'desconocido']).map((cuerpo) => cuerpo.nombre), ['Tierra', 'Luna'])
    assert.deepEqual(obtenerCuerposRelacionados([]), [])
  })

  it('usa textos explícitos para la información ausente', () => {
    assert.equal(formatearEditorial(null), 'Sin editorial')
    assert.equal(formatearEditorial('   '), 'Sin editorial')
    assert.equal(formatearEditorial('Muestra'), 'Muestra')
    assert.equal(formatearAnio(null), 'Año no indicado')
    assert.equal(formatearAnio(undefined), 'Año no indicado')
    assert.equal(formatearAnio(2020), '2020')
  })
})

describe('borradores y relaciones temporales', () => {
  it('el alta empieza vacía y la edición copia valores y relaciones sin compartir referencias', () => {
    assert.deepEqual(crearBorradorLibro(), { titulo: '', autoria: '', editorial: '', anio: '', urlFicha: '', cuerposIds: [], fotografia: null })
    const borrador = crearBorradorLibro(REGISTROS[0])
    assert.deepEqual(borrador, { titulo: 'Órbitas de la Luna', autoria: 'Autoría Ñandú', editorial: 'Muestra', anio: '2020', urlFicha: 'https://example.org/a', cuerposIds: ['tierra', 'luna'], fotografia: null })
    assert.notEqual(borrador.cuerposIds, REGISTROS[0].cuerposIds)
    borrador.cuerposIds.push('marte')
    borrador.titulo = 'Cambio temporal'
    assert.deepEqual(REGISTROS[0].cuerposIds, ['tierra', 'luna'])
    assert.equal(REGISTROS[0].titulo, 'Órbitas de la Luna')
    assert.deepEqual(crearBorradorLibro(REGISTROS[1]), { titulo: 'Manual de Júpiter', autoria: 'Equipo Ejemplo', editorial: '', anio: '', urlFicha: 'https://example.org/b', cuerposIds: ['jupiter', 'europa'], fotografia: null })
  })

  it('selecciona y retira cuerpos sin duplicados ni modificar el arreglo recibido', () => {
    const original = Object.freeze(['tierra'])
    const conLuna = alternarCuerpo(original, 'luna')
    assert.deepEqual(conLuna, ['tierra', 'luna'])
    assert.deepEqual(original, ['tierra'])
    assert.deepEqual(alternarCuerpo(conLuna, 'tierra'), ['luna'])
    assert.deepEqual(alternarCuerpo(alternarCuerpo(conLuna, 'luna'), 'luna'), ['tierra', 'luna'])
    assert.deepEqual(alternarCuerpo(['luna'], 'luna'), [])
  })
})

describe('validación visual de los campos', () => {
  it('título y autoría son obligatorios y rechazan solo espacios', () => {
    for (const campo of ['titulo', 'autoria']) {
      assert.ok(validarCampoLibro(campo, ''))
      assert.ok(validarCampoLibro(campo, '    '))
      assert.equal(validarCampoLibro(campo, ' Válido '), '')
    }
  })

  it('la URL es obligatoria, absoluta y HTTP o HTTPS', () => {
    for (const invalida of ['', '   ', 'example.org/ficha', '/fichas/1', 'ftp://example.org/ficha', 'javascript:alert(1)', 'mailto:persona@example.org', 'https://', 'http//example.org']) {
      assert.ok(validarCampoLibro('urlFicha', invalida), invalida)
    }
    for (const valida of ['https://example.org/ficha', 'http://example.org', '  https://example.org/ficha?id=1  ']) {
      assert.equal(validarCampoLibro('urlFicha', valida), '', valida)
    }
    assert.match(validarCampoLibro('urlFicha', 'example.org'), /http:\/\/ o https:\/\//)
  })

  it('el año es opcional y, si se indica, es un entero de 1 a 9999', () => {
    for (const valido of ['', '   ', '1', '987', '2024', '9999', ' 2020 ']) assert.equal(validarCampoLibro('anio', valido), '', valido)
    for (const invalido of ['0', '-5', '2020.5', '20,5', '10000', '0123', 'dos mil', '1e3', '+20']) assert.ok(validarCampoLibro('anio', invalido), invalido)
  })

  it('editorial es opcional y un borrador completo no presenta errores', () => {
    assert.equal(validarCampoLibro('editorial', ''), '')
    assert.deepEqual(validarBorradorLibro(crearBorradorLibro(REGISTROS[1])), { titulo: '', autoria: '', editorial: '', anio: '', urlFicha: '' })
    const errores = validarBorradorLibro(crearBorradorLibro())
    assert.ok(errores.titulo && errores.autoria && errores.urlFicha)
    assert.equal(errores.editorial, '')
    assert.equal(errores.anio, '')
  })
})

describe('fotografía del libro', () => {
  const CON_FOTOGRAFIA = Object.freeze({ ...REGISTROS[0], fotografia: Object.freeze({ url: '/foto-prueba.webp', encuadre: Object.freeze({ x: 50, y: 53 }) }) })

  it('la edición copia la fotografía y su encuadre sin compartir referencias', () => {
    const borrador = crearBorradorLibro(CON_FOTOGRAFIA)
    assert.deepEqual(borrador.fotografia, { url: '/foto-prueba.webp', encuadre: { x: 50, y: 53 } })
    assert.notEqual(borrador.fotografia, CON_FOTOGRAFIA.fotografia)
    assert.notEqual(borrador.fotografia.encuadre, CON_FOTOGRAFIA.fotografia.encuadre)
    borrador.fotografia.encuadre.y = 0
    assert.equal(CON_FOTOGRAFIA.fotografia.encuadre.y, 53)
    assert.deepEqual(crearBorradorLibro({ ...REGISTROS[0], fotografia: { url: '/foto.webp' } }).fotografia, { url: '/foto.webp', encuadre: { x: 50, y: 50 } })
    const [ejemplo] = REGISTROS_BIBLIOGRAFICOS_EJEMPLO
    assert.deepEqual(crearBorradorLibro(ejemplo).fotografia, { url: ejemplo.fotografia.url, encuadre: { ...ejemplo.fotografia.encuadre } })
    assert.notEqual(crearBorradorLibro(ejemplo).fotografia, ejemplo.fotografia)
    assert.equal(crearBorradorLibro({ ...ejemplo, fotografia: null }).fotografia, null)
  })

  it('acepta JPG, PNG y WebP de hasta 5 MB y explica el rechazo', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      assert.equal(validarArchivoFotografia({ type, size: 1024 }), '')
      assert.equal(validarArchivoFotografia({ type, size: TAMANO_MAXIMO_FOTOGRAFIA }), '')
    }
    assert.equal(TAMANO_MAXIMO_FOTOGRAFIA, 5 * 1024 * 1024)
    for (const type of ['image/gif', 'image/svg+xml', 'application/pdf', '']) {
      assert.match(validarArchivoFotografia({ type, size: 1024 }), /JPG, PNG o WebP de hasta 5 MB/)
    }
    assert.match(validarArchivoFotografia({ type: 'image/png', size: TAMANO_MAXIMO_FOTOGRAFIA + 1 }), /más de 5 MB/)
    assert.ok(validarArchivoFotografia(null))
  })

  it('una foto alta se recorta en vertical y el marco sigue al encuadre', () => {
    const alta = { ancho: 600, alto: 900 }
    const visible = Math.round(((600 / 900) / PROPORCION_PORTADA) * 10000) / 100
    assert.deepEqual(calcularMarcoEncuadre(alta, { x: 50, y: 0 }), { eje: 'y', x: 0, y: 0, ancho: 100, alto: visible })
    assert.equal(calcularMarcoEncuadre(alta, { x: 50, y: 100 }).y, Math.round((100 - visible) * 100) / 100)
    assert.equal(calcularMarcoEncuadre(alta, { x: 50, y: 50 }).y, Math.round(((100 - visible) / 2) * 100) / 100)
  })

  it('una foto ancha se recorta en horizontal y una de igual proporción no se recorta', () => {
    const marco = calcularMarcoEncuadre({ ancho: 3000, alto: 1000 }, { x: 100, y: 50 })
    assert.equal(marco.eje, 'x')
    assert.equal(marco.alto, 100)
    assert.equal(marco.ancho, Math.round((PROPORCION_PORTADA / 3) * 10000) / 100)
    assert.equal(marco.x, Math.round((100 - marco.ancho) * 100) / 100)
    assert.deepEqual(calcularMarcoEncuadre({ ancho: 1100, alto: 500 }), { eje: null, x: 0, y: 0, ancho: 100, alto: 100 })
    assert.equal(calcularMarcoEncuadre({ ancho: 0, alto: 500 }), null)
    assert.equal(calcularMarcoEncuadre(null), null)
  })

  it('calcula el tamaño del visor sin ampliar ni deformar la foto', () => {
    assert.deepEqual(calcularTamanoVistaFotografia({ ancho: 600, alto: 900 }), { ancho: 187, alto: 280 })
    assert.deepEqual(calcularTamanoVistaFotografia({ ancho: 1500, alto: 500 }), { ancho: 340, alto: 113 })
    assert.deepEqual(calcularTamanoVistaFotografia({ ancho: 200, alto: 100 }), { ancho: 200, alto: 100 })
    assert.equal(calcularTamanoVistaFotografia(null), null)
  })

  it('la vista previa convierte el borrador en un registro de presentación sin inventar datos', () => {
    const vacio = crearRegistroVistaPrevia(crearBorradorLibro())
    assert.equal(vacio.titulo, 'Título del libro')
    assert.equal(vacio.autoria, 'Autoría del libro')
    assert.equal(vacio.editorial, null)
    assert.equal(vacio.anio, null)
    assert.equal(vacio.fotografia, null)
    const borrador = { ...crearBorradorLibro(CON_FOTOGRAFIA), anio: ' 1999 ', editorial: '  ' }
    const previa = crearRegistroVistaPrevia(borrador)
    assert.equal(previa.anio, 1999)
    assert.equal(previa.editorial, null)
    assert.equal(previa.fotografia, borrador.fotografia)
    assert.equal(crearRegistroVistaPrevia({ ...borrador, anio: '2020.5' }).anio, null)
  })
})
