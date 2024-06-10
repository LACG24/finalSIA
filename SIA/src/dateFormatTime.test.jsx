import { describe, it, expect } from 'vitest';
import { formatDateTime } from './generalFunctions.js'; 

describe('formatDateTime function tests', () => {
  it('should format a valid date correctly', () => {
    const date = '2024-06-09T12:34:56Z';
    const expected = '2024/06/09 12:34:56';
    expect(formatDateTime(date)).toEqual(expected);
  });

  it('should return an empty string when passed an empty string', () => {
    const date = '';
    const expected = '';
    expect(formatDateTime(date)).toEqual(expected);
  });

  it('should return an empty string when passed null', () => {
    const date = null;
    const expected = '';
    expect(formatDateTime(date)).toEqual(expected);
  });

  it('should return an empty string when passed undefined', () => {
    const date = undefined;
    const expected = '';
    expect(formatDateTime(date)).toEqual(expected);
  });
});