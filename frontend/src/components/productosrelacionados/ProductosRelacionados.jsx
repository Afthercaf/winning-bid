import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductosRelacionados.css";
import { FaShoppingCart } from "react-icons/fa";

const ProductosRelacionados = () => {
    const [productos, setProductos] = useState([]);

    // Función para obtener productos desde la API
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await axios.get("hhttps://winning-bid.onrender.com/api/products"); // Cambia la URL a la de tu API
                setProductos(response.data);
            } catch (error) {
                console.error("Error al obtener los productos:", error);
            }
        };

        fetchProductos();
    }, []);

    return (
        <div className="productos-relacionados-container">
            <h2>Nuestros Clientes También Vieron</h2>
            <div className="productos-grid">
                {productos.map((producto) => (
                    <div key={producto.id} className="producto-card">
                        <img src={producto.imagen} alt={producto.nombre} className="producto-imagen" />
                        <div className="producto-info">
                            <p className="producto-nombre">{producto.nombre}</p>
                            <p className="producto-vendidos">{producto.vendidos} vendidos recientemente</p>
                            <p className="producto-precio">${producto.precio}</p>
                            {producto.descuento && <span className="producto-descuento">-{producto.descuento}%</span>}
                            <div className="producto-rating">
                                {"⭐".repeat(producto.calificacion)} ({producto.calificacion})
                            </div>
                            <button className="producto-carrito-btn">
                                <FaShoppingCart /> Añadir al carrito
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductosRelacionados;
