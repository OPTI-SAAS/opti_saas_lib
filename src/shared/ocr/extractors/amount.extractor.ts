import { BaseExtractor } from './base.extractor';
import { IExtractionResult, IOcrLocale } from '../locales';
import { parseNumber } from '../patterns';

export type AmountType = 'totalHT' | 'totalTTC' | 'vat' | 'discount' | 'netToPay';

/**
 * Extracts monetary amounts from text with locale support.
 */
export class AmountExtractor extends BaseExtractor<number> {
  /**
   * Extracts an amount of a specific type from text.
   * @param text Source text
   * @param locale Locale for amount label patterns
   * @param amountType Type of amount to extract
   * @returns Extraction result
   */
  extract(
    text: string,
    locale: IOcrLocale,
    amountType: AmountType = 'totalTTC',
  ): IExtractionResult<number> {
    const patterns = locale.amounts[amountType];
    if (!patterns || patterns.length === 0) {
      return this.failure();
    }

    const result = this.tryPatterns(text, patterns);
    if (result) {
      const amount = parseNumber(result.match[1]);
      if (amount > 0) {
        return this.success(
          amount,
          this.calculateConfidence(result.match, text),
          result.match[0],
          result.pattern,
        );
      }
    }

    return this.failure();
  }

  /**
   * Extracts all amounts from text (without context).
   * Useful for finding amounts in line items.
   * @param text Source text
   * @returns Array of amounts found
   */
  extractAllAmounts(text: string): number[] {
    const amounts: number[] = [];
    const pattern = /([\d\s]+[.,]\d{2})/g;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const amount = parseNumber(match[1]);
      if (amount > 0) {
        amounts.push(amount);
      }
    }

    return amounts;
  }

  /**
   * Extracts all labeled amounts from text.
   * @param text Source text
   * @param locale Locale for amount patterns
   * @returns Object with all found amounts
   */
  extractAllLabeled(
    text: string,
    locale: IOcrLocale,
  ): Record<AmountType, IExtractionResult<number>> {
    const types: AmountType[] = ['totalHT', 'totalTTC', 'vat', 'discount', 'netToPay'];
    const results: Record<string, IExtractionResult<number>> = {};

    for (const type of types) {
      results[type] = this.extract(text, locale, type);
    }

    return results as Record<AmountType, IExtractionResult<number>>;
  }

  /**
   * Calculates VAT from HT and TTC amounts.
   * @param totalHT Amount excluding tax
   * @param totalTTC Amount including tax
   * @returns Calculated VAT amount
   */
  calculateVAT(totalHT: number, totalTTC: number): number {
    return Math.max(0, totalTTC - totalHT);
  }

  /**
   * Detects VAT rate from amounts.
   * @param totalHT Amount excluding tax
   * @param vat VAT amount
   * @returns Detected VAT rate (e.g., 0.20 for 20%)
   */
  detectVATRate(totalHT: number, vat: number): number | null {
    if (totalHT <= 0 || vat <= 0) return null;

    const rate = vat / totalHT;

    const commonRates = [0.07, 0.1, 0.14, 0.2, 0.21, 0.19, 0.055];

    for (const commonRate of commonRates) {
      if (Math.abs(rate - commonRate) < 0.01) {
        return commonRate;
      }
    }

    if (rate > 0 && rate < 0.5) {
      return Math.round(rate * 100) / 100;
    }

    return null;
  }
}
