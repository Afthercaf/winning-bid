import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaEnvelope, FaUsers, FaBoxOpen, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './Sidebar.css';
import miLogo from '../../assets/logo.png'; // Asegúrate de que la ruta sea correcta

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar cualquier dato del usuario almacenado en el estado o localStorage
    // Ejemplo: localStorage.removeItem('token');
    alert('Cerrando sesión...');
    navigate('/login'); // Redirecciona al usuario a la página de inicio de sesión
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={miLogo} alt="Logo" className="logo-image" />
        <span className="logo-text">MarketApp</span>
      </div>
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <Link to="/Dashboard" className="sidebar-link">
            <FaHome className="sidebar-icon" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/Pedidos" className="sidebar-link">
            <FaEnvelope className="sidebar-icon" />
            <span>Pedidos</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/Clientes" className="sidebar-link">
            <FaUsers className="sidebar-icon" />
            <span>Clientes</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/Productos" className="sidebar-link">
            <FaBoxOpen className="sidebar-icon" />
            <span>Productos</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/" className="sidebar-link">
            <FaSignInAlt className="sidebar-icon" />
            <span>Regresar al Home</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/logout" className="sidebar-link" onClick={handleLogout}>
            <FaUserPlus className="sidebar-icon" />
            <span>Cerrar Sesión</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
