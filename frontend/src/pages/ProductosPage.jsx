import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Productos.css';

function ProductosPage() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Cargar productos y categorías
    useEffect(() => {
        cargarDatos();
    }, [categoriaSeleccionada]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Cargar categorías
            const resCategorias = await api.get('/productos/categorias');
            setCategorias(resCategorias.data);

            // Cargar productos
            const params = categoriaSeleccionada 
                ? { categoria: categoriaSeleccionada } 
                : {};
            
            const resProductos = await api.get('/productos', { params });
            setProductos(resProductos.data);
            
            setError('');
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleDisponibilidad = async (id, disponibleActual) => {
        try {
            const producto = productos.find(p => p.id_producto === id);
            await api.put(`/productos/${id}`, {
                ...producto,
                disponible: !disponibleActual
            });
            cargarDatos();
        } catch (err) {
            console.error('Error al actualizar producto:', err);
            alert('Error al actualizar el producto');
        }
    };

    // Filtrar productos por búsqueda
    const productosFiltrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="productos-page">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1>🍽️ Los Amigos</h1>
                    <div className="header-user">
                        <span>{user?.nombre} ({user?.rol})</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            {/* Filtros */}
            <div className="filtros">
                <div className="filtros-content">
                    <h2>Productos del Menú</h2>
                    
                    <div className="filtros-group">
                        {/* Buscador */}
                        <input
                            type="text"
                            placeholder="🔍 Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input-busqueda"
                        />

                        {/* Filtro de categorías */}
                        <select
                            value={categoriaSeleccionada}
                            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                            className="select-categoria"
                        >
                            <option value="">📋 Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>

                        <button className="btn-nuevo">+ Nuevo Producto</button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <main className="main-content">
                {loading ? (
                    <div className="loading">Cargando productos...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="productos-grid">
                        {productosFiltrados.length === 0 ? (
                            <div className="no-productos">
                                No se encontraron productos
                            </div>
                        ) : (
                            productosFiltrados.map(producto => (
                                <div 
                                    key={producto.id_producto} 
                                    className={`producto-card ${!producto.disponible ? 'no-disponible' : ''}`}
                                >
                                    <div className="producto-header">
                                        <h3>{producto.nombre}</h3>
                                        <span className="producto-precio">
                                            Bs. {parseFloat(producto.precio).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="producto-info">
                                        <span className="producto-categoria">
                                            📁 {producto.categoria_nombre}
                                        </span>
                                        <span className="producto-tiempo">
                                            ⏱️ {producto.tiempo_preparacion} min
                                        </span>
                                    </div>

                                    {producto.descripcion && (
                                        <p className="producto-descripcion">
                                            {producto.descripcion}
                                        </p>
                                    )}

                                    {producto.volumen && (
                                        <span className="producto-volumen">
                                            📏 {producto.volumen}
                                        </span>
                                    )}

                                    {producto.porciones > 1 && (
                                        <span className="producto-porciones">
                                            👥 {producto.porciones} personas
                                        </span>
                                    )}

                                    <div className="producto-actions">
                                        <button 
                                            className={`btn-disponible ${producto.disponible ? 'activo' : 'inactivo'}`}
                                            onClick={() => toggleDisponibilidad(producto.id_producto, producto.disponible)}
                                        >
                                            {producto.disponible ? '✅ Disponible' : '❌ No disponible'}
                                        </button>
                                        <button className="btn-editar">✏️ Editar</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ProductosPage;