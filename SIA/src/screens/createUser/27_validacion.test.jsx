// validateFormTestMutant27.test.js

import { describe, it, expect, beforeEach } from "vitest";

let error = "";
const setError = (message) => {
  error = message;
};

const formData = {
  u_id: "",
  u_nombre: "",
  u_apellidos: "",
  u_email: "",
  u_pass: "",
};

const validateFormTest = () => {
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

  if (formData.u_id.length < 4 || formData.u_id.length > 20) {
    setError("El username debe tener entre 4 y 20 caracteres.");
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

describe("validateFormTest with Mutant 27", () => {
  beforeEach(() => {
    error = "";
    formData.u_id = "";
    formData.u_nombre = "asdas";
    formData.u_apellidos = "adsda";
    formData.u_email = "q@a.com";
    formData.u_pass = "Assb12345";
  });

  it("should return false and set an error if username is not between 4 and 20 characters", () => {
    formData.u_id = "abc"; // Less than 4 characters
    let result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe("El username debe tener entre 4 y 20 caracteres.");

    formData.u_id = "abcdefghijk"; // More than 10 characters (previously valid if <= 20)
    result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe("El username debe tener entre 4 y 20 caracteres.");
  });
});
