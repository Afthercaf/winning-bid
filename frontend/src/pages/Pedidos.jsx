import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import api from '../../api'; // Importar `api` en lugar de `axios`
import './Pedidos.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('/orders');
        setPedidos(response.data);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  return (
    <div className="pedidos-container">
      <Sidebar />
      <div className="pedidos-content">
        <h1 className="pedidos-title">Pedidos</h1>
        <div className="metricas-rapidas">
          <p>Total de Pedidos: {pedidos.length}</p>
          <p>Pedidos Pendientes: {pedidos.filter(pedido => pedido.status === 'pendiente').length}</p>
          <p>Pedidos Completados: {pedidos.filter(pedido => pedido.status === 'completado').length}</p>
          <p>Pedidos Cancelados: {pedidos.filter(pedido => pedido.status === 'cancelado').length}</p>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="ID o Cliente" />
        </div>
        {loading ? (
          <p>Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p>Aún no se realizan pedidos...</p>
        ) : (
          <table className="pedidos-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido, index) => (
                <tr key={index}>
                  <td>{pedido._id}</td>
                  <td>{pedido.buyer_id?.name || "Cliente no disponible"}</td>
                  <td>{new Date(pedido.created_at).toLocaleDateString()}</td>
                  <td>{pedido.status}</td>
                  <td>${pedido.price}</td>
                  <td>
                    <button className="button-detail">Ver Detalles</button>
                    {pedido.status === 'pendiente' && (
                      <>
                        <button className="button-complete">Completar</button>
                        <button className="button-cancel">Cancelar</button>
                      </>
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

export default Pedidos;
