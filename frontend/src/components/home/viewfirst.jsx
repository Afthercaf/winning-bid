import React from 'react';
import './viewt.css'; // Asegúrate de crear este archivo para los estilos personalizados
import { useNavigate } from 'react-router-dom';


const Principal = () => {
const navigate = useNavigate();

    return (
        
        <div className="principal-container">
          <div className="principal-contenido">
            <h1 className="principal-titulo">Haz tu oferta, toma el control</h1>
            <p className="principal-descripcion">Sumérgete en productos únicos, subastas flash y sé el número uno.</p>
            <button onClick={() =>  navigate('/allderrapin')} className="principal-boton">
              Ver subastas
            </button>
          </div>
        </div>
      );
    };
export default Principal;

    
    
    
    
    
