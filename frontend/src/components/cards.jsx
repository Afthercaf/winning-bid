import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client"; // Importa socket.io
import api from "../../api";
import { AuthContext } from "../context/AuthContext";
import "./cartss.css";

const socket = io("https://winning-bid.onrender.com"); // Conéctate al backend

const CardsProducts = ({ selectedCategory, selectedType }) => {
    const { userId } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [bidAmounts, setBidAmounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Número de productos por página
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error al cargar los productos:', error);
            }
        };

        fetchProducts();

        // Escuchar actualizaciones de pujas en tiempo real
        socket.on("bidUpdate", (updatedProduct) => {
            setProducts((prevProducts) =>
                prevProducts.map(product =>
                    product._id === updatedProduct._id ? updatedProduct : product
                )
            );
        });

        return () => {
            socket.off("bidUpdate"); // Limpieza del evento
        };
    }, []);

    const getRemainingTime = (auctionEndTime) => {
        const now = new Date();
        const endDate = new Date(auctionEndTime);
        const diff = endDate - now;
        if (diff <= 0) return "Finalizada";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const handleBidChange = (event, productId, currentPrice) => {
        const value = event.target.value;
        setBidAmounts((prevBids) => ({
            ...prevBids,
            [productId]: value ? parseFloat(value) : currentPrice + 10
        }));
    };

    const placeBid = async (productId, currentPrice) => {
        const bidAmount = bidAmounts[productId] || currentPrice + 10;

        if (bidAmount <= currentPrice) {
            alert("La puja debe ser mayor al precio actual.");
            return;
        }

        try {
            await api.post(`/bids/${productId}/bid-j`, {
                productId,
                userId,
                bidAmount,
                timestamp: new Date(),
            });

            // Emitir la actualización de la puja al servidor para que todos los clientes la reciban
            socket.emit("newBid", { productId, bidAmount });

            // Actualizar el producto localmente sin recargar la página
            setProducts((prevProducts) =>
                prevProducts.map(product =>
                    product._id === productId ? { ...product, currentPrice: bidAmount } : product
                )
            );

            alert("Puja realizada con éxito!");
        } catch (error) {
            console.error("Error en la puja:", error);
            alert(error.response?.data?.message || "Error al pujar");
        }
    };

    const filteredProducts = products.filter(product => 
        product.type === "subasta" && 
        (selectedType === "flash" ? product.auctionType === "flash" : product.auctionType !== "flash") &&
        (selectedCategory === "All" || product.category === selectedCategory)
    );

    // Lógica de paginación
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="product-section">
            <h2 className="section-title">{selectedType === "subasta" ? "Productos en Subasta" : "Subastas Flash"}</h2>
            <div className="auction-cards">
                {displayedProducts.length === 0 ? (
                    <p>No hay productos disponibles.</p>
                ) : (
                    displayedProducts.map(product => (
                        <div key={product._id} className="auction-card">
                            <div className="product-timer">
                                {getRemainingTime(product.auctionEndTime)}
                            </div>
                            <div className="product-image-container">
                                <img src={product.images[0]} alt={product.name} className="product-image" />
                            </div>
                            <div className="product-details">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">Precio actual: ${product.currentPrice || product.startingPrice}</p>
                                <div className="bid-controls">
                                    <input
                                        type="number"
                                        className="bid-input"
                                        placeholder={`Puja mínima: $${(product.currentPrice || product.startingPrice) + 10}`}
                                        onChange={(e) => handleBidChange(e, product._id, product.currentPrice || product.startingPrice)}
                                    />
                                    <button 
                                        className="bid-button"
                                        onClick={() => placeBid(product._id, product.currentPrice || product.startingPrice)}
                                    >
                                        Pujar
                                    </button>
                                </div>
                                <button className="details-button" onClick={() => navigate(`/detallesallproducts/${product._id}`)}>
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Controles de paginación numérica */}
            <div className="pagination">
                {[...Array(totalPages)].map((_, index) => (
                    <button 
                        key={index + 1}
                        className={`pagination-number ${currentPage === index + 1 ? "active" : ""}`}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CardsProducts;
