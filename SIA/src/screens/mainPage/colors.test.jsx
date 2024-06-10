import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MainPage } from '.';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

global.fetch = vi.fn();

describe('Date Formatting', () => {
  beforeEach(() => {
    localStorage.setItem('userRol', '1');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch and display alimentos data', async () => {
    const alimentosMockCaducados = [
      { id: 1, a_nombre: 'Manzana', m_nombre: 'Marca A', estatus: 'Caducado', a_fechaCaducidad: '2023-07-01' },
    ];
    const alimentosMockProximosCaducar = [
      { id: 2, a_nombre: 'Banana', m_nombre: 'Marca B', estatus: 'Por caducar', a_fechaCaducidad: '0000-00-00' },
    ];

    // Simular la primera petición
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(alimentosMockCaducados),
        })
      )
      // Simular la segunda petición
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(alimentosMockProximosCaducar),
        })
      );

    render(
      <BrowserRouter>
        <MainPage />
      </BrowserRouter>
    );

    // Esperar a que los datos sean renderizados
    await waitFor(() => expect(screen.getByText('Manzana')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Banana')).toBeInTheDocument());

    const manzanaElement = screen.getByText('Manzana');
    expect(manzanaElement).toBeInTheDocument();

    const marcaAElement = screen.getByText('Marca A');
    expect(marcaAElement).toBeInTheDocument();

    const caducadoElement = screen.getByText('Caducado');
    expect(caducadoElement).toBeInTheDocument();

    const fechaCaducidadElement = screen.getByText(new Date('2023-07-01').toLocaleDateString());
    expect(fechaCaducidadElement).toBeInTheDocument();

    const bananaElement = screen.getByText('Banana');
    expect(bananaElement).toBeInTheDocument();

    const marcaBElement = screen.getByText('Marca B');
    expect(marcaBElement).toBeInTheDocument();

    const porCaducarElement = screen.getByText('Por caducar');
    expect(porCaducarElement).toBeInTheDocument();

    const sinFechaElement = screen.getByText('Sin fecha');
    expect(sinFechaElement).toBeInTheDocument();
  });

  it('should have correct color for each estatus', async () => {
    const alimentosMockCaducados = [
        { id: 1, a_nombre: 'Manzana', m_nombre: 'Marca A', estatus: 'Caducado', a_fechaCaducidad: '2023-07-01' },
      ];
      const alimentosMockProximosCaducar = [
        { id: 2, a_nombre: 'Banana', m_nombre: 'Marca B', estatus: 'Por caducar', a_fechaCaducidad: '0000-00-00' },
      ];
  
      // Simular la primera petición
      global.fetch
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(alimentosMockCaducados),
          })
        )
        // Simular la segunda petición
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(alimentosMockProximosCaducar),
          })
        );
  
      render(
        <BrowserRouter>
          <MainPage />
        </BrowserRouter>
      );
     // Esperar a que los datos sean renderizados
    await waitFor(() => expect(screen.getByText('Manzana')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Banana')).toBeInTheDocument());
  
    const caducadoElement = screen.getByText('Caducado');
    const porCaducarElement = screen.getByText('Por caducar');
  
    // Obtener estilos computados de los elementos de texto
    const caducadoColor = window.getComputedStyle(caducadoElement).color;
    const porCaducarColor = window.getComputedStyle(porCaducarElement).color;
  
    // Verificar que el color sea el esperado
    expect(caducadoColor).toEqual('rgb(255, 0, 0)'); // Rojo
    expect(porCaducarColor).toEqual('rgb(214, 141, 0)'); // Verde
  });
  
});
