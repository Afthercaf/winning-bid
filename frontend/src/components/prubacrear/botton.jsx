import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./bottone.css"

const BackButtone = () => {
  const navigate = useNavigate();
  
  return (
    <button className="back-buttone" onClick={() => navigate('/')}>
      <FaArrowLeft /> Regresar a la página principal
    </button>
  );
};

export default BackButtone;
