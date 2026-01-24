import { PatternCache } from '../patterns/pattern-cache';

/**
 * Result of line scoring.
 */
export interface ILineScore {
  /** Original line text */
  line: string;

  /** Line index in document */
  lineIndex: number;

  /** Score (higher = more likely product line) */
  score: number;

  /** Criteria that matched */
  criteria: string[];

  /** Is this line considered a product line? */
  isProductLine: boolean;
}

/**
 * Configuration for line scoring.
 */
export interface ILineScorerConfig {
  /** Minimum score to be considered a product line (default: 3) */
  threshold: number;

  /** Noise keywords to exclude */
  noiseKeywords: string[];
}

const DEFAULT_CONFIG: ILineScorerConfig = {
  threshold: 3,
  noiseKeywords: [
    'total a reporter', 'total à reporter', 'net à payer', 'net a payer',
    'arrêtée la présente', 'arretee la presente', 'somme toutes taxes',
  ],
};

/**
 * Scores lines to detect product lines using multi-criteria heuristics.
 * Uses early exit for performance optimization.
 */
export class LineScorer {
  readonly #patterns = PatternCache.getInstance();
  readonly #config: ILineScorerConfig;

  constructor(config: Partial<ILineScorerConfig> = {}) {
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Scores all lines and returns potential product lines (score >= threshold).
   * @param lines Array of text lines
   * @returns Array of scored lines meeting threshold
   */
  scoreLines(lines: string[]): ILineScore[] {
    return this.scoreAllLines(lines).filter(r => r.isProductLine);
  }

  /**
   * Scores all lines and returns ALL of them (including low scores).
   * Use this to never lose lines - low-score lines are still returned for manual review.
   * @param lines Array of text lines
   * @returns Array of ALL scored lines (sorted by score descending)
   */
  scoreAllLines(lines: string[]): ILineScore[] {
    const results: ILineScore[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const result = this.scoreLine(line, i, lines);
      results.push(result);
    }

    return results;
  }

  /**
   * Scores a single line.
   * Uses early exit when threshold is reached for performance.
   * @param line Line to score
   * @param lineIndex Index in document
   * @param allLines All document lines (for context)
   * @returns Score result
   */
  scoreLine(line: string, lineIndex: number, allLines: string[]): ILineScore {
    let score = 0;
    const criteria: string[] = [];
    const threshold = this.#config.threshold;

    // ═══════════════════════════════════════════════════════════════════════
    // NEGATIVE CRITERIA FIRST (quick rejection)
    // ═══════════════════════════════════════════════════════════════════════

    // Line too short
    if (line.length < 10) {
      return { line, lineIndex, score: -10, criteria: ['TOO_SHORT'], isProductLine: false };
    }

    // Is a total/subtotal line
    if (this.#patterns.IS_TOTAL.test(line)) {
      return { line, lineIndex, score: -10, criteria: ['IS_TOTAL'], isProductLine: false };
    }

    // Is a header line (but not if it has amounts - could be a product with keyword)
    const hasAmounts = this.#patterns.AMOUNT_PATTERN.test(line);
    if (this.#patterns.IS_HEADER.test(line) && !hasAmounts) {
      return { line, lineIndex, score: -10, criteria: ['IS_HEADER'], isProductLine: false };
    }

    // Contains noise keyword
    const lowerLine = line.toLowerCase();
    if (this.#config.noiseKeywords.some(kw => lowerLine.includes(kw.toLowerCase()))) {
      return { line, lineIndex, score: -10, criteria: ['NOISE_KEYWORD'], isProductLine: false };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // POSITIVE CRITERIA - IDENTIFIERS (+3 points, early exit possible)
    // ═══════════════════════════════════════════════════════════════════════

    // EAN full (8-14 digits at start)
    if (this.#patterns.EAN_FULL.test(line)) {
      score += 3;
      criteria.push('EAN_FULL');
      if (score >= threshold) {
        return { line, lineIndex, score, criteria, isProductLine: true };
      }
    }
    // EAN truncated (6-7 digits - OCR may cut first)
    else if (this.#patterns.EAN_TRUNCATED.test(line)) {
      score += 2;
      criteria.push('EAN_TRUNCATED');
    }
    // Reference with dash (CH-HER, ABC-123)
    else if (this.#patterns.REF_DASH.test(line)) {
      score += 3;
      criteria.push('REF_DASH');
      if (score >= threshold) {
        return { line, lineIndex, score, criteria, isProductLine: true };
      }
    }
    // Reference numeric (REF001, ART2024)
    else if (this.#patterns.REF_NUMERIC.test(line)) {
      score += 3;
      criteria.push('REF_NUMERIC');
      if (score >= threshold) {
        return { line, lineIndex, score, criteria, isProductLine: true };
      }
    }
    // Numeric index (1., 01), #1)
    else if (this.#patterns.INDEX_NUMERIC.test(line)) {
      score += 1;
      criteria.push('INDEX_NUMERIC');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // POSITIVE CRITERIA - NUMERIC DATA (+1-2 points)
    // ═══════════════════════════════════════════════════════════════════════

    // Has percentage (discount or VAT)
    if (this.#patterns.HAS_PERCENTAGE.test(line)) {
      score += 1;
      criteria.push('HAS_PERCENTAGE');
      if (score >= threshold) {
        return { line, lineIndex, score, criteria, isProductLine: true };
      }
    }

    // Has multiple amounts (price + total)
    const amounts = line.match(this.#patterns.AMOUNT_PATTERN);
    if (amounts && amounts.length >= 2) {
      score += 2;
      criteria.push('HAS_MULTIPLE_AMOUNTS');
      if (score >= threshold) {
        return { line, lineIndex, score, criteria, isProductLine: true };
      }
    } else if (amounts && amounts.length === 1) {
      score += 1;
      criteria.push('HAS_AMOUNT');
    }

    // Has quantity pattern
    if (this.#patterns.QUANTITY_PATTERN.test(line) || /^\d{1,3}\s/.test(line)) {
      score += 1;
      criteria.push('HAS_QUANTITY');
      if (score >= threshold) {
        return { line, lineIndex, score, criteria, isProductLine: true };
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // POSITIVE CRITERIA - STRUCTURE (+1-2 points)
    // ═══════════════════════════════════════════════════════════════════════

    // Multi-column structure
    const columns = line.split(this.#patterns.MULTI_COLUMN).filter(c => c.trim());
    if (columns.length >= 4) {
      score += 2;
      criteria.push('MULTI_COLUMN_4+');
    } else if (columns.length >= 3) {
      score += 1;
      criteria.push('MULTI_COLUMN_3');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONTEXT CRITERIA (+1 point)
    // ═══════════════════════════════════════════════════════════════════════

    // Adjacent line is a product line
    const prevLine = allLines[lineIndex - 1] || '';
    const nextLine = allLines[lineIndex + 1] || '';

    if (this.#patterns.EAN_FULL.test(prevLine) || this.#patterns.EAN_FULL.test(nextLine)) {
      score += 1;
      criteria.push('ADJACENT_PRODUCT');
    }

    return {
      line,
      lineIndex,
      score,
      criteria,
      isProductLine: score >= threshold,
    };
  }

  /**
   * Counts potential product lines without full scoring (quick estimate).
   * @param lines Array of text lines
   * @returns Estimated count of product lines
   */
  quickCount(lines: string[]): number {
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 10) continue;

      // Quick positive checks
      if (this.#patterns.EAN_FULL.test(trimmed)) {
        count++;
        continue;
      }
      if (this.#patterns.REF_DASH.test(trimmed) && this.#patterns.AMOUNT_PATTERN.test(trimmed)) {
        count++;
        continue;
      }

      // Has multiple amounts and percentage (likely product)
      const amounts = trimmed.match(this.#patterns.AMOUNT_PATTERN);
      if (amounts && amounts.length >= 2 && this.#patterns.HAS_PERCENTAGE.test(trimmed)) {
        // Make sure it's not a total line
        if (!this.#patterns.IS_TOTAL.test(trimmed)) {
          count++;
        }
      }
    }

    return count;
  }
}
