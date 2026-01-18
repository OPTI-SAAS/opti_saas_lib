/**
 * Locale-specific patterns for OCR extraction.
 * Each locale provides patterns for its language.
 */
export interface IOcrLocale {
  /** Locale code (e.g., 'fr', 'en') */
  code: string;

  /** Month names for date parsing */
  months: string[];

  /** Patterns for invoice number detection */
  invoiceNumber: RegExp[];

  /** Patterns for date context detection */
  dateContext: {
    invoice: RegExp[];
    due: RegExp[];
  };

  /** Patterns for amount labels */
  amounts: {
    totalHT: RegExp[];
    totalTTC: RegExp[];
    vat: RegExp[];
    discount: RegExp[];
    netToPay: RegExp[];
  };

  /** Patterns for supplier info */
  supplier: {
    name: RegExp[];
    address: RegExp[];
    phone: RegExp[];
  };

  /** Patterns for payment terms */
  paymentTerms: RegExp[];

  /** Common words to filter out from extraction */
  stopWords: string[];

  /** Keywords that indicate a line is NOT a product (noise filtering) */
  noiseKeywords: string[];

  /** Fallback patterns for invoice number (e.g., FA2024001) */
  invoiceNumberFallback: RegExp[];
}

/**
 * Extraction result with confidence.
 */
export interface IExtractionResult<T> {
  /** Extracted value */
  value: T | null;

  /** Confidence score (0-1) */
  confidence: number;

  /** Source text that matched */
  sourceText: string | null;

  /** Pattern that matched */
  matchedPattern: string | null;
}
