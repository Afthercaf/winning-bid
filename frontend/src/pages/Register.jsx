// src/pages/Register.js
import React from 'react';
import './Register.css';
import illustration from '../assets/winningbid_lopgp-removebg-preview.png';
import Regi from '../components/registeros/regis'; // Importamos el componente Regi
import LoginNavbar from '../components/login/LoginNavbar';

const Register = () => {
  return (
    
      <div className='regispage'>
        <LoginNavbar></LoginNavbar>  
        <div>
        <Regi />
        </div>
        <div className="imageregis">
          <img src={illustration} alt="Illustration" />
        </div>
        </div>
    
  );
};

export default Register;
