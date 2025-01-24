import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerCarousel.css';
import banner3 from '../../assets/banners/banner3.png';
import banner2 from '../../assets/banners/banner2.png';
import banner1 from '../../assets/banners/banner1.jpg';

const banners = [
  { image: banner1, productId: '674937ef4de80aec805008d5' }, // Reemplaza con el ID real del producto
  { image: banner2, productId: '6728182dd642acd0785bc43c' }, // Reemplaza con el ID real del producto
  { image: banner3, productId: 'flash-auction' }, // Este es el banner para Subastas Flash
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handlePrevious = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  const handleBannerClick = (productId) => {
    if (productId === 'flash-auction') {
      // Redirigir a la sección de Subastas Flash
      navigate('/allderrapin', { state: { selectedType: 'flash' } });
    } 
  };

  return (
    <div className="banner-carousel">
      <div className="carousel-content">
        <button className="carousel-button1 left" onClick={handlePrevious}>&lt;</button>
        
        <img
          src={banners[currentIndex].image}
          alt={`Banner ${currentIndex + 1}`}
          className="banner-image"
          onClick={() => handleBannerClick(banners[currentIndex].productId)}
          style={{ cursor: 'pointer' }} // Agrega un cursor para indicar que es clickeable
        />
        
        <button className="carousel-button1 right" onClick={handleNext}>&gt;</button>
      </div>
      
      <div className="carousel-indicators">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
