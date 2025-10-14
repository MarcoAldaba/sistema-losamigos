const express = require('express');
const router = express.Router();

// Ruta de prueba
router.post('/login', (req, res) => {
    res.json({ message: 'Ruta de login funcionando' });
});

router.post('/register', (req, res) => {
    res.json({ message: 'Ruta de registro funcionando' });
});

module.exports = router;
