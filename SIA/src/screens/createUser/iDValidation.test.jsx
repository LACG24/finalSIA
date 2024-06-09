import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreateUser } from '.';

// Mock the useNavigate hook and retain other exports from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('CreateUser ID Validation', () => {

  it('should show validation errors for invalid ID (low limit)', async () => {
    // Mock the fetch API
    global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );
  
      const navigate = vi.fn();
  
      render(
        <MemoryRouter>
          <CreateUser />
        </MemoryRouter>
      );
  
      fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'aaa' } });
      fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: 'Valid' } });
      fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'User' } });
      fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'valid@example.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'ValidPass1' } });

      fireEvent.click(screen.getByText(/Crear usuario/i));
  
      await waitFor(() =>
        expect(screen.getByText(/El username debe tener entre 4 y 10 caracteres./i)).toBeInTheDocument()
      );
    });

    it('should show validation errors for invalid ID (up limit)', async () => {
        // Mock the fetch API
        global.fetch = vi.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({}),
            })
          );
      
          const navigate = vi.fn();
      
          render(
            <MemoryRouter>
              <CreateUser />
            </MemoryRouter>
          );
      
          fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'aaaaaaaaaaa' } });
          fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: 'Valid' } });
          fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'User' } });
          fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'valid@example.com' } });
          fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'ValidPass1' } });
    
          fireEvent.click(screen.getByText(/Crear usuario/i));
      
          await waitFor(() =>
            expect(screen.getByText(/El username debe tener entre 4 y 10 caracteres./i)).toBeInTheDocument()
          );
        });

  it('should submit the form successfully with valid ID', async () => {
    // Mock the fetch API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const navigate = vi.fn();

    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'vaUs' } });
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: 'Valid' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'ValidPass1' } });

    fireEvent.click(screen.getByText(/Crear usuario/i));

    await waitFor(() =>
      expect(screen.getByText(/Usuario registrado correctamente/i)).toBeInTheDocument()
    );
  });
});