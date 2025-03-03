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

  const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};
  
    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
  
    return timeLeft;
  };

  useEffect(() => {
    const fetchFlashAuctions = async () => {
      try {
        const response = await axios.get("https://winning-bid-zmiw.onrender.com/api/products");
        const flashProducts = response.data.filter(product => product.auctionType === 'flash');
        const updatedAuctions = flashProducts.slice(0, 5).map(auction => ({
          ...auction,
          timeLeft: calculateTimeLeft(auction.auctionEndTime)
        }));
        setAuctions(updatedAuctions);
      } catch (error) {
        console.error("❌ Error al obtener las subastas:", error);
        setAuctions([]);
      }
    };

    fetchFlashAuctions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prevAuctions => prevAuctions.map(auction => ({
        ...auction,
        timeLeft: calculateTimeLeft(auction.auctionEndTime)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeLeft) => {
    if (!timeLeft) return "00:00:00"; // Return default format if no time left
    const { hours, minutes, seconds } = timeLeft;
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
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
              <div className="flash-text-overlay">
                <div className="flash-gradient"></div> 
                <div className="flash-text">
                  <h3 className="flash-name">{auction.name}</h3>
                  <p className="flash-description">{auction.description}</p>
                  <p className="flash-time">
                    ⏳ Tiempo restante: <span className="flash-timer">{formatTime(auction.timeLeft)}</span>
                  </p>
                  <button className="flash-bid-button">Entrar a subasta</button>
                </div>
              </div>
              <div className="flash-image">
                <img src={auction.images && auction.images[0] ? auction.images[0] : 'https://via.placeholder.com/150'} alt={auction.name} />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FlashAuction;
