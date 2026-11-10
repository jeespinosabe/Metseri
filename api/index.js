import express from 'express';
import { crearConsultaSupabase } from './servicios/consultaSupabase.js';
import { crearRutasContenido } from './rutas/contenidoCeleste.js';
import { crearRutasAdministracion } from './rutas/administracion.js';
import { crearAutenticacionAdmin } from './servicios/autenticacionAdmin.js';
import { crearGestionLibros } from './servicios/gestionLibros.js';

export function crearAplicacion({ consulta = crearConsultaSupabase(), autenticacion = crearAutenticacionAdmin(), gestionLibros = crearGestionLibros() } = {}) {
    const app = express();

    // Ruta para comprobar que la API funciona; no depende de Supabase.
    app.get('/api/estado', (req, res) => {
        res.status(200).json({
            proyecto: 'Metseri',
            mensaje: 'API de Metseri funcionando correctamente',
            estado: 'activo'
        });
    });

    app.use('/api/admin', express.json({ limit: '64kb' }), crearRutasAdministracion(autenticacion, gestionLibros));
    app.use('/api/admin', (error, peticion, respuesta, siguiente) => {
        if (respuesta.headersSent) return siguiente(error);
        const estado = error.type === 'entity.too.large' ? 413 : 400;
        respuesta.status(estado).json({ error: { codigo: 'PETICION_INVALIDA', mensaje: 'Envía un objeto JSON válido de hasta 64 KB.' } });
    });
    app.use('/api/cuerpos-celestes', crearRutasContenido(consulta));
    return app;
}

export default crearAplicacion();
