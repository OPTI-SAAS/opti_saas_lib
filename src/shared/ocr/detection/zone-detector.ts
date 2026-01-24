import { PatternCache } from '../patterns/pattern-cache';

/**
 * Document zones detected in an invoice.
 */
export interface IDocumentZones {
  /** End of header zone (line index) */
  headerEnd: number;

  /** Start of product table zone (line index) */
  tableStart: number;

  /** End of product table zone (line index) */
  tableEnd: number;

  /** Start of footer/totals zone (line index) */
  footerStart: number;

  /** Header text (for contact extraction) */
  headerText: string;

  /** Table text (for line extraction) */
  tableText: string;

  /** Footer text (for totals extraction) */
  footerText: string;
}

/**
 * Detects document zones (header, table, footer) in invoice text.
 * Used to optimize extraction by focusing on relevant zones.
 */
export class ZoneDetector {
  readonly #patterns = PatternCache.getInstance();

  /**
   * Detects zones in the document.
   * @param text Full document text
   * @returns Detected zones
   */
  detectZones(text: string): IDocumentZones {
    const lines = text.split('\n');
    const totalLines = lines.length;

    let headerEnd = 0;
    let tableStart = 0;
    let tableEnd = totalLines - 1;
    let footerStart = totalLines;

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Find table start (first EAN or table header row)
    // ═══════════════════════════════════════════════════════════════════════

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Table header row (Désignation, Qté, Prix, etc.)
      if (this.#patterns.TABLE_HEADER.test(line)) {
        headerEnd = i;
        tableStart = i + 1;
        break;
      }

      // First EAN barcode (start of products)
      if (this.#patterns.EAN_FULL.test(line)) {
        headerEnd = Math.max(0, i - 1);
        tableStart = i;
        break;
      }

      // First reference code with amounts (start of products)
      if (this.#patterns.REF_DASH.test(line) && this.#patterns.AMOUNT_PATTERN.test(line)) {
        headerEnd = Math.max(0, i - 1);
        tableStart = i;
        break;
      }
    }

    // If no clear table start found, use heuristic (after first 20% of lines)
    if (tableStart === 0) {
      headerEnd = Math.floor(totalLines * 0.15);
      tableStart = headerEnd + 1;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Find footer start (first total/reporter line after table)
    // ═══════════════════════════════════════════════════════════════════════

    for (let i = tableStart; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Total or reporter line
      if (this.#patterns.FOOTER_START.test(line)) {
        tableEnd = i - 1;
        footerStart = i;
        break;
      }

      // Large gap in amounts might indicate end of table
      // (heuristic: 3+ consecutive lines without amounts)
      let noAmountCount = 0;
      for (let j = i; j < Math.min(i + 4, lines.length); j++) {
        if (!this.#patterns.AMOUNT_PATTERN.test(lines[j])) {
          noAmountCount++;
        }
      }
      if (noAmountCount >= 3 && i > tableStart + 5) {
        // Check if followed by total keywords
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
          if (this.#patterns.FOOTER_START.test(lines[j])) {
            tableEnd = i - 1;
            footerStart = j;
            break;
          }
        }
        if (footerStart < totalLines) break;
      }
    }

    // If no clear footer found, use heuristic (last 15% of lines)
    if (footerStart === totalLines) {
      footerStart = Math.floor(totalLines * 0.85);
      tableEnd = footerStart - 1;
    }

    // Ensure valid ranges
    tableStart = Math.max(0, Math.min(tableStart, totalLines - 1));
    tableEnd = Math.max(tableStart, Math.min(tableEnd, totalLines - 1));
    footerStart = Math.max(tableEnd + 1, Math.min(footerStart, totalLines));

    return {
      headerEnd,
      tableStart,
      tableEnd,
      footerStart,
      headerText: lines.slice(0, headerEnd + 1).join('\n'),
      tableText: lines.slice(tableStart, tableEnd + 1).join('\n'),
      footerText: lines.slice(footerStart).join('\n'),
    };
  }

  /**
   * Extracts only the header zone for contact information.
   * @param text Full document text
   * @returns Header text
   */
  extractHeaderZone(text: string): string {
    const lines = text.split('\n');
    const headerLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Stop at first EAN
      if (this.#patterns.EAN_FULL.test(line)) break;

      // Stop at first reference with amounts
      if (this.#patterns.REF_DASH.test(line) && this.#patterns.AMOUNT_PATTERN.test(line)) break;

      // Stop at table header
      if (this.#patterns.TABLE_HEADER.test(line)) break;

      headerLines.push(lines[i]);
    }

    return headerLines.join('\n');
  }

  /**
   * Extracts only the table zone for line items.
   * @param text Full document text
   * @returns Table lines as array
   */
  extractTableLines(text: string): string[] {
    const zones = this.detectZones(text);
    const lines = text.split('\n');

    return lines
      .slice(zones.tableStart, zones.tableEnd + 1)
      .map(l => l.trim())
      .filter(l => l.length > 0);
  }

  /**
   * Extracts only the footer zone for totals.
   * @param text Full document text
   * @returns Footer text
   */
  extractFooterZone(text: string): string {
    const zones = this.detectZones(text);
    return zones.footerText;
  }

  /**
   * Checks if a line index is within the table zone.
   * @param lineIndex Line index to check
   * @param zones Detected zones
   * @returns true if line is in table zone
   */
  isInTableZone(lineIndex: number, zones: IDocumentZones): boolean {
    return lineIndex >= zones.tableStart && lineIndex <= zones.tableEnd;
  }
}
