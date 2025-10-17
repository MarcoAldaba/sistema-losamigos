const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener usuarios por rol
router.get('/', async (req, res) => {
    try {
        const { rol } = req.query;
        
        let query = 'SELECT id_usuario, nombre, usuario, rol FROM usuario WHERE activo = true';
        const params = [];
        
        if (rol) {
            query += ' AND rol = $1';
            params.push(rol);
        }
        
        query += ' ORDER BY nombre';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

module.exports = router;