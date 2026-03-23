/**
 * Format price in COP
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Mask card number showing only last 4 digits
 */
export function maskCardNumber(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length < 4) return cleaned;
  return `**** **** **** ${cleaned.slice(-4)}`;
}
