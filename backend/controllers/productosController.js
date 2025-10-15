const pool = require('../config/database');

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
    try {
        const { categoria, disponible, tipo_venta } = req.query;
        
        let query = `
            SELECT p.*, c.nombre as categoria_nombre 
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // Filtros opcionales
        if (categoria) {
            query += ` AND p.id_categoria = $${paramCount}`;
            params.push(categoria);
            paramCount++;
        }

        if (disponible !== undefined) {
            query += ` AND p.disponible = $${paramCount}`;
            params.push(disponible === 'true');
            paramCount++;
        }

        if (tipo_venta) {
            query += ` AND p.tipo_venta = $${paramCount}`;
            params.push(tipo_venta);
            paramCount++;
        }

        query += ' ORDER BY c.nombre, p.nombre';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ 
            message: 'Error al obtener productos',
            error: error.message 
        });
    }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, c.nombre as categoria_nombre 
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ 
            message: 'Error al obtener producto',
            error: error.message 
        });
    }
};

// Crear nuevo producto
exports.createProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            id_categoria,
            tiempo_preparacion,
            tipo_venta,
            porciones,
            volumen,
            disponible_dias,
            disponible
        } = req.body;

        // Validaciones
        if (!nombre || !precio || !id_categoria) {
            return res.status(400).json({ 
                message: 'Nombre, precio y categoría son obligatorios' 
            });
        }

        const query = `
            INSERT INTO producto (
                nombre, descripcion, precio, id_categoria, 
                tiempo_preparacion, tipo_venta, porciones, 
                volumen, disponible_dias, disponible
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            nombre,
            descripcion || null,
            precio,
            id_categoria,
            tiempo_preparacion || 15,
            tipo_venta || 'plato',
            porciones || 1,
            volumen || null,
            disponible_dias || 'todos',
            disponible !== undefined ? disponible : true
        ];

        const result = await pool.query(query, values);
        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ 
            message: 'Error al crear producto',
            error: error.message 
        });
    }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            precio,
            id_categoria,
            tiempo_preparacion,
            tipo_venta,
            porciones,
            volumen,
            disponible_dias,
            disponible
        } = req.body;

        const query = `
            UPDATE producto 
            SET nombre = $1,
                descripcion = $2,
                precio = $3,
                id_categoria = $4,
                tiempo_preparacion = $5,
                tipo_venta = $6,
                porciones = $7,
                volumen = $8,
                disponible_dias = $9,
                disponible = $10,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_producto = $11
            RETURNING *
        `;

        const values = [
            nombre,
            descripcion,
            precio,
            id_categoria,
            tiempo_preparacion,
            tipo_venta,
            porciones,
            volumen,
            disponible_dias,
            disponible,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({
            message: 'Producto actualizado exitosamente',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ 
            message: 'Error al actualizar producto',
            error: error.message 
        });
    }
};

// Eliminar producto (soft delete)
exports.deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete: solo marcamos como no disponible
        const query = `
            UPDATE producto 
            SET disponible = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_producto = $1
            RETURNING *
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({
            message: 'Producto desactivado exitosamente',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ 
            message: 'Error al eliminar producto',
            error: error.message 
        });
    }
};

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
    try {
        const query = `
            SELECT * FROM categoria 
            WHERE activo = true 
            ORDER BY nombre
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ 
            message: 'Error al obtener categorías',
            error: error.message 
        });
    }
};