import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar/navbarComponent";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/AuctionDetails.css";
import { FaArrowLeft } from "react-icons/fa";

const AuctionDetails = () => {
    const { productId } = useParams();
    const { userId } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState("");
    const [highestBid, setHighestBid] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [auctionEnded, setAuctionEnded] = useState(false);
    const navigate = useNavigate(); // Estado para controlar si la subasta ha finalizado

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`https://winning-bid-zmiw.onrender.com/api/products/${productId}`);
                setProduct(response.data);
                setSelectedImage(response.data.images[0]);
            } catch (error) {
                console.error("Error al cargar el producto:", error);
            }
        };

        const fetchBids = async () => {
            try {
                const response = await axios.get(`https://winning-bid-zmiw.onrender.com/api/bids/${productId}/bids`);
                setBids(response.data);

                if (response.data.length > 0) {
                    const maxBid = Math.max(...response.data.map(bid => bid.bidAmount));
                    setHighestBid(maxBid);
                } else {
                    setHighestBid(product.startingPrice);
                }
            } catch (error) {
                console.error("Error al cargar las pujas:", error);
            }
        };

        fetchProduct();
        fetchBids();
    }, [productId, product?.startingPrice]);

    // Calcular el tiempo restante y verificar si la subasta ha terminado
    useEffect(() => {
        if (product && product.auctionEndTime) {
            const interval = setInterval(() => {
                const now = new Date();
                const endTime = new Date(product.auctionEndTime);
                const timeDiff = endTime - now;

                if (timeDiff <= 0) {
                    clearInterval(interval);
                    setTimeRemaining("La subasta ha finalizado");
                    setAuctionEnded(true); // Marcar la subasta como finalizada
                } else {
                    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [product]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();

        if (parseFloat(bidAmount) <= highestBid) {
            alert("La puja debe ser mayor a la puja más alta actual.");
            return;
        }

        if (!userId) {
            alert("Debes estar autenticado para hacer una puja.");
            return;
        }

        try {
            const response = await axios.post(`https://winning-bid-zmiw.onrender.com/api/bids/${productId}/bid`, {
                userId: userId,
                bidAmount: parseFloat(bidAmount),
            });
            setBids([response.data, ...bids]);
            setHighestBid(parseFloat(bidAmount));
            setBidAmount("");
        } catch (error) {
            console.error("Error al hacer la puja:", error);
        }
    };

    const handleIncreaseBy100 = () => {
        setBidAmount((prev) => (parseFloat(prev || highestBid) + 100).toString());
    };

    if (!product) return <div>Cargando...</div>;

    return (
        <div className="full-screen">
            <Navbar />
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Regresar
                </button>
            </div>
            <div className="auction-details-container">
                <div className="image-section">
                    <div className="main-image-container">
                        {selectedImage && (
                            <img src={selectedImage} alt={product.name} className="main-image" />
                        )}
                    </div>
                    <div className="thumbnail-container">
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
                </div>

                <div className="auction-info">
                    <div className="time-remaining-box">
                        <p>Tiempo restante: {timeRemaining}</p>
                    </div>

                    <h2>{product.name}</h2>
                    <p>Precio inicial: ${product.startingPrice}</p>
                    <p>Fecha de fin de subasta: {new Date(product.auctionEndTime).toLocaleString()}</p>

                    {auctionEnded ? (
                        <p className="auction-ended-message">La subasta ha finalizado</p>
                    ) : (
                        <>
                            <h3>Hacer una Puja</h3>
                            <p>Monto de la puja más alta: ${highestBid}</p>
                            <form onSubmit={handleBidSubmit}>
                                <input
                                    type="number"
                                    placeholder="Cantidad de puja"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={handleIncreaseBy100}>
                                    Aumentar +$100
                                </button>
                                <button type="submit">Hacer Puja</button>
                            </form>
                        </>
                    )}

                    <h3>Pujas Actuales</h3>
                    <ul>
                        {bids.map((bid) => (
                            <li key={bid._id}>
                                {bid.userName}: ${bid.bidAmount} - {new Date(bid.bidTime).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AuctionDetails;
