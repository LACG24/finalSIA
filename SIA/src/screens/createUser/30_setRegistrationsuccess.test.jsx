// CreateUser.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSubmit } from "."; // Asegúrate de que la ruta sea correcta

const mockSetRegistrationSuccess = vi.fn();
const mockSetError = vi.fn();
const mockSetIsModalOpen = vi.fn();
const mockValidateForm = vi.fn(() => true);
const mockFormData = {
  u_id: "testuser",
  u_nombre: "Test",
  u_apellidos: "User",
  u_email: "test@example.com",
  u_pass: "Test1234",
};

describe("Registration Success State Handling", () => {
  beforeEach(() => {
    mockSetRegistrationSuccess.mockClear();
    mockSetError.mockClear();
    mockSetIsModalOpen.mockClear();
  });

  it("should consistently set registration success to true on successful registration", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    await handleSubmit(
      mockFormData,
      mockSetRegistrationSuccess,
      mockSetError,
      mockSetIsModalOpen,
      mockValidateForm
    );
    expect(mockSetRegistrationSuccess).toHaveBeenCalledWith(true);

    await handleSubmit(
      mockFormData,
      mockSetRegistrationSuccess,
      mockSetError,
      mockSetIsModalOpen,
      mockValidateForm
    );
    expect(mockSetRegistrationSuccess).toHaveBeenCalledWith(true); // Verificar que se mantiene verdadero independientemente de múltiples invocaciones
  });

  it("should handle registration failure correctly", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error("Error al agregar el usuario")),
      })
    );

    await handleSubmit(
      mockFormData,
      mockSetRegistrationSuccess,
      mockSetError,
      mockSetIsModalOpen,
      mockValidateForm
    );
    expect(mockSetRegistrationSuccess).not.toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith("Error al agregar el usuario");
    expect(mockSetIsModalOpen).toHaveBeenCalled();
  });
});
