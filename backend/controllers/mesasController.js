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
                p.total,
                p.estado as estado_pedido,
                u.nombre as nombre_garzon
            FROM mesa m
            LEFT JOIN LATERAL (
                SELECT * FROM pedido 
                WHERE id_mesa = m.id_mesa 
                  AND estado NOT IN ('pagado', 'cancelado')
                ORDER BY fecha_hora DESC
                LIMIT 1
            ) p ON true
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
                p.estado as estado_pedido,
                p.fecha_hora,
                u.nombre as nombre_garzon
            FROM mesa m
            LEFT JOIN LATERAL (
                SELECT * FROM pedido 
                WHERE id_mesa = m.id_mesa 
                  AND estado NOT IN ('pagado', 'cancelado')
                ORDER BY fecha_hora DESC
                LIMIT 1
            ) p ON true
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

// Abrir mesa (cambiar a ocupada y crear pedido)
const abrirMesa = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { id_garzon } = req.body;

        if (!id_garzon) {
            return res.status(400).json({ error: 'Se requiere id_garzon' });
        }

        await client.query('BEGIN');

        // Verificar que la mesa esté libre
        const mesaCheck = await client.query(
            'SELECT estado FROM mesa WHERE id_mesa = $1',
            [id]
        );

        if (mesaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        if (mesaCheck.rows[0].estado !== 'libre') {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: `La mesa está ${mesaCheck.rows[0].estado}. Solo se pueden abrir mesas libres.` 
            });
        }

        // Actualizar estado a ocupada
        await client.query(
            'UPDATE mesa SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id_mesa = $2',
            ['ocupada', id]
        );

        // Crear nuevo pedido
        const nuevoPedido = await client.query(`
            INSERT INTO pedido (id_mesa, id_garzon, estado, total)
            VALUES ($1, $2, 'pendiente', 0)
            RETURNING *
        `, [id, id_garzon]);

        await client.query('COMMIT');

        res.json({
            mensaje: 'Mesa abierta correctamente',
            pedido: nuevoPedido.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al abrir mesa:', error);
        res.status(500).json({ 
            error: 'Error al abrir mesa',
            detalles: error.message 
        });
    } finally {
        client.release();
    }
};

// Cerrar mesa (cambiar a libre)
const cerrarMesa = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // Verificar que no tenga pedidos activos
        const pedidoActivo = await client.query(`
            SELECT id_pedido, estado FROM pedido 
            WHERE id_mesa = $1 AND estado NOT IN ('pagado', 'cancelado')
        `, [id]);

        if (pedidoActivo.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: 'No se puede cerrar la mesa. Tiene pedidos activos.',
                pedido_activo: pedidoActivo.rows[0]
            });
        }

        // Cambiar estado a libre
        const result = await client.query(
            'UPDATE mesa SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id_mesa = $2 RETURNING *',
            ['libre', id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        await client.query('COMMIT');

        res.json({
            mensaje: 'Mesa cerrada correctamente',
            mesa: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al cerrar mesa:', error);
        res.status(500).json({ 
            error: 'Error al cerrar mesa',
            detalles: error.message 
        });
    } finally {
        client.release();
    }
};

// Reservar mesa
const reservarMesa = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE mesa SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id_mesa = $2 RETURNING *',
            ['reservada', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        res.json({
            mensaje: 'Mesa reservada correctamente',
            mesa: result.rows[0]
        });
    } catch (error) {
        console.error('Error al reservar mesa:', error);
        res.status(500).json({ 
            error: 'Error al reservar mesa',
            detalles: error.message 
        });
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
    abrirMesa,
    cerrarMesa,
    reservarMesa,
    obtenerEstadisticas
};