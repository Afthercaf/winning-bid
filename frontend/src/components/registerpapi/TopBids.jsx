import React from "react";
import { FaUser } from "react-icons/fa";

const TopBids = ({ topBids }) => {
  return (
    <div className="top-bids">
      <h3>Mejores Pujas</h3>
      {topBids.slice(0, 3).map((bid, index) => (
        <div key={index} className="bid-item">
          <FaUser /> {bid.userName}: ${bid.bidAmount}
        </div>
      ))}
    </div>
  );
};

export default TopBids;
