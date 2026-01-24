import { IOcrLocale } from '../locales';
import { IInvoiceSupplier, EntitySource } from '../supplier-invoice.models';
import { ZoneDetector } from '../detection/zone-detector';

/**
 * Loose contact extraction result.
 * All extractions are marked with lower confidence and need review.
 */
export interface ILooseContactResult {
  /** Extracted supplier name */
  name: string | null;

  /** Invoice number (bonus extraction) */
  invoiceNumber: string | null;

  /** Invoice date (bonus extraction) */
  invoiceDate: Date | null;

  /** Extraction confidence (always < 0.7) */
  confidence: number;

  /** Method used for extraction */
  method: 'heuristic_keywords' | 'first_line' | 'pattern_fallback';

  /** Needs user review flag */
  needsReview: boolean;
}

/**
 * Loose/fallback contact extractor using simple patterns from optisass-angular.
 * Used when strict extraction methods fail.
 *
 * Key differences from strict extraction:
 * - More permissive patterns
 * - Lower confidence scores
 * - Always marks for user review
 * - Simpler keyword-based matching
 *
 * Based on optisass-angular/frontend/src/app/core/services/ocr.service.ts
 */
export class LooseContactExtractor {
  readonly #zoneDetector = new ZoneDetector();

  /**
   * Keywords that indicate a supplier/company line.
   * From optisass-angular supplierRegex pattern.
   */
  static readonly SUPPLIER_KEYWORDS = [
    'DISTRIBUTION',
    'SOCIETE',
    'SOCIÉTÉ',
    'OPTICAL',
    'OPTIQUE',
    'VISION',
    'LUNETTES',
    'EYEWEAR',
    'OPTIC',
    'OPTIK',
    'VERRE',
    'LENTILLE',
    'LENS',
    'MONTURE',
    'FRAME',
    'LUXOTTICA',
    'ESSILOR',
    'SAFILO',
    'HOYA',
    'ZEISS',
    'BBGR',
    'RODENSTOCK',
  ];

  /**
   * Legal forms that identify companies (Moroccan/French).
   */
  static readonly LEGAL_FORMS = [
    'SARL',
    'SA',
    'SAS',
    'SASU',
    'EURL',
    'EI',
    'SNC',
    'STE',
    'SOCIÉTÉ',
    'SOCIETE',
    'ETS',
    'ETABLISSEMENT',
  ];

  /**
   * Lines to skip (headers, totals, etc.).
   * From optisass-angular noiseKeywords.
   */
  static readonly NOISE_KEYWORDS = [
    'a reporter',
    'net à payer',
    'net a payer',
    'tva ',
    't.v.a',
    'montant h.t',
    'total h.t',
    'facture n',
    'date :',
    'tél :',
    'tel :',
    'fixe :',
    'site :',
    'email :',
    'rib :',
    'if :',
    'rc :',
    'arrêtée la présente',
    'page ',
    'somme ttc',
    'dirhams',
    'modèle',
    'total à reporter',
    'total net',
    'service - sérieux',
  ];

  /**
   * Extracts supplier info using loose/fallback patterns.
   * Use this when strict ContactExtractor fails.
   * @param text Full document text
   * @param locale OCR locale (used for stop words)
   * @returns Loose extraction result
   */
  extractSupplier(text: string, locale: IOcrLocale): ILooseContactResult {
    const headerText = this.#zoneDetector.extractHeaderZone(text);
    const cleanText = text.replace(/,/g, '.'); // Normalize decimals like optisass

    // Strategy 1: Keyword-based extraction (optisass pattern)
    const keywordResult = this.#extractByKeywords(headerText);
    if (keywordResult.name) {
      return {
        ...keywordResult,
        ...this.#extractBonusFields(cleanText),
      };
    }

    // Strategy 2: Legal form extraction
    const legalFormResult = this.#extractByLegalForm(headerText);
    if (legalFormResult.name) {
      return {
        ...legalFormResult,
        ...this.#extractBonusFields(cleanText),
      };
    }

    // Strategy 3: First line fallback (most permissive)
    const firstLineResult = this.#extractFirstLine(headerText, locale);
    return {
      ...firstLineResult,
      ...this.#extractBonusFields(cleanText),
    };
  }

  /**
   * Extracts complete supplier with all fields using loose patterns.
   * @param text Full document text
   * @param locale OCR locale
   * @returns Partial supplier data
   */
  extractFullSupplier(text: string, locale: IOcrLocale): Partial<IInvoiceSupplier> & { _needsReview: boolean } {
    const looseResult = this.extractSupplier(text, locale);

    // Extract identifiers using simple patterns
    const identifiers = this.#extractLooseIdentifiers(text);

    // Extract phone using simple pattern
    const phone = this.#extractLoosePhone(text);

    // Extract email
    const email = this.#extractLooseEmail(text);

    return {
      name: looseResult.name || 'Fournisseur non identifié',
      ice: identifiers.ice,
      fiscalId: identifiers.fiscalId,
      tradeRegister: identifiers.tradeRegister,
      cnss: null,
      patente: null,
      address: null,
      phone,
      email,
      bank: null,
      rib: null,
      _source: 'inferred' as EntitySource,
      _confidence: looseResult.confidence,
      _needsReview: true,
    };
  }

  /**
   * Strategy 1: Extract by supplier keywords.
   * Based on optisass supplierRegex: /^.*(?:DISTRIBUTION|SOCIETE|OPTICAL|...).*$/im
   */
  #extractByKeywords(text: string): ILooseContactResult {
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      // Skip noise lines
      if (this.#isNoiseLine(trimmed)) continue;

      // Check for supplier keywords
      const upper = trimmed.toUpperCase();
      const hasKeyword = LooseContactExtractor.SUPPLIER_KEYWORDS.some(k => upper.includes(k));

      if (hasKeyword) {
        // Clean the name (remove sponsors/noise that might be appended)
        const cleanedName = this.#cleanSupplierName(trimmed);

        return {
          name: cleanedName,
          invoiceNumber: null,
          invoiceDate: null,
          confidence: 0.65,
          method: 'heuristic_keywords',
          needsReview: true,
        };
      }
    }

    return {
      name: null,
      invoiceNumber: null,
      invoiceDate: null,
      confidence: 0,
      method: 'heuristic_keywords',
      needsReview: true,
    };
  }

  /**
   * Strategy 2: Extract by legal form.
   */
  #extractByLegalForm(text: string): ILooseContactResult {
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      // Skip noise lines
      if (this.#isNoiseLine(trimmed)) continue;

      // Check for legal forms
      const upper = trimmed.toUpperCase();
      const hasLegalForm = LooseContactExtractor.LEGAL_FORMS.some(form => {
        const regex = new RegExp(`\\b${form}\\b`, 'i');
        return regex.test(upper);
      });

      if (hasLegalForm) {
        const cleanedName = this.#cleanSupplierName(trimmed);

        return {
          name: cleanedName,
          invoiceNumber: null,
          invoiceDate: null,
          confidence: 0.60,
          method: 'heuristic_keywords',
          needsReview: true,
        };
      }
    }

    return {
      name: null,
      invoiceNumber: null,
      invoiceDate: null,
      confidence: 0,
      method: 'heuristic_keywords',
      needsReview: true,
    };
  }

  /**
   * Strategy 3: First meaningful line fallback.
   */
  #extractFirstLine(text: string, locale: IOcrLocale): ILooseContactResult {
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty, short, or noise lines
      if (!trimmed || trimmed.length < 4 || trimmed.length > 80) continue;
      if (this.#isNoiseLine(trimmed)) continue;

      // Skip if all stop words
      const words = trimmed.toLowerCase().split(/\s+/);
      if (words.every(w => locale.stopWords.includes(w))) continue;

      // Skip pure numbers or dates
      if (/^[\d\s.,\/\-]+$/.test(trimmed)) continue;

      // Must start with uppercase
      if (!/^[A-ZÀ-Ü]/.test(trimmed)) continue;

      return {
        name: trimmed,
        invoiceNumber: null,
        invoiceDate: null,
        confidence: 0.45,
        method: 'first_line',
        needsReview: true,
      };
    }

    return {
      name: null,
      invoiceNumber: null,
      invoiceDate: null,
      confidence: 0,
      method: 'first_line',
      needsReview: true,
    };
  }

  /**
   * Extracts bonus fields (invoice number, date) using optisass patterns.
   */
  #extractBonusFields(text: string): { invoiceNumber: string | null; invoiceDate: Date | null } {
    // Invoice number patterns from optisass
    const invoiceNumRegex = /(?:Facture|Ref|Fc)\s*(?:N°|No|N\.|N0|N|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i;
    const faFallbackRegex = /(FA\d{6,}[A-Za-z0-9]*)/;

    let invMatch = text.match(invoiceNumRegex);
    if (!invMatch || (invMatch[1] && invMatch[1].length <= 3)) {
      invMatch = text.match(faFallbackRegex);
    }

    const invoiceNumber = invMatch && invMatch[1] && invMatch[1].length > 3
      ? invMatch[1].trim()
      : null;

    // Date patterns from optisass (5 patterns cascade)
    const datePatterns = [
      /(?:Date|Du|Le|Facture du)\s*:?\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/i,
      /(?:Rabat|Casablanca|Marrakech|Fes|Tanger|Agadir)?\s*le,?\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/i,
      /le[,\s]*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/i,
      /Rabat[\s\S]{0,20}(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/i,
      /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/,
    ];

    let invoiceDate: Date | null = null;

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        let year = parseInt(match[3], 10);

        // Handle 2-digit years
        if (year < 100) {
          year += 2000;
        }

        // Basic validation
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
          const date = new Date(year, month - 1, day);
          const now = new Date();
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(now.getFullYear() + 1);

          if (!isNaN(date.getTime()) && date <= oneYearFromNow) {
            invoiceDate = date;
            break;
          }
        }
      }
    }

    return { invoiceNumber, invoiceDate };
  }

  /**
   * Extracts identifiers using simple patterns.
   */
  #extractLooseIdentifiers(text: string): {
    ice: string | null;
    fiscalId: string | null;
    tradeRegister: string | null;
  } {
    const iceMatch = text.match(/ice\s*[:：]?\s*(\d{13,15})/i);
    const ifMatch = text.match(/i\.?f\.?\s*[:：]?\s*(\d{6,8})/i);
    const rcMatch = text.match(/r\.?c\.?\s*[:：]?\s*(\d{4,6})/i);

    return {
      ice: iceMatch ? iceMatch[1] : null,
      fiscalId: ifMatch ? ifMatch[1] : null,
      tradeRegister: rcMatch ? rcMatch[1] : null,
    };
  }

  /**
   * Extracts phone using simple pattern.
   */
  #extractLoosePhone(text: string): string | null {
    // Simple phone pattern (10+ digits with separators)
    const match = text.match(/(?:tél(?:éphone)?|tel|phone|gsm|mobile|fax)\s*[.:]?\s*([\d\s.+()-]{10,20})/i);
    if (match) {
      return match[1].replace(/[\s.\-()]/g, '').replace(/^(\d{2})/, '$1 ').trim();
    }

    // Fallback: any 10-digit sequence starting with 0
    const fallback = text.match(/\b(0[5-7][\d\s.]{8,12})\b/);
    return fallback ? fallback[1].replace(/[\s.]/g, '') : null;
  }

  /**
   * Extracts email using simple pattern.
   */
  #extractLooseEmail(text: string): string | null {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0].toLowerCase() : null;
  }

  /**
   * Checks if a line is noise/metadata.
   */
  #isNoiseLine(line: string): boolean {
    const lower = line.toLowerCase();
    return LooseContactExtractor.NOISE_KEYWORDS.some(k => lower.includes(k));
  }

  /**
   * Cleans supplier name by removing appended sponsors/noise.
   * From optisass createAndSelectSupplier logic.
   */
  #cleanSupplierName(name: string): string {
    // Remove STE/SOCIETE prefix
    let clean = name.replace(/^(STE|SOCIETE|SOCIÉTÉ)\s+/i, '').trim();

    // Remove trailing punctuation
    clean = clean.replace(/[;:,.]+$/, '').trim();

    // Remove known sponsors that might be appended
    const sponsors = ['CHARMANT', 'SEIKO', 'IKKS', 'ESPRIT', 'ELLE', 'MINAMOTO', 'FESTINA'];
    const sponsorRegex = new RegExp(`\\s+(${sponsors.join('|')})[\\s\\S]*`, 'i');
    clean = clean.replace(sponsorRegex, '').trim();

    return clean || name;
  }
}
