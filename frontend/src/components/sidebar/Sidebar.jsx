import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { faHome, faUser, faHistory, faGripHorizontal, faPlusCircle, faSignOutAlt, faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Sidevr.css";

const Sidebar = (userId = userId) => {
  const navigate = useNavigate();


  const handleLogout = () => {
    alert('Cerrando sesión...');
    navigate('/login');
  };

  return (
    <aside className="sidebarE">
  <div className="sidebar-content">
    <div className="top-icons">
      <Link to="/Dashboard" className="sidebar-link-homE">
        <FontAwesomeIcon icon={faHome} />
      </Link>
      <div className="dividerE"></div>
      <Link to={`/user-bids/${userId}`} className="sidebar-link-historyE">
        <FontAwesomeIcon icon={faHistory} />
      </Link>
      <div className="dividerE"></div>
      <Link to="/missubastas" className="sidebar-link-categoriesE">
        <FontAwesomeIcon icon={faGripHorizontal} />
      </Link>
      <div className="dividerE"></div>
      <Link to="/createproducts" className="sidebar-link-addE">
        <FontAwesomeIcon icon={faPlusCircle} />
      </Link>
      <div className="dividerE"></div>
      <Link to="/premium" className="sidebar-link-premiumE">
        <FontAwesomeIcon icon={faCrown} />
      </Link>
    </div>
    
    <div className="bottom-icons">
      <div className="dividerE"></div>
      <Link to="/Account" className="sidebar-link-profilE">
        <FontAwesomeIcon icon={faUser} />
      </Link>
      <div className="dividerE"></div>
      <button onClick={handleLogout} className="sidebar-button-logoutE">
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
    </div>
  </div>
</aside>
  );
}

export default Sidebar;
