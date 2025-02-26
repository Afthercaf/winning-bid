// src/pages/Home.jsx
import React from 'react';
import FlasAuction from '../components/home/FlashAuctions';
import Footer from '../components/footer/Footer';
import CategoriesSection from '../components/home/CategoriesSection';
import '../styles/Home.css';
import Navbar from '../components/navbar/navbarComponent';
import Principal from '../components/home/viewfirst';


const Home = () => {
    return (
        <div className="home-page">
            <Navbar></Navbar>
            <Principal></Principal>
            <CategoriesSection />
            
            <FlasAuction />

            <Footer></Footer>
        
        
        </div>
    );
};

export default Home;
