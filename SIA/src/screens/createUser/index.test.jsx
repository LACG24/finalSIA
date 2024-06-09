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

describe('Email Validation', () => {

    it('should submit the form successfully with valid email', async () => {

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
    
        fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'validUser' } });
        fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: 'Valid' } });
        fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'User' } });
        fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'valid@example.com' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'ValidPass1' } });
    
        fireEvent.click(screen.getByText(/Crear usuario/i));
    
        await waitFor(() =>
          expect(screen.getByText(/Usuario registrado correctamente/i)).toBeInTheDocument()
        );
      });

    it('should show validation errors for invalid inputs', async () => {

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
      
          fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'User02' } });
          fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: 'Valid' } });
          fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'User' } });
          fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'invavalidexample.com' } });
          fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'ValidPass1' } });
    
          fireEvent.click(screen.getByText(/Crear usuario/i));
      
          await waitFor(() =>
            expect(screen.getByText(/Ingrese un correo electrónico válido./i)).toBeInTheDocument()
          );
        });

});
