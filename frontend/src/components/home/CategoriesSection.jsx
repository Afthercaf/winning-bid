import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUnsplashImage } from "../../services/unsplashService";
import axios from "axios";
import "./Categories.css";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://winning-bid-zmiw.onrender.com/api/categories");

        const categoriesWithImages = await Promise.all(
          response.data.map(async (category) => {
            const imageUrl = await fetchUnsplashImage(category.name);
            return { ...category, imageUrl };
          })
        );

        setCategories(categoriesWithImages);
      } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate("/allderrapin", { state: { selectedCategory: categoryName } });
  };

  return (
    <div className="categories-section">
      <h2 className="categories-title">Subastas Categorías</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            className="category-card"
            key={category._id}
            onClick={() => handleCategoryClick(category.name)}
          >
            <div
              className="category-image"
              style={{ backgroundImage: `url(${category.imageUrl || "https://via.placeholder.com/200"})` }}
            >
              <div className="category-overlay">
                <span className="category-name">{category.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
