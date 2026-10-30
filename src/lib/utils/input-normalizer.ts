/**
 * Input Normalizer Utility
 * Normalizes Arabic-Indic and Eastern Arabic digits to standard Latin digits,
 * trims excess whitespace, and cleans Egyptian phone numbers.
 * Safe for copy-paste handlers across all inputs.
 */

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/**
 * Converts any Arabic/Eastern-Indic digits in a string to standard ASCII 0-9 digits.
 */
export function normalizeDigits(input: string): string {
  if (!input) return '';
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const arabicIdx = ARABIC_INDIC_DIGITS.indexOf(char);
    if (arabicIdx !== -1) {
      result += String(arabicIdx);
      continue;
    }
    const easternIdx = EASTERN_ARABIC_DIGITS.indexOf(char);
    if (easternIdx !== -1) {
      result += String(easternIdx);
      continue;
    }
    result += char;
  }
  return result;
}

/**
 * Cleans user text input by trimming leading/trailing whitespace
 * and collapsing multiple internal whitespace characters to single spaces.
 */
export function normalizeText(input: string): string {
  if (!input) return '';
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitizes phone input in real-time during typing (onChange):
 * - Converts Arabic-Indic digits to ASCII
 * - Allows leading '+', spaces, and digits
 * - Automatically normalizes full Egyptian prefixes (+20, 0020) without blocking the user
 */
export function sanitizePhoneInput(input: string): string {
  if (!input) return '';
  let val = normalizeDigits(input);
  // Keep only digits, single leading +, and spaces
  const hasPlus = val.startsWith('+');
  val = val.replace(/[^\d]/g, '');
  if (hasPlus) val = '+' + val;

  // Auto-convert full +20 or 0020 prefixes
  if (val.startsWith('+20') && val.length >= 4) {
    val = '0' + val.slice(3);
  } else if (val.startsWith('0020') && val.length >= 5) {
    val = '0' + val.slice(4);
  } else if (val.startsWith('20') && val.length >= 12) {
    val = '0' + val.slice(2);
  }

  return val;
}

/**
 * Normalizes Egyptian mobile phone numbers to standard 11 digits (e.g. 01012345678):
 * - Converts Arabic-Indic numbers to ASCII
 * - Removes non-digit characters except optional leading '+'
 * - Handles country code +20 / 0020 or leading 20
 * - Returns 11-digit mobile starting with 01 (e.g., 01012345678)
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return '';
  let cleaned = normalizeDigits(input).trim();
  cleaned = cleaned.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('20') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.slice(2);
  }

  // Ensure it retains only digits now
  cleaned = cleaned.replace(/\D/g, '');

  // If user entered 10 digits starting with 1 (e.g. 1012345678), prepend 0
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Validates whether the normalized phone number matches standard Egyptian mobile formats (010, 011, 012, 015).
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^01[0125]\d{8}$/.test(normalized);
}

/**
 * Normalizes activation codes:
 * Converts digits, trims spaces, converts to uppercase.
 */
export function normalizeActivationCode(code: string): string {
  if (!code) return '';
  return normalizeDigits(code).toUpperCase().replace(/\s+/g, '');
}

/**
 * Virtual Email generator for Supabase Auth
 * Converts an Egyptian mobile number to internal virtual email format:
 * e.g., 01012345678 -> 01012345678@student.platform.local
 */
export function phoneToVirtualEmail(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  return `${normalized}@student.platform.local`;
}
