// components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ component: Component }) => {
  const { isAuthenticated, userRole } = useContext(AuthContext);

  // Si aún no se ha determinado la autenticación, no renderizar nada
  if (isAuthenticated === null || userRole === null) {
    return null; // O bien, puedes mostrar un "loading" temporal aquí si prefieres
  }

  // Si no está autenticado, redirigir a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero no es admin, redirigir a /
  if (isAuthenticated && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si es admin y está autenticado, renderizar el componente protegido
  return <Component />;
};

export default ProtectedRoute;
