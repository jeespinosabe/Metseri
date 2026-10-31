import { Router } from 'express'

export function crearRutasAdministracion(autenticacion) {
  const rutas = Router()
  rutas.post('/sesion', (peticion, respuesta) => autenticacion.iniciar(peticion, respuesta))
  rutas.get('/sesion', (peticion, respuesta) => autenticacion.consultar(peticion, respuesta))
  rutas.delete('/sesion', (peticion, respuesta) => autenticacion.cerrar(peticion, respuesta))
  rutas.get('/', autenticacion.exigirAdministrador, (_peticion, respuesta) => {
    respuesta.json({ modulo: 'administracion', acceso: 'autorizado' })
  })
  return rutas
}
