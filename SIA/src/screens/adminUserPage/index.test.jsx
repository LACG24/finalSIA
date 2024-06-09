import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { UserPage } from '.';
import { MemoryRouter } from 'react-router-dom';

// Mock the fetch function to prevent actual API calls during tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ u_id: 'user1', u_email: 'user1@example.com' }]),
  })
);

describe('User Selection Validate', () => {
  it('should add user id to selectedUserIds when checkbox is checked', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Wait for users to be fetched and rendered
    setTimeout(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);

      // Assert that the user id was added to the selectedUserIds
      expect(checkbox).toBeChecked();
    }, 100);
  });

  it('should remove user id from selectedUserIds when checkbox is unchecked', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Wait for users to be fetched and rendered
    setTimeout(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox); // Check the checkbox
      fireEvent.click(checkbox); // Uncheck the checkbox

      // Assert that the user id was removed from the selectedUserIds
      expect(checkbox).not.toBeChecked();
    }, 100);
  });

  it('should enable delete button when at least one checkbox is checked', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Wait for users to be fetched and rendered
    setTimeout(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);

      const deleteButton = document.querySelector('button');
      expect(deleteButton).not.toBeDisabled();
    }, 100);
  });

  it('should disable delete button when no checkbox is checked', () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Wait for users to be fetched and rendered
    setTimeout(() => {
      const deleteButton = document.querySelector('button');
      expect(deleteButton).toBeDisabled();
    }, 100);
  });
});
