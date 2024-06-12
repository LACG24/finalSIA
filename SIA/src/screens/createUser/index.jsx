import React, { useState } from "react";
import "./createUser.css";
import { Guide } from "../../components/guide";
import { GeneralButton } from "../../components/button";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { useNavigate } from "react-router-dom";
import { ReturnButton } from "../../components/returnButton";
import { TextInput } from "../../components/textInput";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;

var formTestData = {
  u_id: "testUser",
  u_nombre: "Test",
  u_apellidos: "User",
  u_email: "",
  u_pass: "Test1234",
};

export const validateFormTest = () => {
  if (
    !formData.u_id ||
    !formData.u_nombre ||
    !formData.u_apellidos ||
    !formData.u_email ||
    !formData.u_pass
  ) {
    setError("Por favor, complete todos los campos obligatorios.");
    return false;
  }

  if (formData.u_id.length <= 4 || formData.u_id.length >= 10) {
    setError("El username debe tener entre 4 y 10 caracteres.");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.u_email)) {
    setError("Ingrese un correo electrónico válido.");
    return false;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,15}$/;
  if (!passwordRegex.test(formData.u_pass)) {
    setError(
      "La contraseña debe tener entre 5 y 15 caracteres, al menos una letra mayúscula, una letra minúscula, un dígito y no debe contener espacios en blanco."
    );
    return false;
  }

  setError("");
  return true;
};

// Definir handleSubmit fuera del componente para exportarlo fácilmente
export const handleSubmit = async (
  formData,
  setRegistrationSuccess,
  setError,
  setIsModalOpen,
  validateForm
) => {
  if (!validateForm()) return;

  try {
    const response = await fetch(`http://${API_HOST}:${API_PORT}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error("Error al agregar el usuario");
    }
    setRegistrationSuccess(true);
    setError(null);
  } catch (error) {
    setError(error.message);
    console.error("Error al agregar el usuario:", error);
  }
  setIsModalOpen(true);
};

export const CreateUser = () => {
  const [formData, setFormData] = useState({
    u_id: "",
    u_nombre: "",
    u_apellidos: "",
    u_email: "",
    u_pass: "",
    u_rol: 0,
  });

  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.u_id ||
      !formData.u_nombre ||
      !formData.u_apellidos ||
      !formData.u_email ||
      !formData.u_pass
    ) {
      setError("Por favor, complete todos los campos obligatorios.");
      return false;
    }

    if (formData.u_id.length <= 4 || formData.u_id.length >= 10) {
      setError("El username debe tener entre 4 y 10 caracteres.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.u_email)) {
      setError("Ingrese un correo electrónico válido.");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,15}$/;
    if (!passwordRegex.test(formData.u_pass)) {
      setError(
        "La contraseña debe tener entre 5 y 15 caracteres, al menos una letra mayúscula, una letra minúscula, un dígito y no debe contener espacios en blanco."
      );
      return false;
    }

    setError("");
    return true;
  };

  return (
    <div className="createUser">
      <div className="editUserTitle">
        <Guide message="No olvides llenar todos los campos para el registro" />
        <ReturnButton textElement="Registrar Usuario" />
      </div>

      <div className="createUser-container">
        <br />
        <div className="createInput">
          <TextInput
            label="Nombre de usuario"
            name="u_id"
            value={formData.u_id}
            onChange={handleChange}
          />
          <TextInput
            label="Nombre"
            name="u_nombre"
            value={formData.u_nombre}
            onChange={handleChange}
          />
          <TextInput
            label="Apellidos"
            name="u_apellidos"
            value={formData.u_apellidos}
            onChange={handleChange}
          />
          <TextInput
            label="Correo"
            type="email"
            name="u_email"
            value={formData.u_email}
            onChange={handleChange}
          />
          <TextInput
            label="Contraseña"
            name="u_pass"
            type="password"
            value={formData.u_pass}
            onChange={handleChange}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <GeneralButton
          textElement="Crear usuario"
          onClick={() =>
            handleSubmit(
              formData,
              setRegistrationSuccess,
              setError,
              setIsModalOpen,
              validateForm
            )
          }
        />
      </div>
      {isModalOpen && registrationSuccess && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="Usuario registrado correctamente"
            answer1="Ok"
            isOpen={isModalOpen}
            closeModal={() => {
              setIsModalOpen(false);
              navigate("/adminUserPage");
            }}
          />
        </div>
      )}
    </div>
  );
};
