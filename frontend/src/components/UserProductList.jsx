// components/UserProductList.js
import React, { useContext } from 'react';
import { UserProductsContext } from '../context/UserProductsContext';

const UserProductList = () => {
  const { userProducts } = useContext(UserProductsContext);

  return (
    <div>
      <h2>Mis Productos</h2>
      <ul>
        {userProducts.map((product) => (
          <li key={product._id}>{product.name} - {product.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserProductList;
