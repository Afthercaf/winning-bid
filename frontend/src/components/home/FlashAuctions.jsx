import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Flash.css";

// Flecha personalizada izquierda (prev)
const PrevArrow = ({ onClick }) => (
  <button className="slick-arrow slick-prev" onClick={onClick}>
    <FaChevronLeft size={30} />
  </button>
);

// Flecha personalizada derecha (next)
const NextArrow = ({ onClick }) => (
  <button className="slick-arrow slick-next" onClick={onClick}>
    <FaChevronRight size={30} />
  </button>
);

const FlashAuction = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchFlashAuctions = async () => {
      try {
        const response = await axios.get("https://winning-bid.onrender.com/api/products/subastasflas");
        setAuctions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("❌ Error al obtener las subastas flash:", error);
        setAuctions([]);
      }
    };

    fetchFlashAuctions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) => ({
          ...auction,
          timeLeft: Math.max(auction.timeLeft - 1, 0),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours < 10 ? "0" : ""}${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
   
  };

  if (auctions.length === 0) {
    return <div className="flash-loading">Cargando subastas flash...</div>;
  }

  return (
    <div className="flash-auction">
      <h2 className="flash-title">Subastas Flash</h2>
      <Slider {...settings}>
        {auctions.map((auction) => (
          <div className="flash-slide" key={auction._id}>
            <div className="flash-content">
              
              {/* Lado Izquierdo con Degradado y Texto */}
              <div className="flash-text-overlay">
                <div className="flash-gradient"></div> 
                <div className="flash-text">
                  <h3 className="flash-name">{auction.name}</h3>
                  <p className="flash-description">{auction.description}</p>
                  <p className="flash-time">
                    ⏳ Tiempo restante: <span className="flash-timer">{formatTime(auction.timeLeft)}</span>
                  </p>
                  <button className="flash-bid-button">Pujar</button>
                </div>
              </div>

              {/* Lado Derecho con la Imagen */}
              <div className="flash-image">
                <img src={auction.image} alt={auction.name} />
              </div>

            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FlashAuction;
