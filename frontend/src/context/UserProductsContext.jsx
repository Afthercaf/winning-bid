import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../../api'; // Importa la instancia configurada de axios con el interceptor

export const UserProductsContext = createContext();

export const UserProductsProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext); // Aseguramos que el contexto tenga el estado de autenticación
  const [userProducts, setUserProducts] = useState([]);
  const [globalProducts, setGlobalProducts] = useState([]);

  const loadGlobalProducts = async () => {
    try {
      const response = await api.get('/products'); // Usa `api` para manejar la petición con axios
      setGlobalProducts(response.data);
      console.log("Productos globales cargados:", response.data);
    } catch (error) {
      console.error("Error al cargar productos globales:", error);
    }
  };

  const loadUserProducts = async () => {
    try {
      const response = await api.get('/products/user-products'); // Usa `api` con el interceptor para añadir el token automáticamente
      setUserProducts(response.data);
      console.log("Productos del usuario cargados:", response.data);
    } catch (error) {
      console.error("Error al cargar productos del usuario:", error);
    }
  };

  useEffect(() => {
    console.log("Efecto ejecutado - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) { // Solo cargar si el usuario está autenticado
      loadGlobalProducts();
      loadUserProducts();
    }
  }, [isAuthenticated]);

  const addProduct = async (productData) => {
    try {
        console.log("Enviando FormData:", productData); // Para verificar los datos antes de enviar
        const response = await api.post('/products/create', productData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Asegura el tipo de contenido correcto
            },
        });

        if (response.status === 201) {
            const newProduct = response.data;
            setUserProducts((prevProducts) => [...prevProducts, newProduct]);
            console.log("Producto añadido:", newProduct);
        } else {
            console.error('Error al crear el producto. Código de respuesta:', response.status);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }
};




  return (
    <UserProductsContext.Provider value={{ userProducts, globalProducts, addProduct }}>
      {children}
    </UserProductsContext.Provider>
  );
};
