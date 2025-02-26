import React from 'react';
import '../styles/HowItWorks.css';
import { useNavigate } from 'react-router-dom'; // Actualiza la importación a useNavigate
import Footer from '../components/footer/Footer';

const HowItWorks = () => {
  const navigate = useNavigate(); // Reemplaza useHistory por useNavigate

  // Función para regresar a la página anterior
  const handleRegresar = () => {
    navigate(-1); // Navega hacia la página anterior
  };

  return (
    <div className="how-it-works-container">
      {/* Botón "Regresar" */}
      <button className="back-button" onClick={handleRegresar}>
        ← Regresar
      </button>

      {/* Sección "Proceso de Compra" */}
      <section className="section">
        <h2 className="section-title">Proceso de Compra</h2>
        <ol>
          <li><strong>Selecciona un Producto:</strong> Explora las categorías y encuentra el producto que deseas comprar. Puedes filtrar por precio, ubicación o condiciones para encontrar lo que más te interesa.</li>
          <li><strong>Elige el Método de Envío:</strong> Tienes la opción de elegir entre envío a domicilio o recogida presencial en la tienda o con el vendedor directamente. Si eliges el envío, el producto será entregado por la empresa de transporte que selecciones, o si prefieres un encuentro en persona, se acuerda el lugar de recogida.</li>
          <li><strong>Realiza el Pago:</strong> Asegura tu compra a través de nuestros métodos de pago seguros, ya sea mediante tarjeta de crédito, débito o pagos a través de plataformas como PayPal.</li>
          <li><strong>Recibe tu Producto:</strong> Si eliges el envío, el producto te llegará en un plazo de 2 a 4 días hábiles, dependiendo del tipo de envío y la ubicación. Si prefieres la opción presencial, el vendedor y tú se pondrán de acuerdo para el encuentro.</li>
        </ol>
      </section>

      {/* Sección "Proceso de Venta" */}
      <section className="section">
        <h2 className="section-title">Proceso de Venta</h2>
        <ol>
          <li><strong>Publica tu Producto:</strong> Sube fotos claras y una descripción detallada de lo que vendes. También podrás establecer un precio y decidir si prefieres hacer envíos o si el comprador tendrá que recoger el producto en persona.</li>
          <li><strong>Gestiona tu Venta:</strong> Una vez que el comprador se interese, recibirás una notificación. Tienes la opción de comunicarte con ellos a través de la plataforma para resolver cualquier duda o detalle.</li>
          <li><strong>Envío o Entrega Presencial:</strong> Si el comprador opta por un envío, tendrás un plazo de 5 días naturales para enviar el producto. Si el comprador prefiere recogerlo en persona, se pondrán de acuerdo en el lugar y momento.</li>
        </ol>
      </section>

      {/* Sección "Subastas" */}
      <section className="section">
        <h2 className="section-title">Subastas</h2>
        <p>
          En Market App, ofrecemos una opción de subasta, donde los compradores pueden hacer ofertas por los productos.
          Puedes configurar un precio inicial y un tiempo de duración para la subasta. ¡Cuanto más competitivo sea el precio, más interés atraerás!
        </p>
        <ul>
          <li><strong>Subasta Normal:</strong> Puedes poner productos a subasta en cualquier momento, permitiendo que los compradores ofrezcan lo que están dispuestos a pagar.</li>
          <li><strong>Subasta Flash:</strong> ¡Una subasta rápida para ofertas limitadas! Los compradores tienen solo unas horas para hacer su oferta. Esto le da a los productos un toque de urgencia, fomentando una mayor participación.</li>
        </ul>
      </section>

      {/* Sección "Beneficios" */}
      <section className="section">
        <h2 className="section-title">Beneficios</h2>
        <ul>
          <li><strong>Productos Revisados:</strong> Todos los productos vendidos en Market App son cuidadosamente revisados para garantizar que estén en las mejores condiciones posibles antes de ser enviados o entregados.</li>
          <li><strong>Métodos de Pago Seguros:</strong> Disfruta de transacciones seguras con opciones de pago que protegen tanto a compradores como a vendedores.</li>
          <li><strong>Opciones de Envío Flexibles:</strong> Puedes elegir si prefieres que te envíen el producto o si deseas recogerlo en persona.</li>
        </ul>
      </section>

      {/* Sección de confianza */}
      <section className="section">
        <h2 className="section-title">Transacciones Seguras</h2>
        <p>
          Con Market App, tanto compradores como vendedores tienen la certeza de realizar transacciones seguras, fáciles y rápidas.
        </p>
      </section>
      <Footer></Footer>
    </div>
  );
};

export default HowItWorks;
