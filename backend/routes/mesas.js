const express = require('express');
const router = express.Router();
const {
    obtenerMesas,
    obtenerMesaPorId,
    abrirMesa,
    cerrarMesa,
    reservarMesa,
    obtenerEstadisticas
} = require('../controllers/mesasController');

// Rutas
router.get('/', obtenerMesas);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerMesaPorId);
router.post('/:id/abrir', abrirMesa);      // Abrir mesa
router.post('/:id/cerrar', cerrarMesa);    // Cerrar mesa
router.post('/:id/reservar', reservarMesa); // Reservar mesa

module.exports = router;