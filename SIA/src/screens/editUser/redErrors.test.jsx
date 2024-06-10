import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { EditUser } from '.';

// Mock the useNavigate hook and retain other exports from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const API_HOST = 'localhost'; // Reemplaza esto con el valor adecuado de tu configuración
const API_PORT = '3001'; // Reemplaza esto con el valor adecuado de tu configuración

describe('EditUser Red Validate', () => {
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

  it('should render the EditUser component with initial data', async () => {
    render(
      <MemoryRouter initialEntries={['/edit-user/1']}>
        <Routes>
          <Route path='/edit-user/:u_id' element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify initial data is rendered
    expect(await screen.findByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
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
    fireEvent.change(emailInput, { target: { value: 'valid.email@example.com' } });

    // Click the Edit button to trigger validation
    const editButton = screen.getByText(/^Editar$/i);
    fireEvent.click(editButton);

    // Verify no error message is displayed
    expect(screen.queryByText(/Ingrese un correo electrónico válido./i)).not.toBeInTheDocument();
  });

  it('should submit form data and handle successful update', async () => {
    const navigateMock = vi.fn();

    // Mock useNavigate to return the mocked navigate function
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter initialEntries={['/edit-user/1']}>
        <Routes>
          <Route path='/edit-user/:u_id' element={<EditUser />} />
          <Route path='/adminUserPage' element={<div>Admin User Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the form to load with the user data
    await waitFor(() => expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument());

    // Simulate form changes
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'jane.smith@example.com' } });

    // Simulate clicking the edit button
    fireEvent.click(screen.getByText(/^Editar$/i));

    // Wait for the confirmation popup to open
    await waitFor(() => screen.getByText(/¿Está seguro que desea editar al usuario?/i));

    // Simulate confirming the update in the popup
    fireEvent.click(screen.getByText(/Si/i));

    // Wait for fetch to be called and the confirmation popup to close
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    // Verify the correct fetch call was made
    expect(global.fetch).toHaveBeenCalledWith(
      `http://${API_HOST}:${API_PORT}/usuarios/1`,
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          u_nombre: 'Jane',
          u_apellidos: 'Smith',
          u_email: 'jane.smith@example.com',
          u_pass: 'password123',
          u_rol: 1,
        }),
      })
    );

    // Wait for the success popup to open
    await waitFor(() => screen.getByText(/El usuario se actualizó correctamente./i));

    // Simulate clicking the close button on the success popup
    fireEvent.click(screen.getByText(/OK/i));

    // Verify navigation to the admin user page
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/adminUserPage'));
  });
});
