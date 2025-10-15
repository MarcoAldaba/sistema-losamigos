const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Rutas públicas (no requieren autenticación)
router.get('/', productosController.getAllProductos);
router.get('/categorias', productosController.getCategorias);
router.get('/:id', productosController.getProductoById);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, checkRole('admin', 'bar'), productosController.createProducto);
router.put('/:id', verifyToken, checkRole('admin', 'bar'), productosController.updateProducto);
router.delete('/:id', verifyToken, checkRole('admin'), productosController.deleteProducto);

module.exports = router;