import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  alternarCuerpo, calcularMarcoEncuadre, calcularTamanoVistaFotografia, crearBorradorLibro, crearRegistroVistaPrevia,
  etiquetaPestanaRegistros, filtrarRegistros, formatearAnio, formatearEditorial, PROPORCION_PORTADA, TAMANO_MAXIMO_FOTOGRAFIA, validarArchivoFotografia,
  hayCriteriosActivos, leerErroresServidor, normalizarTexto, obtenerCuerposRelacionados, validarBorradorLibro, validarCampoLibro,
  prepararDatosLibro, presentarLibroAdministrativo, validarOrdenLibro,
} from './registrosBibliograficos.js'

const REGISTROS = Object.freeze([
  Object.freeze({ id: 'a', titulo: 'Órbitas de la Luna', autoria: 'Autoría Ñandú', editorial: 'Muestra', anio: 2020, cuerposIds: Object.freeze(['tierra', 'luna']) }),
  Object.freeze({ id: 'b', titulo: 'Manual de Júpiter', autoria: 'Equipo Ejemplo', editorial: null, anio: null, cuerposIds: Object.freeze(['jupiter', 'europa']) }),
  Object.freeze({ id: 'c', titulo: 'Cuaderno general', autoria: 'Persona de muestra', editorial: '', anio: 1999, cuerposIds: Object.freeze([]) }),
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

  it('la pestaña de registros se llama Editar solo mientras se edita un libro', () => {
    assert.equal(etiquetaPestanaRegistros('edicion'), 'Editar')
    assert.equal(etiquetaPestanaRegistros('listado'), 'Registros bibliográficos')
    assert.equal(etiquetaPestanaRegistros('alta'), 'Registros bibliográficos')
  })
})

describe('borradores y relaciones temporales', () => {
  it('el alta empieza vacía y la edición copia valores y relaciones sin compartir referencias', () => {
    const valoresIniciales = { ordenPorCuerpo: {}, activo: true, fotografia: null }
    assert.deepEqual(crearBorradorLibro(), { ...valoresIniciales, titulo: '', autoria: '', editorial: '', anio: '', cuerposIds: [] })
    const borrador = crearBorradorLibro(REGISTROS[0])
    assert.deepEqual(borrador, { ...valoresIniciales, titulo: 'Órbitas de la Luna', autoria: 'Autoría Ñandú', editorial: 'Muestra', anio: '2020', cuerposIds: ['tierra', 'luna'] })
    assert.notEqual(borrador.cuerposIds, REGISTROS[0].cuerposIds)
    borrador.cuerposIds.push('marte')
    borrador.titulo = 'Cambio temporal'
    assert.deepEqual(REGISTROS[0].cuerposIds, ['tierra', 'luna'])
    assert.equal(REGISTROS[0].titulo, 'Órbitas de la Luna')
    assert.deepEqual(crearBorradorLibro(REGISTROS[1]), { ...valoresIniciales, titulo: 'Manual de Júpiter', autoria: 'Equipo Ejemplo', editorial: '', anio: '', cuerposIds: ['jupiter', 'europa'] })
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

  it('el año es opcional y admite enteros de cuatro cifras de 1450 al año actual + 1', () => {
    for (const valido of ['', '   ', '1450', '2024', '2027', ' 2020 ']) assert.equal(validarCampoLibro('anio', valido, 2026), '', valido)
    for (const invalido of ['0', '-5', '999', '1449', '1000', '2028', '2100', '2020.5', '20,5', '10000', '0123', 'dos mil', '1e3', '+20']) assert.ok(validarCampoLibro('anio', invalido, 2026), invalido)
    assert.equal(validarCampoLibro('anio', '2028', 2027), '')
  })

  it('la editorial es obligatoria y rechaza solo espacios', () => {
    for (const vacia of ['', '   ']) assert.equal(validarCampoLibro('editorial', vacia), 'Escribe la editorial del libro.')
    assert.equal(validarCampoLibro('editorial', 'Fondo de Cultura Económica'), '')
  })

  it('un borrador completo no presenta errores y uno sin editorial la señala', () => {
    const completo = { ...crearBorradorLibro(REGISTROS[0]), anio: '2020' }
    assert.deepEqual(validarBorradorLibro(completo, 2026), { titulo: '', autoria: '', editorial: '', anio: '' })
    const errores = validarBorradorLibro(crearBorradorLibro(), 2026)
    assert.ok(errores.titulo && errores.autoria && errores.editorial)
    assert.equal(errores.anio, '')
    assert.equal(validarBorradorLibro(crearBorradorLibro(REGISTROS[1]), 2026).editorial, 'Escribe la editorial del libro.')
  })

  it('aplica las reglas compartidas de longitud, autoría y texto limpio', () => {
    assert.ok(validarCampoLibro('titulo', 'a'.repeat(201)))
    assert.ok(validarCampoLibro('titulo', '!!!'))
    assert.ok(validarCampoLibro('autoria', '#Ana'))
    assert.ok(validarCampoLibro('autoria', '3 Ana'))
    assert.ok(validarCampoLibro('autoria', 'A'))
    assert.equal(validarCampoLibro('autoria', 'Álvaro Mutis'), '')
  })
})

describe('mensajes por campo del servidor (VL-35 a VL-37)', () => {
  it('traduce las claves de la API a los campos del formulario', () => {
    const error = Object.assign(new Error('x'), { campos: { titulo: 'T', autores: 'A', editorial: 'E', anio: 'Y' } })
    assert.deepEqual(leerErroresServidor(error), { titulo: 'T', autoria: 'A', editorial: 'E', anio: 'Y' })
  })

  it('ignora errores sin campos, campos desconocidos y valores que no son texto', () => {
    assert.deepEqual(leerErroresServidor(new Error('503')), {})
    assert.deepEqual(leerErroresServidor(null), {})
    assert.deepEqual(leerErroresServidor({ campos: ['x'] }), {})
    assert.deepEqual(leerErroresServidor({ campos: { cuerpos: 'x', editorial: 7, anio: '', titulo: 'T' } }), { titulo: 'T' })
  })
})

describe('datos bibliográficos para la API', () => {
  const registro = presentarLibroAdministrativo({
    id: 'a', titulo: 'Atlas lunar', editorial: 'Editorial', anio: 2022, url_ficha: 'https://example.org/a',
    activo: true, verificado: true, autores: [{ nombre: 'López, Ana' }, { nombre: 'María Sol' }],
    cuerpos: [{ slug: 'tierra', orden: 2 }, { slug: 'luna', orden: 8 }],
  })

  it('conserva la autoría ordenada y envía solo los campos cambiados en una edición', () => {
    const borrador = crearBorradorLibro(registro)
    assert.equal(borrador.autoria, 'López, Ana\nMaría Sol')
    assert.deepEqual(prepararDatosLibro(borrador, registro), {})
    assert.deepEqual(prepararDatosLibro({ ...borrador, activo: false }, registro), { activo: false })
    assert.deepEqual(prepararDatosLibro({ ...borrador, titulo: 'Otro atlas' }, registro), { titulo: 'Otro atlas' })
    assert.deepEqual(prepararDatosLibro({ ...borrador, cuerposIds: ['luna', 'marte'] }, registro), {
      cuerpos: [{ slug: 'luna', orden: 8 }, { slug: 'marte', orden: 1 }],
    })
  })

  it('permite el alta de un libro activo sin enlace ni verificación', () => {
    const borrador = { ...crearBorradorLibro(), titulo: '  Atlas   lunar ', autoria: ' Ana \n\n Beto ', editorial: ' Fondo   de Cultura ', cuerposIds: ['luna'] }
    assert.deepEqual(prepararDatosLibro(borrador), {
      titulo: 'Atlas lunar', autores: ['Ana', 'Beto'], editorial: 'Fondo de Cultura', anio: null,
      activo: true, cuerpos: [{ slug: 'luna', orden: 1 }],
    })
    assert.deepEqual(validarBorradorLibro(borrador), { titulo: '', autoria: '', editorial: '', anio: '' })
    assert.ok(validarCampoLibro('autoria', 'Ana\nana'))
    assert.ok(validarOrdenLibro('32768'))
    assert.equal(validarOrdenLibro('32767'), '')
  })
})

describe('fotografía del libro', () => {
  it('envía altas, reemplazos, encuadres y retiros sin reenviar la portada si queda igual', () => {
    const version = 'b99be919-f78b-47fb-adfe-8f97d0d6bf48'
    const registro = presentarLibroAdministrativo({ id: 'a', titulo: 'Libro con portada', autores: [{ nombre: 'Autora' }], cuerpos: [], portada: { version, x: 30, y: 80 } })
    const borrador = crearBorradorLibro(registro)
    const archivo = new File(['imagen'], 'portada.png', { type: 'image/png' })
    assert.equal(registro.fotografia.url, `/api/admin/libros/a/portada?v=${version}`)
    assert.deepEqual(prepararDatosLibro(borrador, registro), {})
    assert.deepEqual(prepararDatosLibro({ ...borrador, fotografia: null }, registro), { portada: null })
    borrador.fotografia.encuadre.y = 65
    assert.deepEqual(prepararDatosLibro(borrador, registro), { portada: { version, x: 30, y: 65 } })
    borrador.fotografia = { archivo, url: 'blob:portada', encuadre: { x: 50, y: 50 } }
    const portadaNueva = { archivo, x: 50, y: 50 }
    assert.deepEqual(prepararDatosLibro(borrador, registro), { portada: portadaNueva })
    assert.deepEqual(prepararDatosLibro(borrador).portada, portadaNueva)
  })

  const CON_FOTOGRAFIA = Object.freeze({ ...REGISTROS[0], fotografia: Object.freeze({ url: '/foto-prueba.webp', encuadre: Object.freeze({ x: 50, y: 53 }) }) })

  it('la edición copia la fotografía y su encuadre sin compartir referencias', () => {
    const borrador = crearBorradorLibro(CON_FOTOGRAFIA)
    assert.deepEqual(borrador.fotografia, { url: '/foto-prueba.webp', encuadre: { x: 50, y: 53 } })
    assert.notEqual(borrador.fotografia, CON_FOTOGRAFIA.fotografia)
    assert.notEqual(borrador.fotografia.encuadre, CON_FOTOGRAFIA.fotografia.encuadre)
    borrador.fotografia.encuadre.y = 0
    assert.equal(CON_FOTOGRAFIA.fotografia.encuadre.y, 53)
    assert.deepEqual(crearBorradorLibro({ ...REGISTROS[0], fotografia: { url: '/foto.webp' } }).fotografia, { url: '/foto.webp', encuadre: { x: 50, y: 50 } })
    assert.equal(crearBorradorLibro({ ...CON_FOTOGRAFIA, fotografia: null }).fotografia, null)
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
    assert.equal(vacio.autoria, 'Autor del libro')
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
