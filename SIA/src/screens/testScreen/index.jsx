import { useState, useEffect } from "react";
import "./AdminPage.css";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const TestScreen = () => {
  const [alimentos, setAlimentos] = useState([]);

  useEffect(() => {
    fetch(`http://${API_HOST}:${API_PORT}/alimentos/join/marca`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error al obtener los usuarios");
      })
      .then((data) => {
        console.log("Alimentos:", data);
        setAlimentos(data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, []); // Este efecto se ejecuta solo una vez al montar el componente

  return <></>;
};
