import { describe, it, expect } from 'vitest';
import { formatDate } from './generalFunctions'; 

describe('formatDate function tests', () => {
  it('should format a valid date correctly', () => {
    const date = '2024-06-09T12:34:56Z';
    const expected = '2024/06/09';
    expect(formatDate(date)).toEqual(expected);
  });

  it('should return an empty string when passed an empty string', () => {
    const date = '';
    const expected = '';
    expect(formatDate(date)).toEqual(expected);
  });

  it('should return an empty string when passed null', () => {
    const date = null;
    const expected = '';
    expect(formatDate(date)).toEqual(expected);
  });

  it('should return an empty string when passed undefined', () => {
    const date = undefined;
    const expected = '';
    expect(formatDate(date)).toEqual(expected);
  });
});
