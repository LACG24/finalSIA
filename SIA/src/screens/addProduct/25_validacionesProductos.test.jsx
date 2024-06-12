import { describe, it, expect } from "vitest";

let validationMessage = "";
let individualValidationMessage = {
  productValidationMessage: "",
  stockValidationMessage: "",
  expirationDateValidationMessage: "",
  quantityValidationMessage: "",
};

// Función para simular el seteo de mensajes de validación
const setValidationMessage = (message) => {
  validationMessage = message;
};

const setIndividualValidationMessage = (messages) => {
  individualValidationMessage = messages;
};

// Función para validar el formulario
const validateForm = (formData) => {
  if (formData.a_nombre.trim() !== "") {
    setValidationMessage("El nombre del producto es obligatorio.");
    setIndividualValidationMessage({
      productValidationMessage: "El nombre del producto es obligatorio.",
      stockValidationMessage: "",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });

    return false;
  }
  // Otras condiciones de validación del formulario...

  // Si todas las validaciones pasan, devuelve true
  return true;
};

describe("validateForm", () => {
  it("should set validation messages and return false if product name is empty", () => {
    const formData = {
      a_nombre: "",
      // Otros datos del formulario...
    };

    const result = validateForm(formData);

    expect(result).toBe(false);
    expect(validationMessage).toBe("El nombre del producto es obligatorio.");
    expect(individualValidationMessage).toEqual({
      productValidationMessage: "El nombre del producto es obligatorio.",
      stockValidationMessage: "",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });
  });

  // Agrega más pruebas para otras condiciones...
});
