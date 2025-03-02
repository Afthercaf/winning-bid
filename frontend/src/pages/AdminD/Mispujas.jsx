import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserBids = () => {
    const [bids, setBids] = useState([]);
    const { userId } = useParams();

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await axios.get(`https://winning-bid-zmiw.onrender.com/api/users/user-bids/${userId}`);
                if (Array.isArray(response.data)) {
                    setBids(response.data);
                } else {
                    console.error('Expected an array of bids, but got:', response.data);
                }
            } catch (error) {
                console.error('Error fetching bids:', error);
            }
        };

        fetchBids();
    }, [userId]);

    return (
        <div>
            <h1>Mis Pujas</h1>
            <ul>
                {bids.length > 0 ? (
                    bids.map(bid => (
                        <li key={bid._id}>
                            <p>Producto: {bid.auctionId.name}</p>
                            <p>Importe de la puja: {bid.bidAmount}</p>
                            <p>Hora de la puja: {new Date(bid.bidTime).toLocaleString()}</p>
                        </li>
                    ))
                ) : (
                    <p>No hay pujas disponibles.</p>
                )}
            </ul>
        </div>
    );
};

export default UserBids;
