import React, { useState, useEffect } from 'react';
import api from '../../../api'; // Cambia a `api`
import './CategoriesModal.css';

const CategoriesModal = ({ closeModal }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // Función para cargar las categorías existentes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories'); // Usamos `api` en lugar de `axios`
        setCategories(response.data);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  // Función para agregar una nueva categoría
  const handleAddCategory = async () => {
    if (newCategory.trim() === '') return;

    try {
      await api.post('/categories', { name: newCategory }); // Usamos `api` en lugar de `axios`
      setCategories((prevCategories) => [...prevCategories, { name: newCategory }]);
      setNewCategory('');
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>X</button>
        <h2>Categorías Existentes</h2>
        <ul className="categories-list">
          {categories.map((category, index) => (
            <li key={index}>{category.name}</li>
          ))}
        </ul>
        <h3>Agregar Nueva Categoría</h3>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button className="add-category-button" onClick={handleAddCategory}>
          Agregar Categoría
        </button>
      </div>
    </div>
  );
};

export default CategoriesModal;
