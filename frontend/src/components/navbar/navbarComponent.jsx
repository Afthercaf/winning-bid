import React, { useContext, useEffect, useState } from 'react';
import './Conav.css';
import { FaBell, FaStore } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../../api';

const Navbar = () => {
  const { isAuthenticated, userRole, userId, logout } = useContext(AuthContext);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVendedorMode, setIsVendedorMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [avatar, setAvatar] = useState('../../../../backend/uploads/avatar-default.webp');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/notifications/user/${userId}`);
        const allNotifications = response.data;
        setNotifications(allNotifications);

        const unreadNotifications = allNotifications.filter(notification => !notification.read).length;
        setUnreadCount(unreadNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const fetchAvatar = async () => {
      try {
        if (userId) {
          const response = await fetch(`https://winning-bid.onrender.com/api/users/${userId}/avatar`, {
            credentials: 'include',
          });
          const data = await response.json();
          if (data.avatar) {
            setAvatar(`https://winning-bid.onrender.com/${data.avatar}`);
          }
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    if (isAuthenticated) fetchNotifications();
    fetchAvatar();
  }, [userId, isAuthenticated]);

  const handleNotificationsClick = async () => {
    setNotificationMenuOpen(!notificationMenuOpen);
    setAccountMenuOpen(false);

    if (unreadCount > 0) {
      try {
        await api.put(`/notifications/user/${userId}/read`);
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const handleAccountMenuClick = () => {
    setAccountMenuOpen(!accountMenuOpen);
    setNotificationMenuOpen(false);
  };

  const toggleVendedorMode = () => {
    setIsLoading(true); // Activar pantalla de carga
    setTimeout(() => {
      setIsVendedorMode(!isVendedorMode);
      setIsLoading(false); // Desactivar pantalla de carga
    }, 2000); // Simular un retraso de 2 segundos
  };

  return (
    <>
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cambiando a modo {isVendedorMode ? 'Comprador' : 'Vendedor'}...</p>
        </div>
      )}

      <div className="navbar-container">
        <nav className="navbar">
          {/* Texto en lugar de logo */}
          <div className="logo-container">
            <a href="/" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold', }}>
              Winning Bid
            </a>
          </div>

          <ul className="navbar-links">
            <li><a href="/" data-original-text="Inicio">Inicio</a></li>
            {isVendedorMode ? (
              <>
                <li><a href="/products" data-original-text="Mis Productos">Mis Productos</a></li>
                <li><a href="/Dashboard" data-original-text="Ventas">Dashboard</a></li>
                
              </>
            ) : (
              <>
                <li><a href="/allderrapin" data-original-text="Subastas activas">Subastas activas</a></li>
                {userRole === 'user' ? (
                  <li><a href="/Dashboard" data-original-text="Dashboard">Dashboard</a></li>
                ) : (
                  <li><a href="/about" data-original-text="Acerca de nosotros">Acerca de nosotros</a></li>
                )}
              </>
            )}
          </ul>
    
          <input type="text" placeholder="Buscar productos..." className="search-bar1" />
    
          {userRole !== 'admin' && (
            <>
              {!isVendedorMode && (
                <>
                  {isAuthenticated && (
                    <div className="notification-icon" onClick={handleNotificationsClick}>
                      <FaBell />
                      {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                      
                      {notificationMenuOpen && (
                        <div className="notification-dropdown">
                          <div className="notification-header">
                            <h4>Notificaciones</h4>
                            <span className="notification-clear" onClick={() => setNotifications([])}>Limpiar</span>
                          </div>
                          <div className="notification-content">
                            {notifications.length > 0 ? (
                              notifications.map((notification, index) => (
                                <div
                                  key={index}
                                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                                >
                                  {notification.message}
                                  <span className="notification-time">
                                    {new Date(notification.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="no-notifications">No tienes notificaciones</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            
            </>
          )}
    
          {isAuthenticated ? (
            <div className="avatar-container" onClick={handleAccountMenuClick}>
              <img
                src={avatar}
                alt="User Avatar"
                className="user-avatar"
                onError={(e) => { e.target.src = '/uploads/avatar-default.webp'; }}
              />
              {accountMenuOpen && (
                <div className="dropdown-menu">
                  <a href="/Account">Tu Cuenta</a>
                  <a href="/Dashboard">Panel De Control</a>
                  <a href="#" onClick={logout}>Cerrar Sesión</a>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="login-btn">Iniciar Sesión ↗</a>
          )}
        </nav>
      </div>
    </>
  );  
};

export default Navbar;
