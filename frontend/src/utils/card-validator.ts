import type { CardBrand } from '../types';

/**
 * Detect card brand from card number
 */
export function detectCardBrand(number: string): CardBrand {
  const cleaned = number.replace(/\s/g, '');
  if (/^4[0-9]{0,}$/.test(cleaned)) return 'visa';
  if (/^(5[1-5]|2[2-7])[0-9]{0,}$/.test(cleaned)) return 'mastercard';
  return 'unknown';
}

/**
 * Luhn algorithm validation
 */
export function isValidLuhn(number: string): boolean {
  const cleaned = number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format card number with spaces every 4 digits
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Validate expiry date
 */
export function isValidExpiry(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (m < 1 || m > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;

  return true;
}

/**
 * Validate CVC (3 or 4 digits)
 */
export function isValidCVC(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}
