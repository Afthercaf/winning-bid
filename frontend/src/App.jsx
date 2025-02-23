import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProductsProvider } from "./context/UserProductsContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/MyProducts";
import CreateProduccion from "./pages/Crearproducto";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import Clientes from "./pages/Clientes";
import Productos from "./pages/AdminProduct";
import AuctionDetails from "./pages/AuctionDetails";
import Subastas from "./pages/Subastas";
import DetallesAllProducts from "./pages/DetallesAllProduct";
import CrearSubasta from "./pages/CrearSubasta";
import AllProducts from "./pages/AllProducts";
import Compras from "./pages/Compras";
import PedidoEstado from "./pages/PedidoEstado";
import WhoWeAre from "./pages/somos";
import ProtectedRoute from "./components/RutasAdmin/ProtectedRoute";
import HowItWorks from "./pages/funciones";
import TermsAndConditions from "./pages/politica";
import PrivacyPolicy from "./pages/poli";
import UserWinning from "./pages/winninguser";
import WinnerPage from "./pages/Winnerpage";
import LoserPage from "./pages/LoserPage";
import Existo from "./pages/AdminD/Pageprub";

import MyProducts from "./pages/AdminD/Missubastas";
import UserBids from "./pages/AdminD/Mispujas";

const App = () => {
  return (
    <AuthProvider>
      <UserProductsProvider>
        <Router>
          <Routes>
            <Route path="/missubastas" element={<MyProducts />} />
            <Route path="/prueba" element={<Existo />} />
            {/*  <Route path="/user-bids" element={<ProtectedRoute component={Mispujas} />} />*/}
            <Route path="/user-bids/:userId" element={<UserBids />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<Products />} />
            <Route path="/createproducts" element={<CreateProduccion />} />
            <Route path="/subastasderrapin" element={<Subastas />} />
            <Route path="/" element={<AllProducts />} />
            <Route
              path="/detallesallproducts/:productId"
              element={<DetallesAllProducts />}
            />
            <Route path="/crearderrapin" element={<CrearSubasta />} />
            <Route path="/allderrapin" element={<AllProducts />} />
            <Route path="/register" element={<Register />} />
            <Route path="/Account" element={<UserProfile />} />
            <Route path="/auction/:productId" element={<AuctionDetails />} />
            <Route path="/quienes-somos" element={<WhoWeAre />} />
            <Route path="/como-funciona" element={<HowItWorks />} />
            <Route path="/politicadeprivacidad" element={<PrivacyPolicy />} />
            <Route
              path="/terminosycondiciones"
              element={<TermsAndConditions />}
            />
            {/* Ruta para historial de compras y detalles de compra */}
            <Route path="/Historial" element={<Compras />} />
            <Route path="/compras/:orderId" element={<Compras />} />{" "}
            {/* Muestra los detalles de la compra */}
            <Route path="/PedidoEstado/:orderId" element={<PedidoEstado />} />
            <Route path="/winninguser" element={<UserWinning></UserWinning>} />
            {/* Rutas protegidas */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route
              path="/Pedidos"
              element={<ProtectedRoute component={Pedidos} />}
            />
            <Route
              path="/Clientes"
              element={<ProtectedRoute component={Clientes} />}
            />
            <Route
              path="/Productos"
              element={<ProtectedRoute component={Productos} />}
            />
            <Route path="/winner/:orderId" element={<WinnerPage />} />
            <Route path="/loser/:productId" element={<LoserPage />} />
          </Routes>
        </Router>
      </UserProductsProvider>
    </AuthProvider>
  );
};

export default App;
