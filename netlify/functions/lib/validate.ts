// Accepts a US/North American phone number: 10 digits, or 11 digits
// starting with a country code of 1. Rejects junk (letters, too short/long).
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}

// A plain "name@domain.tld" shape check — enough to catch typos.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// US ZIP code: 12345 or 12345-6789.
export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}
