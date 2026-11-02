import assert from 'node:assert/strict'
import { after, before, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { crearFichaPrueba } from '../pruebas/fichasPrueba.js'
import { adaptarFicha } from '../servicios/consultaContenido.js'

let servidor, FichaCuerpoCeleste
before(async () => {
  servidor = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-pruebas-fichas', plugins: [react()], logLevel: 'silent', server: { middlewareMode: true, watch: null }, optimizeDeps: { noDiscovery: true, include: [] } })
  ;({ FichaCuerpoCeleste } = await servidor.ssrLoadModule('/src/componentes/fichaCuerpoCeleste.jsx'))
})
after(async () => { await servidor?.close() })
function representar(cuerpo, contenido, adicionales = {}) {
  return renderToStaticMarkup(createElement(FichaCuerpoCeleste, { cuerpo, contenido, modo: 'normal', lectura: { pagina: 0, total: 4 }, ...adicionales }))
}

it('cada ficha HTML presenta su contenido remoto y los metadatos de sus propios libros', () => {
  for (const local of CUERPOS_CELESTES) {
    const cuerpo = adaptarFicha(crearFichaPrueba(local), local)
    const html = representar(cuerpo, { fase: 'disponible' })
    assert.ok(html.includes(cuerpo.descripcion))
    assert.ok(html.includes(cuerpo.libros[0].titulo))
    assert.match(html, /Autora de prueba|Editorial de prueba/)
    assert.match(html, /Descubrir libros|Ver ficha bibliográfica/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.match(html, /Período de rotación/)
    assert.match(html, /Rotación retrógrada/)
    assert.doesNotMatch(html, /espacio reservado|Valor pendiente|undefined|NaN/)
  }
})

it('carga, 404 y error no se anuncian como listas vacías; el cierre permanece disponible', () => {
  const cuerpo = CUERPOS_CELESTES[2]
  for (const fase of ['cargando', 'no-disponible', 'error']) {
    const html = representar(cuerpo, { fase })
    assert.match(html, /Cerrar ficha de Tierra y volver a la escena/)
    assert.match(html, /role="status"/)
    assert.doesNotMatch(html, /Aún no hay libros|Descripción no disponible/)
    assert.equal(html.includes('>Reintentar<'), fase === 'error')
  }
})

it('muestra ausencias y enlace alternativo por bloqueo sin interpretar HTML remoto', () => {
  const local = CUERPOS_CELESTES[2], datos = crearFichaPrueba(local)
  datos.descripcion_breve = '<script>contenido no ejecutable</script>'
  datos.subtitulo = null; datos.curiosidades = []; datos.libros = []; datos.datos_principales = null
  const html = representar(adaptarFicha(datos, local), { fase: 'disponible' }, { libroBloqueado: { url: 'https://example.org/libro' } })
  assert.match(html, /&lt;script&gt;/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /Dato no disponible/)
  assert.match(html, /No hay curiosidades publicadas/)
  assert.match(html, /Aún no hay libros verificados asociados a Tierra/)
  assert.match(html, /Solón Argüello/)
  assert.match(html, /role="alert"/)
  assert.match(html, /Abrir ficha bibliográfica/)
})
