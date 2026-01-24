import { ILineFieldConfidence, IInvoiceLine } from '../supplier-invoice.models';
import { PatternCache } from '../patterns/pattern-cache';
import { LineScorer, ILineScore } from '../detection/line-scorer';
import { FragmentMerger } from '../detection/fragment-merger';
import { ZoneDetector } from '../detection/zone-detector';
import { MultiLineDetector } from '../detection/multiline-detector';
import { LooseFallbackExtractor } from './loose-fallback.extractor';
import {
  parseNumber,
  cleanOcrText,
  cleanNumeric,
  calculateNetPrice,
} from '../patterns';

/**
 * Result of line extraction with statistics.
 */
export interface ILineExtractionResult {
  /** Extracted lines (guaranteed to match detected count) */
  lines: IInvoiceLine[];

  /** Statistics */
  stats: {
    /** Lines detected by heuristics */
    detected: number;
    /** Lines fully extracted */
    extracted: number;
    /** Lines partially extracted */
    partial: number;
    /** Lines detected but not parsed (created empty) */
    failed: number;
  };
}

/**
 * Default confidence for fields.
 */
const DEFAULT_CONFIDENCE: ILineFieldConfidence = {
  reference: 0,
  designation: 0,
  quantity: 0,
  unitPrice: 0,
  total: 0,
};

/**
 * Extracts invoice line items from text using multi-strategy approach.
 * GUARANTEES: Returns at least as many lines as detected (never loses lines).
 */
export class LineItemExtractor {
  readonly #patterns = PatternCache.getInstance();
  readonly #lineScorer: LineScorer;
  readonly #fragmentMerger: FragmentMerger;
  readonly #zoneDetector: ZoneDetector;
  readonly #multiLineDetector: MultiLineDetector;
  readonly #looseFallback: LooseFallbackExtractor;

  constructor(noiseKeywords: string[] = []) {
    this.#lineScorer = new LineScorer({ noiseKeywords });
    this.#fragmentMerger = new FragmentMerger();
    this.#zoneDetector = new ZoneDetector();
    this.#multiLineDetector = new MultiLineDetector();
    this.#looseFallback = new LooseFallbackExtractor();
  }

  /**
   * Extracts all line items from text.
   * Uses parallel extraction from all methods and guarantees N lines output.
   * @param text Source text
   * @param defaultVatRate Default VAT rate to apply
   * @returns Array of extracted line items
   */
  extractLines(text: string, defaultVatRate: number = 0.2): IInvoiceLine[] {
    const result = this.extractLinesWithStats(text, defaultVatRate);
    return result.lines;
  }

  /**
   * Extracts lines with detailed statistics.
   * @param text Source text
   * @param defaultVatRate Default VAT rate
   * @returns Extraction result with stats
   */
  extractLinesWithStats(text: string, defaultVatRate: number = 0.2): ILineExtractionResult {
    const cleanedText = cleanOcrText(text);

    // Get table zone lines
    const tableLines = this.#zoneDetector.extractTableLines(cleanedText);

    // Merge fragmented lines (single line split by OCR)
    const { lines: fragmentMergedLines } = this.#fragmentMerger.merge(tableLines);

    // Detect and merge multi-line products (product spanning multiple lines)
    const { lines: mergedLines } = this.#multiLineDetector.process(fragmentMergedLines);

    // Score ALL lines (not just high-score ones) to never lose lines
    const allScoredLines = this.#lineScorer.scoreAllLines(mergedLines);

    // Filter out clearly non-product lines (score <= -5 means IS_TOTAL, IS_HEADER, etc.)
    // But keep low-score lines (0-2) as they might be products with unusual format
    const candidateLines = allScoredLines.filter(l => l.score > -5);

    // If no candidate lines, fall back to full text extraction
    if (candidateLines.length === 0) {
      const fallbackLines = this.#extractFromFullText(cleanedText, defaultVatRate);
      return {
        lines: fallbackLines,
        stats: {
          detected: fallbackLines.length,
          extracted: fallbackLines.filter(l => !l._needsReview).length,
          partial: fallbackLines.filter(l => l._needsReview && l.designation).length,
          failed: fallbackLines.filter(l => l._needsReview && !l.designation).length,
        },
      };
    }

    // Extract each candidate line using parallel strategies
    const extractedLines: IInvoiceLine[] = [];
    let extracted = 0;
    let partial = 0;
    let failed = 0;

    for (const scoredLine of candidateLines) {
      const line = this.#extractSingleLine(scoredLine, defaultVatRate);
      extractedLines.push(line);

      if (!line._needsReview) {
        extracted++;
      } else if (line.designation || line.reference) {
        partial++;
      } else {
        failed++;
      }
    }

    return {
      lines: extractedLines,
      stats: {
        detected: candidateLines.length,
        extracted,
        partial,
        failed,
      },
    };
  }

  /**
   * Extracts a single line using all available strategies.
   * @param scoredLine Scored line from detector
   * @param defaultVatRate Default VAT rate
   * @returns Extracted line (may be partial or empty with rawText)
   */
  #extractSingleLine(scoredLine: ILineScore, defaultVatRate: number): IInvoiceLine {
    const { line, lineIndex } = scoredLine;

    // Try each extraction method in order of specificity
    let result: IInvoiceLine | null = null;

    // 1. Barcode format (most specific)
    result = this.#tryBarcodeFormat(line, lineIndex, defaultVatRate);
    if (result && this.#isValidExtraction(result)) {
      return this.#markCorruptionIfSuspicious(result);
    }

    // 2. Extended format with OCR artifacts
    result = this.#tryExtendedFormat(line, lineIndex, defaultVatRate);
    if (result && this.#isValidExtraction(result)) {
      return this.#markCorruptionIfSuspicious(result);
    }

    // 3. With discount format
    result = this.#tryWithDiscountFormat(line, lineIndex, defaultVatRate);
    if (result && this.#isValidExtraction(result)) {
      return this.#markCorruptionIfSuspicious(result);
    }

    // 4. Full format
    result = this.#tryFullFormat(line, lineIndex, defaultVatRate);
    if (result && this.#isValidExtraction(result)) {
      return this.#markCorruptionIfSuspicious(result);
    }

    // 5. Simple format (qty x price)
    result = this.#trySimpleFormat(line, lineIndex, defaultVatRate);
    if (result && this.#isValidExtraction(result)) {
      return this.#markCorruptionIfSuspicious(result);
    }

    // 6. Fallback format
    result = this.#tryFallbackFormat(line, lineIndex, defaultVatRate);
    if (result && this.#isValidExtraction(result)) {
      return this.#markCorruptionIfSuspicious(result);
    }

    // 7. LOOSE FALLBACK - Permissive extraction (lower confidence)
    // Inspired by optisass-angular patterns - accepts more OCR noise
    const looseResult = this.#looseFallback.extract(line, lineIndex, defaultVatRate);
    if (looseResult.line && this.#isValidExtraction(looseResult.line)) {
      return looseResult.line;
    }

    // 8. Create empty line with raw text (NEVER lose a line)
    return this.#createEmptyLine(line, lineIndex, defaultVatRate);
  }

  /**
   * Checks if extraction is valid (has minimum required data).
   */
  #isValidExtraction(line: IInvoiceLine): boolean {
    // Must have at least designation or reference
    if (!line.designation && !line.reference) return false;

    // Should have at least one numeric value
    if (line.quantity === null && line.unitPriceHT === null && line.totalHT === null) {
      return false;
    }

    return true;
  }

  /**
   * Marks a successfully extracted line as corrupted if data looks suspicious.
   * @param line Extracted line
   * @returns Line with corruption flags set if suspicious
   */
  #markCorruptionIfSuspicious(line: IInvoiceLine): IInvoiceLine {
    const suspicion = this.#detectSuspiciousExtraction(line);

    if (suspicion.isSuspicious) {
      return {
        ...line,
        _needsReview: true,
        _isCorrupted: true,
        _corruptionReason: suspicion.reason,
      };
    }

    return line;
  }

  /**
   * Detects if an extracted line has suspicious/corrupted data.
   * @param line Extracted line
   * @returns Suspicion status and reason
   */
  #detectSuspiciousExtraction(line: IInvoiceLine): { isSuspicious: boolean; reason: string | undefined } {
    const ref = line.reference || '';
    const designation = line.designation || '';

    // Reference too short (1-2 chars) is suspicious unless it's a valid short code
    if (ref && ref.length <= 2 && !/^\d+$/.test(ref)) {
      return { isSuspicious: true, reason: 'suspicious_reference' };
    }

    // Designation starts with special character (= [ ] { } | etc.)
    if (designation && /^[=\[\]{}|\\<>@#$%^&*]/.test(designation)) {
      return { isSuspicious: true, reason: 'corrupted_designation' };
    }

    // Designation contains too many special characters
    const specialCharCount = (designation.match(/[=\[\]{}|\\<>@#$%^&*()]/g) || []).length;
    if (designation && specialCharCount > 2) {
      return { isSuspicious: true, reason: 'too_many_special_chars' };
    }

    // Reference contains invalid OCR artifacts
    if (ref && /[=\[\]{}|\\<>@#$%^&*()]/.test(ref)) {
      return { isSuspicious: true, reason: 'reference_ocr_artifacts' };
    }

    // Designation has suspicious patterns (multiple dots, garbled text)
    if (designation && /\.\d+\.[A-Z]+\.\d+/i.test(designation)) {
      return { isSuspicious: true, reason: 'garbled_designation' };
    }

    // Raw text has OCR artifacts but extraction "succeeded"
    if (line._rawText && /[=\[\]{}|\\]/.test(line._rawText) && line._extractionMethod !== 'barcode') {
      return { isSuspicious: true, reason: 'ocr_artifacts_in_source' };
    }

    return { isSuspicious: false, reason: undefined };
  }

  /**
   * Creates an empty line placeholder with raw text.
   * Marks line as corrupted if it looks like a product but couldn't be parsed.
   */
  #createEmptyLine(rawText: string, lineIndex: number, defaultVatRate: number): IInvoiceLine {
    // Try to extract at least a reference from the line
    let reference: string | null = null;
    let designation: string | null = null;

    // Try to get EAN
    const eanMatch = rawText.match(/^(\d{6,14})/);
    if (eanMatch) {
      reference = eanMatch[1];
      designation = rawText.substring(eanMatch[0].length).trim().split(/\s{2,}/)[0] || null;
    } else {
      // Try to get reference code (updated pattern to match OCR errors)
      const refMatch = rawText.match(/^([A-Z0-9]{1,5}[-\s][A-Z0-9]+)/i);
      if (refMatch) {
        reference = refMatch[1];
        designation = rawText.substring(refMatch[0].length).trim().split(/\s{2,}/)[0] || null;
      }
    }

    // Detect corruption - line has product indicators but couldn't be fully parsed
    const corruption = this.#detectCorruption(rawText, reference, designation);

    return {
      reference,
      designation,
      quantity: null,
      unit: null,
      unitPriceHT: null,
      discountRate: null,
      totalHT: null,
      vatRate: defaultVatRate,
      _rawText: rawText,
      _confidence: { ...DEFAULT_CONFIDENCE },
      _needsReview: true,
      _lineIndex: lineIndex,
      _extractionMethod: 'detected_only',
      _isCorrupted: corruption.isCorrupted,
      _corruptionReason: corruption.reason,
    };
  }

  /**
   * Detects if a line is corrupted (has product indicators but unparseable).
   * @param rawText Original line text
   * @param reference Extracted reference (if any)
   * @param designation Extracted designation (if any)
   * @returns Corruption status and reason
   */
  #detectCorruption(
    rawText: string,
    reference: string | null,
    designation: string | null,
  ): { isCorrupted: boolean; reason: string | undefined } {
    // Has amount patterns but no valid extraction = corrupted
    const amounts = rawText.match(this.#patterns.AMOUNT_PATTERN);
    const hasAmounts = amounts && amounts.length > 0;

    // Has percentage pattern
    const hasPercentage = this.#patterns.HAS_PERCENTAGE.test(rawText);

    // Has quantity-like pattern
    const hasQuantity = /\s[1-9]\d{0,2}\s/.test(rawText) || /^\d{1,3}\s/.test(rawText);

    // Check for OCR artifacts (common corruption signs)
    const hasOcrArtifacts =
      /[=\[\]{}|\\]/.test(rawText) || // Unusual characters
      /\d{2,}\.\d{2}\.\d{2}/.test(rawText) || // Multiple decimals concatenated
      /[a-z]{1,2}\s*\d{3,}/i.test(rawText.substring(0, 10)); // Garbled start

    // Line has multiple indicators of being a product but no clean data
    if ((hasAmounts || hasPercentage) && hasQuantity) {
      if (!reference && !designation) {
        return {
          isCorrupted: true,
          reason: 'ocr_unreadable',
        };
      }

      if (hasOcrArtifacts) {
        return {
          isCorrupted: true,
          reason: 'ocr_artifacts',
        };
      }

      // Has indicators but amounts couldn't be parsed properly
      if (hasAmounts && amounts!.length >= 2) {
        return {
          isCorrupted: true,
          reason: 'parsing_failed',
        };
      }
    }

    // Partial reference or designation (too short/garbled)
    if (reference && reference.length < 4 && hasAmounts) {
      return {
        isCorrupted: true,
        reason: 'partial_reference',
      };
    }

    // Line looks like it should be a product but couldn't be parsed
    if (hasAmounts && hasPercentage && !reference && !designation) {
      return {
        isCorrupted: true,
        reason: 'structure_unrecognized',
      };
    }

    return { isCorrupted: false, reason: undefined };
  }

  /**
   * Tries barcode format extraction.
   * Pattern: EAN (8-14 digits) + Designation + Qty + Price + Discount% + Total
   */
  #tryBarcodeFormat(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    if (!this.#patterns.EAN_FULL.test(line)) return null;

    const match = line.match(this.#patterns.LINE_BARCODE);
    if (!match) return null;

    const reference = match[1];
    const designation = match[2].trim();
    const quantity = parseNumber(match[3]);
    const unitPrice = parseNumber(cleanNumeric(match[4]));
    const discountPercent = parseNumber(match[5]);
    const total = parseNumber(cleanNumeric(match[6]));

    if (quantity <= 0 && unitPrice <= 0) return null;

    const calculatedTotal = total > 0 ? total : quantity * calculateNetPrice(unitPrice, discountPercent);

    return {
      reference,
      designation,
      quantity: quantity > 0 ? quantity : null,
      unit: null,
      unitPriceHT: unitPrice > 0 ? unitPrice : null,
      discountRate: discountPercent > 0 ? discountPercent / 100 : null,
      totalHT: calculatedTotal > 0 ? calculatedTotal : null,
      vatRate: defaultVatRate,
      _rawText: line,
      _confidence: this.#calculateConfidence(reference, designation, quantity, unitPrice, total),
      _needsReview: quantity <= 0 || unitPrice <= 0 || total <= 0,
      _lineIndex: lineIndex,
      _extractionMethod: 'barcode',
    };
  }

  /**
   * Tries extended format with OCR artifacts handling.
   */
  #tryExtendedFormat(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    const match = line.match(this.#patterns.LINE_EXTENDED);
    if (!match) return null;

    const reference = match[1].trim();
    const designation = match[2].trim();
    const quantity = parseNumber(match[3]);
    const unitPrice = parseNumber(cleanNumeric(match[4]));
    const discountPercent = parseNumber(match[5]);
    const total = parseNumber(cleanNumeric(match[6]));

    if (quantity <= 0 && unitPrice <= 0) return null;

    const calculatedTotal = total > 0 ? total : quantity * calculateNetPrice(unitPrice, discountPercent);

    return {
      reference,
      designation,
      quantity: quantity > 0 ? quantity : null,
      unit: null,
      unitPriceHT: unitPrice > 0 ? unitPrice : null,
      discountRate: discountPercent > 0 ? discountPercent / 100 : null,
      totalHT: calculatedTotal > 0 ? calculatedTotal : null,
      vatRate: defaultVatRate,
      _rawText: line,
      _confidence: this.#calculateConfidence(reference, designation, quantity, unitPrice, total),
      _needsReview: quantity <= 0 || unitPrice <= 0,
      _lineIndex: lineIndex,
      _extractionMethod: 'extended',
    };
  }

  /**
   * Tries format with discount percentage.
   */
  #tryWithDiscountFormat(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    const match = line.match(this.#patterns.LINE_WITH_DISCOUNT);
    if (!match) return null;

    const reference = match[1].trim();
    const designation = match[2].trim();
    const quantity = parseNumber(match[3]);
    const unitPrice = parseNumber(match[4]);
    const discountPercent = parseNumber(match[5]);
    const total = parseNumber(match[6]);

    if (quantity <= 0 && unitPrice <= 0) return null;

    return {
      reference,
      designation,
      quantity: quantity > 0 ? quantity : null,
      unit: null,
      unitPriceHT: unitPrice > 0 ? unitPrice : null,
      discountRate: discountPercent > 0 ? discountPercent / 100 : null,
      totalHT: total > 0 ? total : quantity * unitPrice * (1 - discountPercent / 100),
      vatRate: defaultVatRate,
      _rawText: line,
      _confidence: this.#calculateConfidence(reference, designation, quantity, unitPrice, total),
      _needsReview: quantity <= 0 || unitPrice <= 0,
      _lineIndex: lineIndex,
      _extractionMethod: 'with_discount',
    };
  }

  /**
   * Tries full format: Description Qty [Unit] Price Total
   */
  #tryFullFormat(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    const match = line.match(this.#patterns.LINE_FULL);
    if (!match) return null;

    const quantity = parseNumber(match[2]);
    const unitPrice = parseNumber(match[4]);
    const total = parseNumber(match[5]);

    if (quantity <= 0 && unitPrice <= 0) return null;

    const designation = match[1].trim();
    const reference = this.#extractReference(designation);

    return {
      reference,
      designation: reference ? designation.replace(reference, '').trim() : designation,
      quantity: quantity > 0 ? quantity : null,
      unit: match[3]?.toLowerCase() || null,
      unitPriceHT: unitPrice > 0 ? unitPrice : null,
      discountRate: null,
      totalHT: total > 0 ? total : quantity * unitPrice,
      vatRate: defaultVatRate,
      _rawText: line,
      _confidence: this.#calculateConfidence(reference, designation, quantity, unitPrice, total),
      _needsReview: quantity <= 0 || unitPrice <= 0,
      _lineIndex: lineIndex,
      _extractionMethod: 'full',
    };
  }

  /**
   * Tries simple format: Qty x Price
   */
  #trySimpleFormat(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    const match = line.match(this.#patterns.LINE_SIMPLE);
    if (!match) return null;

    const quantity = parseNumber(match[1]);
    const unitPrice = parseNumber(match[2]);

    if (quantity <= 0 || unitPrice <= 0) return null;

    return {
      reference: null,
      designation: `Article (ligne ${lineIndex + 1})`,
      quantity,
      unit: null,
      unitPriceHT: unitPrice,
      discountRate: null,
      totalHT: quantity * unitPrice,
      vatRate: defaultVatRate,
      _rawText: line,
      _confidence: {
        reference: 0,
        designation: 0.3,
        quantity: 0.8,
        unitPrice: 0.8,
        total: 0.7,
      },
      _needsReview: true, // No real designation
      _lineIndex: lineIndex,
      _extractionMethod: 'simple',
    };
  }

  /**
   * Tries fallback format.
   */
  #tryFallbackFormat(line: string, lineIndex: number, defaultVatRate: number): IInvoiceLine | null {
    const match = line.match(this.#patterns.LINE_FALLBACK);
    if (!match) return null;

    const reference = match[1].trim();
    const designation = match[2].trim();
    const quantity = parseNumber(match[3]);
    const unitPrice = parseNumber(cleanNumeric(match[4]));

    if (quantity <= 0 && unitPrice <= 0) return null;

    return {
      reference,
      designation,
      quantity: quantity > 0 ? quantity : null,
      unit: null,
      unitPriceHT: unitPrice > 0 ? unitPrice : null,
      discountRate: null,
      totalHT: quantity > 0 && unitPrice > 0 ? quantity * unitPrice : null,
      vatRate: defaultVatRate,
      _rawText: line,
      _confidence: this.#calculateConfidence(reference, designation, quantity, unitPrice, 0),
      _needsReview: true,
      _lineIndex: lineIndex,
      _extractionMethod: 'fallback',
    };
  }

  /**
   * Fallback extraction from full text when no lines detected.
   */
  #extractFromFullText(text: string, defaultVatRate: number): IInvoiceLine[] {
    const lines: IInvoiceLine[] = [];
    const textLines = text.split('\n');

    let lineIndex = 0;
    for (const textLine of textLines) {
      const trimmed = textLine.trim();
      if (!trimmed || trimmed.length < 10) continue;

      // Skip obvious non-product lines
      if (this.#patterns.IS_TOTAL.test(trimmed)) continue;
      if (this.#patterns.IS_HEADER.test(trimmed) && !this.#patterns.AMOUNT_PATTERN.test(trimmed)) {
        continue;
      }

      // Try to extract
      const result = this.#extractSingleLine(
        { line: trimmed, lineIndex, score: 1, criteria: ['fallback'], isProductLine: true },
        defaultVatRate,
      );

      if (result.designation || result.reference || result.quantity !== null) {
        lines.push(result);
        lineIndex++;
      }
    }

    return lines;
  }

  /**
   * Calculates confidence for extracted fields.
   */
  #calculateConfidence(
    reference: string | null,
    designation: string | null,
    quantity: number,
    unitPrice: number,
    total: number,
  ): ILineFieldConfidence {
    return {
      reference: reference && reference.length >= 4 ? 0.9 : reference ? 0.6 : 0,
      designation: designation && designation.length >= 3 ? 0.85 : designation ? 0.5 : 0,
      quantity: quantity > 0 ? 0.9 : 0,
      unitPrice: unitPrice > 0 ? 0.9 : 0,
      total: total > 0 ? 0.9 : quantity > 0 && unitPrice > 0 ? 0.7 : 0,
    };
  }

  /**
   * Extracts product reference from designation.
   */
  #extractReference(designation: string): string | null {
    const match = designation.match(/^([A-Z0-9]{3,15})\s/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Validates extracted lines against totals.
   * @param lines Extracted lines
   * @param expectedTotalHT Expected total HT
   * @returns Validation result
   */
  validateAgainstTotal(
    lines: IInvoiceLine[],
    expectedTotalHT: number,
  ): { isValid: boolean; calculatedTotal: number; difference: number } {
    const calculatedTotal = lines.reduce((sum, line) => sum + (line.totalHT ?? 0), 0);
    const difference = Math.abs(calculatedTotal - expectedTotalHT);

    // Allow 1% tolerance or 0.01 absolute difference
    const tolerance = Math.max(0.01, expectedTotalHT * 0.01);

    return {
      isValid: difference <= tolerance,
      calculatedTotal,
      difference,
    };
  }

  /**
   * Infers VAT rate from line amounts and totals.
   * @param _lines Extracted lines
   * @param totalHT Total excluding tax
   * @param totalTTC Total including tax
   * @returns Inferred VAT rate or null
   */
  inferVATRate(_lines: IInvoiceLine[], totalHT: number, totalTTC: number): number | null {
    if (totalHT <= 0 || totalTTC <= totalHT) return null;

    const vat = totalTTC - totalHT;
    const rate = vat / totalHT;

    if (rate >= 0.05 && rate <= 0.3) {
      // Moroccan VAT rates: 7%, 10%, 14%, 20%
      const commonRates = [0.07, 0.1, 0.14, 0.2];
      for (const common of commonRates) {
        if (Math.abs(rate - common) < 0.02) {
          return common;
        }
      }
      return Math.round(rate * 100) / 100;
    }

    return null;
  }
}
