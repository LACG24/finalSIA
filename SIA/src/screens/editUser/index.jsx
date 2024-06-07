import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreateInput } from "../../components/createInput";
import { Guide } from "../../components/guide";
import { GeneralButton } from "../../components/button";
import { ReturnButton } from "../../components/returnButton";
import "./EditUser.css";
import { TextInput } from "../../components/textInput";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const EditUser = () => {
  const { u_id } = useParams();
  const navigate = useNavigate();
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [updateSuccessOpen, setUpdateSuccessOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    u_nombre: "",
    u_apellidos: "",
    u_email: "",
    u_pass: "",
    u_rol: 0,
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(
          `http://${API_HOST}:${API_PORT}/usuarios/${u_id}`
        );
        const userData = await response.json();
        setFormData({
          u_nombre: userData.u_nombre,
          u_apellidos: userData.u_apellidos,
          u_email: userData.u_email,
          u_pass: userData.u_pass,
          u_rol: userData.u_rol,
        });
        console.log(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, [u_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSuccessClose = () => {
    setUpdateSuccessOpen(false);
    navigate("/adminUserPage");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      console.log(formData);
      const response = await fetch(
        `http://${API_HOST}:${API_PORT}/usuarios/${u_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Error al editar el usuario");
      }
      // Manejar el éxito de la edición
      console.log("Usuario editado correctamente");
    } catch (error) {
      console.error("Error al editar el usuario:", error);
    }
    setConfirmUpdateOpen(false);
    setUpdateSuccessOpen(true);
  };

  const validateForm = () => {
    // Validar el correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.u_email)) {
      setError("Ingrese un correo electrónico válido.");
      return false;
    }

    setError("");
    return true;
  };

  return (
    <div className="editUser">
      <div className="editUserTitle">
        <Guide message="Podrás editar el/los datos de este usuario que desees"></Guide>
        <ReturnButton textElement="Editar Usuario"></ReturnButton>
      </div>

      <div className="editUserContainer">
        <div className="inputContainerEditUser">
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
            name="u_email"
            value={formData.u_email}
            onChange={handleChange}
          />
        </div>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <GeneralButton
          textElement="Editar"
          color="var(--color-button-blue)"
          onClick={() => setConfirmUpdateOpen(true)}
        ></GeneralButton>
        {confirmUpdateOpen && (
          <ConfirmationPopUp
            message="¿Está seguro que desea editar al usuario?"
            answer1="Si"
            answer2="No"
            funct={handleSubmit}
            isOpen={confirmUpdateOpen}
            closeModal={() => setConfirmUpdateOpen(false)}
          />
        )}
        {updateSuccessOpen && (
          <ConfirmationPopUp
            message="El usuario se actualizó correctamente."
            answer1="OK"
            funct={handleSuccessClose}
            isOpen={updateSuccessOpen}
            closeModal={handleSuccessClose}
          />
        )}
      </div>
    </div>
  );
};
