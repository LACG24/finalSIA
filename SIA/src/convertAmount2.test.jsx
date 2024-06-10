import { describe, it, expect } from 'vitest';
import { convertAmount } from './generalFunctions.js'; // Asegúrate de ajustar la ruta al archivo

describe('convertAmount function tests', () => {
  it('should return the integer value without decimals when the input ends with ".000"', () => {
    const amount = "1234.000";
    const expected = 1234;
    expect(convertAmount(amount)).toEqual(expected);
  });

  it('should return the integer value without decimals when the input ends with ".000"', () => {
    const amount = "1234.000";
    const expected = 1234; // Este caso fallaría
    expect(convertAmount(amount)).toEqual(expected);
  });
  
  it('should return the float value when the input does not end with ".000"', () => {
    const amount = "1234.567";
    const expected = 1234.567;
    expect(convertAmount(amount)).toEqual(expected);
  });

  it('should throw an error when passed a non-string input', () => {
    const amount = 1234;
    expect(() => convertAmount(amount)).toThrowError("Invalid input");
  });

  it('should throw an error when passed an empty string', () => {
    const amount = '';
    expect(() => convertAmount(amount)).toThrowError("Invalid input");
  });

  it('should throw an error when passed a string that is not a valid number', () => {
    const amount = 'abc';
    expect(() => convertAmount(amount)).toThrowError("Invalid input");
  });
});
