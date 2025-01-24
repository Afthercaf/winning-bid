// src/components/SpecialOffers.jsx
import React from 'react';
import './SpecialOffers.css';

const SpecialOffers = () => {
    return (
        <div className="special-offers">
            <h2>Beneficios Exclusivos</h2>
            <div className="offers-container">
                <div className="offer-card">Envío Gratis con Mercado Envíos</div>
                <div className="offer-card">Mercado Pago</div>
                <div className="offer-card">Descuentos Exclusivos</div>
            </div>
        </div>
    );
};

export default SpecialOffers;
