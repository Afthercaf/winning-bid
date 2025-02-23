import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/navbarComponent";

import SeccionCategorias from "../components/Categorias";
import CardsProducts from "../components/cards";
import "./AllProducts.css"; // Importa el CSS de la página

const AllProducts = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedType, setSelectedType] = useState("subasta");

    return (
        <div className="all-products-container">
            <Navbar />
            <div className="main-content">
               <SeccionCategorias 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                />
                
                <CardsProducts 
                    selectedCategory={selectedCategory} 
                    selectedType={selectedType} 
                />
            </div>
            
          
            
        </div>
    );
};

export default AllProducts;
