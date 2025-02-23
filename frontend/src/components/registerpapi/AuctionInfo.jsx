import React from "react";
import { FaClock } from "react-icons/fa";

const AuctionInfo = ({ auctionData }) => {
  return (
    <div className="auction-details">
      <div className="auction-timer">
        <FaClock /> Tiempo restante: {auctionData.auctionEndTime || "Cargando..."}
      </div>
      <div className="current-bid-section">
        <p>Precio inicial: ${auctionData.startingPrice}</p>
        <p className="current-bid">Puja actual: ${auctionData.currentPrice}</p>
      </div>
    </div>
  );
};

export default AuctionInfo;

