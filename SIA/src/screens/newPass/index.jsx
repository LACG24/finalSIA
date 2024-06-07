import React, { useState } from "react";
import { Guide } from "../../components/guide";
import { GeneralButton } from "../../components/button";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import "./NewPass.css";
import { useNavigate } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const NewPass = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    // Validar la contraseña según las reglas establecidas
    const isValidPassword = validatePassword(password);
    if (!isValidPassword) {
      setErrorMessage(
        "La contraseña debe tener entre 5 y 15 caracteres, al menos una letra mayúscula, una letra minúscula, y un dígito."
      );
      return;
    }

    // Aquí se realiza la solicitud al servidor para actualizar la contraseña
    try {
      const email = sessionStorage.getItem("email");
      const response = await fetch(
        `http://${API_HOST}:${API_PORT}/usuarios/${email}/pass`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nueva_contraseña: password }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al cambiar la contraseña");
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      setErrorMessage(
        "Error al cambiar la contraseña. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleOkClick = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,15}$/;
    return passwordRegex.test(password);
  };

  return (
    <div className="new">
      <div className="mensaje">
        <Guide message="Ingresa la nueva contraseña" size={130} />
      </div>
      <div className="login-container">
        <form className="logInput" onSubmit={handleSubmit}>
          <p>Nueva contraseña</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p>Confirmar nueva contraseña</p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="buttonContainer">
            <GeneralButton
              textElement="Confirmar"
              type="submit"
              color="var(--color-green-dark)"
            />
            <GeneralButton textElement="Cancelar" path="/login" />
          </div>
        </form>
      </div>
      {isModalOpen && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="Contraseña actualizada."
            answer1="Ok"
            isOpen={isModalOpen}
            closeModal={handleOkClick}
          />
        </div>
      )}
    </div>
  );
};
