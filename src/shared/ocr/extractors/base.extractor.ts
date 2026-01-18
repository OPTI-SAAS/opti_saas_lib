import { IExtractionResult, IOcrLocale } from '../locales';

/**
 * Base class for all extractors.
 * Provides common extraction utilities.
 */
export abstract class BaseExtractor<T> {
  /**
   * Extracts value from text using locale-specific patterns.
   * @param text Source text
   * @param locale Locale for language-specific patterns
   * @returns Extraction result with confidence
   */
  abstract extract(text: string, locale: IOcrLocale): IExtractionResult<T>;

  /**
   * Tries multiple patterns and returns the first match.
   * @param text Source text
   * @param patterns Patterns to try
   * @returns Match result or null
   */
  protected tryPatterns(
    text: string,
    patterns: RegExp[],
  ): { match: RegExpMatchArray; pattern: RegExp } | null {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { match, pattern };
      }
    }
    return null;
  }

  /**
   * Calculates confidence based on match quality.
   * @param match Regex match
   * @param text Original text
   * @returns Confidence score (0-1)
   */
  protected calculateConfidence(match: RegExpMatchArray, text: string): number {
    let confidence = 0.7;

    const matchedText = match[0];
    const capturedText = match[1] || '';

    if (capturedText.length > 0 && capturedText.length === matchedText.trim().length) {
      confidence += 0.1;
    }

    const position = text.indexOf(matchedText);
    if (position < text.length * 0.3) {
      confidence += 0.1;
    }

    const beforeChar = text[position - 1];
    const afterChar = text[position + matchedText.length];
    if ((!beforeChar || /[\s\n]/.test(beforeChar)) && (!afterChar || /[\s\n]/.test(afterChar))) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Creates a successful extraction result.
   */
  protected success(
    value: T,
    confidence: number,
    sourceText: string,
    pattern: RegExp,
  ): IExtractionResult<T> {
    return {
      value,
      confidence,
      sourceText,
      matchedPattern: pattern.source,
    };
  }

  /**
   * Creates a failed extraction result.
   */
  protected failure(): IExtractionResult<T> {
    return {
      value: null,
      confidence: 0,
      sourceText: null,
      matchedPattern: null,
    };
  }
}
