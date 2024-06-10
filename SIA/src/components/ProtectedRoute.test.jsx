import { describe, it, expect } from 'vitest';
import { getCookieValue } from './ProtectedRoute';

describe('getCookieValue function tests', () => {

  it('should return null if the specified cookie does not exist', () => {
    // Simular un entorno donde document.cookie no contiene la cookie especificada
    globalThis.document.cookie = "userRol=admin";

    // Probar la función getCookieValue para una cookie que no existe
    const userId = getCookieValue("userCookieSIA");
    expect(userId).toBe(null);
  });

  it('should return null if document.cookie is empty', () => {
    // Simular un entorno donde document.cookie está vacío
    globalThis.document.cookie = "";

    // Probar la función getCookieValue cuando document.cookie está vacío
    const userId = getCookieValue("userCookieSIA");
    expect(userId).toBe(null);
  });

  it('should return the value of the specified cookie', () => {
    globalThis.document.cookie = "userCookieSIA=12345; userRol=admin";
    
    const userRol = getCookieValue("userRol");
    expect(userRol.toLowerCase()).toBe("admin");
  });
  
});
