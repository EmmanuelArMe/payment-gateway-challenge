import {
  detectCardBrand,
  formatCardNumber,
  isValidCVC,
  isValidExpiry,
  isValidLuhn,
} from './card-validator';

describe('card-validator', () => {
  it('detects visa cards', () => {
    expect(detectCardBrand('4111 1111 1111 1111')).toBe('visa');
  });

  it('detects mastercard cards', () => {
    expect(detectCardBrand('5555 5555 5555 4444')).toBe('mastercard');
  });

  it('returns unknown for unsupported cards', () => {
    expect(detectCardBrand('9111 1111 1111 1111')).toBe('unknown');
  });

  it('validates card number using luhn', () => {
    expect(isValidLuhn('4242424242424242')).toBe(true);
    expect(isValidLuhn('4242424242424241')).toBe(false);
  });

  it('formats card numbers with spaces', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('validates expiry dates', () => {
    expect(isValidExpiry('12', '99')).toBe(true);
    expect(isValidExpiry('13', '99')).toBe(false);
    expect(isValidExpiry('01', '10')).toBe(false);
  });

  it('validates CVC', () => {
    expect(isValidCVC('123')).toBe(true);
    expect(isValidCVC('1234')).toBe(true);
    expect(isValidCVC('12')).toBe(false);
  });
});