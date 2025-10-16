const express = require('express');
const router = express.Router();
const {
    obtenerMesas,
    obtenerMesaPorId,
    cambiarEstadoMesa,
    obtenerEstadisticas
} = require('../controllers/mesasController');

// Rutas
router.get('/', obtenerMesas);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerMesaPorId);
router.patch('/:id/estado', cambiarEstadoMesa);

module.exports = router;