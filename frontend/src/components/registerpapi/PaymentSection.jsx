import React from "react";

const PaymentSection = ({ auctionData }) => {
  return (
    <div className="payment-section">
      <button>Pagar con OXXO</button>
      {auctionData.barcodeUrl && <img src={auctionData.barcodeUrl} alt="Código de barras OXXO" />}
      {auctionData.paymentReference && <p>Referencia de pago: {auctionData.paymentReference}</p>}
    </div>
  );
};

export default PaymentSection;
