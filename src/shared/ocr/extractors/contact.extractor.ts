import { BaseExtractor } from './base.extractor';
import { IExtractionResult, IOcrLocale } from '../locales';
import { formatMoroccanPhone } from '../patterns';

/**
 * Contact information.
 */
export interface IContactInfo {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

/**
 * Extracts contact information from text.
 */
export class ContactExtractor extends BaseExtractor<string> {
  /**
   * Extracts supplier/company name from text.
   * @param text Source text
   * @param locale Locale for name patterns
   * @returns Extraction result
   */
  extract(text: string, locale: IOcrLocale): IExtractionResult<string> {
    return this.extractName(text, locale);
  }

  /**
   * Extracts company/supplier name.
   */
  extractName(text: string, locale: IOcrLocale): IExtractionResult<string> {
    const result = this.tryPatterns(text, locale.supplier.name);
    if (result) {
      const captured = result.match[1] ?? result.match[0];
      return this.success(
        captured.trim(),
        this.calculateConfidence(result.match, text),
        result.match[0],
        result.pattern,
      );
    }

    const lines = text.split('\n').filter((l) => l.trim().length > 3);
    const companyLine = lines.find((line) => this.#looksLikeCompanyName(line, locale));

    if (companyLine) {
      return {
        value: companyLine.trim(),
        confidence: 0.5,
        sourceText: companyLine,
        matchedPattern: 'fallback-first-line',
      };
    }

    return this.failure();
  }

  /**
   * Extracts address from text.
   */
  extractAddress(text: string, locale: IOcrLocale): IExtractionResult<string> {
    const result = this.tryPatterns(text, locale.supplier.address);
    if (result) {
      const address = this.#cleanAddress(result.match[1] || result.match[0]);
      return this.success(
        address,
        this.calculateConfidence(result.match, text),
        result.match[0],
        result.pattern,
      );
    }

    const streetPattern =
      /(?:rue|avenue|av\.|bd|boulevard|lot|imm|résidence|zone|quartier)\s+[^\n]{5,60}/i;
    const streetMatch = text.match(streetPattern);
    if (streetMatch) {
      return this.success(
        streetMatch[0].trim(),
        0.6,
        streetMatch[0],
        streetPattern,
      );
    }

    return this.failure();
  }

  /**
   * Extracts phone number from text.
   */
  extractPhone(text: string, locale: IOcrLocale): IExtractionResult<string> {
    const result = this.tryPatterns(text, locale.supplier.phone);
    if (result) {
      const captured = result.match[1] ?? result.match[0];
      const phone = captured.replace(/\s+/g, '');
      const formatted = formatMoroccanPhone(phone);
      return this.success(
        formatted,
        this.calculateConfidence(result.match, text),
        result.match[0],
        result.pattern,
      );
    }

    const genericPattern = /(?:\+\d{1,3}\s?)?\d{2,4}[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}/;
    const genericMatch = text.match(genericPattern);
    if (genericMatch) {
      const phone = genericMatch[0].replace(/\s+/g, '');
      return this.success(
        formatMoroccanPhone(phone),
        0.5,
        genericMatch[0],
        genericPattern,
      );
    }

    return this.failure();
  }

  /**
   * Extracts email from text.
   */
  extractEmail(text: string): IExtractionResult<string> {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);

    if (match) {
      return this.success(
        match[0].toLowerCase(),
        this.calculateConfidence(match, text),
        match[0],
        emailPattern,
      );
    }

    return this.failure();
  }

  /**
   * Extracts all contact information.
   */
  extractAll(text: string, locale: IOcrLocale): IContactInfo {
    return {
      name: this.extractName(text, locale).value,
      address: this.extractAddress(text, locale).value,
      phone: this.extractPhone(text, locale).value,
      email: this.extractEmail(text).value,
    };
  }

  #looksLikeCompanyName(line: string, locale: IOcrLocale): boolean {
    const trimmed = line.trim();

    if (!/^[A-ZÀ-Ü]/.test(trimmed)) return false;
    if (trimmed.length < 3 || trimmed.length > 60) return false;

    const numbers = trimmed.match(/\d/g);
    if (numbers && numbers.length > trimmed.length * 0.3) return false;

    const words = trimmed.toLowerCase().split(/\s+/);
    if (words.every((w) => locale.stopWords.includes(w))) return false;

    if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(trimmed)) return false;
    if (/^[\d\s.,]+$/.test(trimmed)) return false;

    return true;
  }

  #cleanAddress(address: string): string {
    return address
      .replace(/\s+/g, ' ')
      .replace(/^[:\s]+/, '')
      .trim();
  }
}
