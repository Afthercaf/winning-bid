import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PrivacyPolicy.css'; // Asegúrate de tener el archivo CSS
import Footer from '../components/footer/Footer';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Regresar a la página anterior
  };

  return (
    <div className="privacy-policy-container">
         {/* Botón Regresar */}
      <button className="back-button" onClick={handleBackClick}>
      ← Regresar
      </button>

      <h1>Política de Privacidad</h1>

      <p><strong>En Market App entendemos lo importante que es para ti la privacidad y la seguridad de tu información personal.</strong></p>
      <p>
        Nuestra política de privacidad tiene como objetivo informarte de manera transparente sobre cómo recopilamos, utilizamos y protegemos tus datos personales. A continuación, te explicamos todo lo que necesitas saber para que puedas hacer uso de nuestra plataforma con confianza.
      </p>

      <h2>¿Qué Información Recopilamos?</h2>
      <ul>
        <li><strong>Información personal básica:</strong> Datos de registro: Al crear tu cuenta o registrarte en nuestro sitio, te pediremos que proporciones tu nombre, dirección de correo electrónico, número de teléfono y otros datos de contacto.</li>
        <li><strong>Información de pago:</strong> Cuando realices compras o ventas, solicitaremos los datos de tu tarjeta de crédito o débito, o detalles sobre otros métodos de pago (como PayPal), para procesar tus pagos de forma segura.</li>
        <li><strong>Información sobre las transacciones:</strong> Compras y ventas: Recopilamos información sobre los productos que compras o vendes a través de nuestra plataforma, incluyendo las cantidades, precios, métodos de pago y detalles de envío. Historial de pedidos: Guardamos un historial de todas las transacciones realizadas a través de tu cuenta, para que puedas acceder a ellos en cualquier momento.</li>
        <li><strong>Datos técnicos:</strong> Datos de conexión: Recopilamos información sobre el dispositivo desde el que accedes a nuestra plataforma, como la dirección IP, tipo de navegador, sistema operativo y configuración regional. Datos de interacción: Recopilamos datos sobre cómo interactúas con la plataforma, incluyendo las páginas que visitas, el tiempo que pasas en ellas y cualquier error o problema que puedas encontrar.</li>
        <li><strong>Información de cookies y tecnologías similares:</strong> Cookies: Utilizamos cookies (archivos pequeños que se guardan en tu dispositivo) para ofrecerte una experiencia más personalizada y mejorar el rendimiento de la plataforma. Puedes configurar tu navegador para aceptar o rechazar cookies, aunque si las desactivas algunas funcionalidades de nuestra plataforma pueden no estar disponibles.</li>
      </ul>

      <h2>¿Cómo Usamos Tu Información?</h2>
      <ul>
        <li>Para procesar tus pedidos y transacciones: Gestión de compras y ventas: Usamos tu información para completar las compras y ventas que realizas, procesar pagos, gestionar el envío de productos y ofrecerte soporte en caso de que sea necesario.</li>
        <li>Verificación de identidad: Usamos tus datos para verificar tu identidad en caso de ser necesario, especialmente si se trata de un pedido de alto valor o si detectamos alguna actividad sospechosa.</li>
        <li>Para mejorar nuestra plataforma y servicios: Mejorar la experiencia de usuario: Analizamos tu interacción con la plataforma para optimizar su funcionamiento y hacerla más fácil de usar. Esto incluye la personalización de tu experiencia en base a tus preferencias y comportamiento de compra. Mejorar la seguridad: Utilizamos los datos técnicos para identificar y solucionar problemas técnicos, además de prevenir fraudes y proteger tanto tu cuenta como las transacciones en la plataforma.</li>
        <li>Para enviarte notificaciones importantes: Notificaciones de pedidos: Te enviaremos correos electrónicos o mensajes dentro de la plataforma para informarte sobre el estado de tus pedidos, los productos que has comprado o vendido, y cualquier cambio relevante en tu cuenta. Ofertas y promociones: Si has consentido recibir comunicaciones de marketing, utilizaremos tu información para enviarte ofertas, promociones y actualizaciones sobre productos o servicios que puedan interesarte.</li>
        <li>Para cumplir con requisitos legales: En algunos casos, podemos usar tus datos para cumplir con nuestras obligaciones legales, como el cumplimiento de normativas fiscales, de protección al consumidor o de prevención de fraudes.</li>
      </ul>

      <h2>Seguridad de Tus Datos</h2>
      <ul>
        <li><strong>Protección mediante encriptación:</strong> Utilizamos tecnología de encriptación avanzada (SSL/TLS) para proteger la transmisión de datos sensibles, como tu información de pago y datos personales.</li>
        <li><strong>Protección contra accesos no autorizados:</strong> Implementamos protocolos de seguridad para garantizar que solo personal autorizado pueda acceder a tu información personal. Además, almacenamos la información de forma segura, y protegemos los sistemas que alojan tus datos mediante cortafuegos y otros mecanismos de seguridad.</li>
        <li><strong>Monitorización de seguridad:</strong> Realizamos auditorías de seguridad periódicas para identificar vulnerabilidades y proteger la plataforma frente a amenazas cibernéticas.</li>
      </ul>

      <h2>Derechos del Usuario sobre Sus Datos</h2>
      <ul>
        <li><strong>Acceso:</strong> Tienes derecho a solicitar acceso a la información que tenemos sobre ti en cualquier momento. Esto incluye la capacidad de obtener una copia de tus datos personales que almacenamos.</li>
        <li><strong>Rectificación:</strong> Si alguna de tus informaciones es incorrecta o incompleta, puedes corregirla directamente desde tu perfil en la plataforma, o solicitarnos que lo hagamos por ti.</li>
        <li><strong>Eliminación:</strong> Puedes solicitar la eliminación de tu cuenta y toda la información asociada a ella en cualquier momento. Toma en cuenta que es posible que tengamos que retener ciertos datos por razones legales, como el cumplimiento de normativas fiscales.</li>
        <li><strong>Portabilidad de los Datos:</strong> Tienes derecho a solicitar que te entreguemos tus datos en un formato estructurado y legible, y a transferirlos a otro servicio si lo deseas.</li>
        <li><strong>Oposición al tratamiento de datos:</strong> Puedes oponerte al tratamiento de tus datos para fines específicos, como el marketing directo. En caso de que decidas ejercer este derecho, dejaremos de utilizar tus datos para esos fines, pero seguiríamos procesándolos para otras finalidades relacionadas con la gestión de la plataforma.</li>
      </ul>

      <h2>Cómo Ejercer Tus Derechos</h2>
      <p>
        Si deseas ejercer cualquiera de estos derechos o tienes alguna pregunta sobre cómo gestionamos tu información personal, puedes ponerte en contacto con nosotros a través de los siguientes medios:
      </p>
      <p><strong>Correo electrónico:</strong> privacidad@marketapp.com</p>
      <p><strong>Formulario de contacto:</strong> Puedes acceder a nuestra sección de "Contacto" en la plataforma para enviar una solicitud.</p>
      <p>Te responderemos lo antes posible y nos aseguraremos de procesar tu solicitud de acuerdo con la legislación vigente sobre protección de datos.</p>

      <h2>Modificaciones a esta Política de Privacidad</h2>
      <p>
        Nos reservamos el derecho de modificar o actualizar esta Política de Privacidad en cualquier momento para adaptarla a cambios en nuestras prácticas de recopilación de datos o a nuevas normativas legales. En caso de que realicemos cambios sustanciales, te notificaremos por correo electrónico o mediante un aviso en la plataforma.
      </p>
      <p>
        Te recomendamos revisar periódicamente esta sección para estar al tanto de cualquier actualización.
      </p>

     

      {/* Footer */}
      <Footer></Footer>
    </div>
  );
};

export default PrivacyPolicy;
