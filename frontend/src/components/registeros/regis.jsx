// src/components/Regi.js
import React, { useState } from 'react';
import api from '../../../api'; // Asegúrate de tener la configuración de la API}
import "./regis.css"

const Regi = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await api.post('/users', {
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
      });

      console.log('Usuario creado:', response.data);
      window.location.href = '/login'; // Redirige a login
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Error creando el usuario');
    }
  };

  return (
    <div className="register-container">
      <div className="form-sectione">
        <h2>Crea tu cuenta</h2>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Tu nombre</label>
          <input type="text" name="name" value={user.name} onChange={handleChange} required />

          <label htmlFor="email">Correo electronico</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} required />

          <label htmlFor="password">Contraseña</label>
          <input type="password" name="password" value={user.password} onChange={handleChange} required />

          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input type="passworder" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} required />

          <label htmlFor="phone">Numero de teléfono</label>
          <input type="phones" name="phone" value={user.phone} onChange={handleChange} required />

          <div className="terms-container">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms" className="terms-label">
              Estoy de acuerdo con todos los <a href="#">Terminos y servicios</a>
            </label>
          </div>

          <button type="submit">REGISTRARSE</button>
        </form>
        <p className='sexosme'>
          Ya tienes una cuenta? <a href="/login">Inicia sesion</a>
        </p>
      </div>
    </div>
  );
};

export default Regi;
