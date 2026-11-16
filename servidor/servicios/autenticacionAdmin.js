import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const DURACION_SESION_MS = 8 * 60 * 60 * 1000
const COOKIE_SESION = 'metseri_admin'

function compararSeguro(primero, segundo) {
  const hashPrimero = createHash('sha256').update(primero).digest()
  const hashSegundo = createHash('sha256').update(segundo).digest()
  return timingSafeEqual(hashPrimero, hashSegundo)
}

export function crearAutenticacionAdmin({ entorno = process.env, ahora = Date.now } = {}) {
  const sesiones = new Map()

  function credencialesConfiguradas() {
    return typeof entorno.ADMIN_USUARIO === 'string'
      && entorno.ADMIN_USUARIO.length > 0
      && typeof entorno.ADMIN_CONTRASENA === 'string'
      && entorno.ADMIN_CONTRASENA.length >= 12
  }

  function leerToken(peticion) {
    const cookies = peticion.headers.cookie ?? ''
    const cookie = cookies.split(';').map((parte) => parte.trim())
      .find((parte) => parte.startsWith(`${COOKIE_SESION}=`))
    return cookie?.slice(COOKIE_SESION.length + 1) ?? ''
  }

  function tieneSesion(peticion) {
    const token = leerToken(peticion)
    const vence = sesiones.get(token)
    if (!token || !vence) return false
    if (vence <= ahora()) {
      sesiones.delete(token)
      return false
    }
    return true
  }

  function exigirAdministrador(peticion, respuesta, siguiente) {
    if (tieneSesion(peticion)) return siguiente()
    return respuesta.status(401).json({ error: { codigo: 'SESION_REQUERIDA', mensaje: 'Inicia sesión para acceder al módulo administrativo.' } })
  }

  function establecerCookie(respuesta, token) {
    const segura = entorno.NODE_ENV === 'production' ? '; Secure' : ''
    respuesta.set('Set-Cookie', `${COOKIE_SESION}=${token}; HttpOnly; Path=/api/admin; SameSite=Strict; Max-Age=${DURACION_SESION_MS / 1000}${segura}`)
  }

  function borrarCookie(respuesta) {
    respuesta.set('Set-Cookie', `${COOKIE_SESION}=; HttpOnly; Path=/api/admin; SameSite=Strict; Max-Age=0${entorno.NODE_ENV === 'production' ? '; Secure' : ''}`)
  }

  return {
    exigirAdministrador,
    estaConfigurada: credencialesConfiguradas,
    iniciar(peticion, respuesta) {
      if (!credencialesConfiguradas()) {
        return respuesta.status(503).json({ error: { codigo: 'AUTENTICACION_NO_CONFIGURADA', mensaje: 'El acceso administrativo aún no está configurado.' } })
      }
      const { usuario, contrasena } = peticion.body ?? {}
      const usuarioValido = typeof usuario === 'string' && compararSeguro(usuario, entorno.ADMIN_USUARIO)
      const contrasenaValida = typeof contrasena === 'string' && contrasena.length <= 256
        && compararSeguro(contrasena, entorno.ADMIN_CONTRASENA)
      if (!usuarioValido || !contrasenaValida) {
        return respuesta.status(401).json({ error: { codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'El usuario o la contraseña son incorrectos.' } })
      }
      const token = randomBytes(32).toString('base64url')
      sesiones.set(token, ahora() + DURACION_SESION_MS)
      establecerCookie(respuesta, token)
      return respuesta.json({ autenticado: true })
    },
    consultar(peticion, respuesta) {
      respuesta.json({ autenticado: tieneSesion(peticion) })
    },
    cerrar(peticion, respuesta) {
      sesiones.delete(leerToken(peticion))
      borrarCookie(respuesta)
      respuesta.json({ autenticado: false })
    },
  }
}
