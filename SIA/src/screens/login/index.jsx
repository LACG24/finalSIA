import React, { useState } from "react";
import { Guide } from "../../components/guide";
import { GeneralButton } from "../../components/button";
import { useNavigate } from "react-router-dom";

import "./login.css";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleClick = () => navigate("/restorePass");

  const handleLogin = () => {
    setErrorMessage("");

    if (!id || !password) {
      setErrorMessage("Por favor completa todos los campos");
      return;
    }

    fetch(`http://${API_HOST}:${API_PORT}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    })
      .then(async (response) => {
        if (response.status === 200) {
          const data = await response.json(); // Convert response to JSON

          // Store cookies
          const now = new Date();
          const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
          const expiresFormatted = expires.toUTCString();
          document.cookie = `userCookieSIA=${id}; expires=${expiresFormatted}; path=/`;

          // Save user details in local storage
          console.log(data);
          if (data.userId) {
            localStorage.setItem("userId", data.userId);
            if (data.userRol === null) {
              data.userRol = 0;
            } else {
              localStorage.setItem("userRol", data.userRol);
            }
            navigate("/mainPage");
          } else {
            throw new Error("Datos de usuario no válidos");
          }
        } else if (response.status === 401) {
          setErrorMessage("Usuario o contraseña incorrectos");
        } else if (response.status === 404) {
          setErrorMessage("Servidor no encontrado");
        } else {
          throw new Error("Error de servidor");
        }
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error("Error:", error.message);
      });
  };

  return (
    <div className="login">
      <Guide message="Bienvenid@ Por favor inicia sesión." size={130} />
      <div className="login-container">
        <div className="logInput">
          <p>Usuario</p>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <p>Contraseña</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
        <p className="forgotPassword" onClick={handleClick}>
          ¿Olvidaste la contraseña?
        </p>
        <GeneralButton textElement="Iniciar sesión" onClick={handleLogin} />
      </div>
    </div>
  );
};
