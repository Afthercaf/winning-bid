import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar/navbarComponent";
import Footer from "../components/footer/Footer";
import api from "../../api";
import { AuthContext } from '../context/AuthContext'; // Asegúrate de importar el contexto si tienes autenticación
import { FaArrowLeft, FaHeart } from "react-icons/fa";
import "../pages/DetallesAllProducts.css";

const DetallesAllProducts = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { userId } = useContext(AuthContext); // Obtiene el ID del usuario desde el contexto
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [highestBid, setHighestBid] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
                setSelectedImage(response.data.images[0]);

                if (response.data.type === "subasta") {
                    const bidResponse = await api.get(`/bids/${productId}/bids`);
                    if (bidResponse.data.length > 0) {
                        const maxBid = Math.max(...bidResponse.data.map(bid => bid.bidAmount));
                        setHighestBid(maxBid);
                    } else {
                        setHighestBid(response.data.startingPrice);
                    }
                }
            } catch (error) {
                console.error("Error al cargar el producto:", error);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleEnterAuction = () => {
        navigate(`/auction/${productId}`);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handlePurchase = async () => {
        try {
            if (!userId) {
                alert("Por favor inicia sesión para realizar la compra.");
                navigate("/login");
                return;
            }

            const orderData = {
                product_id: productId,
                buyer_id: userId,
                seller_id: product.seller_id?._id || product.seller_id,
                price: product.price,
            };

            // Agrega un console.log para ver el contenido de orderData
            console.log("Datos de la orden que se están enviando:", orderData);

            const response = await api.post("/orders", orderData);

            // Notificación al comprador
            alert("¡Compra en proceso! El vendedor confirmará tu compra.");

            // Notificación al vendedor
            console.log("Notificación enviada al vendedor.");

            navigate("/Historial"); // Redirige a la página de historial de compras
        } catch (error) {
            console.error("Error al procesar la compra:", error);
            alert("Hubo un problema al realizar la compra. Inténtalo de nuevo.");
        }
    };

    if (!product) return <div>Cargando...</div>;

    return (
        <div className="full-screen">
            <Navbar />
            <div className="product-details-container">
                <div className="header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Regresar
                    </button>
                </div>
                <div className="thumbnail-column">
                    {product.images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className="thumbnail-image"
                            onMouseEnter={() => setSelectedImage(img)}
                        />
                    ))}
                </div>

                <div className="main-image-container">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className="main-image"
                        />
                    )}
                </div>

                <div className="product-info">
                    <div className="product-title">
                        <h2>{product.name}</h2>
                        <FaHeart
                            onClick={toggleFavorite}
                            className={`favorite-icon ${isFavorite ? "favorite" : ""}`}
                        />
                    </div>
                    <p className="product-description">{product.description}</p>
                    <p className="product-category">Categoría: {product.category}</p>

                    {product.type === "subasta" ? (
                        <>
                            <p className="product-price">Precio inicial: ${product.startingPrice}</p>
                            <p className="current-bid">Valor actual: ${highestBid}</p>
                        </>
                    ) : (
                        <p className="product-price">Precio: ${product.price}</p>
                    )}

                    <p className="product-stock">Stock: {product.stock}</p>
                    <p className="product-status">Estado: {product.isActive ? "Activo" : "Inactivo"}</p>

                    {product.seller_id && (
                        <>
                            <p>Vendido por: {product.seller_id.name}</p>
                            <p>Correo del vendedor: {product.seller_id.email}</p>
                        </>
                    )}

                    <div className="button-container">
                        {product.type === "venta" ? (
                            <button className="buy-button" onClick={handlePurchase}>Comprar</button>
                        ) : (
                            <button className="bid-button" onClick={handleEnterAuction}>
                                Entrar a Subasta
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DetallesAllProducts;
