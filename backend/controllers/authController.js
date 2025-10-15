const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Validar datos
        if (!usuario || !password) {
            return res.status(400).json({ 
                message: 'Usuario y contraseña son requeridos' 
            });
        }

        // Buscar usuario en la base de datos
        const query = 'SELECT * FROM usuario WHERE usuario = $1 AND activo = true';
        const result = await pool.query(query, [usuario]);

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                message: 'Usuario o contraseña incorrectos' 
            });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ 
                message: 'Usuario o contraseña incorrectos' 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id_usuario: user.id_usuario, 
                usuario: user.usuario, 
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Responder con token y datos del usuario (sin password)
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                usuario: user.usuario,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error en el servidor',
            error: error.message 
        });
    }
};

// Verificar token (middleware)
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Obtener usuario actual
exports.getCurrentUser = async (req, res) => {
    try {
        const query = 'SELECT id_usuario, nombre, usuario, rol FROM usuario WHERE id_usuario = $1';
        const result = await pool.query(query, [req.user.id_usuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};