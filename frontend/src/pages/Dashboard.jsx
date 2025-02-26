import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import { FaDollarSign, FaBox, FaUser } from 'react-icons/fa';
import '../styles/Dashboard.css';
import api from '../../api'; // Importar `api` en lugar de `axios`
import SalesChart from '../components/SalesChart/SalesChart';
import Navbar from '../components/navbar/navbarComponent';

const Dashboard = () => {
  const [ganancias, setGanancias] = useState(0);
  const [cambioPorcentual, setCambioPorcentual] = useState(0);
  const [productosVendidos, setProductosVendidos] = useState(0);
  const [cambioProductos, setCambioProductos] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [cambioClientes, setCambioClientes] = useState(0);
  const [latestUsers, setLatestUsers] = useState([]);
  const [lastSoldProducts, setLastSoldProducts] = useState([]);

  useEffect(() => {
    const obtenerGanancias = async () => {
      try {
        const response = await api.get('/orders/ganancias');
        setGanancias(response.data.total || 0);
        setCambioPorcentual(response.data.cambioPorcentual || 0);
      } catch (error) {
        console.error("Error al obtener las ganancias:", error);
      }
    };

    const obtenerProductosVendidos = async () => {
      try {
        const response = await api.get('/orders/productos-vendidos');
        setProductosVendidos(response.data.total || 0);
        setCambioProductos(response.data.cambioPorcentual || 0);
      } catch (error) {
        console.error("Error al obtener productos vendidos:", error);
      }
    };

    const obtenerClientes = async () => {
      try {
        const response = await api.get('/users/count');
        setClientes(response.data.total || 0);
        setCambioClientes(response.data.cambioPorcentual || 0); 
      } catch (error) {
        console.error("Error al obtener el total de clientes:", error);
      }
    };

    const obtenerClientesRecientes = async () => {
      try {
        const response = await api.get('/users/latest');
        setLatestUsers(response.data);
      } catch (error) {
        console.error("Error al obtener los últimos clientes:", error);
      }
    };

    const obtenerUltimosProductosVendidos = async () => {
      try {
        const response = await api.get('/orders/last-sold-products');
        setLastSoldProducts(response.data);
      } catch (error) {
        console.error("Error al obtener los últimos productos vendidos:", error);
      }
    };

    obtenerGanancias();
    obtenerProductosVendidos();
    obtenerClientes();
    obtenerClientesRecientes();
    obtenerUltimosProductosVendidos();
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar></Navbar>
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="top-stats">
          <div className="stat-card">
            <FaDollarSign className="stat-icon" style={{ color: '#34D399' }} />
            <h2>Ganancias</h2>
            <p className="stat-value">${ganancias}</p>
            <p className={`stat-change ${cambioPorcentual > 0 ? 'positive' : cambioPorcentual < 0 ? 'negative' : ''}`}>
              {cambioPorcentual === 0 ? '→' : (cambioPorcentual > 0 ? '↗' : '↘')} {cambioPorcentual}% en el último mes
            </p>
          </div>
          <div className="stat-card">
            <FaBox className="stat-icon" style={{ color: '#F59E0B' }} />
            <h2>Productos Vendidos</h2>
            <p className="stat-value">{productosVendidos}</p>
            <p className={`stat-change ${cambioProductos > 0 ? 'positive' : cambioProductos < 0 ? 'negative' : ''}`}>
              {cambioProductos === 0 ? '→' : (cambioProductos > 0 ? '↗' : '↘')} {cambioProductos}% en el último mes
            </p>
          </div>
          <div className="stat-card">
            <FaUser className="stat-icon" style={{ color: '#6366F1' }} />
            <h2>Clientes</h2>
            <p className="stat-value">{clientes}</p>
            <p className="stat-change">→ 0% en el último mes</p>
          </div>
        </div>

        <div className="middle-stats">
          <div className="welcome-card">
            <h2>Bienvenido de nuevo,</h2>
            <h1>Juan Manuel</h1>
            <p>Estoy alegre de volverte a ver</p>
            <button className="record-button">Tap to record →</button>
          </div>
          <div className="additional-card">
            <SalesChart />
          </div>
        </div>

        <div className="bottom-stats">
          <div className="bottom-card">
            <h2>Últimos Clientes Agregados</h2>
            <ul className="clientes-list">
              {latestUsers.map((user, index) => (
                <li key={index} className="cliente-item">
                  <span className="cliente-icon">👤</span> {user.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="bottom-card">
            <h2>Productos Más Vendidos</h2>
            <ul>
              {lastSoldProducts.length > 0 ? (
                lastSoldProducts.map((product, index) => (
                  <li key={index}>{product.product_id.title}</li>
                ))
              ) : (
                <li>Aún no se venden productos...</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
