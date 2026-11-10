import { Router } from 'express'
import { ErrorLibros, esIdLibroValido, validarLibro } from '../servicios/gestionLibros.js'

export function crearRutasLibros(gestion, exigirAdministrador) {
  const rutas = Router()
  rutas.use(exigirAdministrador)
  rutas.param('id', (peticion, respuesta, siguiente, id) => {
    if (!esIdLibroValido(id)) return siguiente(new ErrorLibros(400, 'ID_LIBRO_INVALIDO', 'El identificador del libro no es válido.'))
    siguiente()
  })
  rutas.get('/', async (peticion, respuesta) => {
    const { limite = '50', desplazamiento = '0' } = peticion.query
    if (Object.keys(peticion.query).some((campo) => !['limite', 'desplazamiento'].includes(campo))
      || typeof limite !== 'string' || !/^\d{1,3}$/.test(limite) || +limite < 1 || +limite > 100
      || typeof desplazamiento !== 'string' || !/^\d{1,7}$/.test(desplazamiento)) {
      throw new ErrorLibros(400, 'PAGINACION_INVALIDA', 'Usa limite de 1 a 100 y desplazamiento entero desde cero.')
    }
    respuesta.json(await gestion.listar(+limite, +desplazamiento))
  })
  rutas.get('/:id', async (peticion, respuesta) => respuesta.json(await gestion.obtener(peticion.params.id)))
  rutas.post('/', async (peticion, respuesta) => {
    const libro = await gestion.guardar(null, validarLibro(peticion.body))
    respuesta.location(`/api/admin/libros/${libro.id}`).status(201).json(libro)
  })
  rutas.patch('/:id', async (peticion, respuesta) => {
    respuesta.json(await gestion.guardar(peticion.params.id, validarLibro(peticion.body, true)))
  })
  rutas.delete('/:id', async (peticion, respuesta) => {
    await gestion.eliminar(peticion.params.id)
    respuesta.status(204).end()
  })
  rutas.use((peticion, respuesta) => {
    respuesta.set('Allow', 'GET, HEAD, POST, PATCH, DELETE')
    respuesta.status(405).json({ error: { codigo: 'METODO_NO_PERMITIDO', mensaje: 'Método no permitido para los libros.' } })
  })
  rutas.use((error, peticion, respuesta, siguiente) => {
    if (respuesta.headersSent) return siguiente(error)
    const fallo = error instanceof ErrorLibros ? error : new ErrorLibros()
    respuesta.status(fallo.estado).json({ error: { codigo: fallo.codigo, mensaje: fallo.message } })
  })
  return rutas
}
