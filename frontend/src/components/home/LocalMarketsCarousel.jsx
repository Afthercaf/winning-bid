import React, { useState } from 'react';
import './LocalMarketsCarousel.css';
import tianguis1 from '../../assets/tianguis1.jpeg';
import tianguis2 from '../../assets/tianguis2.jpeg';
import tianguis3 from '../../assets/tianguis3.jpeg';
import tianguis4 from '../../assets/tianguis4.jpeg';
import tianguis5 from '../../assets/tianguis5.jpeg';

const LocalMarketsCarousel = () => {
  const images = [tianguis1, tianguis2, tianguis3, tianguis4, tianguis5];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="local-markets-section">
      <h2 className="section-title1">Algunos tianguis en la ciudad</h2>
      <div className="carousel-container">
        <button className="carousel-button left" onClick={handlePrev}>&lt;</button>
        
        <div className="carousel-image-wrapper">
          <div className="carousel-gradient-left"></div>
          
          <img
            src={images[currentIndex]}
            alt={`Tianguis ${currentIndex + 1}`}
            className="carousel-image"
          />
          
          <div className="carousel-gradient-right"></div>
        </div>
        
        <button className="carousel-button right" onClick={handleNext}>&gt;</button>
      </div>
    </div>
  );
};

export default LocalMarketsCarousel;
