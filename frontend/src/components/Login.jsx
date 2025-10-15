import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Login.css';

function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🔍 Intentando login con:', { usuario, password });

        try {
            console.log('📡 Enviando petición a:', api.defaults.baseURL + '/auth/login');

            const response = await api.post('/auth/login', {
                usuario,
                password
            });

            console.log('✅ Respuesta del servidor:', response.data);

            const { token, user } = response.data;
            login(user, token);

            console.log('👤 Usuario logueado:', user);
            console.log('🔀 Redirigiendo a /dashboard');

            // Redirigir según el rol
            switch (user.rol) {
                case 'admin':
                    navigate('/dashboard');
                    break;
                case 'garzon':
                    navigate('/pedidos');
                    break;
                case 'jefe_cocina':
                    navigate('/cocina');
                    break;
                case 'bar':
                    navigate('/productos');
                    break;
                default:
                    navigate('/dashboard');
            }
        } catch (err) {
            console.error('❌ Error completo:', err);
            console.error('❌ Respuesta del error:', err.response);

            // Manejo mejorado de errores
            if (err.response) {
                // El servidor respondió con un error
                const errorMessage = err.response.data?.message ||
                    `Error ${err.response.status}: ${err.response.statusText}`;
                setError(errorMessage);
            } else if (err.request) {
                // La petición se hizo pero no hubo respuesta
                setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            } else {
                // Error al configurar la petición
                setError('Error al iniciar sesión: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Club Social Recreo Los Amigos</h1>
                <h2>Iniciar Sesión</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="usuario">Usuario</label>
                        <input
                            type="text"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="login-info">
                    <p>Usuario de prueba: <strong>admin</strong></p>
                    <p>Contraseña: <strong>123456</strong></p>
                </div>
            </div>
        </div>
    );
}

export default Login;