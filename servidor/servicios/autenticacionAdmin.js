import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { obtenerConfiguracionPrivada, solicitarRpcPrivada } from './supabasePrivada.js'

const DURACION_SESION_SEGUNDOS = 8 * 60 * 60
const COOKIE_SESION = 'metseri_admin'

function compararSeguro(primero, segundo) {
  const hashPrimero = createHash('sha256').update(primero).digest()
  const hashSegundo = createHash('sha256').update(segundo).digest()
  return timingSafeEqual(hashPrimero, hashSegundo)
}

export function crearAutenticacionAdmin({ entorno = process.env, solicitar = fetch } = {}) {
  function credencialesConfiguradas() {
    return typeof entorno.ADMIN_USUARIO === 'string'
      && entorno.ADMIN_USUARIO.length > 0
      && typeof entorno.ADMIN_CONTRASENA === 'string'
      && entorno.ADMIN_CONTRASENA.length >= 12
  }

  function leerHuella(peticion) {
    const cookies = peticion.headers.cookie ?? ''
    const cookie = cookies.split(';').map((parte) => parte.trim())
      .find((parte) => parte.startsWith(`${COOKIE_SESION}=`))
    const token = cookie?.slice(COOKIE_SESION.length + 1) ?? ''
    return /^[A-Za-z0-9_-]{43}$/.test(token) && credencialesConfiguradas() ? calcularHuella(token) : null
  }

  function calcularHuella(token) {
    return createHmac('sha256', entorno.ADMIN_CONTRASENA).update(JSON.stringify([entorno.ADMIN_USUARIO, token])).digest('hex')
  }

  async function gestionarSesion(funcion, huella) {
    const configuracion = obtenerConfiguracionPrivada(entorno)
    if (!configuracion) throw new Error()
    const respuesta = await solicitarRpcPrivada(configuracion, funcion, { p_huella: huella }, solicitar)
    if (!respuesta.ok) throw new Error()
    const resultado = await respuesta.json()
    if (typeof resultado !== 'boolean') throw new Error()
    return resultado
  }

  async function tieneSesion(peticion) {
    const huella = leerHuella(peticion)
    return huella ? gestionarSesion('consultarSesionAdministrativa', huella) : false
  }

  function sesionNoDisponible(respuesta) {
    return respuesta.status(503).json({ error: { codigo: 'SESION_NO_DISPONIBLE', mensaje: 'No se pudo gestionar la sesión administrativa. Inténtalo de nuevo.' } })
  }

  async function exigirAdministrador(peticion, respuesta, siguiente) {
    try {
      if (await tieneSesion(peticion)) return siguiente()
    } catch {
      return sesionNoDisponible(respuesta)
    }
    return respuesta.status(401).json({ error: { codigo: 'SESION_REQUERIDA', mensaje: 'Inicia sesión para acceder al módulo administrativo.' } })
  }

  function establecerCookie(respuesta, token) {
    const segura = entorno.NODE_ENV === 'production' ? '; Secure' : ''
    respuesta.set('Set-Cookie', `${COOKIE_SESION}=${token}; HttpOnly; Path=/api/admin; SameSite=Strict; Max-Age=${DURACION_SESION_SEGUNDOS}${segura}`)
  }

  function borrarCookie(respuesta) {
    respuesta.set('Set-Cookie', `${COOKIE_SESION}=; HttpOnly; Path=/api/admin; SameSite=Strict; Max-Age=0${entorno.NODE_ENV === 'production' ? '; Secure' : ''}`)
  }

  return {
    exigirAdministrador,
    estaConfigurada: credencialesConfiguradas,
    async iniciar(peticion, respuesta) {
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
      try {
        if (!await gestionarSesion('crearSesionAdministrativa', calcularHuella(token))) return sesionNoDisponible(respuesta)
      } catch {
        return sesionNoDisponible(respuesta)
      }
      establecerCookie(respuesta, token)
      return respuesta.json({ autenticado: true })
    },
    async consultar(peticion, respuesta) {
      try {
        return respuesta.json({ autenticado: await tieneSesion(peticion) })
      } catch {
        return sesionNoDisponible(respuesta)
      }
    },
    async cerrar(peticion, respuesta) {
      const huella = leerHuella(peticion)
      try {
        if (huella && !await gestionarSesion('revocarSesionAdministrativa', huella)) return sesionNoDisponible(respuesta)
      } catch {
        return sesionNoDisponible(respuesta)
      }
      borrarCookie(respuesta)
      return respuesta.json({ autenticado: false })
    },
  }
}
