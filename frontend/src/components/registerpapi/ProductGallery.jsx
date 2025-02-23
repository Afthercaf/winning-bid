import React from "react";

const ProductGallery = ({ images, selectedImage, setSelectedImage }) => {
  return (
    <div className="product-gallery">
      <div className="thumbnails">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Miniatura ${index + 1}`}
            className={selectedImage === img ? "selected" : ""}
            onClick={() => setSelectedImage(img)}
          />
        ))}
      </div>
      <div className="main-image">
        <img src={selectedImage} alt="Producto" />
      </div>
    </div>
  );
};

export default ProductGallery;
