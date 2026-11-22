import { useState } from 'react'
import { PieInstitucional } from './pieInstitucional.jsx'

export function AccesoAdministrativo({ alIniciarSesion }) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const respuesta = await fetch('/api/admin/sesion', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      })
      const datos = await respuesta.json().catch(() => null)
      if (!datos) throw new Error('No se recibió una respuesta válida. Comprueba que la API esté activa en el puerto 3000.')
      if (!respuesta.ok) throw new Error(datos.error?.mensaje ?? 'No se pudo iniciar sesión.')
      alIniciarSesion()
    } catch (fallo) {
      setError(fallo.message.includes('fetch') || fallo.message.includes('NetworkError')
        ? 'No se pudo conectar con la API. Inicia npm run start:api en otra terminal e inténtalo de nuevo.'
        : fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="admin-acceso">
      <header className="admin-acceso__cabecera">
        <a className="admin-acceso__marca" href="/" aria-label="Metseri, volver al inicio">MET<span>S</span>ERI</a>
      </header>
      <div className="admin-acceso__contenido">
        <section className="admin-acceso__tarjeta" aria-labelledby="admin-titulo">
          <div className="admin-acceso__logo" aria-hidden="true" />
          <p className="admin-acceso__sobrelinea">PANEL DE CONTROL</p>
          <h1 id="admin-titulo">Iniciar sesión</h1>
          <form onSubmit={enviar}>
            <label htmlFor="admin-usuario">Usuario</label>
            <input id="admin-usuario" name="usuario" autoComplete="username" autoCapitalize="none" required value={usuario} onChange={(evento) => setUsuario(evento.target.value)} />
            <label htmlFor="admin-contrasena">Contraseña</label>
            <input id="admin-contrasena" name="contrasena" type="password" autoComplete="current-password" required value={contrasena} onChange={(evento) => setContrasena(evento.target.value)} />
            {error && <p className="admin-acceso__error" role="alert">{error}</p>}
            <button type="submit" disabled={enviando}>{enviando ? 'Verificando…' : 'Iniciar sesión'}<span aria-hidden="true">↗</span></button>
          </form>
          <a className="admin-acceso__volver" href="/">← Volver a explorar el cielo</a>
        </section>
      </div>
      <PieInstitucional />
    </main>
  )
}
