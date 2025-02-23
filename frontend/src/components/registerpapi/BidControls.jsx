import React from "react";

const BidControls = ({ product, auctionData }) => {
  return (
    <div className="bid-controls">
      {product.pujas.map((amount, index) => (
        <button key={index} className="bid-button">
          ${amount}
        </button>
      ))}
    </div>
  );
};

export default BidControls;
