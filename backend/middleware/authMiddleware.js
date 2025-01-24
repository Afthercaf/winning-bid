const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Obtiene el token de la cabecera de autorización y elimina el prefijo 'Bearer '
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log("Token is missing"); // Mensaje de depuración si no se encuentra el token
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Mensaje de depuración para verificar el token recibido
  console.log("Received token:", token);

  try {
    // Verifica el token usando la clave secreta de JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjunta la información decodificada del usuario a la solicitud
    next(); // Pasa al siguiente middleware o controlador
  } catch (error) {
    console.error("Invalid token:", error.message); // Mensaje de error detallado si el token es inválido
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
