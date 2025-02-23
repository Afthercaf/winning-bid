// frontend/src/pages/Loser.js
import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar/navbarComponent";
import Footer from "../components/footer/Footer";
import "./Loser.css";

const Loser = () => {
  const { productId } = useParams();

  return (
    <div className="loser-page">
      <Navbar />
      <div className="loser-container">
        <h1>Lo sentimos, esta vez no ganaste</h1>
        <p>¡Sigue intentándolo en otras subastas!</p>
      </div>
      <Footer />
    </div>
  );
};

export default Loser;