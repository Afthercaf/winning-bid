import React from 'react';
import './Footer.css';
import logo from '../../assets/logo.png'; // Asegúrate de tener la ruta correcta de tu logo

const Footer = () => {
  return (
    <footer className="footer">
      {/* Sección de logo */}
      <div className="footer-logo-container">
        <img src={logo} alt="Logo" className="footer-logo" />
      </div>

      {/* Sección de Modelo de Negocios */}
      <div className="footer-sections">
        <div className="footer-column">
          <h4 className="footer-title">Vendedores</h4>
          <p>
            Publican productos para subasta o venta directa, alcanzando una audiencia amplia de compradores.
            La plataforma ofrece herramientas simples y eficientes para gestionar inventarios, fijar precios
            competitivos y promover ventas rápidas.
          </p>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">Compradores</h4>
          <p>
            Acceden a productos variados con precios competitivos y la opción de comprar en subasta o venta directa.
            Los compradores disfrutan de un entorno seguro y transparente, con funciones diseñadas para maximizar su experiencia de compra.
          </p>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">Objetivos</h4>
          <p>
            Crear una plataforma donde los usuarios puedan vender y comprar productos de manera fácil, segura y accesible.
            Nuestro propósito es promover una comunidad conectada por la confianza y la innovación.
          </p>
        </div>
      </div>

      {/* Línea de separación entre secciones */}
      <div className="footer-divider"></div>

      {/* Market App y contacto */}
      <div className="footer-contact">
        <div>
          <p>
            <a href="quienes-somos">¿Quiénes somos?</a> | <a href="como-funciona">Cómo funciona</a> | <a href="politicadeprivacidad">Política de privacidad</a> |{' '}
            <a href="terminosycondiciones">Términos y condiciones</a>
          </p>
        </div>
        <div className="footer-contact-details">
          <p>Contáctanos: MarketApp@gmail.com</p>
          <p>Redes sociales: Facebook | Instagram</p> 
        </div>
      </div>

      {/* Línea de separación final */}
      <div className="footer-bottom">
        <p>©2024 MarketApp - Apoyando a la segunda mano</p>
      </div>
    </footer>
  );
};

export default Footer;
