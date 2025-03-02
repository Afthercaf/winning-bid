import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DetallesProduct = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`https://winning-bid-zmiw.onrender.com/api/products/${productId}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Error al cargar el producto:", error);
            }
        };
        fetchProductDetails();
    }, [productId]);

    if (!product) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h2>{product.name}</h2>
            <img src={`https://winning-bid-zmiw.onrender.com/${product.images[0]}`} alt={product.name} />
            <p>{product.description}</p>
            <p>Categoría: {product.category}</p>
            <p>Precio: ${product.price}</p>
            {/* Muestra otros detalles del producto según el modelo */}
        </div>
    );
};
0
export default DetallesProduct;
