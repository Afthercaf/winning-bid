import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './CategoriesSection.css';
import { FaLaptop, FaShoePrints, FaHome, FaSpa, FaTshirt } from 'react-icons/fa';

const categoryIcons = {
    "Electrónica": <FaLaptop />,
    "Calzado": <FaShoePrints />,
    "Hogar": <FaHome />,
    "Productos de belleza": <FaSpa />,
    "Ropa": <FaTshirt />
};

const CategoriesSection = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories'); // Endpoint para obtener categorías
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        // Navega a la página de productos y pasa la categoría seleccionada
        navigate('/allderrapin', { state: { selectedCategory: categoryName } });
    };

    return (
        <div className="categories-section">
            <h2 className="categories-title">Explora por Categoría</h2>
            <div className="categories-grid">
                {categories.slice(0, 5).map((category) => (
                    <div 
                        className="category-card" 
                        key={category._id} 
                        onClick={() => handleCategoryClick(category.name)}
                    >
                        <div className="category-icon">
                            {categoryIcons[category.name] || <FaHome />} {/* Ícono por defecto */}
                        </div>
                        <h3 className="category-name">{category.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesSection;
