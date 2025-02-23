import React from 'react';
import './Footer.css';

import logo from '../../assets/winningbid_lopgp-removebg-preview.png';
import { FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* 1️⃣ Logo e Introducción */}
        <div className="footer-section">
          <img src={logo} alt="WinningBid Logo" className="footer-logo" />
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>

        {/* 2️⃣ Sobre la Empresa */}
        <div className="footer-section">
          <h4>Empresa</h4>
          <p><a href="/about">Sobre nosotros</a></p>
          <p><a href="/services">Nuestros servicios</a></p>
        </div>

        {/* 3️⃣ Clientes y Soporte */}
        <div className="footer-section">
          <h4>Clientes</h4>
          <p><a href="/support">Soporte al cliente</a></p>
          <p><a href="/news">Cómo funciona?</a></p>
          <p><a href="/pricing">Por qué subastar?</a></p>
        </div>

        {/* 4️⃣ Información de Contacto */}
        <div className="footer-section">
          <h4>Contacto</h4>
          <p><FaEnvelope /> contacto@winningbid.com</p>
          <p><FaPhone /> +123 456 7890</p>
          <p><FaMapMarkerAlt /> Calle 123, Ciudad, País</p>
        </div>

      </div>

      {/* Pie de Página */}
      <div className="footer-bottom">
        <p>© 2024 WinningBid - Todos los derechos reservados</p>
        <div className="footer-links">
          <a href="/privacy">Política de privacidad</a>
          <a href="/legal">Aviso legal</a>
          <a href="/terms">Términos de servicio</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;













