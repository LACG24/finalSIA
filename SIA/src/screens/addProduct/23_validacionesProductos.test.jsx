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
  if (formData.a_nombre.length > 2) {
    setValidationMessage(
      "El nombre del producto es muy corto (mínimo 2 caracteres)."
    );
    setIndividualValidationMessage({
      productValidationMessage:
        "El nombre del producto es muy corto (mínimo 2 caracteres).",
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
  it("should set validation messages and return false if product name is too short", () => {
    const formData = {
      a_nombre: "A",
      // Otros datos del formulario...
    };

    const result = validateForm(formData);

    expect(result).toBe(false);
    expect(validationMessage).toBe(
      "El nombre del producto es muy corto (mínimo 2 caracteres)."
    );
    expect(individualValidationMessage).toEqual({
      productValidationMessage:
        "El nombre del producto es muy corto (mínimo 2 caracteres).",
      stockValidationMessage: "",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });
  });

  // Agrega más pruebas para otras condiciones...
});
