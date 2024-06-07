import React, { useState } from "react";
import "./RestorePass.css";
import { Guide } from "../../components/guide";
import { GeneralButton } from "../../components/button";
import emailjs from "emailjs-com";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { LoadingSpinner } from "../../components/loadingSpinner";
import { useNavigate } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const RestorePass = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la animación de carga
  const navigate = useNavigate();

  // Función para generar un código aleatorio de 5 dígitos
  const generateRandomCode = () => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    return randomCode.toString();
  };

  // Función para manejar el clic de recuperación
  const handleRecoveryClick = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true); // Mostrar animación de carga

    if (!email || !confirmEmail) {
      setErrorMessage("Por favor completa todos los campos");
      setIsLoading(false); // Ocultar animación de carga
      return;
    }

    if (email !== confirmEmail) {
      setErrorMessage("Los correos electrónicos no coinciden");
      setIsLoading(false); // Ocultar animación de carga
      return;
    }

    // Verificar si el correo existe en la base de datos
    try {
      const response = await fetch(
        `http://${API_HOST}:${API_PORT}/usuarios/verificar-email/${email}`
      );
      if (response.status === 404) {
        setErrorMessage("Correo no registrado");
        setIsLoading(false); // Ocultar animación de carga
        return;
      }
      if (!response.ok) {
        setErrorMessage("Error al verificar el correo");
        setIsLoading(false); // Ocultar animación de carga
        return;
      }
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      setErrorMessage("Error de servidor");
      setIsLoading(false); // Ocultar animación de carga
      return;
    }

    const generatedCode = generateRandomCode();
    setCode(generatedCode);

    const templateParams = {
      user_email: email,
      code: generatedCode,
    };

    const myValue = generatedCode;
    const now = new Date();
    const expires = new Date(now.getTime() + 5 * 60 * 1000);
    const expiresFormatted = expires.toUTCString();
    document.cookie = `passCookieSIA=${myValue}; expires=${expiresFormatted}; path=/`;

    try {
      const response = await emailjs.send(
        "service_touk674",
        "template_zisnua5",
        templateParams,
        "ItP7OTaI2vAb03jHA"
      );
      console.log("Correo enviado con éxito:", response);
      sessionStorage.setItem("email", email);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      setErrorMessage("Error al enviar el correo");
    } finally {
      setIsLoading(false); // Ocultar animación de carga
    }
  };

  const handleOkClick = () => {
    setIsModalOpen(false);
    navigate("/codePage");
  };

  return (
    <div className="restore">
      {isLoading && <LoadingSpinner />}
      <div className="mensaje">
        <Guide
          message="Bienvenid@ Introduce el correo electrónico de la cuenta para recuperarla"
          size={130}
        />
      </div>
      <div className="login-container">
        <form className="logInput" onSubmit={handleRecoveryClick}>
          <p>Correo</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p>Confirmar correo</p>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="buttonContainer">
            <GeneralButton
              textElement="Recuperar"
              type="submit"
              color="var(--color-green-dark)"
            />
            <GeneralButton textElement="Regresar" path="/login" />
          </div>
        </form>
      </div>
      {isModalOpen && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="Correo enviado con éxito."
            answer1="Ok"
            isOpen={isModalOpen}
            closeModal={handleOkClick}
          />
        </div>
      )}
    </div>
  );
};
