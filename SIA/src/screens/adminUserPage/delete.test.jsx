import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPage } from '.';
import { MemoryRouter } from 'react-router-dom';

// Mock the fetch function to prevent actual API calls during tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { u_id: 'user1', u_email: 'user1@example.com' },
      { u_id: 'user2', u_email: 'user2@example.com' },
      { u_id: 'user3', u_email: 'test@example.com' }
    ]),
  })
);

describe('User Deletion Functionality', () => {
  it('should remove selected users when delete button is clicked', async () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    setTimeout(() => {
      // Select the first and third users
      const checkbox1 = screen.getByLabelText('user1@example.com').closest('input');
      const checkbox3 = screen.getByLabelText('test@example.com').closest('input');
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox3);

      // Click the delete selected button
      const deleteButton = screen.getByText('Eliminar seleccionados');
      fireEvent.click(deleteButton);

      // Wait for deletion to complete
      waitFor(() => {
        // Check that the deleted users are not present in the list
        expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();

        // Check that the remaining user is still present
        expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      });
    }, 100);
  });
});
