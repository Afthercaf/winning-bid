import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClock, FaUser,  } from "react-icons/fa";
import io from "socket.io-client";
import Navbar from "../components/navbar/navbarComponent";

import api from "../../api";
import { AuthContext } from "../context/AuthContext";
import "../styles/DetallesAllProducts.css";

const DetallesAllProducts = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [auctionData, setAuctionData] = useState({
    currentPrice: 0,
    startingPrice: 0,
    topBids: [],
    auctionEndTime: null,
    auctionStatus: "pendiente",
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  const [barcodeUrl, setBarcodeUrl] = useState(null);

  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return null;

    const now = new Date().getTime();
    const difference = new Date(endTime).getTime() - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  useEffect(() => {
    const newSocket = io("https://winning-bid.onrender.com");
    setSocket(newSocket);

    newSocket.emit("joinRoom", productId);

    newSocket.on("bidUpdate", (data) => {
      if (data.productId === productId) {
        setAuctionData((prevData) => ({
          ...prevData,
          currentPrice: data.currentPrice,
          topBids: data.topBids,
        }));
      }
    });

    newSocket.on("auctionTimeUpdate", (data) => {
      if (data.productId === productId) {
        setAuctionData((prevData) => ({
          ...prevData,
          auctionEndTime: data.auctionEndTime,
          auctionStatus: data.status,
        }));
      }
    });

    return () => newSocket.disconnect();
  }, [productId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (auctionData.auctionEndTime) {
        setTimeRemaining(calculateTimeRemaining(auctionData.auctionEndTime));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionData.auctionEndTime]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productResponse = await api.get(`/products/${productId}`);
        setProduct(productResponse.data);
        setSelectedImage(productResponse.data.images[0]);

        if (productResponse.data.type === "subasta") {
          const auctionResponse = await api.get(`/bids/${productId}/bids`);
          setAuctionData({
            currentPrice: productResponse.data.currentPrice,
            startingPrice: productResponse.data.startingPrice,
            topBids: auctionResponse.data.bids || [],
            auctionEndTime: productResponse.data.auctionEndTime,
            auctionStatus: auctionResponse.data.status,
          });
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);
  const placeBid = async (amount) => {
    console.log(`Puja realizada por monto: ${amount}`);
    try {
      if (!userId) {
        navigate("/login");
        return;
      }
  
      const bidData = {
        productId,
        userId,
        bidAmount: amount,
        timestamp: new Date(),
      };
  
      await api.post(`/bids/${productId}/bid-j`, bidData);
    } catch (error) {
      console.error("Error al realizar la puja:", error);
      alert("Error al realizar la puja");
    }
  };
  

  const isValidBid = (amount) => {
    return amount > auctionData.currentPrice && !timeRemaining?.expired;
  };

  const renderTimeRemaining = () => {
    if (!timeRemaining) return "Cargando...";
    if (timeRemaining.expired) return "Subasta finalizada";
    return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  const createPaymentOrder = async () => {
    try {
      const response = await api.post("https://winning-bid.onrender.com/api/orders/crear-orden", {
        productId,
        userId,
        amount: auctionData.currentPrice,
      });

      const { reference, barcodeUrl, orderId } = response.data;
      setPaymentReference(reference);
      setBarcodeUrl(barcodeUrl);

      navigate(`/winner/${orderId}`);
    } catch (error) {
      console.error("Error al crear la orden de pago:", error);
      alert("Error al crear la orden de pago");
    }
  };

  if (!product) return <div>Cargando...</div>;

  return (
    
    
    <div className="product-details-page">
      <div className="ayudi">
      <Navbar></Navbar>
    </div>
      <p
      onClick={() => navigate(-1)}
      className="regresar-botom"
    >
      <FaArrowLeft className="back-icon" 
      
      />
      Regresar
    </p>

      <div className="product-details-container">
        <div className="product-gallery">
          <div className="thumbnails">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Miniatura ${index + 1}`}
                className={selectedImage === img ? "selected" : ""}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
          <div className="main-image">
            <img src={selectedImage} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <div className="auction-header">
            <h2>{product.name}</h2>



          </div>

          <div className="auction-details">
          <div className="auction-timer">
        <FaClock /> <span className="remaining-time">Tiempo restante:</span> <span className="time">{renderTimeRemaining()}</span>
        </div>

            <div className="current-bid-section">
              <p>Precio inicial: ${auctionData.startingPrice.toFixed(2)}</p>
              <p className="current-bid">Puja actual: ${auctionData.currentPrice}</p>
            </div>

            
    <p className="mejjores">Puja para ganar</p>
    <div className="bid-controls">
    {product.pujas.map((amount, index) => (
      <button
        key={index}
        onClick={() => placeBid(amount)}
        disabled={!isValidBid(amount)}
        className="bid-button"
      >
        ${amount}
      </button>
    ))}
  </div>

            
            <h3 className="mepu">Mejores Pujas</h3>
            <div className="top-bids">
              
              {auctionData.topBids.slice(0, 3).map((bid, index) => (
                <div key={index} className="bid-item">
                  <FaUser /> {bid.userName}: ${bid.bidAmount.toFixed(2)}
                </div>
              ))}
            </div>

            {timeRemaining?.expired && auctionData.topBids[0]?.userId === userId && (
              <div className="payment-section">
                <button onClick={createPaymentOrder}>Pagar con OXXO</button>
                {barcodeUrl && <img src={barcodeUrl} alt="Código de barras OXXO" />}
                {paymentReference && <p>Referencia de pago: {paymentReference}</p>}
              </div>
            )}
          </div>

          <div className="product-description">
            <p className="descrpe"> Descripción Del Producto</p>
            {product.description}
          </div>
          
        </div>
        
      </div >
      <div >
    </div>
    
     </div>
  );
};

export default DetallesAllProducts;