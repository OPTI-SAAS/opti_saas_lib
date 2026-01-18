/**
 * Universal numeric patterns (language-independent).
 */
export const NUMERIC_PATTERNS = {
  /**
   * Date formats (numeric only).
   * Captures: day, month, year
   */
  DATE: {
    /** DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY */
    DMY: /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/,
    /** YYYY/MM/DD, YYYY-MM-DD */
    YMD: /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/,
    /** MM/DD/YYYY (US format) */
    MDY: /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/,
  },

  /**
   * Amount formats.
   * Handles French (1 234,56) and English (1,234.56) formats.
   */
  AMOUNT: {
    /** French format: 1 234,56 or 1234,56 */
    FRENCH: /([\d\s]+,\d{2})/,
    /** English format: 1,234.56 or 1234.56 */
    ENGLISH: /([\d,]+\.\d{2})/,
    /** Any number with optional decimals */
    GENERIC: /([\d\s.,]+)/,
  },

  /**
   * Quantity patterns.
   */
  QUANTITY: {
    /** Integer quantity */
    INTEGER: /(\d+)/,
    /** Decimal quantity (e.g., 1.5, 2,5) */
    DECIMAL: /(\d+[.,]\d+)/,
    /** Quantity with unit: "10 pcs", "5 kg" */
    WITH_UNIT: /(\d+(?:[.,]\d+)?)\s*(pcs?|kg|g|l|ml|m|cm|mm|unit[és]?|box|carton|lot)/i,
  },

  /**
   * Percentage patterns.
   */
  PERCENTAGE: {
    /** 20%, 20 %, 20.5% */
    STANDARD: /(\d+(?:[.,]\d+)?)\s*%/,
  },

  /**
   * Currency symbols and codes.
   */
  CURRENCY: {
    /** Symbol detection */
    SYMBOL: /[€$£¥₹₽]/,
    /** Code detection (EUR, USD, MAD, etc.) */
    CODE: /\b(EUR|USD|GBP|MAD|DH|CHF|CAD|AUD|JPY)\b/i,
    /** Symbol to code mapping */
    SYMBOL_MAP: {
      '€': 'EUR',
      $: 'USD',
      '£': 'GBP',
      '¥': 'JPY',
    } as Record<string, string>,
  },

  /**
   * Line item pattern.
   * Captures: description, quantity, unit (optional), unit price, total
   */
  LINE_ITEM: {
    /**
     * Extended format with OCR artifacts handling.
     * Code + Designation + Qty + Price (with OCR artifacts) + Discount% + Total
     * Handles malformed delimiters: f, ], }, |, etc.
     */
    EXTENDED:
      /^([a-z0-9\-\.]+)\s+(.+?)\s+(\d+(?:[\.,]\d+)?)\s+([\d\s\.,\]\[\}\{\)\|f]+)\s+([\d\.\s]+)%?\s+([\d\s\.,]+)/i,
    /**
     * With discount: Code + Designation + Qty + Price + Discount% + Total
     * Generic pattern for various invoice formats
     */
    WITH_DISCOUNT:
      /^([A-Z0-9][-A-Z0-9]{2,20})\s+(.{5,60}?)\s+(\d+(?:[.,]\d+)?)\s+([\d\s.,]+)\s+(\d+(?:[.,]\d+)?)\s*%\s+([\d\s.,]+)/gim,
    /** Full format: Description Qty [Unit] Price Total */
    FULL: /^(.{3,60}?)\s+(\d+(?:[.,]\d+)?)\s*(pcs?|kg|unité|unit|box|carton|lot)?\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)/gim,
    /** Fallback format: Ref + Text + Qty + Price */
    FALLBACK: /^([a-z0-9\-\.]{4,})\s+(.+?)\s+(\d+(?:[\.,]\d+)?)\s+([\d\s\.,]+)$/i,
    /** Simple format: Qty x Price */
    SIMPLE: /(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/g,
    /** Barcode line: starts with 8-14 digits (EAN/UPC) */
    BARCODE_LINE: /^(\d{8,14})\s+(.+)/,
  },

  /**
   * Multi-page invoice patterns.
   */
  MULTI_PAGE: {
    /** Total to carry forward */
    TOTAL_A_REPORTER: /total\s*[àa]\s*reporter\s*[:\s]*([\d\s.,]+)/i,
    /** Report from previous page */
    REPORT: /report\s*[:\s]*([\d\s.,]+)/i,
  },
};

/**
 * Parses a number from text, handling both French and English formats.
 * @param value Text to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseNumber(value: string): number {
  if (!value) return 0;

  let cleaned = value.replace(/\s/g, '');

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    cleaned = cleaned.replace(/,/g, '');
  } else if (lastComma !== -1) {
    cleaned = cleaned.replace(',', '.');
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses a date from regex match groups.
 * @param match Regex match array
 * @param format Date format (dmy, ymd, mdy)
 * @param monthNames Optional month names for text months
 * @returns Parsed Date or null
 */
export function parseDate(
  match: RegExpMatchArray,
  format: 'dmy' | 'ymd' | 'mdy' = 'dmy',
  monthNames?: string[],
): Date | null {
  try {
    let day: number, month: number, year: number;

    if (monthNames && match[2] && isNaN(parseInt(match[2]))) {
      const monthIndex = monthNames.findIndex(
        (m) => m.toLowerCase() === match[2].toLowerCase(),
      );
      if (monthIndex === -1) return null;
      day = parseInt(match[1]);
      month = monthIndex;
      year = parseInt(match[3]);
    } else {
      switch (format) {
        case 'ymd':
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          day = parseInt(match[3]);
          break;
        case 'mdy':
          month = parseInt(match[1]) - 1;
          day = parseInt(match[2]);
          year = parseInt(match[3]);
          break;
        case 'dmy':
        default:
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
      }
    }

    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    if (month < 0 || month > 11 || day < 1 || day > 31) {
      return null;
    }

    return new Date(year, month, day);
  } catch {
    return null;
  }
}

/**
 * Cleans OCR text by removing common artifacts and normalizing characters.
 * @param text Raw OCR text
 * @returns Cleaned text
 */
export function cleanOcrText(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        // Replace common OCR misreads for digits
        .replace(/[îìíï]/g, '1')
        .replace(/[ôòóö]/g, '0')
        .replace(/[ûùúü]/g, 'u')
        // Remove bracket/pipe artifacts that appear after numbers
        .replace(/(\d)[}\]|)]+/g, '$1')
        .replace(/[}\]|)]+(\d)/g, '$1')
        // Remove isolated special characters between spaces
        .replace(/\s+[|}\])\[{(]+\s+/g, ' ')
        // Normalize multiple spaces to single space
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .join('\n');
}

/**
 * Detects currency from text and returns its code.
 * @param text Text to analyze
 * @param defaultCurrency Default currency code
 * @returns Currency code
 */
export function detectCurrency(text: string, defaultCurrency = 'MAD'): string {
  const codeMatch = text.match(NUMERIC_PATTERNS.CURRENCY.CODE);
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    return code === 'DH' ? 'MAD' : code;
  }

  const symbolMatch = text.match(NUMERIC_PATTERNS.CURRENCY.SYMBOL);
  if (symbolMatch) {
    const symbol = symbolMatch[0];
    return NUMERIC_PATTERNS.CURRENCY.SYMBOL_MAP[symbol] ?? defaultCurrency;
  }

  return defaultCurrency;
}

/**
 * Cleans a numeric string by removing all non-numeric characters except dots.
 * Handles OCR artifacts like ], }, |, f that may appear in prices.
 * @param value Raw string with potential OCR artifacts
 * @returns Clean numeric string
 */
export function cleanNumeric(value: string): string {
  if (!value) return '';
  return value
    .replace(/,/g, '.') // Normalize comma to dot
    .replace(/[^\d.]/g, ''); // Remove all non-numeric except dot
}

/**
 * Validates a date against reasonable bounds.
 * @param date Date to validate
 * @param maxYearsInFuture Maximum years in future (default 1)
 * @param minYear Minimum valid year (default 2000)
 * @param maxYear Maximum valid year (default 2100)
 * @returns true if date is valid
 */
export function isValidInvoiceDate(
  date: Date,
  maxYearsInFuture = 1,
  minYear = 2000,
  maxYear = 2100,
): boolean {
  if (!date || isNaN(date.getTime())) return false;

  const year = date.getFullYear();
  if (year < minYear || year > maxYear) return false;

  const now = new Date();
  const futureLimit = new Date();
  futureLimit.setFullYear(now.getFullYear() + maxYearsInFuture);

  return date <= futureLimit;
}

/**
 * Checks if a line is likely a product line (starts with barcode).
 * Lines starting with 8-14 digits are force-allowed as products.
 * @param line Line to check
 * @returns true if line starts with barcode pattern
 */
export function startsWithBarcode(line: string): boolean {
  return /^\d{8,14}/.test(line.trim());
}

/**
 * Checks if a line contains noise keywords and should be excluded from product lines.
 * Conservative approach: only filter lines that are clearly NOT products.
 * @param line Line to check
 * @param noiseKeywords Array of keywords to check against
 * @returns true if line contains noise (should be excluded)
 */
export function isNoiseLine(line: string, noiseKeywords: string[]): boolean {
  const trimmedLine = line.trim();

  // Empty lines are noise
  if (trimmedLine.length === 0) return true;

  // Lines starting with barcode or alphanumeric code are force-allowed as products
  if (startsWithBarcode(trimmedLine)) return false;
  if (/^[A-Z0-9][-A-Z0-9]{3,}/.test(trimmedLine)) return false;

  // Only filter lines that exactly match noise keywords (case-insensitive)
  const lowerLine = trimmedLine.toLowerCase();
  if (noiseKeywords.some((k) => lowerLine.includes(k.toLowerCase()))) return true;

  return false;
}

/**
 * Extracts brand from designation text.
 * Takes the first word if it's at least 3 characters.
 * @param designation Product designation text
 * @returns Extracted brand or empty string
 */
export function extractBrand(designation: string): string {
  const parts = designation.split(/\s+/);
  const firstWord = parts[0] || '';
  return firstWord.length >= 3 ? firstWord : '';
}

/**
 * Calculates net price after discount.
 * @param unitPrice Unit price before discount
 * @param discountPercent Discount percentage (e.g., 15 for 15%)
 * @returns Net price after discount
 */
export function calculateNetPrice(
  unitPrice: number,
  discountPercent: number,
): number {
  return unitPrice * (1 - discountPercent / 100);
}
