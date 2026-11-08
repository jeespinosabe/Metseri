import assert from 'node:assert/strict'
import { it } from 'node:test'
import { PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { prepararEntornoEscena } from '../pruebas/entornoEscena.js'
import { crearGestosVr, INTERVALO_DOBLE_TAP_MS } from './gestosVr.js'
import { obtenerZonasNavegacion } from './contenidoFicha.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido } from '../servicios/consultaContenido.js'
import { obtenerCuerpoCeleste } from '../datos/cuerposCelestes.js'

function abrirFicha(t) {
  const entorno = prepararEntornoEscena(t)
  const { campo } = entorno
  campo.activar({ clientX: 450, clientY: 225 })
  assert.equal(entorno.lectura().cuerpoId, 'tierra')
  campo.establecerModo('vr')
  entorno.dibujar()
  const tarjeta = entorno.tarjeta()
  const apuntar = (x, y) => {
    const camara = new PerspectiveCamera()
    camara.lookAt(tarjeta.localToWorld(new Vector3(x - .5, .5 - y, 0)))
    campo.establecerOrientacion(camara.quaternion)
    entorno.dibujar()
  }
  const gestos = crearGestosVr({ prepararActivacion: () => campo.prepararActivacion(), alRecentrar: () => campo.recentrarFicha() })
  return { ...entorno, apuntar, gestos }
}

for (const origen of ['mitad', 'control', 'acción accesible']) {
  it(`avanzar al final desde ${origen} cierra una sola ficha conservando VR y orientación`, (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const { campo, gestos, apuntar, lectura, tarjeta } = abrirFicha(t)
    campo.ocultarInstruccionVr()
    campo.ejecutarAccionFicha('seccion:3')
    if (origen === 'control') {
      const { width: ancho, height: alto } = tarjeta().material.map.image
      const zona = obtenerZonasNavegacion(ancho, alto, lectura().pagina, lectura().total).find((registro) => registro.accion === 'siguiente')
      apuntar((zona.x + zona.ancho / 2) / ancho, (zona.y + zona.alto / 2) / alto)
    } else apuntar(.75, .5)
    const orientacion = campo.obtenerOrientacion()
    if (origen === 'acción accesible') campo.ejecutarAccionFicha('siguiente')
    else {
      gestos.pulsar({ clientX: 5, clientY: 5 })
      t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS - 1)
      assert.equal(lectura().cuerpoId, 'tierra')
      t.mock.timers.tick(1)
    }
    assert.equal(lectura().cuerpoId, null)
    assert.equal(campo.obtenerModo(), 'vr')
    assert.ok(campo.obtenerOrientacion().equals(orientacion))
    assert.equal(tarjeta().visible, false)
  })
}

it('la instrucción consume el primer tap; después navegar usa la mitad capturada sin depender del dedo', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { campo, gestos, apuntar, lectura, punteros, dibujar } = abrirFicha(t)
  assert.deepEqual(punteros.slice(-2), [0, 0])
  gestos.pulsar({})
  t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
  assert.equal(lectura().pagina, 0)
  apuntar(.75, .5)
  gestos.pulsar({ clientX: 5 })
  apuntar(.25, .5)
  t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
  assert.equal(lectura().pagina, 1)
  dibujar()
  assert.deepEqual(punteros.slice(-2), [-1, -1])
  gestos.pulsar({ clientX: 895 })
  t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
  assert.equal(lectura().pagina, 0)
  assert.equal(campo.obtenerModo(), 'vr')
})

for (const cambio of ['página', 'contenido', 'tamaño', 'reabrir el mismo cuerpo']) {
  it(`descarta el cierre capturado si cambia ${cambio} durante los 300 ms`, (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const { campo, gestos, apuntar, lectura, redimensionar } = abrirFicha(t)
    campo.ocultarInstruccionVr()
    campo.ejecutarAccionFicha('seccion:3')
    apuntar(.75, .5)
    gestos.pulsar({})
    if (cambio === 'página') campo.ejecutarAccionFicha('anterior')
    if (cambio === 'contenido') campo.establecerContenidoFicha('tierra', { fase: 'cargando' })
    if (cambio === 'tamaño') redimensionar(350, 200)
    if (cambio === 'reabrir el mismo cuerpo') {
      campo.ejecutarAccionFicha('cerrar')
      campo.establecerOrientacion(new Quaternion())
      campo.activar({})
    }
    t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
    assert.equal(lectura().cuerpoId, 'tierra')
  })
}

it('el doble tap en la última página recentra conservando la lectura y sin ejecutar cierre', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { campo, gestos, apuntar, lectura } = abrirFicha(t)
  campo.ocultarInstruccionVr()
  campo.ejecutarAccionFicha('seccion:3')
  apuntar(.75, .5)
  gestos.pulsar({})
  t.mock.timers.tick(100)
  gestos.pulsar({})
  t.mock.timers.tick(1000)
  assert.equal(lectura().cuerpoId, 'tierra')
  assert.equal(lectura().pagina, 3)
})

it('el puntero en ambos ojos sigue la lectura, cierre, tamaño, diagonal y nuevo objetivo', (t) => {
  const { campo, apuntar, dibujar, punteros, redimensionar } = abrirFicha(t)
  campo.ocultarInstruccionVr()
  apuntar(.25, .5)
  assert.deepEqual(punteros.slice(-2), [0, 0])
  campo.ejecutarAccionFicha('siguiente')
  dibujar()
  assert.deepEqual(punteros.slice(-2), [-1, -1])
  apuntar(.75, .5)
  assert.deepEqual(punteros.slice(-2), [1, 1])
  campo.ejecutarAccionFicha('seccion:3')
  dibujar()
  assert.deepEqual(punteros.slice(-2), [2, 2])
  redimensionar(850, 440)
  campo.establecerDiagonalPantalla(6.5)
  dibujar()
  assert.deepEqual(punteros.slice(-2), [2, 2])
  campo.ejecutarAccionFicha('cerrar')
  dibujar()
  assert.deepEqual(punteros.slice(-2), [0, 0])
  campo.establecerModo('normal')
  dibujar()
  campo.establecerModo('vr')
  dibujar()
  assert.deepEqual(punteros.slice(-2), [0, 0])
})

for (const cuerpoId of ['tierra', 'luna']) {
  for (const fase of ['disponible', 'cargando', 'error']) {
    it(`recorrido completo de ${cuerpoId} con contenido ${fase}, continuaciones y rotación sin navegador`, (t) => {
      t.mock.timers.enable({ apis: ['setTimeout'] })
      const { campo, dibujar, lectura, tarjeta, punteros, apuntarCuerpo, redimensionar, rectangulo } = prepararEntornoEscena(t)
      const gestos = crearGestosVr({ prepararActivacion: () => campo.prepararActivacion(), alRecentrar: () => campo.recentrarFicha() })
      const cuerpo = obtenerCuerpoCeleste(cuerpoId)
      const contenido = fase === 'disponible'
        ? { fase, ficha: adaptarContenido(cuerpo, FICHAS_PRUEBA.find((ficha) => ficha.slug === cuerpoId)) }
        : { fase }
      const apuntar = (x, y = .5) => {
        const camara = new PerspectiveCamera()
        camara.lookAt(tarjeta().localToWorld(new Vector3(x - .5, .5 - y, 0)))
        campo.establecerOrientacion(camara.quaternion)
        dibujar()
      }
      const tocar = () => {
        gestos.pulsar({ clientX: 5, clientY: 5 })
        t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
        dibujar()
      }
      const apuntarZona = (accion) => {
        const { width: ancho, height: alto } = tarjeta().material.map.image
        const zona = obtenerZonasNavegacion(ancho, alto, lectura().pagina, lectura().total).find((zona) => zona.accion === accion)
        apuntar((zona.x + zona.ancho / 2) / ancho, (zona.y + zona.alto / 2) / alto)
      }

      campo.establecerModo('vr')
      campo.ocultarInstruccionVr()
      for (const [ancho, alto] of [[350, 200], [844, 390], [390, 844]]) {
        redimensionar(ancho, alto, { rotarPantalla: true })
        apuntarCuerpo(cuerpoId)
        tocar()
        assert.equal(lectura().cuerpoId, cuerpoId)
        assert.equal(lectura().pagina, 0)
        campo.establecerContenidoFicha(cuerpoId, contenido)
        campo.recentrarFicha()
        const total = lectura().total
        if (fase === 'disponible' && ancho === 350) assert.ok(total > 4, 'el recorrido incluye continuaciones reales')

        apuntar(.25)
        assert.deepEqual(punteros.slice(-2), [0, 0])
        tocar()
        assert.equal(lectura().pagina, 0)
        assert.equal(lectura().cuerpoId, cuerpoId)

        const seccionesVisitadas = new Set([lectura().seccion])
        for (let pagina = 1; pagina < total; pagina += 1) {
          apuntar(.75)
          assert.deepEqual(punteros.slice(-2), [1, 1])
          tocar()
          assert.equal(lectura().pagina, pagina)
          assert.equal(lectura().cuerpoId, cuerpoId)
          seccionesVisitadas.add(lectura().seccion)
        }
        assert.deepEqual([...seccionesVisitadas], ['resumen', 'datos', 'curiosidades', 'libros'])
        apuntar(.75)
        assert.deepEqual(punteros.slice(-2), [2, 2])
        for (let pagina = total - 2; pagina >= 0; pagina -= 1) {
          apuntar(.25)
          assert.deepEqual(punteros.slice(-2), [-1, -1])
          tocar()
          assert.equal(lectura().pagina, pagina)
        }

        apuntarZona('seccion:3')
        assert.deepEqual(punteros.slice(-2), [0, 0])
        tocar()
        assert.equal(lectura().seccion, 'libros', 'la pestaña no ejecuta también el avance de su mitad')
        const primeraPaginaLibros = lectura().pagina
        apuntar(.25)
        tocar()
        assert.equal(lectura().seccion, 'curiosidades', 'la pestaña llevó a la primera página de Libros')
        campo.ejecutarAccionFicha('seccion:3')
        assert.equal(lectura().pagina, primeraPaginaLibros)
        const antesDeRotar = { ...lectura() }
        redimensionar(alto, ancho, { rotarPantalla: true })
        campo.establecerDiagonalPantalla(6.5)
        dibujar()
        assert.equal(lectura().seccion, antesDeRotar.seccion)
        assert.equal(lectura().cuerpoId, cuerpoId)

        campo.ejecutarAccionFicha('seccion:0')
        apuntarZona('seccion:3')
        tocar()
        assert.equal(lectura().seccion, 'libros')
        while (lectura().pagina < lectura().total - 1) { apuntar(.75); tocar() }
        const final = { ...lectura() }
        apuntar(.75)
        gestos.pulsar({})
        t.mock.timers.tick(100)
        gestos.pulsar({})
        t.mock.timers.tick(INTERVALO_DOBLE_TAP_MS)
        assert.deepEqual(lectura(), final, 'el doble tap conserva cuerpo, página y sección')
        apuntar(.75)
        tocar()
        assert.equal(lectura().cuerpoId, null)
        assert.equal(campo.obtenerModo(), 'vr')
        assert.equal(tarjeta().visible, false)
        assert.deepEqual(punteros.slice(-2), [0, 0])

        apuntarCuerpo(cuerpoId)
        tocar()
        assert.equal(lectura().cuerpoId, cuerpoId)
        apuntarZona('cerrar')
        tocar()
        assert.equal(lectura().cuerpoId, null, '× tiene prioridad y cierra desde la primera página')
      }
      campo.establecerModo('normal')
      apuntarCuerpo(cuerpoId)
      campo.activar({ clientX: rectangulo().width / 2, clientY: rectangulo().height / 2 })
      assert.equal(lectura().cuerpoId, cuerpoId)
      assert.equal(tarjeta().visible, false, 'la tarjeta VR no se muestra en vista única')
      campo.ejecutarAccionFicha('cerrar')
      assert.equal(lectura().cuerpoId, null)
    })
  }
}
