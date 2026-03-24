import { formatCurrency, maskCardNumber } from './formatters';

describe('formatters', () => {
  it('formats COP currency', () => {
    expect(formatCurrency(250000)).toContain('250');
  });

  it('formats custom currency', () => {
    expect(formatCurrency(100, 'USD')).toContain('100');
  });

  it('masks card number preserving last four digits', () => {
    expect(maskCardNumber('4242424242424242')).toBe('**** **** **** 4242');
  });

  it('returns raw value when card number is shorter than four digits', () => {
    expect(maskCardNumber('123')).toBe('123');
  });
});