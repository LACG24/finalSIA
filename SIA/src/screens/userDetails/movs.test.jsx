import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserDetails } from '.';
import { MemoryRouter } from 'react-router-dom';

// Mock de la llamada a la API fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { ua_id: 1, m_id: null, m_nombre: 'MarcaX' }, // Sin marca
        { ua_id: 2, m_id: 123, m_nombre: 'MarcaY' } // Con marca
      ])
  })
);

describe('UserDetails Component - Food Brand Display Logic', () => {
  it('should display "Sin marca" if m_id is null', async () => {
    render(
      <MemoryRouter>
        <UserDetails id="1" />
      </MemoryRouter>
    );

    await vi.waitFor(() => {
      expect(screen.getByText('Sin marca')).toBeInTheDocument();
    });
  });

  it('should display the brand name if m_id is present', async () => {
    render(
      <MemoryRouter>
        <UserDetails id="2" />
      </MemoryRouter>
    );

    await vi.waitFor(() => {
      expect(screen.getByText('MarcaY')).toBeInTheDocument();
    });
  });
});
