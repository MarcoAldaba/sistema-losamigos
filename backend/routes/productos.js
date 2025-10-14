const express = require('express');
const router = express.Router();

// Ruta de prueba
router.get('/', (req, res) => {
    res.json({ message: 'Ruta de productos funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Crear producto funcionando' });
});

module.exports = router;
