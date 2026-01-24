import { PatternCache } from '../patterns/pattern-cache';

/**
 * Result of multi-line detection.
 */
export interface IMultiLineGroup {
  /** All lines that belong together */
  lines: string[];
  /** Original indices of the lines */
  indices: number[];
  /** Merged single line */
  merged: string;
  /** Confidence that these lines belong together (0-1) */
  confidence: number;
}

/**
 * Result of multi-line processing.
 */
export interface IMultiLineResult {
  /** Processed lines (some may be merged) */
  lines: string[];
  /** Groups that were merged */
  mergedGroups: IMultiLineGroup[];
  /** Original line count */
  originalCount: number;
  /** Final line count after merging */
  finalCount: number;
}

/**
 * Detects and merges multi-line product descriptions.
 *
 * Some invoices split product info across multiple lines:
 * - Line 1: Reference + Brand
 * - Line 2: Model/Color
 * - Line 3: Qty + Price + Total
 *
 * This detector identifies these patterns and merges them.
 */
export class MultiLineDetector {
  readonly #patterns = PatternCache.getInstance();

  /**
   * Processes lines to detect and merge multi-line products.
   * @param lines Array of text lines
   * @returns Processed result with merged lines
   */
  process(lines: string[]): IMultiLineResult {
    const result: string[] = [];
    const mergedGroups: IMultiLineGroup[] = [];
    const processed = new Set<number>();

    let i = 0;
    while (i < lines.length) {
      if (processed.has(i)) {
        i++;
        continue;
      }

      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        result.push(lines[i]);
        i++;
        continue;
      }

      // Check if this could be the start of a multi-line product
      const group = this.#detectMultiLineGroup(lines, i);

      if (group && group.lines.length > 1) {
        result.push(group.merged);
        mergedGroups.push(group);

        // Mark all lines in group as processed
        for (const idx of group.indices) {
          processed.add(idx);
        }

        i = Math.max(...group.indices) + 1;
      } else {
        result.push(lines[i]);
        i++;
      }
    }

    return {
      lines: result,
      mergedGroups,
      originalCount: lines.length,
      finalCount: result.length,
    };
  }

  /**
   * Detects if lines starting at index form a multi-line product group.
   * @param lines All lines
   * @param startIndex Starting index
   * @returns Multi-line group or null
   */
  #detectMultiLineGroup(lines: string[], startIndex: number): IMultiLineGroup | null {
    const maxLookAhead = 3; // Max lines to look ahead
    const startLine = lines[startIndex]?.trim();

    if (!startLine) return null;

    // Pattern 1: Reference/EAN on first line, details + amounts on following lines
    if (this.#startsWithIdentifier(startLine) && !this.#hasCompleteData(startLine)) {
      return this.#tryMergeFromIdentifier(lines, startIndex, maxLookAhead);
    }

    // Pattern 2: Description line followed by amounts line
    if (this.#looksLikeDescription(startLine) && !this.#hasAmounts(startLine)) {
      return this.#tryMergeDescriptionWithAmounts(lines, startIndex, maxLookAhead);
    }

    return null;
  }

  /**
   * Pattern 1: Merge from identifier (EAN/Reference) line.
   */
  #tryMergeFromIdentifier(lines: string[], startIndex: number, maxLookAhead: number): IMultiLineGroup | null {
    const groupLines: string[] = [lines[startIndex].trim()];
    const indices: number[] = [startIndex];
    let foundAmounts = false;
    let confidence = 0.5;

    for (let j = 1; j <= maxLookAhead && startIndex + j < lines.length; j++) {
      const nextLine = lines[startIndex + j]?.trim();
      if (!nextLine) continue;

      // Stop if we hit another product identifier
      if (this.#startsWithIdentifier(nextLine) && this.#hasAmounts(nextLine)) {
        break;
      }

      // Stop if we hit a total/header line
      if (this.#patterns.IS_TOTAL.test(nextLine) || this.#patterns.IS_HEADER.test(nextLine)) {
        break;
      }

      groupLines.push(nextLine);
      indices.push(startIndex + j);

      // Check if this line completes the product data
      if (this.#hasAmounts(nextLine)) {
        foundAmounts = true;
        confidence += 0.3;

        // If we have percentage, even more confident
        if (this.#patterns.HAS_PERCENTAGE.test(nextLine)) {
          confidence += 0.1;
        }

        break; // Stop after finding amounts
      }

      // If line looks like continuation (starts lowercase, no identifier)
      if (/^[a-z]/.test(nextLine) || this.#looksLikeContinuation(nextLine)) {
        confidence += 0.1;
      }
    }

    // Only return group if we found amounts (complete product data)
    if (!foundAmounts || groupLines.length < 2) {
      return null;
    }

    return {
      lines: groupLines,
      indices,
      merged: groupLines.join(' '),
      confidence: Math.min(confidence, 1),
    };
  }

  /**
   * Pattern 2: Merge description with amounts line.
   */
  #tryMergeDescriptionWithAmounts(lines: string[], startIndex: number, maxLookAhead: number): IMultiLineGroup | null {
    const groupLines: string[] = [lines[startIndex].trim()];
    const indices: number[] = [startIndex];
    let confidence = 0.4;

    for (let j = 1; j <= maxLookAhead && startIndex + j < lines.length; j++) {
      const nextLine = lines[startIndex + j]?.trim();
      if (!nextLine) continue;

      // Stop if we hit a new product or noise
      if (this.#startsWithIdentifier(nextLine) && this.#hasAmounts(nextLine)) {
        break;
      }

      if (this.#patterns.IS_TOTAL.test(nextLine)) {
        break;
      }

      // Check if this is an amounts-only line
      if (this.#looksLikeAmountsOnly(nextLine)) {
        groupLines.push(nextLine);
        indices.push(startIndex + j);
        confidence += 0.4;

        return {
          lines: groupLines,
          indices,
          merged: groupLines.join(' '),
          confidence: Math.min(confidence, 1),
        };
      }

      // If line continues description
      if (this.#looksLikeContinuation(nextLine)) {
        groupLines.push(nextLine);
        indices.push(startIndex + j);
        confidence += 0.1;
      } else {
        break;
      }
    }

    return null;
  }

  /**
   * Checks if line starts with a product identifier (EAN or reference).
   */
  #startsWithIdentifier(line: string): boolean {
    return this.#patterns.EAN_FULL.test(line) ||
           this.#patterns.REF_DASH.test(line) ||
           this.#patterns.REF_NUMERIC.test(line);
  }

  /**
   * Checks if line has complete product data (identifier + amounts).
   */
  #hasCompleteData(line: string): boolean {
    const hasIdentifier = this.#startsWithIdentifier(line);
    const hasAmounts = this.#hasAmounts(line);
    return hasIdentifier && hasAmounts;
  }

  /**
   * Checks if line contains amount patterns.
   */
  #hasAmounts(line: string): boolean {
    const amounts = line.match(this.#patterns.AMOUNT_PATTERN);
    return amounts !== null && amounts.length >= 1;
  }

  /**
   * Checks if line looks like a product description (text-heavy).
   */
  #looksLikeDescription(line: string): boolean {
    // Has significant text content
    const textOnly = line.replace(/[\d\s.,\-\/\\%]+/g, '').trim();
    if (textOnly.length < 5) return false;

    // Not a header/total
    if (this.#patterns.IS_TOTAL.test(line) || this.#patterns.IS_HEADER.test(line)) {
      return false;
    }

    return true;
  }

  /**
   * Checks if line looks like it only contains amounts (qty, price, total).
   */
  #looksLikeAmountsOnly(line: string): boolean {
    const amounts = line.match(this.#patterns.AMOUNT_PATTERN);
    if (!amounts || amounts.length < 2) return false;

    // Line is mostly numbers
    const numbersLength = (line.match(/[\d.,\s%]+/g) || []).join('').length;
    const ratio = numbersLength / line.length;

    return ratio > 0.6;
  }

  /**
   * Checks if line looks like a continuation (not a new product).
   */
  #looksLikeContinuation(line: string): boolean {
    // Starts with lowercase
    if (/^[a-z]/.test(line)) return true;

    // Starts with dash/continuation char
    if (/^[-./]/.test(line)) return true;

    // Short line with color/size info
    if (line.length < 20 && /\b(\d{3}|[A-Z]{2,3})\b/.test(line)) return true;

    // Contains only model/color codes
    if (/^[A-Z0-9.\/\-\s]{3,15}$/.test(line)) return true;

    return false;
  }
}
