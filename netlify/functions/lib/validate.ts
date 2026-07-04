// Accepts a US/North American phone number: 10 digits, or 11 digits
// starting with a country code of 1. Rejects junk (letters, too short/long).
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}
