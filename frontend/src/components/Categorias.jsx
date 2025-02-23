import React, { useState, useEffect } from "react";
import api from "../../api";
import "./Categorias.css"; // Importa el CSS de este componente

const SeccionCategorias = ({ selectedCategory, setSelectedCategory, selectedType, setSelectedType }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="sidebar">
            <h3>Categorías</h3>
            <button className={`filter-button ${selectedType === "subasta" ? "active" : ""}`} onClick={() => setSelectedType("subasta")}>Subastas</button>
            <button className={`filter-button ${selectedType === "flash" ? "active" : ""}`} onClick={() => setSelectedType("flash")}>Subastas Flash</button>
            
            <h4>Categorías</h4>
            <button className={`category-button ${selectedCategory === "All" ? "active" : ""}`} onClick={() => setSelectedCategory("All")}>Todos</button>
            {categories.map(category => (
                <button key={category._id} className={`category-button ${selectedCategory === category.name ? "active" : ""}`} onClick={() => setSelectedCategory(category.name)}>
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default SeccionCategorias;
