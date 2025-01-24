import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import './UserProfile.css';
import { FaArrowLeft } from 'react-icons/fa';

const UserProfile = () => {
  const { userRole, logout, userId, updateUserAvatar, userName } = useContext(AuthContext);
  const [avatar, setAvatar] = useState('/uploads/avatar-default.webp');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (userId) {
      const fetchAvatar = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/users/${userId}/avatar`, { credentials: 'include' });
          const data = await response.json();
          if (data.avatar) {
            setAvatar(`http://localhost:5000/${data.avatar}`);
          }
        } catch (error) {
          console.error('Error al obtener el avatar:', error);
        }
      };
      fetchAvatar();
    }
  }, [userId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    } else {
      alert("Por favor, arrastra solo archivos de imagen.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleAvatarUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/avatar`, {
          method: 'PUT',
          body: formData,
          credentials: 'include',
        });
        const data = await response.json();
        if (data.user && data.user.avatar) {
          const newAvatar = `http://localhost:5000/${data.user.avatar}`;
          setAvatar(newAvatar);
          updateUserAvatar(newAvatar); // Actualiza el avatar en AuthContext
        }
        alert('Avatar actualizado exitosamente');
      } catch (error) {
        console.error('Error al subir el avatar:', error);
        alert('Error al actualizar el avatar');
      }
    }
  };

  return (
    <div className="user-profile-container">
      <div className="back-button" onClick={() => (window.location.href = '/')}>
        <FaArrowLeft /> Volver a Home
      </div>
      <h2>Mi Cuenta</h2>
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="avatar-section">
            <img src={avatar} alt="User Avatar" className="avatar-image" />
            <input type="file" id="fileUpload" onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={() => document.getElementById('fileUpload').click()} className="upload-button">
              Cambiar Avatar
            </button>
          </div>
          <div className="user-info">
            <h3>{userName}</h3> {/* Display dynamic username */}
            <p>{userRole === 'admin' ? 'Admin' : 'Cliente'}</p>
          </div>
          <ul className="menu">
            <li><a href="#personal-info">Información Personal</a></li>
            <li><a href="#" onClick={logout}>Cerrar Sesión</a></li>
          </ul>
        </div>
        <div className="profile-main">
          <h3>Actualizar Avatar</h3>
          <div
            className="upload-preview"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="preview-image" />
            ) : (
              <p>Arrastra y suelta una imagen aquí o selecciona un archivo.</p>
            )}
          </div>
          <button onClick={handleAvatarUpload} className="save-button">Guardar Avatar</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
