import React from 'react';
import '../styles/PrivacyPolicy.css';  // Importa el archivo CSS
import { useNavigate } from 'react-router-dom'; // Usamos useNavigate en lugar de useHistory
import Footer from '../components/footer/Footer'; // Asegúrate de que Footer está correctamente importado

const PrivacyPolicy = () => {
  const navigate = useNavigate(); // Usamos useNavigate para la navegación

  const handleBackClick = () => {
    navigate(-1); // Regresa a la página anterior
  };

  return (
    <div className="privacy-policy-container">
      {/* Botón "Regresar" */}
      <button onClick={handleBackClick} className="back-button">← Regresar</button>

      {/* Sección "Política de Privacidad" */}
      <section className="section">
        <h1 className="section-title">Terminos y condiciones</h1>
        <p>
        Bienvenido a Market App. Al utilizar nuestros servicios, aceptas estar sujeto a estos Términos y Condiciones, los cuales son esenciales para garantizar una experiencia segura, justa y eficiente para todos nuestros usuarios. A continuación, te explicamos de manera detallada las reglas y normas que debes seguir al interactuar con nuestra plataforma.

        </p>
      </section>

      {/* Sección "¿Qué Información Recopilamos?" */}
      <section className="section">
        <h2 className="section-title">Uso del Servicio</h2>
        <p>Market App pone a tu disposición una plataforma que facilita la compra y venta de productos de diversos tipos, incluyendo opciones de subasta y venta directa. Al utilizar nuestros servicios, te comprometes a cumplir con las siguientes normas:</p>
        <ul>
          <li><strong></strong>
            <ul>
              <li><strong></strong> gistro y autenticidad: Debes proporcionar información veraz, precisa y actualizada al registrarte y crear una cuenta. Es tu responsabilidad mantener la confidencialidad de tus credenciales de acceso (nombre de usuario y contraseña) y asegurarte de que nadie más acceda a tu cuenta sin tu permiso.
Compra y venta de productos: Solo podrás publicar productos que estén permitidos en nuestra plataforma, siguiendo las políticas de venta establecidas. Cualquier producto ilegal, prohibido o que infrinja derechos de propiedad intelectual no está permitido.
Cumplimiento de leyes locales: Al vender o comprar productos, te comprometes a cumplir con todas las leyes y regulaciones aplicables en tu país de residencia, incluidas, pero no limitadas a, las leyes de protección al consumidor, normativas fiscales y de propiedad intelectual.</li>
              <li><strong>Información de pago:</strong> Cuando realices compras o ventas, solicitaremos los datos de tu tarjeta de crédito o débito, o detalles sobre otros métodos de pago (como PayPal), para procesar tus pagos de forma segura.</li>
            </ul>
          </li>
          <li><strong>Información sobre las transacciones:</strong>
            <ul>
              <li><strong>Compras y ventas:</strong> Recopilamos información sobre los productos que compras o vendes a través de nuestra plataforma, incluyendo las cantidades, precios, métodos de pago y detalles de envío.</li>
              <li><strong>Historial de pedidos:</strong> Guardamos un historial de todas las transacciones realizadas a través de tu cuenta, para que puedas acceder a ellos en cualquier momento.</li>
            </ul>
          </li>
          <li><strong>Datos técnicos:</strong>
            <ul>
              <li><strong>Datos de conexión:</strong> Recopilamos información sobre el dispositivo desde el que accedes a nuestra plataforma, como la dirección IP, tipo de navegador, sistema operativo y configuración regional.</li>
              <li><strong>Datos de interacción:</strong> Recopilamos datos sobre cómo interactúas con la plataforma, incluyendo las páginas que visitas, el tiempo que pasas en ellas y cualquier error o problema que puedas encontrar.</li>
            </ul>
          </li>
          <li><strong>Información de cookies y tecnologías similares:</strong>
            <ul>
              <li><strong>Cookies:</strong> Utilizamos cookies (archivos pequeños que se guardan en tu dispositivo) para ofrecerte una experiencia más personalizada y mejorar el rendimiento de la plataforma. Puedes configurar tu navegador para aceptar o rechazar cookies, aunque si las desactivas algunas funcionalidades de nuestra plataforma pueden no estar disponibles.</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Sección "¿Cómo Usamos Tu Información?" */}
      <section className="section">
        <h2 className="section-title">¿Cómo Usamos Tu Información?</h2>
        <p>La información que recopilamos nos ayuda a ofrecerte un mejor servicio. A continuación te explicamos cómo utilizamos tus datos:</p>
        <ul>
          <li><strong>Para procesar tus pedidos y transacciones:</strong>
            <ul>
              <li><strong>Gestión de compras y ventas:</strong> Usamos tu información para completar las compras y ventas que realizas, procesar pagos, gestionar el envío de productos y ofrecerte soporte en caso de que sea necesario.</li>
              <li><strong>Verificación de identidad:</strong> Usamos tus datos para verificar tu identidad en caso de ser necesario, especialmente si se trata de un pedido de alto valor o si detectamos alguna actividad sospechosa.</li>
            </ul>
          </li>
          <li><strong>Para mejorar nuestra plataforma y servicios:</strong>
            <ul>
              <li><strong>Mejorar la experiencia de usuario:</strong> Analizamos tu interacción con la plataforma para optimizar su funcionamiento y hacerla más fácil de usar. Esto incluye la personalización de tu experiencia en base a tus preferencias y comportamiento de compra.</li>
              <li><strong>Mejorar la seguridad:</strong> Utilizamos los datos técnicos para identificar y solucionar problemas técnicos, además de prevenir fraudes y proteger tanto tu cuenta como las transacciones en la plataforma.</li>
            </ul>
          </li>
          <li><strong>Para enviarte notificaciones importantes:</strong>
            <ul>
              <li><strong>Notificaciones de pedidos:</strong> Te enviaremos correos electrónicos o mensajes dentro de la plataforma para informarte sobre el estado de tus pedidos, los productos que has comprado o vendido, y cualquier cambio relevante en tu cuenta.</li>
              <li><strong>Ofertas y promociones:</strong> Si has consentido recibir comunicaciones de marketing, utilizaremos tu información para enviarte ofertas, promociones y actualizaciones sobre productos o servicios que puedan interesarte.</li>
            </ul>
          </li>
          <li><strong>Para cumplir con requisitos legales:</strong>
            <ul>
              <li>En algunos casos, podemos usar tus datos para cumplir con nuestras obligaciones legales, como el cumplimiento de normativas fiscales, de protección al consumidor o de prevención de fraudes.</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Sección "Seguridad de Tus Datos" */}
      <section className="section">
        <h2 className="section-title">Seguridad de Tus Datos</h2>
        <p>La seguridad de tu información es nuestra prioridad. Implementamos diversas medidas para protegerla y garantizar que tus datos estén seguros mientras navegas y realizas transacciones en nuestra plataforma:</p>
        <ul>
          <li><strong>Protección mediante encriptación:</strong> Utilizamos tecnología de encriptación avanzada (SSL/TLS) para proteger la transmisión de datos sensibles, como tu información de pago y datos personales.</li>
          <li><strong>Protección contra accesos no autorizados:</strong> Implementamos protocolos de seguridad para garantizar que solo personal autorizado pueda acceder a tu información personal. Además, almacenamos la información de forma segura, y protegemos los sistemas que alojan tus datos mediante cortafuegos y otros mecanismos de seguridad.</li>
          <li><strong>Monitorización de seguridad:</strong> Realizamos auditorías de seguridad periódicas para identificar vulnerabilidades y proteger la plataforma frente a amenazas cibernéticas.</li>
        </ul>
      </section>

      {/* Sección "Derechos del Usuario sobre Sus Datos" */}
      <section className="section">
        <h2 className="section-title">Derechos del Usuario sobre Sus Datos</h2>
        <p>En Market App, respetamos tus derechos sobre tu información personal. Como usuario, tienes los siguientes derechos:</p>
        <ul>
          <li><strong>Acceso:</strong> Tienes derecho a solicitar acceso a la información que tenemos sobre ti en cualquier momento. Esto incluye la capacidad de obtener una copia de tus datos personales que almacenamos.</li>
          <li><strong>Rectificación:</strong> Si alguna de tus informaciones es incorrecta o incompleta, puedes corregirla directamente desde tu perfil en la plataforma, o solicitarnos que lo hagamos por ti.</li>
          <li><strong>Eliminación:</strong> Puedes solicitar la eliminación de tu cuenta y toda la información asociada a ella en cualquier momento. Toma en cuenta que es posible que tengamos que retener ciertos datos por razones legales, como el cumplimiento de normativas fiscales.</li>
          <li><strong>Portabilidad de los Datos:</strong> Tienes derecho a solicitar que te entreguemos tus datos en un formato estructurado y legible, y a transferirlos a otro servicio si lo deseas.</li>
          <li><strong>Oposición al tratamiento de datos:</strong> Puedes oponerte al tratamiento de tus datos para fines específicos, como el marketing directo. En caso de que decidas ejercer este derecho, dejaremos de utilizar tus datos para esos fines, pero seguiríamos procesándolos para otras finalidades relacionadas con la gestión de la plataforma.</li>
        </ul>
      </section>

      {/* Sección "Cómo Ejercer Tus Derechos" */}
      <section className="section">
        <h2 className="section-title">Cómo Ejercer Tus Derechos</h2>
        <p>Si deseas ejercer cualquiera de estos derechos o tienes alguna pregunta sobre cómo gestionamos tu información personal, puedes ponerte en contacto con nosotros a través de los siguientes medios:</p>
        <ul>
          <li><strong>Correo electrónico:</strong> privacidad@marketapp.com</li>
          <li><strong>Formulario de contacto:</strong> Puedes acceder a nuestra sección de "Contacto" en la plataforma para enviar una solicitud.</li>
        </ul>
        <p>Te responderemos lo antes posible y nos aseguraremos de procesar tu solicitud de acuerdo con la legislación vigente sobre protección de datos.</p>
      </section>

      {/* Sección "Modificaciones a esta Política de Privacidad" */}
      <section className="section">
        <h2 className="section-title">Modificaciones a esta Política de Privacidad</h2>
        <p>Nos reservamos el derecho de modificar o actualizar esta Política de Privacidad en cualquier momento para adaptarla a cambios en nuestras prácticas de recopilación de datos o a nuevas normativas legales. En caso de que realicemos cambios sustanciales, te notificaremos por correo electrónico o mediante un aviso en la plataforma.</p>
        <p>Te recomendamos revisar periódicamente esta sección para estar al tanto de cualquier actualización.</p>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
