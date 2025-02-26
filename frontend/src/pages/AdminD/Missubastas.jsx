import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import "../../styles/Missubastas.css"
import Navbar from '../../components/navbar/navbarComponent';
import Sidebar from '../../components/sidebar/Sidebar';

const MyProducts = () => {
    const { userId } = useContext(AuthContext);  // Asumiendo que AuthContext proporciona userId
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`https://winning-bid.onrender.com/api/products/user/${userId}/products`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error al cargar productos', error);
            }
        };

        if (userId) {
            fetchProducts();
        }
    }, [userId]);

    return (
        <div>
            <Navbar></Navbar>
       
        <div className="paquita-container">
        
            
            <Sidebar></Sidebar>
            <h1 className="paquita-title">Mis Productos</h1>
            <input type="search" className="paquita-search" placeholder="Buscar" />
            <div>Total de productos: {products.length}</div>
            <table className="paquita-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Imagen</th>
                        <th>Precio Inicial</th>
                        <th>Precio Actual</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? products.map(product => (
                        <tr key={product._id}>
                            <td>{product.name}</td>
                            <td><img src={product.images[0]} alt={product.name} className="paquita-image" /></td>
                            <td>${product.startingPrice}</td>
                            <td>${product.currentPrice}</td>
                            <td><button className="paquita-button">Ver detalles</button></td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">No hay productos disponibles.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default MyProducts;
