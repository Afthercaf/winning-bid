import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import './Compras.css';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Compras = () => {
  const { userId } = useContext(AuthContext);
  const { orderId } = useParams();
  const [activePurchases, setActivePurchases] = useState([]);
  const [completedPurchases, setCompletedPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get(`/orders?buyer_id=${userId}`);
        const purchases = response.data;

        const active = purchases.filter(purchase => purchase.status !== 'completado');
        const completed = purchases.filter(purchase => purchase.status === 'completado');

        setActivePurchases(active);
        setCompletedPurchases(completed);
      } catch (error) {
        console.error('Error al obtener las compras:', error);
      }
    };

    if (userId) {
      fetchPurchases();
    }
  }, [userId]);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      if (orderId) {
        try {
          const response = await api.get(`/orders/${orderId}`);
          setSelectedPurchase(response.data);
        } catch (error) {
          console.error("Error al obtener los detalles de la compra:", error);
        }
      }
    };

    fetchPurchaseDetails();
  }, [orderId]);

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? 'Fecha inválida' : parsedDate.toLocaleDateString('es-ES');
  };

  const goToPurchaseDetails = (orderId) => {
    navigate(`/compras/${orderId}`);
  };

  if (orderId && selectedPurchase) {
    return (
      <div className="compras-page">
        <h2 className="black-text">Detalles de la Compra</h2>
        <div className="purchase-details">
          <h4>{selectedPurchase.product_id?.title || 'Producto no disponible'}</h4>
          <p><strong>Estado:</strong> {selectedPurchase.status}</p>
          <p><strong>Fecha de Compra:</strong> {formatDate(selectedPurchase.created_at)}</p>
          {selectedPurchase.status === 'completado' && (
            <p><strong>Fecha de Finalización:</strong> {formatDate(selectedPurchase.updated_at)}</p>
          )}
          <button onClick={() => navigate('/Historial')} className="back-button">
            Volver al Historial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compras-page">
      <h2 className="black-text">Historial de Compras</h2>

      <section className="active-purchases">
        <h3>Compras en Curso</h3>
        {activePurchases.length > 0 ? (
          <div className="purchases-list">
            {activePurchases.map((purchase) => (
              <div className="purchase-card" key={purchase._id} onClick={() => goToPurchaseDetails(purchase._id)}>
                <h4>{purchase.product_id?.title || 'Producto no disponible'}</h4>
                <p><strong>Estado:</strong> {purchase.status}</p>
                <p><strong>Fecha de Compra:</strong> {formatDate(purchase.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes compras en curso.</p>
        )}
      </section>

      <section className="completed-purchases">
        <h3 className="black-text">Historial de Compras Finalizadas</h3>
        {completedPurchases.length > 0 ? (
          <div className="purchases-list">
            {completedPurchases.map((purchase) => (
              <div className="purchase-card completed" key={purchase._id} onClick={() => goToPurchaseDetails(purchase._id)}>
                <h4>{purchase.product_id?.title || 'Producto no disponible'}</h4>
                <p><strong>Fecha de Finalización:</strong> {formatDate(purchase.updated_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes compras finalizadas.</p>
        )}
      </section>
    </div>
  );
};

export default Compras;
