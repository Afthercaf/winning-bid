import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './DailyDeals.css';

const DailyDeals2 = () => {
  const [dailyDeals, setDailyDeals] = useState([]);
  const [dailyAuctions, setDailyAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch daily deals (ventas)
    const fetchDailyDeals = async () => {
      try {
        const response = await api.get('/products/daily-deals');
        const filteredDeals = response.data.filter((product) => product.type === 'venta');
        setDailyDeals(filteredDeals);
      } catch (error) {
        console.error('Error fetching daily deals:', error);
      }
    };

    // Fetch daily auctions (subastas)
    const fetchDailyAuctions = async () => {
      try {
        const response = await api.get('/products/daily-auctions');
        setDailyAuctions(response.data);
      } catch (error) {
        console.error('Error fetching daily auctions:', error);
      }
    };

    fetchDailyDeals();
    fetchDailyAuctions();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/detallesallproducts/${productId}`);
  };

  return (
    <div className="deals-section-container">
      <div className="daily-deals-container">
        <h2 className="daily-deals-title">Ventas del Día</h2>
        <div className="daily-deals-grid">
          {dailyDeals.map((product) => (
            <div
              className="daily-deal-card"
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: 'pointer' }} // Para indicar que es clickeable
            >
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150'}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">${product.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="daily-auctions-container">
        <h2 className="daily-auctions-title">Subastas del Día</h2>
        <div className="daily-deals-grid">
          {dailyAuctions.map((product) => (
            <div
              className="daily-deal-card"
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: 'pointer' }} // Para indicar que es clickeable
            >
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150'}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-starting-price">Precio inicial: ${product.startingPrice}</p>
              <p className="auction-end-time">Termina: {new Date(product.auctionEndTime).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyDeals2;
