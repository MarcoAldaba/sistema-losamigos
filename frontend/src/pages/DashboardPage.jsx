import '../styles/Dashboard.css';

function DashboardPage() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="dashboard-container">
      <h1>Bienvenido, {userData.nombre}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>Pedidos Hoy</h3>
            <p className="stat-value">45</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Ventas Hoy</h3>
            <p className="stat-value">Bs. 3,450</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-info">
            <h3>Mesas Ocupadas</h3>
            <p className="stat-value">12 / 60</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-info">
            <h3>Productos</h3>
            <p className="stat-value">85</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Accesos Rápidos</h2>
        <div className="actions-grid">
          <button className="action-btn">➕ Nuevo Pedido</button>
          <button className="action-btn">📋 Ver Pedidos</button>
          <button className="action-btn">🍽️ Gestionar Menú</button>
          <button className="action-btn">💵 Abrir Caja</button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;