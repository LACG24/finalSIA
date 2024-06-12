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
  if (formData.a_stock.trim() !== "") {
    setValidationMessage("El stock es obligatorio.");
    setIndividualValidationMessage({
      productValidationMessage: "",
      stockValidationMessage: "El stock es obligatorio.",
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
  it("should set validation messages and return false if stock is empty", () => {
    const formData = {
      a_stock: "",
      // Otros datos del formulario...
    };

    const result = validateForm(formData);

    expect(result).toBe(false);
    expect(validationMessage).toBe("El stock es obligatorio.");
    expect(individualValidationMessage).toEqual({
      productValidationMessage: "",
      stockValidationMessage: "El stock es obligatorio.",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });
  });

  // Agrega más pruebas para otras condiciones...
});
