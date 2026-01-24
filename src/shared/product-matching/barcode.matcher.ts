/**
 * Barcode matching utilities for product identification.
 * Supports EAN-8, EAN-13, EAN-14, UPC-A, and UPC-E formats.
 */

/**
 * Supported barcode types.
 */
export type BarcodeType = 'EAN-8' | 'EAN-13' | 'UPC-A' | 'UPC-E' | 'EAN-14';

/**
 * Result of barcode normalization.
 */
export interface INormalizedBarcode {
  readonly original: string;
  readonly normalized: string;
  readonly type: BarcodeType | null;
  readonly isValid: boolean;
}

/**
 * Normalizes a barcode by removing spaces, dashes, and other non-digit characters.
 * @param raw The raw barcode string
 * @returns The normalized barcode (digits only) or null if invalid format
 */
export function normalizeBarcode(raw: string): string | null {
  if (!raw) return null;

  const cleaned = raw.replace(/[\s\-\.]/g, '');

  if (!/^\d{8,14}$/.test(cleaned)) return null;

  return cleaned;
}

/**
 * Detects the type of barcode based on its format.
 * @param barcode Normalized barcode (digits only)
 * @returns The detected barcode type or null if unrecognized
 */
export function detectBarcodeType(barcode: string): BarcodeType | null {
  if (!barcode || !/^\d+$/.test(barcode)) return null;

  const len = barcode.length;

  if (len === 8 && /^[01]\d{7}$/.test(barcode)) {
    return 'UPC-E';
  }

  if (len === 8) {
    return 'EAN-8';
  }

  if (len === 12) {
    return 'UPC-A';
  }

  if (len === 13) {
    return 'EAN-13';
  }

  if (len === 14) {
    return 'EAN-14';
  }

  return null;
}

/**
 * Validates the checksum of an EAN-13 or UPC-A barcode.
 * Uses the standard modulo-10 algorithm.
 * @param barcode The barcode to validate (12 or 13 digits)
 * @returns True if the checksum is valid
 */
export function validateBarcodeChecksum(barcode: string): boolean {
  if (!barcode || !/^\d{12,13}$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits.pop()!;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const calculated = (10 - (sum % 10)) % 10;
  return calculated === checkDigit;
}

/**
 * Validates the checksum of an EAN-8 barcode.
 * @param barcode The 8-digit EAN-8 barcode
 * @returns True if the checksum is valid
 */
export function validateEAN8Checksum(barcode: string): boolean {
  if (!barcode || !/^\d{8}$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits.pop()!;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const calculated = (10 - (sum % 10)) % 10;
  return calculated === checkDigit;
}

/**
 * Fully processes a raw barcode string: normalizes, detects type, and validates.
 * @param raw The raw barcode string from OCR or scanner
 * @returns Complete barcode information
 */
export function processBarcode(raw: string): INormalizedBarcode {
  const normalized = normalizeBarcode(raw);

  if (!normalized) {
    return {
      original: raw,
      normalized: '',
      type: null,
      isValid: false,
    };
  }

  const type = detectBarcodeType(normalized);

  let isValid = false;
  if (type === 'EAN-13' || type === 'UPC-A') {
    isValid = validateBarcodeChecksum(normalized);
  } else if (type === 'EAN-8') {
    isValid = validateEAN8Checksum(normalized);
  } else if (type === 'EAN-14') {
    const ean13Part = normalized.substring(1);
    isValid = validateBarcodeChecksum(ean13Part);
  } else if (type === 'UPC-E') {
    const expanded = expandUPCE(normalized);
    isValid = expanded ? validateBarcodeChecksum(expanded) : false;
  }

  return {
    original: raw,
    normalized,
    type,
    isValid,
  };
}

/**
 * Expands a UPC-E barcode to UPC-A format.
 * @param upce The 8-digit UPC-E barcode
 * @returns The 12-digit UPC-A equivalent or null if invalid
 */
export function expandUPCE(upce: string): string | null {
  if (!upce || !/^[01]\d{7}$/.test(upce)) return null;

  const manufacturer = upce.substring(1, 7);
  const checkDigit = upce.charAt(7);
  const flag = upce.charAt(0);

  let expanded: string;
  const lastDigit = manufacturer.charAt(5);

  switch (lastDigit) {
    case '0':
    case '1':
    case '2':
      expanded =
        flag +
        manufacturer.substring(0, 2) +
        lastDigit +
        '0000' +
        manufacturer.substring(2, 5);
      break;
    case '3':
      expanded =
        flag + manufacturer.substring(0, 3) + '00000' + manufacturer.substring(3, 5);
      break;
    case '4':
      expanded =
        flag + manufacturer.substring(0, 4) + '00000' + manufacturer.charAt(4);
      break;
    default:
      expanded = flag + manufacturer.substring(0, 5) + '0000' + lastDigit;
      break;
  }

  return expanded + checkDigit;
}

/**
 * Converts EAN-8 to EAN-13 by prepending zeros.
 * @param ean8 The 8-digit EAN-8 barcode
 * @returns The 13-digit EAN-13 equivalent
 */
export function expandEAN8toEAN13(ean8: string): string | null {
  if (!ean8 || !/^\d{8}$/.test(ean8)) return null;

  return '00000' + ean8;
}
