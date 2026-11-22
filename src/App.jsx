import { useEffect, useState } from 'react'
import { EscenaEstelar } from './componentes/escenaEstelar.jsx'
import { AccesoAdministrativo } from './componentes/accesoAdministrativo.jsx'
import { ModuloAdministrativo } from './componentes/moduloAdministrativo.jsx'
import '@fontsource-variable/noto-sans'
import './componentes/temaAdministrativo.css'
import './App.css'

function App() {
  const [ruta, setRuta] = useState(window.location.pathname)
  const [sesion, setSesion] = useState('comprobando')

  useEffect(() => {
    const alNavegar = () => setRuta(window.location.pathname)
    window.addEventListener('popstate', alNavegar)
    return () => window.removeEventListener('popstate', alNavegar)
  }, [])

  useEffect(() => {
    if (ruta !== '/admin' && ruta !== '/admin/') return
    let vigente = true
    fetch('/api/admin/sesion', { credentials: 'same-origin' })
      .then((respuesta) => respuesta.json())
      .then((datos) => { if (vigente) setSesion(datos.autenticado ? 'autenticada' : 'sin-sesion') })
      .catch(() => { if (vigente) setSesion('sin-sesion') })
    return () => { vigente = false }
  }, [ruta])

  function abrirAdministracion(evento) {
    if (evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
    evento.preventDefault()
    window.history.pushState({}, '', '/admin')
    setRuta('/admin')
  }

  if (ruta === '/admin' || ruta === '/admin/') {
    if (sesion === 'comprobando') return <main className="aplicacion"><div className="admin-cargando" role="status">Verificando acceso…</div></main>
    if (sesion === 'autenticada') return <ModuloAdministrativo alCerrarSesion={async () => {
      const respuesta = await fetch('/api/admin/sesion', { method: 'DELETE', credentials: 'same-origin', signal: AbortSignal.timeout(12000) })
      if (!respuesta.ok) throw new Error('No se pudo cerrar la sesión.')
      setSesion('sin-sesion')
    }} />
    return <AccesoAdministrativo alIniciarSesion={() => setSesion('autenticada')} />
  }

  return (
    <main className="aplicacion">
      <EscenaEstelar alAbrirAdministracion={abrirAdministracion} />
    </main>
  )
}

export default App
