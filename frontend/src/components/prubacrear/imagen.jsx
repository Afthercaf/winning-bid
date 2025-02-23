import React, { useState } from "react";
import axios from "axios";
import "./imagen.css";

const ImageUploader = ({ product, setProduct }) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const uploadToImgur = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("https://api.imgur.com/3/upload", formData, {
        headers: {
          Authorization: "Client-ID 10a739251ca6b08", // 🔥 Reemplaza con tu Client-ID de Imgur
        },
      });
      return response.data.data.link;
    } catch (error) {
      console.error("Error subiendo imagen a Imgur:", error);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + product.images.length > 5) {
      alert("Solo puedes subir un máximo de 5 imágenes.");
      return;
    }

    const validFiles = files.filter(file => file instanceof File);
    const uploadedImages = await Promise.all(validFiles.map(file => uploadToImgur(file)));
    const validImages = uploadedImages.filter(url => url !== null);

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...validImages].slice(0, 5),
    }));

    setImagePreviews(validImages);

    if (!mainImage && validImages.length > 0) {
      setMainImage(validImages[0]);
    }
  };

  return (
    <div className="image-preview-container">
      {mainImage ? (
        <img src={mainImage} alt="Vista principal" className="image-preview" />
      ) : (
        <p className="placeholder-text">Selecciona imágenes para ver la vista previa</p>
      )}
      <input type="file" name="images" onChange={handleFileChange} multiple accept="image/*" className="create-product-file-input" id="file" />
      <label htmlFor="file" className="file-input-label">Elegir archivos</label>
    </div>
  );
};

export default ImageUploader;
