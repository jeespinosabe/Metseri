import express from 'express';

const app = express();

app.use(express.json());

// Ruta para comprobar que la API funciona
app.get('/api/estado', (req, res) => {
    res.status(200).json({
        proyecto: 'Metseri',
        mensaje: 'API de Metseri funcionando correctamente',
        estado: 'activo'
    });
});

export default app;