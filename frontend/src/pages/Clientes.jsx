import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import api from '../../api'; // Importa `api` en lugar de `axios`
import '../styles/Clientes.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get('/users'); // Usa `api` para realizar la solicitud
        setClientes(response.data);
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  // Filtrar clientes según el término de búsqueda
  const filteredClients = clientes.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página en cada nueva búsqueda
  };

  return (
    <div className="clientes-container">
      <Sidebar />
      <div className="clientes-content">
        <h1 className="clientes-title">Clientes</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Nombre o Email"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {loading ? (
          <p>Cargando clientes...</p>
        ) : currentClients.length === 0 ? (
          <p>Aún no se han registrado clientes...</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha de Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map((client, index) => (
                <tr key={index}>
                  <td>{indexOfFirstClient + index + 1}</td>
                  <td>
                    <img
                      src={`https://winning-bid-zmiw.onrender.com/${client.avatar}`}
                      alt="Avatar"
                      className="avatar-img"
                    />
                  </td>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td>{client.active ? "Activo" : "Inactivo"}</td>
                  <td>
                    <button className="action-button view-button">Ver Detalles</button>
                    <button className={`action-button toggle-button ${client.active ? 'button-deactivate' : 'button-activate'}`}>
                      {client.active ? "Desactivar" : "Activar"}
                    </button>
                    <button className="action-button delete-button">Eliminar</button>
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
      </div>
    </div>
  );
};

export default Clientes;
