import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EditUser } from '.';

// Mock the useNavigate hook and retain other exports from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('EditUser Email Message', () => {
  beforeEach(() => {
    // Mock the fetch function to prevent actual API calls during tests
    global.fetch = vi.fn((url) => {
      if (url.includes('/usuarios/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            u_nombre: 'John',
            u_apellidos: 'Doe',
            u_email: 'john.doe@example.com',
            u_pass: 'password123',
            u_rol: 1,
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });


  it('should validate email format and display an error message for invalid email', async () => {
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
  
    // Simulate entering invalid email address
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'invavalidexample.com' } });
    fireEvent.click(screen.getByText(/^Editar$/i)); // Assuming this is the button to trigger validation
  
    await waitFor(() =>
      expect(screen.getByText(/Ingrese un correo electrónico válido/i)).toBeInTheDocument()
    );
  });
  
  

  it('should not display an error message for a valid email', async () => {
    render(
      <MemoryRouter initialEntries={['/edit-user/1']}>
        <Routes>
          <Route path='/edit-user/:u_id' element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial data to be rendered
    await waitFor(() => screen.getByDisplayValue('john.doe@example.com'));

    // Change email to a valid format
    const emailInput = screen.getByLabelText(/Correo/i);
    fireEvent.change(emailInput, { target: { value: 'valid.email@ex.com' } });

    // Click the Edit button to trigger validation
    const editButton = screen.getByText(/^Editar$/i);
    fireEvent.click(editButton);

    // Verify no error message is displayed
    expect(screen.queryByText(/Ingrese un correo electrónico válido./i)).not.toBeInTheDocument();
  });

});
