import { BaseExtractor } from './base.extractor';
import { IExtractionResult, IOcrLocale } from '../locales';
import { NUMERIC_PATTERNS, parseDate } from '../patterns';

export type DateType = 'invoice' | 'due' | 'any';

/**
 * Cache for compiled text date patterns by locale code.
 * Avoids creating new RegExp instances on every extraction call.
 */
const textDatePatternCache = new Map<string, RegExp>();

/**
 * Gets or creates a cached text date pattern for a locale.
 * @param locale Locale with month names
 * @returns Compiled RegExp for text dates
 */
function getTextDatePattern(locale: IOcrLocale): RegExp {
  const cacheKey = locale.code;
  let pattern = textDatePatternCache.get(cacheKey);

  if (!pattern) {
    const monthsPattern = locale.months.join('|');
    pattern = new RegExp(`(\\d{1,2})\\s+(${monthsPattern})\\s+(\\d{4})`, 'i');
    textDatePatternCache.set(cacheKey, pattern);
  }

  return pattern;
}

/**
 * Extracts dates from text with locale support.
 */
export class DateExtractor extends BaseExtractor<Date> {
  /**
   * Extracts a date from text.
   * @param text Source text
   * @param locale Locale for month names and context patterns
   * @param dateType Type of date to extract (invoice, due, or any)
   * @returns Extraction result
   */
  extract(text: string, locale: IOcrLocale, dateType: DateType = 'any'): IExtractionResult<Date> {
    if (dateType !== 'any') {
      const contextResult = this.#extractWithContext(text, locale, dateType);
      if (contextResult.value) {
        return contextResult;
      }
    }

    return this.#extractGeneric(text, locale);
  }

  /**
   * Extracts all dates from text.
   * @param text Source text
   * @param locale Locale for month names
   * @returns Array of extraction results
   */
  extractAll(text: string, locale: IOcrLocale): IExtractionResult<Date>[] {
    const results: IExtractionResult<Date>[] = [];
    const patterns = [NUMERIC_PATTERNS.DATE.DMY, getTextDatePattern(locale)];

    for (const pattern of patterns) {
      const globalPattern = new RegExp(pattern.source, 'gi');
      let match;
      while ((match = globalPattern.exec(text)) !== null) {
        const date = parseDate(match, 'dmy', locale.months);
        if (date && this.#isValidDate(date)) {
          results.push(
            this.success(date, this.calculateConfidence(match, text), match[0], pattern),
          );
        }
      }
    }

    return results;
  }

  #extractWithContext(
    text: string,
    locale: IOcrLocale,
    dateType: 'invoice' | 'due',
  ): IExtractionResult<Date> {
    const contextPatterns = locale.dateContext[dateType];

    for (const contextPattern of contextPatterns) {
      const contextMatch = text.match(contextPattern);
      if (contextMatch) {
        const dateContext = contextMatch[1];
        const dateResult = this.#extractFromContext(dateContext, locale);
        if (dateResult.value) {
          return {
            ...dateResult,
            confidence: Math.min(dateResult.confidence + 0.15, 1),
          };
        }
      }
    }

    return this.failure();
  }

  #extractFromContext(context: string, locale: IOcrLocale): IExtractionResult<Date> {
    const numericMatch = context.match(NUMERIC_PATTERNS.DATE.DMY);
    if (numericMatch) {
      const date = parseDate(numericMatch, 'dmy');
      if (date && this.#isValidDate(date)) {
        return this.success(
          date,
          this.calculateConfidence(numericMatch, context),
          numericMatch[0],
          NUMERIC_PATTERNS.DATE.DMY,
        );
      }
    }

    const textPattern = getTextDatePattern(locale);
    const textMatch = context.match(textPattern);
    if (textMatch) {
      const date = parseDate(textMatch, 'dmy', locale.months);
      if (date && this.#isValidDate(date)) {
        return this.success(
          date,
          this.calculateConfidence(textMatch, context),
          textMatch[0],
          textPattern,
        );
      }
    }

    return this.failure();
  }

  #extractGeneric(text: string, locale: IOcrLocale): IExtractionResult<Date> {
    const numericMatch = text.match(NUMERIC_PATTERNS.DATE.DMY);
    if (numericMatch) {
      const date = parseDate(numericMatch, 'dmy');
      if (date && this.#isValidDate(date)) {
        return this.success(
          date,
          this.calculateConfidence(numericMatch, text) - 0.1,
          numericMatch[0],
          NUMERIC_PATTERNS.DATE.DMY,
        );
      }
    }

    const textPattern = getTextDatePattern(locale);
    const textMatch = text.match(textPattern);
    if (textMatch) {
      const date = parseDate(textMatch, 'dmy', locale.months);
      if (date && this.#isValidDate(date)) {
        return this.success(
          date,
          this.calculateConfidence(textMatch, text) - 0.1,
          textMatch[0],
          textPattern,
        );
      }
    }

    return this.failure();
  }

  #isValidDate(date: Date): boolean {
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 10, 0, 1);
    const maxDate = new Date(now.getFullYear() + 2, 11, 31);
    return date >= minDate && date <= maxDate;
  }
}
