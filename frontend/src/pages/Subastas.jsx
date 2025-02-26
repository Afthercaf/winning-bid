import React from "react";
import "../styles/Subastas.css";
import Navbar from "../components/navbar/navbarComponent";

const Subastas = () => {
    return (
        <div className="subastas-container">
            <Navbar />
            
            <div className="subastas-header">
                <h1>Subastas</h1>
                <p>Encuentra las mejores subastas ahora!!!</p>
            </div>
            <div className="subastas-controls">
                <div className="select-box">
                    <label>Sort By :</label>
                    <select>
                        <option>All</option>
                        <option>Ropa</option>
                        <option>Tecnologia</option>
                        <option>Juguetes</option>
                    </select>
                </div>

                <div className="search-box">
                    <input type="text" placeholder="Item Name..." />
                    <button>🔍</button>
                </div>
            </div>

            {/* Sección de Tarjetas de Productos */}
            <div className="auction-cards">
                <div className="auction-card">
                    {/* Ícono de martillo en la esquina superior derecha */}
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div> {/* Cuadro gris como marcador de posición */}
                    <h3>4K Dual Camera Foldable Toy Drones</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$14,750 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Apple MacBook Air Laptop 2022</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$18,950 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>

                <div className="auction-card">
                    <div className="hammer-icon">🔨</div>
                    <div className="placeholder-image"></div>
                    <h3>Foldable Drone with 4K Pro Camera</h3>
                    <div className="dotted-line"></div>
                    <div className="info-section">
                        <span>Current Bid:</span>
                        <span className="bid-amount">$24,500 (USD)</span>
                    </div>
                    <div className="info-section">
                        <span>Ends In:</span>
                        <span className="time-remaining">00 : 00 : 00</span>
                    </div>
                    <button className="bid-button">Submit A Bid</button>
                </div>
            </div>

            <div className="pagination-container">
                <button className="pagination-button">❮</button>
                <button className="pagination-number">01</button>
                <button className="pagination-number active">02</button>
                <button className="pagination-number">03</button>
                <button className="pagination-number">04</button>
                <button className="pagination-number">05</button>
                <button className="pagination-button">❯</button>
            </div>

            <div className="contact-section">
                <div className="contact-info">
                    <h3>Contact Us</h3>
                    <p>📞 +1 559 154 2587</p>
                    <p>✉️ example@mail.com</p>
                </div>
                <div className="social-media">
                    <h3>Follow Us</h3>
                    <p>📘 Facebook</p>
                    <p>🐦 Twitter</p>
                    <p>🎮 Twitch</p>
                    <p>📺 Youtube</p>
                </div>
            </div>

        </div>
    );
};

export default Subastas;
