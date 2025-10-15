import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Bienvenido, <strong>{user?.nombre}</strong></p>
            <p>Rol: <strong>{user?.rol}</strong></p>
            
            <button onClick={handleLogout} style={{ marginTop: '20px' }}>
                Cerrar Sesión
            </button>
        </div>
    );
}

export default DashboardPage;