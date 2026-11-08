import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { REGISTROS_BIBLIOGRAFICOS_EJEMPLO } from '../datos/registrosBibliograficosEjemplo.js'
import { crearBorradorLibro, crearRegistroVistaPrevia } from '../administracion/registrosBibliograficos.js'

// Pruebas de representación estática: comprueban etiquetas, estados y controles
// deshabilitados. La interacción, el foco y el diálogo modal se revisan en navegador.
let vite
let componentes
before(async () => {
  vite = await createServer({ cacheDir: 'node_modules/.vite-pruebas-panel', server: { middlewareMode: true, hmr: false, watch: null } })
  componentes = {
    ...(await vite.ssrLoadModule('/src/componentes/moduloAdministrativo.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/listadoBibliografico.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/tarjetaLibro.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/campoFotografiaLibro.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/formularioLibro.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/selectorCuerposCelestes.jsx')),
    ...(await vite.ssrLoadModule('/src/componentes/confirmacionEliminarLibro.jsx')),
  }
})
after(async () => { await vite?.close() })

const nada = () => {}
const representar = (nombre, propiedades = {}) => renderToStaticMarkup(createElement(componentes[nombre], propiedades))
const contar = (html, texto) => html.split(texto).length - 1
const [TIERRA_LUNA, , MARTE, COSMOS, , SIN_CUERPOS] = REGISTROS_BIBLIOGRAFICOS_EJEMPLO
// Los libros reales tienen sus datos completos: los casos ausentes se derivan aquí.
const SIN_EDITORIAL = Object.freeze({ ...MARTE, editorial: null })
const SIN_ANIO = Object.freeze({ ...COSMOS, anio: null })
const SIN_ASOCIAR = Object.freeze({ ...SIN_CUERPOS, editorial: null, anio: null })

// Textos retirados de la interfaz a petición del usuario: no deben reaparecer.
const TEXTOS_RETIRADOS = ['Vista previa · Datos de ejemplo', 'Los cambios aún no se guardan', 'REGISTROS BIBLIOGRÁFICOS', 'El guardado estará disponible', '<h1']

function botonGuardar(html, texto) {
  assert.ok(html.includes(`<button type="submit" class="panel-admin__boton" disabled="">${texto}</button>`), `falta ${texto} deshabilitado`)
  for (const retirado of TEXTOS_RETIRADOS) assert.equal(html.includes(retirado), false, retirado)
}

describe('contenedor del panel', () => {
  it('muestra navegación, filtros y el listado con los ejemplos, sin encabezado ni aviso de vista previa', () => {
    const html = representar('ModuloAdministrativo', { alCerrarSesion: nada })
    for (const texto of ['aria-label="Panel administrativo"', 'Registros bibliográficos</button>', 'Agregar libro</button>', 'Volver a la exploración</a>', 'Cerrar sesión</button>', 'aria-label="Listado de registros bibliográficos"', 'Buscar por título o autoría', 'Todos los cuerpos', 'Limpiar filtros</button>', '6 registros de ejemplo']) {
      assert.ok(html.includes(texto), texto)
    }
    for (const retirado of [...TEXTOS_RETIRADOS, 'Revisa los libros de ejemplo']) assert.equal(html.includes(retirado), false, retirado)
    assert.match(html, /aria-current="page">\s*Registros bibliográficos/)
    assert.equal(html.includes('<dialog'), false)
    assert.equal(contar(html, '<option value="'), 13)
    assert.ok(html.includes('<option value="luna">Luna (Tierra)</option>'))
  })

  it('una colección explícitamente vacía no se rellena con ejemplos', () => {
    const html = representar('ModuloAdministrativo', { alCerrarSesion: nada, registros: [] })
    assert.ok(html.includes('Todavía no hay registros bibliográficos'))
    assert.ok(html.includes('data-foco="agregar-vacio">Agregar libro</button>'))
    for (const ausente of [...TEXTOS_RETIRADOS, '<table', 'role="search"', 'Limpiar filtros', 'Ningún registro coincide', ...REGISTROS_BIBLIOGRAFICOS_EJEMPLO.map((registro) => registro.titulo)]) {
      assert.equal(html.includes(ausente), false, ausente)
    }
  })
})

describe('galería bibliográfica', () => {
  const propiedades = { total: 6, hayCriterios: false, alAgregar: nada, alEditar: nada, alEliminar: nada, alLimpiarFiltros: nada }
  const tarjetas = (html) => html.split('<article').slice(1).map((parte) => parte.split('</article>')[0])

  it('muestra cada libro una sola vez en una tarjeta con relaciones, cantidad de cuerpos y acciones vinculadas', () => {
    const html = representar('ListadoBibliografico', { ...propiedades, registros: REGISTROS_BIBLIOGRAFICOS_EJEMPLO })
    assert.ok(html.includes('<ul class="panel-admin__galeria" aria-label="Registros bibliográficos de ejemplo">'))
    assert.equal(html.includes('<table'), false)
    assert.equal(tarjetas(html).length, REGISTROS_BIBLIOGRAFICOS_EJEMPLO.length)
    for (const registro of REGISTROS_BIBLIOGRAFICOS_EJEMPLO) {
      assert.equal(contar(html, `>${registro.titulo}</h2>`), 1, registro.titulo)
      assert.ok(html.includes(`aria-label="Editar ${registro.titulo}">Editar</button>`))
      assert.ok(html.includes(`aria-label="Eliminar ${registro.titulo}">Eliminar</button>`))
    }
    const tarjeta = tarjetas(html).find((parte) => parte.includes(TIERRA_LUNA.titulo))
    assert.ok(tarjeta.includes('<li>Tierra</li><li>Luna</li>'))
  })

  it('sin criterios termina con Agregar libro y con criterios la oculta', () => {
    const sinCriterios = representar('ListadoBibliografico', { ...propiedades, registros: REGISTROS_BIBLIOGRAFICOS_EJEMPLO })
    assert.match(sinCriterios, /data-foco="agregar-galeria">.*Agregar libro<\/button><\/li><\/ul>$/s)
    const conCriterios = representar('ListadoBibliografico', { ...propiedades, hayCriterios: true, registros: [TIERRA_LUNA] })
    assert.equal(conCriterios.includes('agregar-galeria'), false)
    assert.equal(tarjetas(conCriterios).length, 1)
  })

  it('indica explícitamente la información ausente sin inventar valores', () => {
    const html = representar('ListadoBibliografico', { ...propiedades, total: 3, registros: [SIN_EDITORIAL, SIN_ANIO, SIN_ASOCIAR] })
    const [marte, interiores, sinAsociar] = tarjetas(html)
    assert.ok(marte.includes('Sin editorial') && marte.includes('2014') && marte.includes('<li>Marte</li>'))
    assert.ok(interiores.includes('Año no indicado') && interiores.includes('Planeta'))
    for (const texto of ['Sin editorial', 'Año no indicado', 'panel-admin__tarjeta-sin-cuerpos panel-admin__ausente">Sin asociar</p>']) {
      assert.ok(sinAsociar.includes(texto), texto)
    }
    assert.equal(sinAsociar.includes('class="panel-admin__cuerpos"'), false)
    for (const tarjeta of [marte, interiores, sinAsociar]) assert.equal(contar(tarjeta, '<button'), 2)
  })

  it('distingue la búsqueda sin coincidencias del catálogo vacío', () => {
    const sinCoincidencias = representar('ListadoBibliografico', { ...propiedades, hayCriterios: true, registros: [] })
    assert.ok(sinCoincidencias.includes('Ningún registro coincide con la búsqueda'))
    assert.ok(sinCoincidencias.includes('Limpiar filtros</button>'))
    assert.ok(sinCoincidencias.includes('role="status">0 de 6 registros de ejemplo</p>'))
    assert.equal(sinCoincidencias.includes('Todavía no hay'), false)
    assert.equal(sinCoincidencias.includes('panel-admin__galeria'), false)

    const vacio = representar('ListadoBibliografico', { ...propiedades, total: 0, registros: [] })
    assert.ok(vacio.includes('Todavía no hay registros bibliográficos'))
    assert.ok(vacio.includes('Agregar libro</button>'))
    assert.equal(vacio.includes('Limpiar filtros'), false)
    assert.equal(vacio.includes('role="status"'), false)
  })

  it('informa la cantidad filtrada', () => {
    const html = representar('ListadoBibliografico', { ...propiedades, hayCriterios: true, registros: [TIERRA_LUNA, SIN_ANIO] })
    assert.ok(html.includes('role="status">2 de 6 registros de ejemplo</p>'))
  })
})

const CON_FOTOGRAFIA = Object.freeze({ ...TIERRA_LUNA, fotografia: Object.freeze({ url: '/foto-prueba.webp', encuadre: Object.freeze({ x: 50, y: 53 }) }) })
const PORTADA_VACIA = '<div class="panel-admin__portada panel-admin__portada--vacia" aria-hidden="true"></div>'
const RESTOS_ORBITALES = ['panel-admin__orbita', 'panel-admin__planeta', 'panel-admin__cantidad-cuerpos', 'panel-admin__portada--orbital']

describe('tarjeta de libro', () => {
  it('con fotografía muestra la parte elegida sin imágenes de cuerpos ni indicaciones', () => {
    const html = representar('TarjetaLibro', { registro: CON_FOTOGRAFIA, alEditar: nada, alEliminar: nada })
    assert.match(html, /^<article class="panel-admin__tarjeta"><div class="panel-admin__portada"><img src="\/foto-prueba\.webp" alt=""[^>]*style="object-position:50% 53%"\/><\/div>/)
    assert.equal(contar(html, '<img'), 1)
    for (const resto of RESTOS_ORBITALES) assert.equal(html.includes(resto), false, resto)
  })

  it('sin fotografía muestra el espacio de portada vacío, sin órbitas, imágenes ni indicaciones', () => {
    for (const registro of REGISTROS_BIBLIOGRAFICOS_EJEMPLO.map((ejemplo) => ({ ...ejemplo, fotografia: null }))) {
      const html = representar('TarjetaLibro', { registro, alEditar: nada, alEliminar: nada })
      assert.ok(html.startsWith(`<article class="panel-admin__tarjeta">${PORTADA_VACIA}<div class="panel-admin__tarjeta-cuerpo"><h2 class="panel-admin__tarjeta-titulo">`), registro.id)
      for (const ausente of ['<img', ...RESTOS_ORBITALES]) assert.equal(html.includes(ausente), false, `${registro.id}: ${ausente}`)
    }
  })

  it('los ejemplos muestran su portada enlazada desde Open Library como imagen decorativa', () => {
    const html = representar('ListadoBibliografico', { total: 6, hayCriterios: true, registros: REGISTROS_BIBLIOGRAFICOS_EJEMPLO, alAgregar: nada, alEditar: nada, alEliminar: nada, alLimpiarFiltros: nada })
    const imagenes = [...html.matchAll(/<img src="([^"]+)" alt=""/g)].map(([, src]) => src)
    assert.deepEqual(imagenes, REGISTROS_BIBLIOGRAFICOS_EJEMPLO.map((registro) => registro.fotografia.url))
    assert.equal(html.includes('panel-admin__portada--vacia'), false)
  })

  it('la vista previa no tiene acciones ni encabezado', () => {
    const html = representar('TarjetaLibro', { registro: SIN_ASOCIAR, vistaPrevia: true })
    assert.equal(html.includes('<button'), false)
    assert.equal(html.includes('<h2'), false)
    assert.ok(html.includes('<p class="panel-admin__tarjeta-titulo">'))
    assert.ok(html.includes('Sin asociar</p>'))
  })
})

describe('campo de fotografía', () => {
  it('sin fotografía ofrece elegirla o arrastrarla, con formatos y vista previa con portada vacía', () => {
    const html = representar('CampoFotografiaLibro', { fotografia: null, alCambiar: nada, registroVistaPrevia: crearRegistroVistaPrevia(crearBorradorLibro()) })
    assert.ok(html.includes('<legend>Fotografía del libro <span class="panel-admin__marca-campo">Opcional</span></legend>'))
    assert.match(html, /<input type="file" accept="image\/jpeg,image\/png,image\/webp" hidden=""/)
    assert.match(html, /aria-describedby="[^"]+-formatos"[^>]*>Elegir fotografía<\/button>/)
    assert.ok(html.includes('JPG, PNG o WebP · hasta 5 MB'))
    assert.ok(html.includes('Vista previa') && html.includes(PORTADA_VACIA))
    assert.ok(html.includes('Título del libro') && html.includes('Sin asociar'))
    assert.equal(html.includes('Quitar foto'), false)
    for (const resto of RESTOS_ORBITALES) assert.equal(html.includes(resto), false, resto)
  })

  it('con fotografía muestra la imagen completa, Cambiar foto, Quitar foto y la vista previa con el recorte', () => {
    const borrador = crearBorradorLibro(CON_FOTOGRAFIA)
    const html = representar('CampoFotografiaLibro', { fotografia: borrador.fotografia, alCambiar: nada, registroVistaPrevia: crearRegistroVistaPrevia(borrador) })
    assert.match(html, /<img src="\/foto-prueba\.webp" alt="Fotografía elegida del libro/)
    assert.ok(html.includes('Cambiar foto</button>') && html.includes('Quitar foto</button>'))
    assert.ok(html.includes('Cargando la fotografía…'))
    assert.ok(html.includes('style="object-position:50% 53%"'))
    assert.ok(html.includes(TIERRA_LUNA.titulo))
  })
})

describe('formulario de libro', () => {
  it('el alta empieza vacía, identifica obligatorios y mantiene el guardado deshabilitado', () => {
    const html = representar('FormularioLibro', { modo: 'alta', alVolver: nada })
    assert.match(html, /<form [^>]*novalidate=""[^>]*aria-label="Agregar libro"/i)
    assert.equal(html.includes('Completa un borrador temporal'), false)
    for (const campo of ['titulo', 'autoria', 'editorial', 'anio', 'urlFicha']) assert.match(html, new RegExp(`name="${campo}"[^>]*value=""`))
    assert.equal(contar(html, '>Obligatorio</span>'), 3)
    assert.equal(contar(html, '>Opcional</span>'), 4)
    assert.ok(html.indexOf('Fotografía del libro') > html.indexOf('name="urlFicha"'))
    assert.ok(html.indexOf('Fotografía del libro') < html.indexOf('Cuerpos celestes relacionados'))
    assert.ok(html.includes('Elegir fotografía</button>') && html.includes(PORTADA_VACIA))
    assert.match(html, /type="text" inputMode="numeric"[^>]*name="anio"/)
    assert.match(html, /type="url"[^>]*name="urlFicha"/)
    assert.equal(contar(html, 'type="checkbox"'), 12)
    assert.equal(html.includes('checked=""'), false)
    assert.ok(html.includes('aria-live="polite">Sin asociar</p>'))
    assert.equal(html.includes('aria-invalid'), false)
    assert.ok(html.includes('<button type="button" class="panel-admin__boton panel-admin__boton--secundario">Cancelar</button>'))
    botonGuardar(html, 'Guardar libro')
    assert.equal(contar(html, 'type="submit"'), 1)
  })

  it('la edición presenta los valores y relaciones originales', () => {
    const html = representar('FormularioLibro', { modo: 'edicion', registro: TIERRA_LUNA, alVolver: nada })
    assert.match(html, /<form [^>]*aria-label="Editar libro"/)
    assert.equal(html.includes('Modificas un borrador temporal'), false)
    for (const [campo, valor] of [['titulo', TIERRA_LUNA.titulo], ['autoria', TIERRA_LUNA.autoria], ['editorial', TIERRA_LUNA.editorial], ['anio', String(TIERRA_LUNA.anio)], ['urlFicha', TIERRA_LUNA.urlFicha]]) {
      assert.match(html, new RegExp(`name="${campo}"[^>]*value="${valor}"`))
    }
    assert.ok(html.includes('checked="" value="tierra"'))
    assert.ok(html.includes('checked="" value="luna"'))
    assert.equal(contar(html, 'checked=""'), 2)
    assert.ok(html.includes('Seleccionados: Tierra, Luna'))
    assert.ok(html.includes(`src="${TIERRA_LUNA.fotografia.url}" alt="Fotografía elegida del libro`))
    assert.ok(html.includes('Quitar foto</button>'))
    botonGuardar(html, 'Guardar cambios')

    const incompleto = representar('FormularioLibro', { modo: 'edicion', registro: SIN_ASOCIAR, alVolver: nada })
    assert.match(incompleto, /name="editorial"[^>]*value=""/)
    assert.match(incompleto, /name="anio"[^>]*value=""/)
    assert.ok(incompleto.includes('aria-live="polite">Sin asociar</p>'))
  })
})

describe('selector de cuerpos celestes', () => {
  it('agrupa los doce cuerpos e identifica el planeta principal de cada satélite', () => {
    const html = representar('SelectorCuerposCelestes', { seleccionados: ['tierra', 'luna'], alAlternar: nada })
    const [planetas, satelites] = html.split('<legend>Satélites</legend>')
    assert.ok(planetas.includes('<legend>Planetas</legend>'))
    assert.equal(contar(planetas, 'type="checkbox"'), 8)
    assert.equal(contar(satelites, 'type="checkbox"'), 4)
    for (const texto of ['Satélite natural de la Tierra', 'Satélite natural de Júpiter', 'Satélite natural de Saturno', 'Satélite natural de Neptuno']) assert.ok(satelites.includes(texto))
    assert.equal(planetas.includes('Satélite natural'), false)
    assert.ok(html.includes('Seleccionados: Tierra, Luna'))
  })
})

describe('confirmación de eliminación', () => {
  it('identifica el libro y sus relaciones con la confirmación deshabilitada', () => {
    const html = representar('ConfirmacionEliminarLibro', { registro: TIERRA_LUNA, alCerrar: nada })
    assert.ok(html.startsWith('<dialog'))
    assert.ok(html.includes(`«${TIERRA_LUNA.titulo}»`))
    assert.ok(html.includes('Relaciones que se retirarían'))
    assert.ok(html.includes('<li>Tierra</li><li>Luna</li>'))
    assert.ok(html.includes('aria-label="Cerrar confirmación"'))
    assert.ok(html.includes('panel-admin__boton--secundario">Cancelar</button>'))
    const confirmar = html.match(/disabled="" aria-describedby="([^"]+)">Eliminar libro<\/button>/)
    assert.ok(confirmar)
    assert.match(html, new RegExp(`id="${confirmar[1]}" class="panel-admin__pendiente">La eliminación estará disponible en una próxima etapa`))
    assert.equal(/eliminad[oa] (correctamente|con éxito)/i.test(html), false)
  })

  it('un registro sin asociaciones lo indica sin inventar relaciones', () => {
    const html = representar('ConfirmacionEliminarLibro', { registro: SIN_ASOCIAR, alCerrar: nada })
    assert.ok(html.includes('Sin asociar: este libro no tiene cuerpos celestes relacionados.'))
    assert.equal(html.includes('<li>'), false)
  })
})

it('los componentes bibliográficos no realizan escrituras de red ni guardan borradores', () => {
  for (const archivo of ['moduloAdministrativo.jsx', 'listadoBibliografico.jsx', 'tarjetaLibro.jsx', 'campoFotografiaLibro.jsx', 'formularioLibro.jsx', 'selectorCuerposCelestes.jsx', 'confirmacionEliminarLibro.jsx', '../administracion/registrosBibliograficos.js']) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), 'utf8')
    for (const prohibido of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'FileReader']) {
      assert.equal(fuente.includes(prohibido), false, `${archivo}: ${prohibido}`)
    }
  }
})
