import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/productos', icon: '🍽️', label: 'Productos' },
    { path: '/mesas', icon: '🪑', label: 'Mesas' },
    { path: '/pedidos', icon: '📝', label: 'Pedidos' },
    { path: '/caja', icon: '💰', label: 'Caja' },
    { path: '/reportes', icon: '📈', label: 'Reportes' },
  ];

  // Filtrar según rol
  const filteredMenu = user?.rol === 'garzon' 
    ? menuItems.filter(item => ['Mesas', 'Pedidos'].includes(item.label))
    : menuItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">🍴 Los Amigos</div>
        <div className="user-info">
          <span className="user-name">{user?.nombre}</span>
          <span className="user-role">{user?.rol}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="logout-btn"
          onClick={logout}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;