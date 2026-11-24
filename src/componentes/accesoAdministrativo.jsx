import { useEffect, useRef, useState } from 'react'
import { PieInstitucional } from './pieInstitucional.jsx'

// Campo de contraseña con un botón para mostrarla u ocultarla. El estado vive en quien lo usa.
export function CampoContrasena({ visible, valor, alCambiar, alAlternar, entradaRef }) {
  const accion = visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
  return (
    <div className="admin-acceso__campo-contrasena">
      <input id="admin-contrasena" ref={entradaRef} name="contrasena" type={visible ? 'text' : 'password'}
        autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={valor} onChange={alCambiar} />
      <button className="admin-acceso__ojo" type="button" aria-label={accion} aria-pressed={visible} title={accion}
        onMouseDown={(evento) => evento.preventDefault()} onClick={alAlternar}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          {visible ? (
            <>
              <path d="M17.94 17.94A10.4 10.4 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <path d="M2 2l20 20" />
            </>
          ) : (
            <>
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}

export function AccesoAdministrativo({ alIniciarSesion }) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [contrasenaVisible, setContrasenaVisible] = useState(false)
  const contrasenaRef = useRef(null)
  const seleccionPendiente = useRef(null)

  // Al mostrar u ocultar con el puntero, el cursor se queda en la contraseña donde estaba.
  useEffect(() => {
    const seleccion = seleccionPendiente.current
    if (!seleccion) return
    seleccionPendiente.current = null
    const entrada = contrasenaRef.current
    entrada?.focus({ preventScroll: true })
    entrada?.setSelectionRange(seleccion[0], seleccion[1])
  }, [contrasenaVisible])

  function alternarContrasena(evento) {
    const entrada = contrasenaRef.current
    // Clic o toque (detail > 0): el foco vuelve al campo. Con el teclado (detail 0) sigue en el botón.
    if (evento.detail > 0 && entrada) {
      seleccionPendiente.current = document.activeElement === entrada
        ? [entrada.selectionStart, entrada.selectionEnd]
        : [entrada.value.length, entrada.value.length]
    }
    setContrasenaVisible((actual) => !actual)
  }

  async function enviar(evento) {
    evento.preventDefault()
    setContrasenaVisible(false)
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
            <CampoContrasena visible={contrasenaVisible} valor={contrasena} entradaRef={contrasenaRef}
              alCambiar={(evento) => setContrasena(evento.target.value)} alAlternar={alternarContrasena} />
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
