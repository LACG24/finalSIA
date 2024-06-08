import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { CreateUser } from './index';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('CreateUser Component', () => {
  it('renders the form fields correctly', () => {
    renderWithRouter(<CreateUser />);
    expect(screen.getByLabelText(/Nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear usuario/i)).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    renderWithRouter(<CreateUser />);
    
    const submitButton = screen.getByText(/Crear usuario/i);
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Por favor, complete todos los campos obligatorios./i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'usr' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText(/El username debe tener entre 4 y 10 caracteres./i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'invalidemail' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText(/Ingrese un correo electrónico válido./i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '123' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText(/La contraseña debe tener entre 5 y 15 caracteres/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    renderWithRouter(<CreateUser />);

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'validUser' } });
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Nombre' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Apellidos' } });
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'email@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Crear usuario/i));

    await waitFor(() => expect(screen.queryByText(/Usuario registrado correctamente/i)).toBeInTheDocument());
    expect(screen.queryByText(/Error al agregar el usuario/i)).toBeNull();
  });

  it('handles API error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );

    renderWithRouter(<CreateUser />);

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'validUser' } });
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Nombre' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Apellidos' } });
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'email@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Crear usuario/i));

    await waitFor(() => expect(screen.queryByText(/Error al agregar el usuario/i)).toBeInTheDocument());
  });
});
