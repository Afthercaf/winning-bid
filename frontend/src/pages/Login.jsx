import React, { useState, useContext } from 'react';
import { FaGoogle, FaFacebookF, FaApple, FaSteam, FaArrowLeft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Login failed');
        return;
      }
  
      const data = await response.json();
      console.log('Datos recibidos:', data); // Log adicional para ver la respuesta completa
  
      // Verificar que se reciban `token` y `user`
      if (data.token && data.user) {
        // Llama a la función `login` con `token` y `avatar` desde `user`
        login(data.token, data.token, data.user.avatar || '/uploads/avatar-default.webp'); // Usa el token para ambos y un avatar por defecto si no existe
  
        // Redirige al dashboard o a la página principal
        window.location.href = '/';
      } else {
        setErrorMessage('Error: Datos de usuario incompletos.');
        console.error('Datos de usuario incompletos:', data); // Log adicional en caso de error
      }
    } catch (error) {
      setErrorMessage('Error al iniciar sesión, intenta de nuevo.');
      console.error('Login Error:', error);
    }
  };
  
  
  return (
    <div className="login-page">
      <div>
        <FaArrowLeft className="back-icon" onClick={() => (window.location.href = '/')} />
      </div>
      <div className="left-section"></div>
      <div className="right-section">
        <div className="login-form-container">
          <h2>Bienvenido de vuelta!</h2>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="form-options">
              <label>
                <input type="checkbox" /> Recuérdame
              </label>
              <a href="/reset-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit">Login</button>

            <div className="social-login">
              <p>o logearse con:</p>
              <div className="social-icons">
                <button className="icon-button google"><FaGoogle /></button>
                <button className="icon-button facebook"><FaFacebookF /></button>
                <button className="icon-button apple"><FaApple /></button>
                <button className="icon-button"><FaSteam /></button>
              </div>
            </div>
          </form>
          <p>
            ¿No tienes una cuenta? <a href="/register">Créala aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
