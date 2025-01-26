import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaGavel, FaClock, FaUser, FaHeart } from "react-icons/fa";
import io from "socket.io-client";
import Navbar from "../components/navbar/navbarComponent";
import Footer from "../components/footer/Footer";
import api from "../../api";
import { AuthContext } from "../context/AuthContext";
import "./DetallesAllProducts.css";

const DetallesAllProducts = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { userId } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [auctionData, setAuctionData] = useState({
        currentPrice: 0,
        startingPrice: 0,
        topBids: [],
        auctionEndTime: null,
        auctionStatus: "pendiente",
    });
    const [bidAmount, setBidAmount] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    const calculateTimeRemaining = (endTime) => {
        if (!endTime) return null;

        const now = new Date().getTime();
        const difference = new Date(endTime).getTime() - now;

        if (difference <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                expired: true,
            };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
            expired: false,
        };
    };

    // Conexión al socket y escucha de eventos
    useEffect(() => {
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        newSocket.emit("joinRoom", productId);

        newSocket.on("bidUpdate", (data) => {
            if (data.productId === productId) {
                setAuctionData((prevData) => ({
                    ...prevData,
                    currentPrice: data.currentPrice,
                    topBids: data.topBids,
                }));
            }
        });

        newSocket.on("auctionTimeUpdate", (data) => {
            if (data.productId === productId) {
                setAuctionData((prevData) => ({
                    ...prevData,
                    auctionEndTime: data.auctionEndTime,
                    auctionStatus: data.status,
                }));
            }
        });

        return () => newSocket.disconnect();
    }, [productId]);

    // Actualización del tiempo restante
    useEffect(() => {
        const timer = setInterval(() => {
            if (auctionData.auctionEndTime) {
                setTimeRemaining(calculateTimeRemaining(auctionData.auctionEndTime));
            }
        }, 100);

        return () => clearInterval(timer);
    }, [auctionData.auctionEndTime]);

    // Fetch periódico de pujas
    useEffect(() => {
        const fetchBids = async () => {
            try {
                const auctionResponse = await api.get(`/bids/${productId}/bids`);
                setAuctionData((prevData) => ({
                    ...prevData,
                    topBids: auctionResponse.data.bids || [],
                    currentPrice: auctionResponse.data.bids[0]?.bidAmount || prevData.startingPrice,
                }));
            } catch (error) {
                console.error("Error al cargar las pujas:", error);
            }
        };

        const intervalId = setInterval(fetchBids, 100); // Intervalo de 100 ms

        return () => clearInterval(intervalId);
    }, [productId]);

    // Carga de detalles del producto
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productResponse = await api.get(`/products/${productId}`);
                const product = productResponse.data;
                setProduct(product);
                setSelectedImage(product.images[0]);

                if (product.type === "subasta") {
                    const auctionResponse = await api.get(`/bids/${productId}/bids`);
                    setAuctionData({
                        currentPrice: product.currentPrice,
                        startingPrice: product.startingPrice,
                        topBids: auctionResponse.data.bids || [],
                        auctionEndTime: product.auctionEndTime,
                        auctionStatus: auctionResponse.data.status,
                    });
                }
            } catch (error) {
                console.error("Error cargando detalles:", error);
            }
        };

        fetchProductDetails();
    }, [productId]);

    const placeBid = async () => {
        try {
            if (!userId) {
                navigate("/login");
                return;
            }

            const bidData = {
                productId,
                userId,
                bidAmount: parseFloat(bidAmount),
                timestamp: new Date(),
            };

            socket.emit("newBid", {
                ...bidData,
                userName: "Usuario Actual",
            });

            await api.post(`/bids/${productId}/bid-j`, bidData);
            setBidAmount("");
        } catch (error) {
            console.error("Error en la puja:", error);
            alert(error.response?.data?.message || "Error al pujar");
        }
    };

    const isValidBid = () => {
        const amount = parseFloat(bidAmount);
        return amount > auctionData.currentPrice && !timeRemaining?.expired;
    };

    const renderTimeRemaining = () => {
        if (!timeRemaining) return "Cargando...";
        if (timeRemaining.expired) return "Subasta finalizada";

        return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    };

    if (!product) return <div>Cargando...</div>;

    return (
        <div className="product-details-page">
            <Navbar />
            <div className="product-details-container">
                <div className="product-gallery">
                    <div className="thumbnails">
                        {product.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Miniatura ${index + 1}`}
                                className={selectedImage === img ? 'selected' : ''}
                                onClick={() => setSelectedImage(img)}
                            />
                        ))}
                    </div>
                    <div className="main-image">
                        <img src={selectedImage} alt={product.name} />
                    </div>
                </div>

                <div className="product-info">
                    <div className="auction-header">
                        <h2>{product.name}</h2>
                        <FaHeart 
                            className={`favorite-icon ${isFavorite ? 'favorite' : ''}`} 
                            onClick={() => setIsFavorite(!isFavorite)} 
                        />
                    </div>

                    <div className="auction-details">
                        <div className="auction-timer">
                            <FaClock /> 
                            Tiempo restante: {renderTimeRemaining()}
                        </div>

                        <div className="current-bid-section">
                            <p>Precio inicial: ${auctionData.startingPrice.toFixed(2)}</p>
                            <p className="current-bid">
                                Puja actual: ${auctionData.currentPrice}
                            </p>
                        </div>

                        <div className="bid-controls">
                            <input 
                                type="number" 
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder={`Puja mínima: $${(product.currentPrice + 1)}`}
                                min={product.currentPrice + 1}
                                disabled={timeRemaining?.expired}
                            />
                            <button 
                                onClick={placeBid}
                                disabled={!isValidBid()}
                                className="bid-button"
                            >
                                <FaGavel /> Pujar
                            </button>
                        </div>

                        <div className="top-bids">
                            <h3>Mejores Pujas</h3>
                            {auctionData.topBids.slice(0, 3).map((bid, index) => (
                                <div key={index} className="bid-item">
                                    <FaUser /> {bid.userName}: ${bid.bidAmount.toFixed(2)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="product-description">
                        {product.description}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DetallesAllProducts;
