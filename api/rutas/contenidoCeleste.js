import { Router } from 'express';
import { ErrorConsulta, esSlugValido } from '../servicios/consultaSupabase.js';

function responderError(respuesta, estado, codigo, mensaje) {
    return respuesta.status(estado).json({ error: { codigo, mensaje } });
}

export function crearRutasContenido(consulta) {
    const rutasContenido = Router();
    rutasContenido.use((peticion, respuesta, siguiente) => {
        if (!['GET', 'HEAD'].includes(peticion.method)) {
            respuesta.set('Allow', 'GET, HEAD');
            return responderError(respuesta, 405, 'METODO_NO_PERMITIDO', 'Solo se permiten consultas GET y HEAD.');
        }
        siguiente();
    });

    rutasContenido.param('slug', (peticion, respuesta, siguiente, slug) => {
        if (!esSlugValido(slug)) {
            return responderError(respuesta, 400, 'SLUG_INVALIDO', 'El identificador del cuerpo celeste no es válido.');
        }
        siguiente();
    });

    rutasContenido.get('/', async (peticion, respuesta) => {
        respuesta.json(await consulta.listarCuerpos());
    });

    async function obtenerFichaVisible(slug, respuesta) {
        const ficha = await consulta.obtenerFicha(slug);
        if (ficha === null) {
            responderError(respuesta, 404, 'CUERPO_NO_ENCONTRADO', 'No se encontró el cuerpo celeste.');
        }
        return ficha;
    }

    rutasContenido.get('/:slug', async (peticion, respuesta) => {
        const ficha = await obtenerFichaVisible(peticion.params.slug, respuesta);
        if (ficha !== null) respuesta.json(ficha);
    });

    rutasContenido.get('/:slug/libros', async (peticion, respuesta) => {
        const ficha = await obtenerFichaVisible(peticion.params.slug, respuesta);
        if (ficha !== null) respuesta.json(await consulta.listarLibros(peticion.params.slug));
    });

    rutasContenido.use((error, peticion, respuesta, siguiente) => {
        if (respuesta.headersSent) return siguiente(error);
        if (error instanceof URIError) {
            return responderError(respuesta, 400, 'SLUG_INVALIDO', 'El identificador del cuerpo celeste no es válido.');
        }
        const fallo = error instanceof ErrorConsulta ? error : new ErrorConsulta();
        responderError(respuesta, 503, fallo.codigo, fallo.message);
    });

    return rutasContenido;
}
