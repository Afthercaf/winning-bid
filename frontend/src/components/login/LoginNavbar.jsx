import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./LogNav.css";

const LoginNavbar = () => {
  const location = useLocation();

  return (
    <div className="login-navbar">
      <div className="login-navbar-logo">WinningBid</div>
      <nav className="login-navbar-links">
        <Link to="/terms" className="login-navbar-link">Términos y condiciones</Link>
        <Link to="/about-us" className="login-navbar-link">Acerca de nosotros</Link>
        <Link to="/privacy-policy" className="login-navbar-link">Política de privacidad</Link>
        <Link to="/login" className={`login-navbar-button ${location.pathname === '/login' ? 'active' : ''}`}>Iniciar Sesión</Link>
        <Link to="/register" className={`login-navbar-button ${location.pathname === '/register' ? 'active' : ''}`}>Registrarse</Link>
      </nav>
    </div>
  );
};

export default LoginNavbar;
