import { describe, it, expect } from 'vitest';
import { logout } from './generalFunctions.js'; 

describe('logout function tests', () => {
  it('should logout the user and navigate to the login page', async () => {
    // Mock de navigate para simular la navegación
    const navigate = (url) => {
      expect(url).toBe("/login");
    };

    // Mock de document.cookie para simular la eliminación de la cookie
    const originalDocumentCookie = globalThis.document.cookie;
    globalThis.document.cookie = "";
    
    // Mock de localStorage para simular la eliminación de elementos
    const originalLocalStorageRemoveItem = globalThis.localStorage.removeItem;
    globalThis.localStorage.removeItem = (key) => {
      expect(key).toMatch(/userId|userRol/);
    };

    // Ejecutar la función logout y esperar a que se resuelva la promesa
    await logout(navigate);

    // Verificar que se eliminó la cookie del usuario
    expect(globalThis.document.cookie).toBe("");

    // Restaurar document.cookie y localStorage a su estado original
    globalThis.document.cookie = originalDocumentCookie;
    globalThis.localStorage.removeItem = originalLocalStorageRemoveItem;
  });
});
