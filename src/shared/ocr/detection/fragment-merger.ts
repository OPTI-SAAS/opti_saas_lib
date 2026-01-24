import { PatternCache } from '../patterns/pattern-cache';

/**
 * Result of fragment merging.
 */
export interface IMergeResult {
  /** Merged lines */
  lines: string[];

  /** Number of merges performed */
  mergeCount: number;

  /** Indices of lines that were merged */
  mergedIndices: number[];
}

/**
 * Merges fragmented lines that were split by OCR.
 * Example:
 *   "197737121563 Se pe"          <- truncated line
 *   "-SOD.54.19 1 1010.00 15%"    <- fragment
 * Becomes:
 *   "197737121563 Se pe -SOD.54.19 1 1010.00 15%"
 */
export class FragmentMerger {
  readonly #patterns = PatternCache.getInstance();

  /**
   * Merges fragmented lines.
   * @param lines Array of text lines
   * @returns Merge result with merged lines
   */
  merge(lines: string[]): IMergeResult {
    const merged: string[] = [];
    const mergedIndices: number[] = [];
    let mergeCount = 0;

    let i = 0;
    while (i < lines.length) {
      const current = lines[i].trim();
      const next = lines[i + 1]?.trim() || '';

      // Check if current line is truncated and next is a fragment
      if (this.isTruncatedLine(current) && this.isFragment(next)) {
        // Merge the two lines
        merged.push(current + ' ' + next);
        mergedIndices.push(i, i + 1);
        mergeCount++;
        i += 2; // Skip both lines
      } else {
        merged.push(lines[i]); // Keep original with whitespace
        i++;
      }
    }

    return { lines: merged, mergeCount, mergedIndices };
  }

  /**
   * Checks if a line appears to be truncated.
   * A truncated line typically:
   * - Starts with EAN but lacks price/total data
   * - Has incomplete word at the end
   * - Has fewer fields than expected
   */
  isTruncatedLine(line: string): boolean {
    if (!line || line.length < 10) return false;

    const trimmed = line.trim();

    // Starts with EAN but no price data
    if (this.#patterns.EAN_FULL.test(trimmed)) {
      // Count amount patterns
      const amounts = trimmed.match(this.#patterns.AMOUNT_PATTERN);
      if (!amounts || amounts.length < 2) {
        // Check for incomplete end (ends with short word or partial word)
        const words = trimmed.split(/\s+/);
        const lastWord = words[words.length - 1] || '';
        if (lastWord.length < 4 || /[^a-z0-9]$/i.test(lastWord)) {
          return true;
        }
      }
    }

    // Starts with reference but no complete data
    if (this.#patterns.REF_DASH.test(trimmed)) {
      const amounts = trimmed.match(this.#patterns.AMOUNT_PATTERN);
      const hasPercentage = this.#patterns.HAS_PERCENTAGE.test(trimmed);

      // Typical product line has amounts and often percentage
      if ((!amounts || amounts.length < 1) && !hasPercentage) {
        return true;
      }
    }

    // Line ends with common truncation indicators
    if (/[.\-/]$/.test(trimmed) && trimmed.length > 20) {
      // Check if it looks like a product line start
      if (this.#patterns.EAN_FULL.test(trimmed) || this.#patterns.REF_DASH.test(trimmed)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a line appears to be a fragment (continuation of previous line).
   * A fragment typically:
   * - Starts with dash, dot, or non-alphanumeric character
   * - Does NOT start with EAN
   * - Contains price/amount data
   */
  isFragment(line: string): boolean {
    if (!line || line.length < 5) return false;

    const trimmed = line.trim();

    // Starts with dash or continuation character
    if (/^[-./]/.test(trimmed)) {
      // And contains amounts
      if (this.#patterns.AMOUNT_PATTERN.test(trimmed)) {
        return true;
      }
    }

    // Does NOT start with EAN (would be a new line)
    if (this.#patterns.EAN_FULL.test(trimmed)) {
      return false;
    }

    // Does NOT start with reference code (would be a new line)
    if (this.#patterns.REF_DASH.test(trimmed)) {
      return false;
    }

    // Starts with lowercase and has amounts (likely continuation)
    if (/^[a-z]/.test(trimmed) && this.#patterns.AMOUNT_PATTERN.test(trimmed)) {
      // Has multiple amounts (price, discount, total pattern)
      const amounts = trimmed.match(this.#patterns.AMOUNT_PATTERN);
      if (amounts && amounts.length >= 2) {
        return true;
      }
    }

    // Starts with number that's not EAN (could be quantity)
    if (/^\d{1,3}\s/.test(trimmed) && !this.#patterns.EAN_FULL.test(trimmed)) {
      if (this.#patterns.AMOUNT_PATTERN.test(trimmed)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Attempts to reconstruct a line from fragments.
   * @param fragments Array of potential fragments
   * @returns Reconstructed line or null
   */
  reconstructLine(fragments: string[]): string | null {
    if (fragments.length < 2) return null;

    // Filter out empty fragments
    const validFragments = fragments.filter(f => f && f.trim().length > 0);
    if (validFragments.length < 2) return null;

    // Check if first fragment is truncated
    if (!this.isTruncatedLine(validFragments[0])) return null;

    // Merge valid fragments
    let merged = validFragments[0].trim();
    for (let i = 1; i < validFragments.length; i++) {
      const fragment = validFragments[i].trim();
      if (this.isFragment(fragment)) {
        merged += ' ' + fragment;
      } else {
        break; // Stop at non-fragment
      }
    }

    return merged;
  }
}
