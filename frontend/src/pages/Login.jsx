import React from "react";
import LoginNavbar from "../components/login/LoginNavbar";
import LoginComp from "../components/login/LoginCom";
import "../styles/Login.css";

const Login = () => {
  return (
    <div>
      <LoginNavbar />
      <LoginComp></LoginComp>
     
    </div>
  );
};

export default Login;
