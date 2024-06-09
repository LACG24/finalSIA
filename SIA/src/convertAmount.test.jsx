import { describe, it, expect } from 'vitest';
import { convertAmount } from './generalFunctions';

describe('convertAmount', () => {
  it('should remove ".000" and return integer', () => {
    expect(convertAmount('123.000')).toBe(123);
    expect(convertAmount('0.000')).toBe(0);
    expect(convertAmount('456000.000')).toBe(456000);
  });

  it('should keep other decimals', () => {
    expect(convertAmount('123.456')).toBe(123.456);
    expect(convertAmount('0.789')).toBe(0.789);
    expect(convertAmount('456000.001')).toBe(456000.001);
  });

  it('should convert integers correctly', () => {
    expect(convertAmount('123')).toBe(123);
    expect(convertAmount('0')).toBe(0);
    expect(convertAmount('456000')).toBe(456000);
  });

  it('should handle invalid inputs gracefully', () => {
    expect(() => convertAmount('abc')).toThrow();
    expect(() => convertAmount('123.45a')).toThrow();
    expect(() => convertAmount('')).toThrow();
  });
});
