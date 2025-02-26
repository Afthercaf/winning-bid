import React, { useState } from "react";
import "../styles/CrearSubasta.css";

const CrearSubasta = () => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const newImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prevImages) => [...prevImages, ...newImages]);
        if (!selectedImage && newImages.length > 0) {
            setSelectedImage(newImages[0].url); // Muestra la primera imagen como la seleccionada
        }
    };

    const handleSelectImage = (url) => {
        setSelectedImage(url);
    };

    const handleDeleteImage = (url) => {
        const updatedImages = images.filter((image) => image.url !== url);
        setImages(updatedImages);
        // Actualiza selectedImage si la imagen eliminada era la seleccionada o si ya no quedan imágenes
        if (selectedImage === url) {
            setSelectedImage(updatedImages.length > 0 ? updatedImages[0].url : null);
        }
    };

    return (
        <div className="crear-subasta-container">
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>Create New Auction</h3>
                    </div>
                    <div className="modal-body">
                        <div className="modal-columns">
                            {/* Contenedor de imágenes a la izquierda */}
                            <div className="image-container">
                                <div className="image-preview">
                                    {selectedImage ? (
                                        <img src={selectedImage} alt="Product Preview" />
                                    ) : (
                                        <p>No image selected</p>
                                    )}
                                </div>
                                <div className="thumbnail-container">
                                    {images.map((image, index) => (
                                        <div key={index} className="thumbnail-wrapper">
                                            <img
                                                src={image.url}
                                                alt={`Thumbnail ${index + 1}`}
                                                className={`thumbnail ${selectedImage === image.url ? 'selected' : ''}`}
                                                onClick={() => handleSelectImage(image.url)}
                                            />
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteImage(image.url)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Formulario a la derecha */}
                            <form className="form-section">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Type product name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price">Minimum price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        id="price"
                                        placeholder="$2999"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select id="category">
                                        <option>Select category</option>
                                        <option value="TV">TV/Monitors</option>
                                        <option value="PC">PC</option>
                                        <option value="GA">Gaming/Console</option>
                                        <option value="PH">Phones</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="startDate">Start Date and Time</label>
                                    <input
                                        type="datetime-local"
                                        id="startDate"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endDate">End Date and Time</label>
                                    <input
                                        type="datetime-local"
                                        id="endDate"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="image">Product Images</label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        multiple
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="description">Product Description</label>
                                    <textarea
                                        id="description"
                                        rows="4"
                                        placeholder="Write product description here"
                                    ></textarea>
                                </div>
                                <button type="submit" className="submit-button">
                                    Add new auction
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearSubasta;
