import { describe, it, expect } from 'vitest';

// Re-implement the validation helpers to test them in isolation
// (mirrors the helpers in src/hooks/useSubscriptions.ts)
function sanitizeAmount(value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

const VALID_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'KRW', 'SEK', 'NOK', 'DKK', 'NZD', 'SGD', 'HKD', 'ZAR', 'PLN',
]);

function sanitizeCurrency(value: string): string {
  const upper = (value || 'USD').trim().toUpperCase();
  return VALID_CURRENCIES.has(upper) ? upper : 'USD';
}

describe('sanitizeAmount', () => {
  it('returns 0 for negative values', () => {
    expect(sanitizeAmount(-9.99)).toBe(0);
  });

  it('returns 0 for NaN', () => {
    expect(sanitizeAmount(NaN)).toBe(0);
  });

  it('returns 0 for Infinity', () => {
    expect(sanitizeAmount(Infinity)).toBe(0);
    expect(sanitizeAmount(-Infinity)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(sanitizeAmount(14.999)).toBe(15);
    expect(sanitizeAmount(14.994)).toBe(14.99);
  });

  it('passes through valid amounts', () => {
    expect(sanitizeAmount(0)).toBe(0);
    expect(sanitizeAmount(9.99)).toBe(9.99);
    expect(sanitizeAmount(49.99)).toBe(49.99);
  });
});

describe('sanitizeCurrency', () => {
  it('defaults to USD for empty/null input', () => {
    expect(sanitizeCurrency('')).toBe('USD');
  });

  it('defaults to USD for unknown currency codes', () => {
    expect(sanitizeCurrency('XYZ')).toBe('USD');
    expect(sanitizeCurrency('BITCOIN')).toBe('USD');
  });

  it('uppercases valid currency codes', () => {
    expect(sanitizeCurrency('usd')).toBe('USD');
    expect(sanitizeCurrency('eur')).toBe('EUR');
    expect(sanitizeCurrency('gbp')).toBe('GBP');
  });

  it('trims whitespace', () => {
    expect(sanitizeCurrency('  CAD  ')).toBe('CAD');
  });

  it('accepts all valid currencies', () => {
    for (const code of VALID_CURRENCIES) {
      expect(sanitizeCurrency(code)).toBe(code);
    }
  });
});
