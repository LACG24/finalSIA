import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CodePage } from '.';

describe('CodePage component tests', () => {
  beforeEach(() => {
    // Utilizar temporizadores falsos para las pruebas
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restaurar temporizadores reales después de cada prueba
    vi.useRealTimers();
  });

  it('should start the timer and display the remaining time correctly', async () => {
    render(<MemoryRouter><CodePage /></MemoryRouter>);

    // Avanzar 1 segundo para simular el inicio del temporizador
    vi.advanceTimersByTime(1000);

    // Verificar que se muestra el tiempo restante correctamente
    const timeLeftElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' && content.includes('Tiempo restante:');
    });

    expect(timeLeftElement).toBeInTheDocument();
  });
  
});
