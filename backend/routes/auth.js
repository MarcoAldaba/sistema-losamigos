const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta de login
router.post('/login', authController.login);

// Ruta protegida para obtener usuario actual
router.get('/me', authController.verifyToken, authController.getCurrentUser);

module.exports = router;