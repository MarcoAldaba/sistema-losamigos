import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import '../styles/Navbar.css';
import logo from '../assets/logo.png';


function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/productos', icon: '🍽️', label: 'Productos' },
    { path: '/mesas', icon: '🪑', label: 'Mesas' },
    { path: '/pedidos', icon: '📝', label: 'Pedidos' },
    { path: '/caja', icon: '💰', label: 'Caja' },
    { path: '/reportes', icon: '📈', label: 'Reportes' },
  ];

  const filteredMenu = user?.rol === 'garzon' 
    ? menuItems.filter(item => ['Mesas', 'Pedidos'].includes(item.label))
    : menuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <img 
            src={logo}
            alt="Los Amigos" 
            className="navbar-logo"
            onError={(e) => {
              // Fallback si no se encuentra la imagen
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <span className="navbar-logo-fallback">🍴 Los Amigos</span>
        </Link>

        {/* Menu Desktop */}
        <div className="navbar-menu">
          {filteredMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Usuario y Logout */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.nombre}</span>
            <span className="user-role">{user?.rol}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Salir
          </button>
        </div>

        {/* Hamburger Menu Mobile */}
        <button 
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="navbar-mobile">
          {filteredMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-mobile-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </Link>
          ))}
          <button className="navbar-mobile-logout" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;