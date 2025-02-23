import React, { useState, useEffect, useContext } from "react";
import { UserProductsContext } from "../../context/UserProductsContext";
import api from "../../../api";
import "./formulario.css";

const ProductForm = ({ product, setProduct }) => {
  const { addProduct } = useContext(UserProductsContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
      flashDuration: prev.flashDuration || 60,
    }));

    if (name === "auctionType" && value === "flash") {
      const now = new Date();
      const options = { timeZone: "America/Mexico_City" };
      const mexicanTime = new Date(now.toLocaleString("en-US", options));
      const formattedTime = mexicanTime.toISOString().slice(0, 16);
      setProduct((prev) => ({
        ...prev,
        auctionStartTime: formattedTime,
        auctionEndTime: undefined, // No se usa en flash
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("auctionType", product.auctionType);
    formData.append("startingPrice", Number(product.startingPrice));
    formData.append("puja1", Number(product.puja1));
    formData.append("puja2", Number(product.puja2));
    formData.append("puja3", Number(product.puja3));
    formData.append("auctionStartTime", new Date(product.auctionStartTime).toISOString());

    if (product.auctionType === "normal") {
      formData.append("auctionEndTime", new Date(product.auctionEndTime).toISOString());
    } else {
      formData.append("flashDuration", product.flashDuration);
    }

    product.images.forEach((imageUrl) => {
      formData.append("images", imageUrl);
    });

    const totalPujas = parseInt(product.puja1) + parseInt(product.puja2) + parseInt(product.puja3);
    if (totalPujas !== 150) {
      alert("Las pujas deben sumar un total de 150.");
      return;
    }

    try {
      await addProduct(formData);
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="create-product-form">
      <h2 className="create-product-title">Crear Producto</h2>
      <input type="text" name="name" value={product.name} onChange={handleChange} required className="create-product-input" />
      <textarea name="description" value={product.description} onChange={handleChange} required className="create-product-textarea" />
      <select name="category" value={product.category} onChange={handleChange} required className="create-product-select">
        <option value="">Selecciona una categoría</option>
        {categories.map((category) => (
          <option key={category._id} value={category.name}>{category.name}</option>
        ))}
      </select>
      <button type="submit" className="create-product-button">Crear Producto</button>
    </form>
  );
};

export default ProductForm;
