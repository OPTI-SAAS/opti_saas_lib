import { IInvoiceLine, ILineFieldConfidence } from '../supplier-invoice.models';
import { parseNumber, cleanNumeric, calculateNetPrice } from '../patterns';

/**
 * Confidence levels for loose fallback extraction.
 * Lower than strict extraction since data quality is uncertain.
 */
const LOOSE_CONFIDENCE: ILineFieldConfidence = {
  reference: 0.4,
  designation: 0.5,
  quantity: 0.6,
  unitPrice: 0.6,
  total: 0.5,
};

/**
 * Result of loose extraction attempt.
 */
export interface ILooseExtractionResult {
  /** Extracted line (may be partial) */
  line: IInvoiceLine | null;
  /** Strategy that succeeded */
  strategy: string | null;
}

/**
 * Loose fallback extractor inspired by optisass-angular patterns.
 * Used when strict extraction fails - more permissive but lower confidence.
 *
 * Strategy: Accept more noise, let the user verify.
 * Better to have data that needs review than no data at all.
 */
export class LooseFallbackExtractor {
  /**
   * Attempts loose extraction on a line that failed strict extraction.
   * @param rawText Raw line text
   * @param lineIndex Line index in document
   * @param defaultVatRate Default VAT rate
   * @returns Extraction result with line and strategy used
   */
  extract(rawText: string, lineIndex: number, defaultVatRate: number): ILooseExtractionResult {
    const trimmed = rawText.trim();
    if (!trimmed || trimmed.length < 10) {
      return { line: null, strategy: null };
    }

    // Strategy 1: Extended format with OCR artifacts (optisass-angular main pattern)
    let result = this.#tryExtendedOcrArtifacts(trimmed, lineIndex, defaultVatRate);
    if (result) return { line: result, strategy: 'loose_extended_ocr' };

    // Strategy 2: Any line with code-like start + amounts
    result = this.#tryCodeWithAmounts(trimmed, lineIndex, defaultVatRate);
    if (result) return { line: result, strategy: 'loose_code_amounts' };

    // Strategy 3: Quantities and prices only (minimal extraction)
    result = this.#tryMinimalQtyPrice(trimmed, lineIndex, defaultVatRate);
    if (result) return { line: result, strategy: 'loose_qty_price' };

    // Strategy 4: Any line with multiple numbers (desperate fallback)
    result = this.#tryMultipleNumbers(trimmed, lineIndex, defaultVatRate);
    if (result) return { line: result, strategy: 'loose_multi_numbers' };

    return { line: null, strategy: null };
  }

  /**
   * Strategy 1: Extended OCR artifacts pattern.
   * Handles malformed delimiters: f, ], }, |, etc.
   * From optisass-angular: /^([a-z0-9\-\.]+)\s+(.+?)\s+(\d+(?:[\.,]\d+)?)\s+([\d\s\.,\]\[\}\{\)\|f]+)\s+([\d\.\s]+)%?\s+([\d\s\.,]+)/i
   */
  #tryExtendedOcrArtifacts(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    // Very permissive pattern that accepts OCR garbage in price fields
    const pattern = /^([a-z0-9\-\.]{2,})\s+(.+?)\s+(\d+(?:[\.,]\d+)?)\s+([\d\s\.,\]\[\}\{\)\|f]+)\s*([\d\.\s]*%?)?\s*([\d\s\.,]*)?/i;
    const match = line.match(pattern);

    if (!match) return null;

    const reference = match[1]?.trim() || null;
    const designation = match[2]?.trim() || null;
    const quantity = parseNumber(match[3] || '0');
    const unitPrice = parseNumber(cleanNumeric(match[4] || '0'));
    const discountStr = match[5] || '';
    const totalStr = match[6] || '';

    // Extract discount if present
    const discountMatch = discountStr.match(/(\d+(?:[.,]\d+)?)\s*%/);
    const discountPercent = discountMatch ? parseNumber(discountMatch[1]) : 0;

    // Parse total, fallback to calculation
    let total = parseNumber(cleanNumeric(totalStr));
    if (total <= 0 && quantity > 0 && unitPrice > 0) {
      total = quantity * calculateNetPrice(unitPrice, discountPercent);
    }

    // Must have at least some data
    if (!designation && !reference) return null;
    if (quantity <= 0 && unitPrice <= 0) return null;

    return this.#createLooseLine(
      reference,
      designation,
      quantity,
      unitPrice,
      discountPercent,
      total,
      line,
      lineIndex,
      defaultVatRate,
      'loose_extended_ocr',
    );
  }

  /**
   * Strategy 2: Any code-like start followed by text and amounts.
   * More permissive than Strategy 1.
   */
  #tryCodeWithAmounts(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    // Look for something that looks like a code at the start
    const codePattern = /^([A-Z0-9][-A-Z0-9./]{2,20})\s+/i;
    const codeMatch = line.match(codePattern);

    if (!codeMatch) return null;

    const reference = codeMatch[1];
    const rest = line.substring(codeMatch[0].length);

    // Find all numbers in the rest of the line
    const numbers = this.#extractNumbers(rest);
    if (numbers.length < 2) return null;

    // Heuristic: last number is likely total, second to last is price or qty
    const total = numbers[numbers.length - 1];
    const priceOrQty = numbers[numbers.length - 2];

    // Try to infer quantity and price
    let quantity = 1;
    let unitPrice = priceOrQty;

    // If we have 3+ numbers, first is likely quantity
    if (numbers.length >= 3) {
      const firstNum = numbers[0];
      if (firstNum <= 100 && Number.isInteger(firstNum)) {
        quantity = firstNum;
        unitPrice = numbers[numbers.length - 2];
      }
    }

    // Extract designation (text between code and first number)
    const firstNumberIndex = rest.search(/\d/);
    const designation = firstNumberIndex > 0 ? rest.substring(0, firstNumberIndex).trim() : null;

    // Look for discount percentage
    const discountMatch = rest.match(/(\d+(?:[.,]\d+)?)\s*%/);
    const discountPercent = discountMatch ? parseNumber(discountMatch[1]) : 0;

    return this.#createLooseLine(
      reference,
      designation || `Article ${reference}`,
      quantity,
      unitPrice,
      discountPercent,
      total,
      line,
      lineIndex,
      defaultVatRate,
      'loose_code_amounts',
    );
  }

  /**
   * Strategy 3: Minimal extraction - just qty and price.
   * For lines where we can only identify numeric values.
   */
  #tryMinimalQtyPrice(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    // Look for qty x price pattern
    const qtyPricePattern = /(\d+)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/;
    const match = line.match(qtyPricePattern);

    if (match) {
      const quantity = parseInt(match[1], 10);
      const unitPrice = parseNumber(match[2]);

      if (quantity > 0 && unitPrice > 0) {
        return this.#createLooseLine(
          null,
          `Article (ligne ${lineIndex + 1})`,
          quantity,
          unitPrice,
          0,
          quantity * unitPrice,
          line,
          lineIndex,
          defaultVatRate,
          'loose_qty_price',
        );
      }
    }

    return null;
  }

  /**
   * Strategy 4: Multiple numbers fallback (desperate).
   * Just try to make sense of any line with multiple numbers.
   */
  #tryMultipleNumbers(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    const numbers = this.#extractNumbers(line);

    // Need at least 2 meaningful numbers
    if (numbers.length < 2) return null;

    // Filter out numbers that are likely dates or codes (year-like: 2024, 2025...)
    const meaningfulNumbers = numbers.filter(n => n < 2000 || n > 2100);
    if (meaningfulNumbers.length < 2) return null;

    // Last number is likely total
    const total = meaningfulNumbers[meaningfulNumbers.length - 1];

    // Try to find quantity (small integer, usually < 100)
    const possibleQty = meaningfulNumbers.find(n => n > 0 && n <= 100 && Number.isInteger(n));
    const quantity = possibleQty || 1;

    // Price is likely the largest number before total
    const priceNumbers = meaningfulNumbers.slice(0, -1).filter(n => n > 10);
    const unitPrice = priceNumbers.length > 0 ? Math.max(...priceNumbers) : total / quantity;

    // Try to extract any text as designation
    const textOnly = line.replace(/[\d\s.,\-\/\\%]+/g, ' ').trim();
    const designation = textOnly.length >= 3 ? textOnly : `Article (ligne ${lineIndex + 1})`;

    // Try to extract reference (first alphanumeric sequence)
    const refMatch = line.match(/^([A-Z0-9][-A-Z0-9.]{2,15})/i);
    const reference = refMatch ? refMatch[1] : null;

    // Check for discount
    const discountMatch = line.match(/(\d+(?:[.,]\d+)?)\s*%/);
    const discountPercent = discountMatch ? parseNumber(discountMatch[1]) : 0;

    return this.#createLooseLine(
      reference,
      designation,
      quantity,
      unitPrice,
      discountPercent,
      total,
      line,
      lineIndex,
      defaultVatRate,
      'loose_multi_numbers',
    );
  }

  /**
   * Extracts all numbers from a string.
   */
  #extractNumbers(text: string): number[] {
    const pattern = /\d+(?:[.,]\d+)?/g;
    const matches = text.match(pattern) || [];
    return matches.map(m => parseNumber(m)).filter(n => n > 0);
  }

  /**
   * Creates a loose extraction line with appropriate flags.
   */
  #createLooseLine(
    reference: string | null,
    designation: string | null,
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    total: number,
    rawText: string,
    lineIndex: number,
    defaultVatRate: number,
    extractionMethod: string,
  ): IInvoiceLine {
    // Adjust confidence based on what we have
    const confidence: ILineFieldConfidence = { ...LOOSE_CONFIDENCE };

    if (!reference) confidence.reference = 0;
    if (!designation || designation.startsWith('Article')) confidence.designation = 0.3;
    if (quantity <= 0) confidence.quantity = 0;
    if (unitPrice <= 0) confidence.unitPrice = 0;
    if (total <= 0) confidence.total = 0;

    return {
      reference,
      designation,
      quantity: quantity > 0 ? quantity : null,
      unit: null,
      unitPriceHT: unitPrice > 0 ? unitPrice : null,
      discountRate: discountPercent > 0 ? discountPercent / 100 : null,
      totalHT: total > 0 ? total : null,
      vatRate: defaultVatRate,
      _rawText: rawText,
      _confidence: confidence,
      _needsReview: true, // Always needs review for loose extraction
      _lineIndex: lineIndex,
      _extractionMethod: extractionMethod as any,
      _isCorrupted: false,
      _corruptionReason: undefined,
    };
  }
}
