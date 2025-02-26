import React, { useEffect, useState, useContext } from 'react';
import '../styles/MyProducts.css';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../context/AuthContext';

const MyProducts = () => {
  const { userId } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/products/user-products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Agrega una llamada adicional para obtener el `orderId` de cada producto
        const productsWithOrders = await Promise.all(
          response.data.map(async (product) => {
            try {
              const orderResponse = await api.get(`/orders/product/${product._id}`);
              return { ...product, orderId: orderResponse.data[0]?._id || null };
            } catch (error) {
              console.error(`Error obteniendo órdenes para producto ${product._id}:`, error);
              return product;
            }
          })
        );

        setProducts(productsWithOrders);
        setFilteredProducts(productsWithOrders);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'todos' || (product.isActive ? 'activo' : 'inactivo') === statusFilter)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, statusFilter, products]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStatusFilter = (e) => setStatusFilter(e.target.value);

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/products/${productId}/status`, { isActive: newStatus });
      setProducts(products.map(product =>
        product._id === productId ? { ...product, isActive: newStatus } : product
      ));
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error);
    }
  };

  return (
    <div className="my-products-page">
      <div className="my-products-container">
        <button className="back-home-button" onClick={() => navigate('/')}>Regresar al Home</button>
        <h1 className="my-products-title">Mis Productos</h1>
        
        <div className="header-actions">
          <button className="create-product-button" onClick={() => navigate('/createproducts')}>
            Crear Producto
          </button>
        </div>

        <div className="summary">
          <span>Total de productos: {products.length}</span>
          <span>Activos: {products.filter(p => p.isActive).length}</span>
          <span>En subasta: {products.filter(p => p.type === 'subasta').length}</span>
        </div>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-bar"
          />
          <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {loading ? (
          <p>Cargando productos...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.isActive ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    {product.orderId ? (
                      <Link to={`/PedidoEstado/${product.orderId}`} className="action-button">
                        Detalles
                      </Link>
                    ) : (
                      'Sin orden'
                    )}
                    <button className="action-button delete" onClick={() => handleDelete(product._id)}>Eliminar</button>
                    {product.isActive ? (
                      <button
                        className="action-button deactivate"
                        onClick={() => handleToggleStatus(product._id, product.isActive)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="action-button activate"
                        onClick={() => handleToggleStatus(product._id, product.isActive)}
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
