import React from 'react';
import './WhoWeAre.css';
import { useNavigate } from 'react-router-dom'; // Actualiza la importación a useNavigate
import Footer from '../components/footer/Footer';

const WhoWeAre = () => {
  const navigate = useNavigate(); // Reemplaza useHistory por useNavigate

  // Función para regresar a la página anterior
  const handleRegresar = () => {
    navigate(-1); // Navega hacia la página anterior
  };

  return (
    <div className="who-we-are-container">
      {/* Botón "Regresar" */}
      <button className="back-button" onClick={handleRegresar}>
        ← Regresar
      </button>

      {/* Sección "Quiénes Somos" */}
      <section className="section">
        <h2 className="section-title">Quiénes Somos</h2>
        <p>
          En Market App, creemos en un nuevo modelo de consumo que va más allá de la simple compra y venta de productos.
          Somos una plataforma que conecta a personas que buscan lo mejor en variedad, calidad y precios, con artículos
          revisados y garantizados, provenientes de diversas fuentes confiables.
        </p>
      </section>

      {/* Sección "Nuestra Misión" */}
      <section className="section">
        <h2 className="section-title">Nuestra Misión</h2>
        <p>
          Facilitar que todos puedan acceder a productos electrónicos y otros artículos de calidad a precios justos, a través
          de un servicio confiable, sencillo y directo. Ayudamos a nuestros clientes a aprovechar al máximo sus recursos,
          ofreciéndoles opciones de productos que cumplen con altos estándares de calidad, mientras fomentamos una economía
          más sostenible.
        </p>
      </section>

      {/* Sección "Nuestra Historia" */}
      <section className="section">
        <h2 className="section-title">Nuestra Historia</h2>
        <p>
          Market App es una iniciativa reciente nacida de la necesidad de ofrecer a los consumidores una nueva forma de
          encontrar productos de excelente calidad sin comprometer su presupuesto. Nos inspiramos en un modelo de negocio que
          pone a disposición de nuestros usuarios productos garantizados, revisados y cuidadosamente seleccionados, con el
          objetivo de hacer que cada compra sea una experiencia satisfactoria. Contamos con un equipo de profesionales con
          experiencia en el sector de tecnología y comercio, comprometidos con entregar un servicio excepcional. Además,
          trabajamos estrechamente con una red de casas de empeño, lo que nos permite ofrecer productos a precios accesibles
          sin sacrificar la calidad.
        </p>
      </section>

      {/* Sección "Nuestros Valores" */}
      <section className="section">
        <h2 className="section-title">Nuestros Valores</h2>
        <ul className="values-list">
          <li><strong>Compromiso con la Sostenibilidad:</strong> Creemos que la clave para un futuro mejor es un consumo más responsable. A través de Market App, impulsamos la compra de productos revisados, asegurándonos de darles una nueva vida y reduciendo el impacto ambiental de la producción en masa.</li>
          <li><strong>Transparencia y Confianza:</strong> Queremos que nuestros clientes se sientan seguros al comprar con nosotros. Cada producto que vendemos es inspeccionado y garantizado, y nuestra plataforma es transparente en cuanto a precios y condiciones.</li>
          <li><strong>Economía Eficiente:</strong> Fomentamos un modelo de consumo dinámico y responsable, donde nuestros usuarios pueden tanto encontrar productos a precios más bajos como vender aquellos que ya no necesitan, contribuyendo a una economía circular.</li>
          <li><strong>Atención Personalizada:</strong> El corazón de Market App es nuestro servicio al cliente. Estamos comprometidos en ofrecer una experiencia de compra y venta que sea simple, segura y placentera para todos nuestros usuarios.</li>
        </ul>
      </section>

      {/* Sección "¿Por qué elegirnos?" */}
      <section className="section">
        <h2 className="section-title">¿Por qué elegirnos?</h2>
        <p>
          Porque en Market App, no solo compras productos, compras confianza, calidad y responsabilidad. Te ofrecemos una
          plataforma fácil de usar, con una variedad de productos electrónicos y más, todo respaldado por nuestro compromiso
          con la calidad y la satisfacción del cliente.
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default WhoWeAre;
