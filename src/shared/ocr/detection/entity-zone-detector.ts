import { ZoneDetector } from './zone-detector';
import { EntitySource } from '../supplier-invoice.models';

/**
 * A block of text identified as belonging to an entity (vendor or customer).
 */
export interface IEntityBlock {
  /** Raw text content */
  text: string;

  /** Individual lines */
  lines: string[];

  /** Where this block was found */
  source: EntitySource;

  /** Starting line index in original document */
  startLine: number;

  /** Ending line index */
  endLine: number;

  /** Confidence that this block belongs to the identified entity (0-1) */
  confidence: number;

  /** Label that identified this block (if any) */
  matchedLabel?: string;
}

/**
 * Result of entity block detection.
 */
export interface IEntityBlocks {
  /** Vendor/supplier block */
  vendor: IEntityBlock | null;

  /** Customer/client block */
  customer: IEntityBlock | null;

  /** Footer block with vendor legal info */
  vendorFooter: IEntityBlock | null;
}

/**
 * Vendor info extracted from footer zone.
 */
export interface IVendorFooterInfo {
  /** ICE number */
  ice: string | null;

  /** Fiscal ID */
  fiscalId: string | null;

  /** Trade register */
  tradeRegister: string | null;

  /** CNSS number */
  cnss: string | null;

  /** Patente number */
  patente: string | null;

  /** Bank name */
  bank: string | null;

  /** RIB number */
  rib: string | null;

  /** Capital social */
  capitalSocial: string | null;

  /** Legal form */
  legalForm: string | null;

  /** Raw footer text */
  rawText: string;

  /** Extraction confidence */
  confidence: number;
}

/**
 * Detects and separates VENDOR and CUSTOMER blocks in invoice header.
 * Uses multi-strategy approach:
 * 1. Explicit labels (highest confidence)
 * 2. Positional analysis (left/right in header)
 * 3. Identifier-based (ICE, IF, RC always belong to vendor)
 */
export class EntityZoneDetector {
  readonly #zoneDetector = new ZoneDetector();

  /** Labels that identify customer blocks */
  static readonly CUSTOMER_LABELS: RegExp[] = [
    // French labels
    /^(?:factur[ée]\s*[àa]|client|destinataire|acheteur)\s*[:：]/im,
    /^(?:livr[ée]\s*[àa]|adresse\s*de\s*livraison)\s*[:：]/im,
    /^(?:pour|à\s*l['']attention\s*de|att\.?)\s*[:：]?/im,
    // English labels
    /^(?:bill(?:ed)?\s*to|ship(?:ped)?\s*to|customer|buyer)\s*[:：]/im,
    /^(?:sold\s*to|deliver(?:ed)?\s*to)\s*[:：]/im,
  ];

  /** Labels that identify vendor blocks */
  static readonly VENDOR_LABELS: RegExp[] = [
    // French labels
    /^(?:fournisseur|émetteur|vendeur|notre\s*société)\s*[:：]/im,
    /^(?:expéditeur|de\s*la\s*part\s*de)\s*[:：]/im,
    // English labels
    /^(?:vendor|supplier|seller|from)\s*[:：]/im,
  ];

  /** Patterns for customer code */
  static readonly CUSTOMER_CODE_PATTERNS: RegExp[] = [
    /(?:code|n[°o]|ref\.?)\s*client\s*[:：]?\s*(\w+)/i,
    /client\s*(?:code|n[°o]|ref\.?)\s*[:：]?\s*(\w+)/i,
  ];

  /** Patterns for footer vendor identifiers */
  static readonly FOOTER_VENDOR_PATTERNS = {
    ice: /ice\s*[:：]?\s*(\d{15})/i,
    fiscalId: /i\.?f\.?\s*[:：]?\s*(\d{7,8})/i,
    tradeRegister: /r\.?c\.?\s*[:：]?\s*(\d{5,6})/i,
    cnss: /cnss\s*[:：]?\s*(\d{7,10})/i,
    patente: /patente\s*[:：]?\s*(\d{7,10})/i,
    bank: /(?:banque|bank)\s*[:：]?\s*([A-Za-zÀ-ü\s]+?)(?=\s*[-–|]|\n|$)/i,
    rib: /(?:rib|iban)\s*[:：]?\s*([\d\s]{20,35})/i,
    capitalSocial: /capital\s*(?:social\s*)?(?:de\s*)?[\s:：]*([\d\s.,]+)\s*(?:dh|€|mad)/i,
    legalForm: /^(sarl|sa|sas|sasu|eurl|ei|snc)\s+(?:au\s+)?capital/im,
  };

  /**
   * Detects entity blocks (vendor, customer) in the invoice header.
   * @param text Full document text
   * @returns Detected entity blocks
   */
  detectEntityBlocks(text: string): IEntityBlocks {
    const headerText = this.#zoneDetector.extractHeaderZone(text);
    const footerText = this.#zoneDetector.extractFooterZone(text);

    // Strategy 1: Find labeled blocks (highest confidence)
    const labeledResult = this.#findLabeledBlocks(headerText);

    // Strategy 2: Positional analysis (if labels not found)
    const positionalResult = this.#analyzePositionalLayout(headerText, labeledResult);

    // Strategy 3: Extract vendor info from footer
    const vendorFooter = this.#extractVendorFooterBlock(footerText);

    return {
      vendor: positionalResult.vendor,
      customer: positionalResult.customer,
      vendorFooter,
    };
  }

  /**
   * Extracts vendor legal info from footer zone.
   * @param footerText Footer text
   * @returns Vendor footer info
   */
  extractVendorFromFooter(footerText: string): IVendorFooterInfo {
    const patterns = EntityZoneDetector.FOOTER_VENDOR_PATTERNS;

    const extractField = (pattern: RegExp): string | null => {
      const match = footerText.match(pattern);
      return match ? match[1].trim() : null;
    };

    // Count how many fields we found
    let fieldsFound = 0;
    const result: IVendorFooterInfo = {
      ice: extractField(patterns.ice),
      fiscalId: extractField(patterns.fiscalId),
      tradeRegister: extractField(patterns.tradeRegister),
      cnss: extractField(patterns.cnss),
      patente: extractField(patterns.patente),
      bank: extractField(patterns.bank),
      rib: extractField(patterns.rib),
      capitalSocial: extractField(patterns.capitalSocial),
      legalForm: extractField(patterns.legalForm),
      rawText: footerText,
      confidence: 0,
    };

    // Count non-null fields for confidence calculation
    Object.keys(result).forEach(key => {
      if (key !== 'rawText' && key !== 'confidence' && result[key as keyof IVendorFooterInfo]) {
        fieldsFound++;
      }
    });

    // Higher confidence with more fields found
    result.confidence = Math.min(0.5 + fieldsFound * 0.1, 0.95);

    return result;
  }

  /**
   * Extracts customer code from text.
   * @param text Text to search
   * @returns Customer code or null
   */
  extractCustomerCode(text: string): string | null {
    for (const pattern of EntityZoneDetector.CUSTOMER_CODE_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Finds blocks identified by explicit labels.
   */
  #findLabeledBlocks(headerText: string): IEntityBlocks {
    const lines = headerText.split('\n');
    let vendor: IEntityBlock | null = null;
    let customer: IEntityBlock | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check customer labels
      for (const pattern of EntityZoneDetector.CUSTOMER_LABELS) {
        if (pattern.test(line)) {
          const block = this.#extractBlockFromLabel(lines, i, pattern);
          if (block) {
            customer = {
              ...block,
              source: 'labeled',
              confidence: 0.95,
              matchedLabel: pattern.toString(),
            };
          }
          break;
        }
      }

      // Check vendor labels
      for (const pattern of EntityZoneDetector.VENDOR_LABELS) {
        if (pattern.test(line)) {
          const block = this.#extractBlockFromLabel(lines, i, pattern);
          if (block) {
            vendor = {
              ...block,
              source: 'labeled',
              confidence: 0.90,
              matchedLabel: pattern.toString(),
            };
          }
          break;
        }
      }
    }

    return { vendor, customer, vendorFooter: null };
  }

  /**
   * Extracts a text block starting from a labeled line.
   */
  #extractBlockFromLabel(
    lines: string[],
    startIndex: number,
    labelPattern: RegExp,
  ): Omit<IEntityBlock, 'source' | 'confidence'> | null {
    const collectedLines: string[] = [];
    const startLine = startIndex;

    // Get content after label on same line
    const firstLine = lines[startIndex];
    const labelMatch = firstLine.match(labelPattern);
    if (labelMatch) {
      const afterLabel = firstLine.slice(labelMatch[0].length).trim();
      if (afterLabel) {
        collectedLines.push(afterLabel);
      }
    }

    // Collect subsequent lines until we hit a stop condition
    for (let i = startIndex + 1; i < Math.min(startIndex + 6, lines.length); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Stop at another label or identifier keywords
      if (this.#isStopLine(line)) break;

      // Stop if line looks like it's a different section
      if (EntityZoneDetector.CUSTOMER_LABELS.some(p => p.test(line))) break;
      if (EntityZoneDetector.VENDOR_LABELS.some(p => p.test(line))) break;

      collectedLines.push(line);
    }

    if (collectedLines.length === 0) return null;

    return {
      text: collectedLines.join('\n'),
      lines: collectedLines,
      startLine,
      endLine: startLine + collectedLines.length,
    };
  }

  /**
   * Analyzes positional layout to find vendor/customer blocks.
   * Heuristic: Left side = vendor, Right side = customer
   */
  #analyzePositionalLayout(
    headerText: string,
    labeledResult: IEntityBlocks,
  ): IEntityBlocks {
    // If both already found via labels, return as-is
    if (labeledResult.vendor && labeledResult.customer) {
      return labeledResult;
    }

    const lines = headerText.split('\n');
    const leftLines: string[] = [];
    const rightLines: string[] = [];

    // Simple heuristic: lines with lots of leading spaces or tabs might be "right" column
    // This is a basic approach - in reality we'd need OCR bounding boxes for accuracy
    for (const line of lines) {
      if (!line.trim()) continue;

      // Check for dual-column layout (3+ spaces or tab as separator)
      const dualMatch = line.match(/^(.{10,}?)(?:\s{4,}|\t)(.{10,})$/);
      if (dualMatch) {
        leftLines.push(dualMatch[1].trim());
        rightLines.push(dualMatch[2].trim());
      } else {
        // Single column - assume left/vendor
        leftLines.push(line.trim());
      }
    }

    // Build vendor block if not found via labels
    let vendor = labeledResult.vendor;
    if (!vendor && leftLines.length > 0) {
      // Check if left side has vendor indicators (ICE, legal form)
      const leftText = leftLines.join('\n');
      const hasVendorIndicators =
        /ice\s*[:：]?\s*\d{15}/i.test(leftText) ||
        /(?:sarl|sa|sas|sasu|eurl)\s/i.test(leftText) ||
        /i\.?f\.?\s*[:：]/i.test(leftText);

      if (hasVendorIndicators || leftLines.length >= 2) {
        vendor = {
          text: leftText,
          lines: leftLines,
          source: 'header_left',
          startLine: 0,
          endLine: leftLines.length,
          confidence: hasVendorIndicators ? 0.85 : 0.70,
        };
      }
    }

    // Build customer block if not found via labels
    let customer = labeledResult.customer;
    if (!customer && rightLines.length > 0) {
      const rightText = rightLines.join('\n');
      customer = {
        text: rightText,
        lines: rightLines,
        source: 'header_right',
        startLine: 0,
        endLine: rightLines.length,
        confidence: 0.65,
      };
    }

    return {
      vendor,
      customer,
      vendorFooter: labeledResult.vendorFooter,
    };
  }

  /**
   * Extracts vendor footer block.
   */
  #extractVendorFooterBlock(footerText: string): IEntityBlock | null {
    const info = this.extractVendorFromFooter(footerText);

    // Only create block if we found meaningful info
    if (info.confidence < 0.5) return null;

    return {
      text: info.rawText,
      lines: info.rawText.split('\n').filter(l => l.trim()),
      source: 'footer',
      startLine: 0,
      endLine: 0,
      confidence: info.confidence,
    };
  }

  /**
   * Checks if a line is a stop line for block extraction.
   */
  #isStopLine(line: string): boolean {
    const lower = line.toLowerCase();

    // Document identifiers
    if (/^(facture|devis|avoir|proforma|bl|bc)\s*n[°o]?\s*[:：]?/i.test(line)) return true;

    // Date patterns
    if (/^date\s*[:：]?/i.test(line)) return true;

    // Moroccan identifiers (these belong to vendor, stop customer block)
    if (/^(ice|i\.?f\.?|r\.?c\.?|cnss|patente)\s*[:：]?/i.test(lower)) return true;

    // Contact keywords
    if (/^(tél|tel|phone|fax|email|@)/i.test(lower)) return true;

    // Code client (belongs to customer section)
    if (/code\s*client/i.test(lower)) return true;

    return false;
  }
}
