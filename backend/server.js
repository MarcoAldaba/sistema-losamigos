const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ IMPORTANTE: CORS debe estar ANTES de las rutas
app.use(cors({
    origin: 'http://localhost:5173', // Frontend
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/productos', require('./routes/productos'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API Sistema Los Amigos funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});