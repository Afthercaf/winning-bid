import React, { useState, useContext } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "./LoginC.css";
import ImagenEjemplo from "../../assets/winningbid_lopgp-removebg-preview.png"

const LoginComp = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://winning-bid.onrender.com/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Login failed");
        return;
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);

      if (data.token && data.user) {
        console.log("Usuario autenticado:", data.user);
        login(data.token, data.token, data.user.avatar || "/uploads/avatar-default.webp");
        window.location.href = "/";
      } else {
        setErrorMessage("Error: Datos de usuario incompletos.");
        console.error("Datos de usuario incompletos:", data);
      }
    } catch (error) {
      setErrorMessage("Error al iniciar sesión, intenta de nuevo.");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="login-container">
      
      
      <div className="login-form">
        <h2>BIENVENIDO DE NUEVO</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleLogin}>
          <label>Correo Electrónico</label>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recuérdame</label>
          </div>

          <button type="submite">Entrar</button>

          <a href="/forgot-password" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </a>

          <p className="terms">
            Al hacer clic en "Entrar" aceptas nuestros{" "}
            <a href="/terms">Términos de servicio</a> |{" "}
            <a href="/privacy">Política de privacidad</a>
          </p>
        </form>
        <div className="social-icons">
          <FaFacebookF />
          <FaTwitter />
          <FaInstagram />
          <FaYoutube />
        </div>
        

      </div>
      <div className="imagin">
          <img src={ImagenEjemplo} />
        </div>
      </div>
  );
};

export default LoginComp;
