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

describe("Error Message Handling on User Creation Failure", () => {
  beforeEach(() => {
    mockSetRegistrationSuccess.mockClear();
    mockSetError.mockClear();
    mockSetIsModalOpen.mockClear();
  });

  it("should handle the error message correctly when using an incorrect URL", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Failed to fetch")));

    await handleSubmit(
      mockFormData,
      mockSetRegistrationSuccess,
      mockSetError,
      mockSetIsModalOpen,
      mockValidateForm,
      `http:///usuarios`
    );
    expect(mockSetRegistrationSuccess).not.toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith("Failed to fetch");
    expect(mockSetIsModalOpen).toHaveBeenCalled();
  });
});
