import app from './api/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
    if (error) {
        console.error(error.code === 'EADDRINUSE'
            ? `No se pudo iniciar la API: el puerto ${PORT} está ocupado. Detén el proceso que lo usa o cambia PORT en .env.`
            : `No se pudo iniciar la API: ${error.message}`);
        process.exitCode = 1;
        return;
    }
    console.log(`Servidor de Metseri ejecutándose en http://localhost:${PORT}`);
});
