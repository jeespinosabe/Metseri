import express from 'express';
import { crearConsultaSupabase } from './servicios/consultaSupabase.js';
import { crearRutasContenido } from './rutas/contenidoCeleste.js';

export function crearAplicacion({ consulta = crearConsultaSupabase() } = {}) {
    const app = express();

    // Ruta para comprobar que la API funciona; no depende de Supabase.
    app.get('/api/estado', (req, res) => {
        res.status(200).json({
            proyecto: 'Metseri',
            mensaje: 'API de Metseri funcionando correctamente',
            estado: 'activo'
        });
    });

    app.use('/api/cuerpos-celestes', crearRutasContenido(consulta));
    app.use(express.json());
    return app;
}

export default crearAplicacion();
