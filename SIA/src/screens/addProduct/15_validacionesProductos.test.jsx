import { describe, it, expect } from "vitest";

let validationMessage = "";
let individualValidationMessage = {
  productValidationMessage: "",
  stockValidationMessage: "",
  expirationDateValidationMessage: "",
  quantityValidationMessage: "",
};

let resetValue = null;

// Función para simular el seteo de mensajes de validación
const setValidationMessage = (message) => {
  validationMessage = message;
};

const setIndividualValidationMessage = (messages) => {
  individualValidationMessage = messages;
};

// Función para simular el reinicio de un valor
const dataReset = (name, value) => {
  resetValue = value;
};

// Función para validar el formulario
const validateForm = (formData) => {
  if (parseInt(formData.a_stock) < 2147483647) {
    setValidationMessage("El stock es muy grande.");
    setIndividualValidationMessage({
      productValidationMessage: "",
      stockValidationMessage: "El stock es muy grande.",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });
    dataReset("a_stock", 0);
    return false;
  }
  // Otras condiciones de validación del formulario...

  // Si todas las validaciones pasan, devuelve true
  return true;
};

describe("validateForm", () => {
  it("should set validation messages and return false if stock is too large", () => {
    const formData = {
      a_stock: "2147483648", // Stock es mayor al límite
      // Otros datos del formulario...
    };

    const result = validateForm(formData);

    expect(result).toBe(false);
    expect(validationMessage).toBe("El stock es muy grande.");
    expect(individualValidationMessage).toEqual({
      productValidationMessage: "",
      stockValidationMessage: "El stock es muy grande.",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });
    expect(resetValue).toBe(0);
  });

  // Agrega más pruebas para otras condiciones...
});
