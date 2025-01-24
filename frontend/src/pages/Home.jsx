// src/pages/Home.jsx
import React from 'react';
import Banner from '../components/home/BannerCarousel';
import DailyDeals from '../components/home/DailyDeals';
import Recommendations from '../components/home/Recommendations';
import CategoriesSection from '../components/home/CategoriesSection';
import LocalMarketsCarousel from '../components/home/LocalMarketsCarousel';
import './Home.css';
import Navbar from '../components/navbar/navbarComponent';
import Footer from '../components/footer/Footer';

const Home = () => {
    return (
        <div className="home-page">
            <Navbar></Navbar>
            <Banner />
            <DailyDeals />
            <CategoriesSection />
            <Recommendations />
            <LocalMarketsCarousel />
            <Footer></Footer>
        </div>
    );
};

export default Home;
