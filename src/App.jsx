import { useEffect, useState } from 'react'
import { EscenaEstelar } from './componentes/escenaEstelar.jsx'
import { AccesoAdministrativo } from './componentes/accesoAdministrativo.jsx'
import { ModuloAdministrativo } from './componentes/moduloAdministrativo.jsx'
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

  function navegar(destino) {
    window.history.pushState({}, '', destino)
    setRuta(destino)
  }

  if (ruta === '/admin' || ruta === '/admin/') {
    if (sesion === 'comprobando') return <main className="aplicacion"><div className="admin-cargando" role="status">Verificando acceso…</div></main>
    if (sesion === 'autenticada') return <ModuloAdministrativo alCerrarSesion={async () => {
      await fetch('/api/admin/sesion', { method: 'DELETE', credentials: 'same-origin' })
      setSesion('sin-sesion')
    }} />
    return <AccesoAdministrativo alIniciarSesion={() => setSesion('autenticada')} />
  }

  return (
    <main className="aplicacion">
      <EscenaEstelar />
      <a className="enlace-administracion" href="/admin" onClick={(evento) => { evento.preventDefault(); navegar('/admin') }}>Administración</a>
    </main>
  )
}

export default App
