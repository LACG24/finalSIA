import React, { useState, useEffect } from "react";
import "./mainPage.css";
import { Guide } from "../../components/guide";
import { GeneralButton } from "../../components/button";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { logout } from "../../generalFunctions";
import { useNavigate } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const MainPage = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userRol = localStorage.getItem("userRol"); // Obtener el userRol del almacenamiento local
  const navigate = useNavigate();

  // Función para cargar los datos de la db
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primera petición
        const response1 = await fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/caducados/dCad`
        );
        if (!response1.ok)
          throw new Error("Error al obtener los alimentos caducados");
        const data1 = await response1.json();
        const alimentosCaducados = data1.map((alimento) => ({
          ...alimento,
          estatus: "Caducado",
        }));

        // Segunda petición
        const response2 = await fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados/dCad`
        );
        if (!response2.ok)
          throw new Error("Error al obtener los alimentos próximos a caducar");
        const data2 = await response2.json();
        const alimentosProximosCaducar = data2.map((alimento) => ({
          ...alimento,
          estatus: "Por caducar",
        }));

        // Actualizar el estado alimentos con los datos combinados
        setAlimentos([...alimentosCaducados, ...alimentosProximosCaducar]);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    fetchData();
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (dateString === "0000-00-00") {
      return "Sin fecha";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para cambiar color del estatus en el estilo
  const getClassForEstatus = (estatus) => {
    return estatus.replace(/\s+/g, "-").toLowerCase();
  };

  return (
    <div className="mainP">
      <div className="mensaje">
        <Guide
          message="Bienvenid@ Estos alimentos son los próximos a caducar."
          size={130}
        />
      </div>
      <div className="als">
        <table className="alTable">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Estatus</th>
              <th>Fecha caducidad próxima</th>
            </tr>
          </thead>
          <tbody>
            {alimentos.map((alimento) => (
              <tr key={alimento.id}>
                <td>{alimento.a_nombre}</td>
                <td>{alimento.m_nombre || "Sin marca"}</td>
                <td className={getClassForEstatus(alimento.estatus)}>
                  {alimento.estatus}
                </td>
                <td>{formatDate(alimento.a_fechaCaducidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="buttonContainer">
        <GeneralButton textElement="Administrar alimentos" path="/adminPage" />
        {userRol === "1" && ( // Condicionar la renderización del botón en función de userRol
          <GeneralButton
            textElement="Administrar usuarios"
            path="/adminUserPage"
          />
        )}
        <GeneralButton
          textElement="Cerrar sesión"
          onClick={() => setIsModalOpen(true)}
          color="red"
        />
      </div>
      {isModalOpen && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="¿Seguro que quieres cerrar sesión?"
            answer1="Si"
            answer2="No"
            path1="/login"
            funct={() => logout(navigate)}
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
