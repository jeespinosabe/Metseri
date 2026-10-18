import app from './api/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor de Metseri ejecutándose en http://localhost:${PORT}`);
});