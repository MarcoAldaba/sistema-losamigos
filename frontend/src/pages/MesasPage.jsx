import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Mesas.css';

function MesasPage() {
  const { user } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [garzones, setGarzones] = useState([]);
  const [garzonSeleccionado, setGarzonSeleccionado] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Cargar mesas y estadísticas
  useEffect(() => {
    cargarMesas();
    cargarEstadisticas();
    cargarGarzones();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      cargarMesas();
      cargarEstadisticas();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarMesas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mesas');
      const data = await response.json();
      setMesas(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mesas/estadisticas');
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarGarzones = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios?rol=garzon');
      const data = await response.json();
      setGarzones(data);
    } catch (error) {
      console.error('Error al cargar garzones:', error);
    }
  };

  const abrirModal = (mesa) => {
    setMesaSeleccionada(mesa);
    setGarzonSeleccionado(user?.id_usuario || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setMesaSeleccionada(null);
    setGarzonSeleccionado('');
  };

  const abrirMesa = async () => {
    if (!garzonSeleccionado) {
      alert('Selecciona un garzón');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/mesas/${mesaSeleccionada.id_mesa}/abrir`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_garzon: garzonSeleccionado })
        }
      );

      if (response.ok) {
        alert('Mesa abierta correctamente');
        cargarMesas();
        cargarEstadisticas();
        cerrarModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al abrir mesa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al abrir mesa');
    }
  };

  const cerrarMesaHandler = async (mesa) => {
    if (!confirm(`¿Cerrar la mesa ${mesa.numero}?`)) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/mesas/${mesa.id_mesa}/cerrar`,
        { method: 'POST' }
      );

      if (response.ok) {
        alert('Mesa cerrada correctamente');
        cargarMesas();
        cargarEstadisticas();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al cerrar mesa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar mesa');
    }
  };

  const reservarMesa = async (mesa) => {
    if (!confirm(`¿Reservar la mesa ${mesa.numero}?`)) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/mesas/${mesa.id_mesa}/reservar`,
        { method: 'POST' }
      );

      if (response.ok) {
        alert('Mesa reservada correctamente');
        cargarMesas();
        cargarEstadisticas();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al reservar mesa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reservar mesa');
    }
  };

  const mesasFiltradas = mesas.filter(mesa => {
    if (filtroEstado === 'todas') return true;
    return mesa.estado === filtroEstado;
  });

  if (loading) {
    return <div className="loading">Cargando mesas...</div>;
  }

  return (
    <div className="mesas-page">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="mesas-estadisticas">
          <div className="stat-card stat-total">
            <span className="stat-icon">🪑</span>
            <div className="stat-info">
              <span className="stat-label">Total Mesas</span>
              <span className="stat-value">{estadisticas.total_mesas}</span>
            </div>
          </div>
          <div className="stat-card stat-libres">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-label">Libres</span>
              <span className="stat-value">{estadisticas.mesas_libres}</span>
            </div>
          </div>
          <div className="stat-card stat-ocupadas">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-label">Ocupadas</span>
              <span className="stat-value">{estadisticas.mesas_ocupadas}</span>
            </div>
          </div>
          <div className="stat-card stat-reservadas">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <span className="stat-label">Reservadas</span>
              <span className="stat-value">{estadisticas.mesas_reservadas}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mesas-filtros">
        <h2>Gestión de Mesas</h2>
        <div className="filtros-botones">
          <button 
            className={filtroEstado === 'todas' ? 'active' : ''}
            onClick={() => setFiltroEstado('todas')}
          >
            Todas
          </button>
          <button 
            className={filtroEstado === 'libre' ? 'active' : ''}
            onClick={() => setFiltroEstado('libre')}
          >
            Libres
          </button>
          <button 
            className={filtroEstado === 'ocupada' ? 'active' : ''}
            onClick={() => setFiltroEstado('ocupada')}
          >
            Ocupadas
          </button>
          <button 
            className={filtroEstado === 'reservada' ? 'active' : ''}
            onClick={() => setFiltroEstado('reservada')}
          >
            Reservadas
          </button>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="mesas-grid">
        {mesasFiltradas.map(mesa => (
          <div 
            key={mesa.id_mesa} 
            className={`mesa-card mesa-${mesa.estado}`}
          >
            <div className="mesa-header">
              <span className="mesa-numero">Mesa {mesa.numero}</span>
              <span className={`mesa-badge badge-${mesa.estado}`}>
                {mesa.estado === 'libre' && '✅'}
                {mesa.estado === 'ocupada' && '👥'}
                {mesa.estado === 'reservada' && '📅'}
                {mesa.estado.toUpperCase()}
              </span>
            </div>

            <div className="mesa-info">
              <div className="info-item">
                <span className="info-icon">👤</span>
                <span className="info-text">Capacidad: {mesa.capacidad} personas</span>
              </div>

              {mesa.nombre_garzon && (
                <div className="info-item">
                  <span className="info-icon">🙋</span>
                  <span className="info-text">Garzón: {mesa.nombre_garzon}</span>
                </div>
              )}

              {mesa.id_pedido && (
                <div className="info-item">
                  <span className="info-icon">📝</span>
                  <span className="info-text">Pedido #{mesa.id_pedido}</span>
                </div>
              )}
            </div>

            <div className="mesa-acciones">
              {mesa.estado === 'libre' && (
                <>
                  <button 
                    className="btn btn-abrir"
                    onClick={() => abrirModal(mesa)}
                  >
                    🔓 Abrir
                  </button>
                  <button 
                    className="btn btn-reservar"
                    onClick={() => reservarMesa(mesa)}
                  >
                    📅 Reservar
                  </button>
                </>
              )}

              {mesa.estado === 'ocupada' && (
                <>
                  <button 
                    className="btn btn-ver"
                    onClick={() => alert(`Ver pedido #${mesa.id_pedido}`)}
                  >
                    👁️ Ver Pedido
                  </button>
                  <button 
                    className="btn btn-cerrar"
                    onClick={() => cerrarMesaHandler(mesa)}
                  >
                    🔒 Cerrar
                  </button>
                </>
              )}

              {mesa.estado === 'reservada' && (
                <button 
                  className="btn btn-abrir"
                  onClick={() => abrirModal(mesa)}
                >
                  ✅ Confirmar Llegada
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para abrir mesa */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Abrir Mesa {mesaSeleccionada?.numero}</h3>
              <button className="modal-close" onClick={cerrarModal}>✖</button>
            </div>

            <div className="modal-body">
              <p>Capacidad: {mesaSeleccionada?.capacidad} personas</p>
              
              <div className="form-group">
                <label>Selecciona el garzón responsable:</label>
                <select 
                  value={garzonSeleccionado}
                  onChange={(e) => setGarzonSeleccionado(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Seleccionar garzón --</option>
                  {garzones.map(garzon => (
                    <option key={garzon.id_usuario} value={garzon.id_usuario}>
                      {garzon.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="btn btn-confirmar" onClick={abrirMesa}>
                Abrir Mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesasPage;