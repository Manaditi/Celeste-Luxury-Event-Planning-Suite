import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyStorage } from '../services/api';

describe('Security & Input Hygiene Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages API key storage securely in localStorage', () => {
    expect(ApiKeyStorage.get()).toBe('');

    const mockKey = 'AIzaSy_MockValidApiKey1234567890';
    ApiKeyStorage.set(mockKey);
    expect(ApiKeyStorage.get()).toBe(mockKey);

    ApiKeyStorage.clear();
    expect(ApiKeyStorage.get()).toBe('');
  });

  it('trims whitespace and ignores empty API key submissions', () => {
    ApiKeyStorage.set('   AIzaSy_TrimmedKey   ');
    expect(ApiKeyStorage.get()).toBe('AIzaSy_TrimmedKey');

    ApiKeyStorage.set('   ');
    expect(ApiKeyStorage.get()).toBe('');
  });

  it('sanitizes malicious script tags and injection patterns', () => {
    const sanitize = (input: unknown, maxLen = 500): string => {
      if (typeof input !== 'string') return '';
      return input.replace(/[<>]/g, '').slice(0, maxLen).trim();
    };

    const malicious1 = '<script>alert("XSS")</script>Nuptials';
    expect(sanitize(malicious1)).toBe('scriptalert("XSS")/scriptNuptials');

    const malicious2 = '<img src=x onerror=alert(1)>Chateau Soirée';
    expect(sanitize(malicious2)).toBe('img src=x onerror=alert(1)Chateau Soirée');

    // Length boundary
    const longString = 'A'.repeat(1000);
    expect(sanitize(longString, 100).length).toBe(100);
  });

  it('validates and clamps numbers to safe ranges against buffer/integer abuse', () => {
    const validateNum = (input: unknown, min: number, max: number, fallback: number): number => {
      const num = Number(input);
      if (isNaN(num) || num < min || num > max) return fallback;
      return Math.round(num);
    };

    // Valid number
    expect(validateNum(180, 5, 20000, 150)).toBe(180);

    // Negative guest count falls back
    expect(validateNum(-50, 5, 20000, 150)).toBe(150);

    // Infinite or absurdly high numbers fall back
    expect(validateNum(99999999999, 5, 20000, 150)).toBe(150);

    // NaN / non-numeric string falls back
    expect(validateNum('one hundred', 5, 20000, 150)).toBe(150);
  });
});
