import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from "../components/navbar/navbarComponent";
import "../pages/AllProducts.css";
import Footer from "../components/footer/Footer";
import api from '../../api'; // Asegúrate de usar api.js aquí para las solicitudes
import { AuthContext } from '../context/AuthContext';

const AllProducts = () => {
    const { userId } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedType, setSelectedType] = useState("venta"); // Mostrar "venta" por defecto
    const location = useLocation();
    const navigate = useNavigate();

    // Cargar productos y categorías
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                console.log('Productos cargados:', response.data); // Log para verificar productos
                setProducts(response.data);
            } catch (error) {
                console.error('Error al cargar los productos:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
            }
        };

        fetchProducts();
        fetchCategories();
    }, []);

    // Verificar si hay una categoría o tipo seleccionado desde la navegación
    useEffect(() => {
        if (location.state?.selectedCategory) {
            setSelectedCategory(location.state.selectedCategory);
        }
        if (location.state?.selectedType === 'flash') {
            setSelectedType('flash'); // Aseguramos que "Subastas Flash" sea el tipo seleccionado
        }
    }, [location.state]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const goToDetails = (productId) => {
        navigate(`/detallesallproducts/${productId}`);
    };

    const getAuctionStatus = (auctionEndTime) => {
        const now = new Date();
        const endDate = new Date(auctionEndTime);

        if (now >= endDate) {
            return "Subasta finalizada";
        } else {
            return "Subasta en curso";
        }
    };

    // Filtrar productos según el tipo seleccionado y la categoría
    const filteredProducts = products.filter(product => {
        if (selectedType === "flash") {
            return product.auctionType === "flash"; // Solo muestra subastas flash
        }

        const isCategoryMatch = selectedCategory === "All" || product.category === selectedCategory;
        const isTypeMatch = selectedType === product.type;
        const isSellerMatch = (product.seller_id._id || product.seller_id) !== userId;

        return isCategoryMatch && isTypeMatch && isSellerMatch;
    });

    return (
        <div className="all-products-container">
            <Navbar selectedType={selectedType} handleTypeChange={handleTypeChange} />
            <div className="product-type-filters">
                <button 
                    className={`type-button ${selectedType === "venta" ? "active" : ""}`} 
                    onClick={() => handleTypeChange("venta")}
                >
                    Venta
                </button>
                <button 
                    className={`type-button ${selectedType === "subasta" ? "active" : ""}`} 
                    onClick={() => handleTypeChange("subasta")}
                >
                    Subasta
                </button>
                <button 
                    className={`type-button ${selectedType === "flash" ? "active" : ""}`} 
                    onClick={() => handleTypeChange("flash")}
                >
                    Subastas Flash
                </button>
            </div>

            <div className="main-content">
                {/* Sidebar de filtros */}
                <div className="sidebar">
                    <div className="category-filter">
                        <button 
                            className={`category-button ${selectedCategory === "All" ? "active" : ""}`} 
                            onClick={() => handleCategoryChange("All")}
                        >
                            Todos
                        </button>
                        {categories.map(category => (
                            <button 
                                key={category._id} 
                                className={`category-button ${selectedCategory === category.name ? "active" : ""}`} 
                                onClick={() => handleCategoryChange(category.name)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sección de productos */}
                <div className="product-section">
                    <h2 className="section-title">
                        {selectedType === "venta" ? "Productos en Venta" : selectedType === "subasta" ? "Productos en Subasta" : "Subastas Flash"}
                    </h2>
                    <div className="auction-cards">
                        {filteredProducts.length === 0 ? (
                            <p>No hay productos disponibles en esta categoría o tipo.</p>
                        ) : (
                            filteredProducts.map(product => (
                                <div 
                                    key={product._id} 
                                    className="auction-card" 
                                    onClick={() => goToDetails(product._id)}
                                >
                                    <div className="product-image-container">
                                        <img 
                                            src={product.images[0]} 
                                            alt={product.name} 
                                            className="product-image" 
                                        />
                                    </div>
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-category">Categoría: {product.category}</p>
                                    
                                    {product.type === 'venta' ? (
                                        <>
                                            <p className="product-price">Precio: ${product.price}</p>
                                            <p className="product-status">Aún en venta</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="product-price">Precio inicial: ${product.startingPrice}</p>
                                            <p className="product-status">
                                                {product.auctionEndTime 
                                                    ? getAuctionStatus(product.auctionEndTime) 
                                                    : 'Fecha de finalización no disponible'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AllProducts;
