import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import api from '../../api'; // Importamos `api` en lugar de `axios`
import CategoriesModal from '../components/CategoriesButton/CategoriesModal'; // Asegúrate de que la ruta es correcta
import './AdminProduct.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const productsPerPage = 10;

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get('/products'); // Usamos `api` para la solicitud
        setProductos(response.data);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // Filtrar productos según el término de búsqueda
  const filteredProducts = productos.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.seller_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
  );

  // Calcular paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página en cada nueva búsqueda
  };

  return (
    <div className="productos-container">
      <Sidebar />
      <div className="productos-content">
        <h1 className="productos-title">Productos</h1>
        
        <div className="product-summary">
          <span>Total de Productos: {productos.length}</span>
          <span>Productos Activos: {productos.filter(product => product.isActive).length}</span>
          <span>Productos Inactivos: {productos.filter(product => !product.isActive).length}</span>
        </div>
        
        <div className="actions">
          <button onClick={toggleModal} className="categories-button">
            Categorías
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar producto o cliente"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        {loading ? (
          <p>Cargando productos...</p>
        ) : currentProducts.length === 0 ? (
          <p>Aún no se han registrado productos...</p>
        ) : (
          <table className="productos-table">
            <thead>
              <tr>
                <th>ID Producto</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Cliente</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {currentProducts.map((product, index) => (
    <tr key={index}>
      <td>{indexOfFirstProduct + index + 1}</td>
      <td>{product.name}</td>
      <td>{product.category}</td>
      <td>{product.seller_id?.name || "Sin información"}</td>
      <td>${product.price}</td>
      <td>{product.stock || 0}</td>
      <td>{product.isActive ? "Activo" : "Inactivo"}</td>
      <td>
        <button className="action-button view-button">Ver Detalles</button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        )}
        
        {/* Paginación */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Modal de categorías */}
        {isModalOpen && <CategoriesModal closeModal={toggleModal} />}
      </div>
    </div>
  );
};

export default Productos;
