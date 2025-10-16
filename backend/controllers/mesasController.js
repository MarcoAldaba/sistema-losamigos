const pool = require('../config/database');

// Obtener todas las mesas
const obtenerMesas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.id_mesa,
                m.numero,
                m.capacidad,
                m.estado,
                m.updated_at,
                p.id_pedido,
                u.nombre as nombre_garzon
            FROM mesa m
            LEFT JOIN pedido p ON m.id_mesa = p.id_mesa 
                AND p.estado NOT IN ('pagado', 'cancelado')
            LEFT JOIN usuario u ON p.id_garzon = u.id_usuario
            ORDER BY m.numero
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener mesas:', error);
        res.status(500).json({ 
            error: 'Error al obtener mesas',
            detalles: error.message 
        });
    }
};

// Obtener una mesa por ID
const obtenerMesaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                m.*,
                p.id_pedido,
                p.total,
                p.fecha_hora,
                u.nombre as nombre_garzon
            FROM mesa m
            LEFT JOIN pedido p ON m.id_mesa = p.id_mesa 
                AND p.estado NOT IN ('pagado', 'cancelado')
            LEFT JOIN usuario u ON p.id_garzon = u.id_usuario
            WHERE m.id_mesa = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener mesa:', error);
        res.status(500).json({ 
            error: 'Error al obtener mesa',
            detalles: error.message 
        });
    }
};

// Cambiar estado de una mesa
const cambiarEstadoMesa = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { estado, id_garzon } = req.body;

        // Validar estado
        const estadosValidos = ['libre', 'ocupada', 'reservada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ 
                error: 'Estado inválido',
                estadosValidos 
            });
        }

        await client.query('BEGIN');

        // Actualizar estado de la mesa
        const result = await client.query(
            'UPDATE mesa SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id_mesa = $2 RETURNING *',
            [estado, id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        // Si la mesa pasa a "ocupada", crear un nuevo pedido
        if (estado === 'ocupada' && id_garzon) {
            await client.query(`
                INSERT INTO pedido (id_mesa, id_garzon, estado, total)
                VALUES ($1, $2, 'pendiente', 0)
            `, [id, id_garzon]);
        }

        // Si la mesa pasa a "libre", verificar que no tenga pedidos activos
        if (estado === 'libre') {
            const pedidoActivo = await client.query(`
                SELECT id_pedido FROM pedido 
                WHERE id_mesa = $1 AND estado NOT IN ('pagado', 'cancelado')
            `, [id]);

            if (pedidoActivo.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    error: 'No se puede liberar la mesa. Tiene pedidos activos.' 
                });
            }
        }

        await client.query('COMMIT');

        res.json({
            mensaje: 'Estado de mesa actualizado correctamente',
            mesa: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al cambiar estado de mesa:', error);
        res.status(500).json({ 
            error: 'Error al cambiar estado de mesa',
            detalles: error.message 
        });
    } finally {
        client.release();
    }
};

// Obtener estadísticas de mesas
const obtenerEstadisticas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_mesas,
                COUNT(*) FILTER (WHERE estado = 'libre') as mesas_libres,
                COUNT(*) FILTER (WHERE estado = 'ocupada') as mesas_ocupadas,
                COUNT(*) FILTER (WHERE estado = 'reservada') as mesas_reservadas
            FROM mesa
        `);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ 
            error: 'Error al obtener estadísticas',
            detalles: error.message 
        });
    }
};

module.exports = {
    obtenerMesas,
    obtenerMesaPorId,
    cambiarEstadoMesa,
    obtenerEstadisticas
};