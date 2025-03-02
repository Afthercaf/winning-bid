import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import logo from '../assets/xoo.png';
import './WinnerPage.css'; // Importar el archivo CSS

const Winner = () => {
  const { orderId } = useParams(); // Obtener `orderId` desde la URL
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setErrorMessage("No se proporcionó un ID de orden válido.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://winning-bid-zmiw.onrender.com/orders/${orderId}`);
        const text = await response.text();

        if (text.includes("<!doctype html>")) {
          throw new Error("Respuesta inesperada (HTML en lugar de JSON).");
        }

        if (!response.ok) {
          throw new Error('No se pudo obtener la información de la orden');
        }

        const data = JSON.parse(text);
        setOrderData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setErrorMessage(error.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Función para convertir imagen URL a Base64 usando fetch
  const toDataURL = url =>
    fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

  // Función para generar el PDF automáticamente
  const downloadBarcode = () => {
    // Función para descargar la imagen directamente
    const downloadImage = (url, filename) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    // Verifica si la URL del código de barras existe
    if (orderData && orderData.barcodeUrl) {
      downloadImage(orderData.barcodeUrl, 'codigo_barras.png');
    } else {
      alert("No se encontró la imagen del código de barras.");
    }
  };
  
  if (loading) {
    return <div className="winner-page">Cargando...</div>;
  }

  if (errorMessage) {
    return <div className="winner-page error-message">{errorMessage}</div>;
  }

  if (!orderData) {
    return <div className="winner-page">No se encontraron detalles para esta orden.</div>;
  }

  const { paymentReference, barcodeUrl, conektaDetails } = orderData;
  const totalAmount = conektaDetails?.amount ? (conektaDetails.amount / 100).toFixed(2) : "N/A";

  return (
    <div className="winner-page">

 {/* Imagen centrada */}
 <div className="imagxxo">
      <img src={logo} alt="Logo" className="centered-image" />
    </div>



      <h1>¡Felicidades! Eres el ganador de la subasta</h1>
      <p className="payment-reference"><strong>Referencia de pago:</strong> {paymentReference}</p>
      <p>Para completar tu pago en OXXO, usa el siguiente código de barras:</p>
      {barcodeUrl ? (
        <img src={barcodeUrl} alt="Código de barras OXXO" className="barcode-image" />
      ) : (
        <p>No hay código de barras disponible.</p>
      )}
      <p className="total-amount"><strong>Importe a pagar:</strong> ${totalAmount} MXN</p>
      <p>Escanea este código en cualquier tienda OXXO y proporciona el importe correcto.</p>
      <p>El código de barras es válido hasta la fecha de vencimiento indicada.</p>
      <button onClick={downloadBarcode} className="download-barcode-button">
  Generar Código de Barras
</button>
    </div>
  );
};

export default Winner;
