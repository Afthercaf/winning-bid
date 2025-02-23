import React, { useState, useEffect, useContext } from 'react';
import "./Crearproducto.css"
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserProductsContext } from '../context/UserProductsContext';
import api from '../../api';
import Navbar from '../components/navbar/navbarComponent';
import Sidebar from '../components/sidebar/Sidebar';

const CreateProduct = () => {
  const { addProduct } = useContext(UserProductsContext);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    images: [],
    type: 'subasta', // Solo subasta (normal o flash)
    startingPrice: '',
    auctionStartTime: '',
    auctionEndTime: '',
    auctionType: 'normal',
    flashDuration: 60,
    puja1: '',
    puja2: '',
    puja3: '',
  });
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + product.images.length > 5) {
      alert("Solo puedes subir un máximo de 5 imágenes.");
      return;
    }
    const updatedImages = [...product.images, ...files].slice(0, 5);
    setProduct({ ...product, images: updatedImages });
    const previews = updatedImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    if (!mainImage && previews.length > 0) {
      setMainImage(previews[0]);
    }
  };

  const handleThumbnailClick = (src) => {
    setMainImage(src);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('category', product.category);
    formData.append('type', product.type);
    formData.append('startingPrice', product.startingPrice);
    formData.append('auctionStartTime', product.auctionStartTime);
    if (product.auctionType === 'flash') {
      const auctionEndTime = new Date(product.auctionStartTime);
      auctionEndTime.setMinutes(auctionEndTime.getMinutes() + parseInt(product.flashDuration));
      formData.append('auctionEndTime', auctionEndTime.toISOString());
    }
    formData.append('auctionType', product.auctionType);
    formData.append('flashDuration', product.flashDuration);
    formData.append('puja1', product.puja1);
    formData.append('puja2', product.puja2);
    formData.append('puja3', product.puja3);

    const totalPujas = parseInt(product.puja1) + parseInt(product.puja2) + parseInt(product.puja3);
    if (totalPujas !== 150) {
      alert("Las pujas deben sumar un total de 150.");
      return;
    }

    product.images.forEach((file) => formData.append('images', file));
    await addProduct(formData);
  };

  return (
    <div className="create-product-container">
      <Navbar></Navbar>
      <Sidebar></Sidebar>
      
      <div className="create-product-containerE">
        <div className="image-preview-container">
          {mainImage ? (
            <img src={mainImage} alt="Vista principal" className="image-preview" />
          ) : (
            <p className="placeholder-text">Selecciona imágenes para ver la vista previa</p>
          )}
          <div className="thumbnail-container">
            {imagePreviews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Thumbnail ${index}`}
                className="thumbnail"
                onClick={() => handleThumbnailClick(src)}
              />
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="create-product-form">
          <h2 className="create-product-title">Crear Producto</h2>
          <label className="create-product-label">Nombre del Producto:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="create-product-input"
          />
          <label className="create-product-label">Descripción:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            className="create-product-textarea"
          />
          <label className="create-product-label">Categoría:</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
            className="create-product-select"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <label className="create-product-label">Tipo de Subasta:</label>
          <select
            name="auctionType"
            value={product.auctionType}
            onChange={handleChange}
            required
            className="create-product-select"
          >
            <option value="normal">Normal</option>
            <option value="flash">Flash</option>
          </select>
          {product.auctionType === 'flash' && (
            <>
              <label className="create-product-label">Duración de Subasta Flash:</label>
              <select
                name="flashDuration"
                value={product.flashDuration}
                onChange={handleChange}
                required
                className="create-product-select"
              >
                <option value={60}>1 hora</option>
              </select>
            </>
          )}
          <label className="create-product-label">Precio Inicial:</label>
          <input
            type="number"
            name="startingPrice"
            value={product.startingPrice}
            onChange={handleChange}
            required
            className="create-product-input"
          />
          <label className="create-product-label">Fecha de Inicio de Subasta:</label>
          <input
            type="datetime-local"
            name="auctionStartTime"
            value={product.auctionStartTime}
            onChange={handleChange}
            required
            className="create-product-input"
          />
          {product.auctionType === 'normal' && (
            <>
              <label className="create-product-label">Fecha de Fin de Subasta:</label>
              <input
                type="datetime-local"
                name="auctionEndTime"
                value={product.auctionEndTime}
                onChange={handleChange}
                required
                className="create-product-input"
              />
            </>
          )}
          <label className="create-product-label">Puja 1:</label>
          <input
            type="number"
            name="puja1"
            value={product.puja1}
            onChange={handleChange}
            required
            className="create-product-input"
          />
          <label className="create-product-label">Puja 2:</label>
          <input
            type="number"
            name="puja2"
            value={product.puja2}
            onChange={handleChange}
            required
            className="create-product-input"
          />
          <label className="create-product-label">Puja 3:</label>
          <input
            type="number"
            name="puja3"
            value={product.puja3}
            onChange={handleChange}
            required
            className="create-product-input"
          />
          <label className="create-product-label">Imágenes:</label>
          <div className="file-input-container">
            <input
              type="file"
              name="images"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="create-product-file-input"
              id="file"
            />
            <label htmlFor="file" className="file-input-label">
              Elegir archivos
            </label>
            <span className="file-selected">
              {product.images.length > 0
                ? `${product.images.length} archivo(s) seleccionado(s)`
                : "No se ha seleccionado ningún archivo."}
            </span>
          </div>
          <button type="submit" className="create-product-button">
            Crear Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;