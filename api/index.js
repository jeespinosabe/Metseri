import express from 'express';
import { crearConsultaSupabase } from './servicios/consultaSupabase.js';
import { crearRutasContenido } from './rutas/contenidoCeleste.js';
import { crearRutasAdministracion } from './rutas/administracion.js';
import { crearAutenticacionAdmin } from './servicios/autenticacionAdmin.js';

export function crearAplicacion({ consulta = crearConsultaSupabase(), autenticacion = crearAutenticacionAdmin() } = {}) {
    const app = express();

    // Ruta para comprobar que la API funciona; no depende de Supabase.
    app.get('/api/estado', (req, res) => {
        res.status(200).json({
            proyecto: 'Metseri',
            mensaje: 'API de Metseri funcionando correctamente',
            estado: 'activo'
        });
    });

    app.use('/api/admin', express.json(), crearRutasAdministracion(autenticacion));
    app.use('/api/cuerpos-celestes', crearRutasContenido(consulta));
    return app;
}

export default crearAplicacion();
