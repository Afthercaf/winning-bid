import React, { useState } from 'react';
import './Register.css';
import illustration from '../assets/registro.png';
import api from '../../api'; // Importar `api` en lugar de usar fetch directamente

const Register = () => {
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
      // Redirigir al login después del registro exitoso
      window.location.href = '/login';
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Error creando el usuario');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="form-section">
          <h2>Sign up</h2>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Your Name</label>
            <input type="text" name="name" value={user.name} onChange={handleChange} required />

            <label htmlFor="email">Your Email</label>
            <input type="email" name="email" value={user.email} onChange={handleChange} required />

            <label htmlFor="password">Password</label>
            <input type="password" name="password" value={user.password} onChange={handleChange} required />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} required />

            <label htmlFor="phone">Phone Number</label>
            <input type="text" name="phone" value={user.phone} onChange={handleChange} required />

            <div className="terms-container">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms" className="terms-label">
                I agree to all statements in <a href="#">Terms of Service</a>
              </label>
            </div>

            <button type="submit">REGISTER</button>
          </form>
          <p>
            Already have an account? <a href="/login">Login now</a>
          </p>
        </div>
        <div className="image-section">
          <img src={illustration} alt="Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Register;
