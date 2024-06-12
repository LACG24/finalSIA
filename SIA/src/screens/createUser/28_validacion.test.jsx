// validateFormTest.test.js

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

// Aplicar el mutante
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

  // Mutante: incorrecta validación de la longitud del username
  if (formData.u_id.length > 4 || formData.u_id.length < 20) {
    setError("El username debe tener más de 4 y menos de 20 caracteres.");
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

describe("validateFormTest", () => {
  beforeEach(() => {
    error = "";
    formData.u_id = "";
    formData.u_nombre = "";
    formData.u_apellidos = "";
    formData.u_email = "";
    formData.u_pass = "";
  });

  it("should return false and set an error if any field is empty", () => {
    const result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe("Por favor, complete todos los campos obligatorios.");
  });

  it("should return false and set an error if username is not between 4 and 10 characters", () => {
    formData.u_id = "abc"; // Less than 4 characters
    formData.u_nombre = "John";
    formData.u_apellidos = "Doe";
    formData.u_email = "john.doe@example.com";
    formData.u_pass = "Password1";
    let result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe(
      "El username debe tener más de 4 y menos de 20 caracteres."
    );

    formData.u_id = "abcdefghijk"; // More than 10 characters
    result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe(
      "El username debe tener más de 4 y menos de 20 caracteres."
    );
  });

  it("should return false and set an error if email is invalid", () => {
    formData.u_id = "john_doe";
    formData.u_nombre = "John";
    formData.u_apellidos = "Doe";
    formData.u_email = "john.doe@example"; // Invalid email
    formData.u_pass = "Password1";
    const result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe("Ingrese un correo electrónico válido.");
  });

  it("should return false and set an error if password is invalid", () => {
    formData.u_id = "john_doe";
    formData.u_nombre = "John";
    formData.u_apellidos = "Doe";
    formData.u_email = "john.doe@example.com";
    formData.u_pass = "pass"; // Less than 5 characters
    let result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe(
      "La contraseña debe tener entre 5 y 15 caracteres, al menos una letra mayúscula, una letra minúscula, un dígito y no debe contener espacios en blanco."
    );

    formData.u_pass = "password"; // No uppercase letter, no digit
    result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe(
      "La contraseña debe tener entre 5 y 15 caracteres, al menos una letra mayúscula, una letra minúscula, un dígito y no debe contener espacios en blanco."
    );

    formData.u_pass = "PASSWORD1"; // No lowercase letter
    result = validateFormTest();
    expect(result).toBe(false);
    expect(error).toBe(
      "La contraseña debe tener entre 5 y 15 caracteres, al menos una letra mayúscula, una letra minúscula, un dígito y no debe contener espacios en blanco."
    );
  });

  it("should return true and set no error if all fields are valid", () => {
    formData.u_id = "john_doe";
    formData.u_nombre = "John";
    formData.u_apellidos = "Doe";
    formData.u_email = "john.doe@example.com";
    formData.u_pass = "Password1";
    const result = validateFormTest();
    expect(result).toBe(true);
    expect(error).toBe("");
  });
});
