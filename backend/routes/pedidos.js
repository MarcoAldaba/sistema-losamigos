const express = require('express');
const router = express.Router();

// Ruta de prueba
router.get('/', (req, res) => {
    res.json({ message: 'Ruta de pedidos funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Crear pedido funcionando' });
});

module.exports = router;
