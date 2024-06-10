import { describe, it, expect, vi } from 'vitest';
import { CodeInput } from '.';
import { render, fireEvent } from '@testing-library/react';

describe('CodeInput Component', () => {
  it('should call onComplete with the complete code when all inputs are filled', () => {
    const mockOnComplete = vi.fn();
    const { getByTestId } = render(<CodeInput onComplete={mockOnComplete} />);
    const inputs = Array.from({ length: 5 }, (_, i) => getByTestId(`code-input-${i}`));

    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });
    fireEvent.change(inputs[3], { target: { value: '4' } });
    fireEvent.change(inputs[4], { target: { value: '5' } });

    expect(mockOnComplete).toHaveBeenCalledWith('12345');
  });

  it('should focus on the previous input when Backspace is pressed and the current input is empty', () => {
    const { getByTestId } = render(<CodeInput />);
    const inputs = Array.from({ length: 5 }, (_, i) => getByTestId(`code-input-${i}`));

    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '' } });

    fireEvent.keyDown(inputs[1], { key: 'Backspace' });

    expect(document.activeElement).toBe(inputs[0]);
  });
});
