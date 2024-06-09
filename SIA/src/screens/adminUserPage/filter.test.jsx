import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('User Search Functionality', () => {
  it('should filter users by ID', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    setTimeout(() => {
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'user' } });

      // Assert that only the user with id 'user1' is displayed
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.queryByText('user2')).toBeInTheDocument();
      expect(screen.queryByText('user@example.com')).toBeInTheDocument();
    }, 100);
  });

  it('should filter users by email', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    setTimeout(() => {
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'test@example.com' } });

      // Assert that only the user with email 'test@example.com' is displayed
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user1')).not.toBeInTheDocument();
      expect(screen.queryByText('user2')).not.toBeInTheDocument();
    }, 100);
  });

  it('should display all users when search term does not match ID or email', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    setTimeout(() => {
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'user3' } });

      // Assert that all users are displayed
      expect(screen.getByText('user3')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    }, 100);
  });
});
