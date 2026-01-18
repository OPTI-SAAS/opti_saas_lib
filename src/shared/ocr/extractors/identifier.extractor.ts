import { BaseExtractor } from './base.extractor';
import { IExtractionResult, IOcrLocale } from '../locales';
import { MOROCCAN_PATTERNS, isValidICE, isValidIF } from '../patterns';

/**
 * Moroccan business identifiers.
 */
export interface IMoroccanIdentifiers {
  ice: string | null;
  fiscalId: string | null;
  tradeRegister: string | null;
  cnss: string | null;
  patente: string | null;
}

/**
 * Extracts business identifiers from text.
 * Supports Moroccan identifiers (ICE, IF, RC, etc.)
 */
export class IdentifierExtractor extends BaseExtractor<string> {
  /**
   * Extracts a specific identifier.
   * @param text Source text
   * @param _locale Locale (not used for identifiers, but kept for interface consistency)
   * @param type Identifier type
   * @returns Extraction result
   */
  extract(
    text: string,
    _locale: IOcrLocale,
    type: 'ice' | 'if' | 'rc' | 'cnss' | 'patente' = 'ice',
  ): IExtractionResult<string> {
    const pattern = this.#getPattern(type);
    const match = text.match(pattern);

    if (match) {
      const value = match[1];
      const isValid = this.#validate(value, type);

      return this.success(
        value,
        isValid ? this.calculateConfidence(match, text) : this.calculateConfidence(match, text) - 0.2,
        match[0],
        pattern,
      );
    }

    return this.failure();
  }

  /**
   * Extracts all Moroccan identifiers from text.
   * @param text Source text
   * @returns All found identifiers
   */
  extractAllMoroccan(text: string): IMoroccanIdentifiers {
    return {
      ice: this.#extractSimple(text, MOROCCAN_PATTERNS.ICE),
      fiscalId: this.#extractSimple(text, MOROCCAN_PATTERNS.IF),
      tradeRegister: this.#extractSimple(text, MOROCCAN_PATTERNS.RC),
      cnss: this.#extractSimple(text, MOROCCAN_PATTERNS.CNSS),
      patente: this.#extractSimple(text, MOROCCAN_PATTERNS.PATENTE),
    };
  }

  /**
   * Extracts invoice/document number.
   * @param text Source text
   * @param locale Locale for invoice number patterns
   * @returns Extraction result
   */
  extractInvoiceNumber(text: string, locale: IOcrLocale): IExtractionResult<string> {
    const result = this.tryPatterns(text, locale.invoiceNumber);
    if (result && result.match[1]) {
      return this.success(
        result.match[1].trim(),
        this.calculateConfidence(result.match, text),
        result.match[0],
        result.pattern,
      );
    }

    // Try locale-specific fallback patterns
    if (locale.invoiceNumberFallback) {
      const fallbackResult = this.tryPatterns(text, locale.invoiceNumberFallback);
      if (fallbackResult && fallbackResult.match[1]) {
        return this.success(
          fallbackResult.match[1].trim(),
          this.calculateConfidence(fallbackResult.match, text) - 0.1,
          fallbackResult.match[0],
          fallbackResult.pattern,
        );
      }
    }

    // Generic fallback pattern
    const genericFallback = /(?:FA|FAC|INV|BL|BC|CMD)[- ]?(\d{4,})/i;
    const fallbackMatch = text.match(genericFallback);
    if (fallbackMatch && fallbackMatch[1]) {
      return this.success(
        fallbackMatch[1].trim(),
        this.calculateConfidence(fallbackMatch, text) - 0.15,
        fallbackMatch[0],
        genericFallback,
      );
    }

    return this.failure();
  }

  #getPattern(type: 'ice' | 'if' | 'rc' | 'cnss' | 'patente'): RegExp {
    switch (type) {
      case 'ice':
        return MOROCCAN_PATTERNS.ICE;
      case 'if':
        return MOROCCAN_PATTERNS.IF;
      case 'rc':
        return MOROCCAN_PATTERNS.RC;
      case 'cnss':
        return MOROCCAN_PATTERNS.CNSS;
      case 'patente':
        return MOROCCAN_PATTERNS.PATENTE;
    }
  }

  #validate(value: string, type: 'ice' | 'if' | 'rc' | 'cnss' | 'patente'): boolean {
    switch (type) {
      case 'ice':
        return isValidICE(value);
      case 'if':
        return isValidIF(value);
      default:
        return value.length > 0;
    }
  }

  #extractSimple(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern);
    return match ? match[1] : null;
  }
}
