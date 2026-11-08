import assert from 'node:assert/strict'
import { after, before, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { obtenerCuerpoCeleste } from '../datos/cuerposCelestes.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido } from '../servicios/consultaContenido.js'

let vite
let FichaCuerpoCeleste
before(async () => {
  vite = await createServer({ cacheDir: 'node_modules/.vite-pruebas-fichas', server: { middlewareMode: true, hmr: false, watch: null } })
  ;({ FichaCuerpoCeleste } = await vite.ssrLoadModule('/src/componentes/fichaCuerpoCeleste.jsx'))
})
after(async () => { await vite?.close() })

function representar(ficha, propiedades = {}) {
  const cuerpo = obtenerCuerpoCeleste(ficha.slug)
  return renderToStaticMarkup(createElement(FichaCuerpoCeleste, {
    cuerpo, modo: 'normal', lectura: { cuerpoId: cuerpo.id, pagina: 0, total: 4 },
    contenido: { fase: 'disponible', ficha: adaptarContenido(cuerpo, ficha) },
    ...propiedades,
  }))
}

it('rellena las doce fichas con los 48 datos y las invitaciones del PDF sin agregar controles', () => {
  for (const ficha of FICHAS_PRUEBA) {
    const html = representar(ficha)
    assert.ok(html.includes(ficha.descripcion_breve))
    assert.ok(html.includes(ficha.contenido_ficha.descubrir_libros))
    assert.ok(html.includes(obtenerCuerpoCeleste(ficha.slug).imagen))
    assert.equal(html.includes('/imagen-remota-no-utilizada.webp'), false)
    assert.equal(html.includes('Libros: espacio reservado'), false)
    assert.equal((html.match(/<button /g) ?? []).length, 1)
    assert.equal((html.match(/<dt>/g) ?? []).length, 4)
    assert.ok(html.includes('Subtítulo: espacio reservado'))
    const datos = [...html.matchAll(/<dt>(.*?)<\/dt><dd>(.*?)<span class="ficha-cuerpo__unidad">(.*?)<\/span><\/dd>/gu)]
    assert.equal(datos.length, 4)
    datos.forEach(([, etiqueta, valor, unidad], indice) => {
      const original = ficha.contenido_ficha.datos_principales[indice]
      assert.equal(etiqueta, original.etiqueta)
      assert.equal(`${valor} ${unidad}`, original.valor)
    })
    ficha.curiosidades.forEach((curiosidad) => assert.ok(html.includes(curiosidad)))
  }
})

it('los estados de espera/error conservan estructura, imagen y cierre', () => {
  const ficha = FICHAS_PRUEBA[0]
  for (const [contenido, texto] of [[null, 'Cargando información...'], [{ fase: 'error' }, 'No se pudo cargar la información.']]) {
    const html = representar(ficha, { contenido })
    assert.ok(html.includes(texto))
    assert.ok(html.includes('Cerrar ficha de Mercurio'))
    assert.ok(html.includes('Valor pendiente'))
    assert.equal(html.includes(ficha.descripcion_breve), false)
    assert.equal((html.match(/<button /g) ?? []).length, 1)
  }
})

it('la lectura accesible VR comparte el contenido publicado y conserva los controles existentes', () => {
  const ficha = FICHAS_PRUEBA.find((registro) => registro.slug === 'europa')
  const html = representar(ficha, { modo: 'vr' })
  assert.equal(html.includes(ficha.descripcion_breve), true)
  assert.equal(html.includes(ficha.contenido_ficha.descubrir_libros), true)
  assert.equal(html.includes('Descripción: espacio reservado'), false)
  assert.equal(html.includes('Libros: espacio reservado'), false)
  assert.ok(html.includes('Secciones de la ficha VR'))
  const continuacion = representar(ficha, { modo: 'vr', lectura: { cuerpoId: ficha.slug, pagina: 5, total: 9, seccion: 'datos' } })
  assert.ok(continuacion.includes('aria-current="page">Datos</button>'))
})

it('los campos ausentes siguen reservados y el contenido recibido no ejecuta HTML', () => {
  const ficha = structuredClone(FICHAS_PRUEBA[0])
  ficha.descripcion_breve = '<img src=x onerror=alert(1)>'
  ficha.contenido_ficha.datos_principales[2] = null
  const html = representar(ficha)
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  assert.equal(html.includes('<img src=x'), false)
  assert.ok(html.includes('Valor pendiente'))
})

it('VR permite avanzar hasta un cierre final habilitado, con retroceso inicial deshabilitado', () => {
  const ficha = FICHAS_PRUEBA[0]
  const inicial = representar(ficha, { modo: 'vr' })
  assert.match(inicial, /<button type="button" disabled="">← Anterior<\/button>/)
  assert.match(inicial, /<button type="button">Siguiente →<\/button>/)
  const final = representar(ficha, { modo: 'vr', lectura: { cuerpoId: ficha.slug, pagina: 8, total: 9, seccion: 'libros' } })
  assert.match(final, /<button type="button">← Anterior<\/button>/)
  assert.match(final, /<button type="button">Cerrar →<\/button>/)
  assert.equal(final.includes('Siguiente →'), false)
  assert.equal(representar(ficha).includes('Cerrar →'), false)
})
