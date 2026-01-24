import { IInvoiceLine, ILineFieldConfidence } from '../supplier-invoice.models';
import { parseNumber, cleanNumeric } from '../patterns';

/**
 * Supplier template configuration.
 * Defines specific parsing patterns for known suppliers.
 */
export interface ISupplierTemplate {
  /** Template identifier */
  id: string;
  /** Supplier name patterns to match */
  supplierPatterns: RegExp[];
  /** ICE patterns to match (if known) */
  icePatterns?: RegExp[];
  /** Line extraction regex pattern */
  linePattern: RegExp;
  /** Group indices mapping */
  groups: {
    reference?: number;
    designation?: number;
    quantity?: number;
    unitPrice?: number;
    discount?: number;
    total?: number;
    unit?: number;
  };
  /** Default VAT rate for this supplier */
  defaultVatRate?: number;
  /** Post-processing function */
  postProcess?: (line: IInvoiceLine, rawMatch: RegExpMatchArray) => IInvoiceLine;
}

/**
 * Known supplier templates.
 * Add new templates here for suppliers with specific invoice formats.
 */
export const SUPPLIER_TEMPLATES: ReadonlyArray<ISupplierTemplate> = [
  // ============================================================
  // DK DISTRIBUTION - Common Moroccan optical distributor
  // ============================================================
  {
    id: 'dk_distribution',
    supplierPatterns: [
      /DK\s*DISTRIBUTION/i,
      /DK\s*OPTICAL/i,
    ],
    linePattern: /^(\d{8,14})\s+([A-Z0-9\-./]+)\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+([\d\s.,]+)\s+(\d+(?:[.,]\d+)?)\s*%\s+([\d\s.,]+)$/i,
    groups: {
      reference: 1,      // EAN
      designation: 3,    // Product description (group 2 is model code)
      quantity: 4,
      unitPrice: 5,
      discount: 6,
      total: 7,
    },
    defaultVatRate: 0.20,
    postProcess: (line, match) => {
      // Combine model code with designation
      const modelCode = match[2]?.trim();
      if (modelCode && line.designation) {
        line = {
          ...line,
          designation: `${modelCode} ${line.designation}`,
        };
      }
      return line;
    },
  },

  // ============================================================
  // LUXOTTICA Format
  // ============================================================
  {
    id: 'luxottica',
    supplierPatterns: [
      /LUXOTTICA/i,
      /SUNGLASS\s*HUT/i,
    ],
    linePattern: /^([A-Z]{2}\d{4}[A-Z]?)\s+(\d{3}\/\d{2,3})\s+(.+?)\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)$/i,
    groups: {
      reference: 1,      // Model code (RB3025, OO9013, etc.)
      designation: 3,
      quantity: 4,
      unitPrice: 5,
      total: 6,
    },
    defaultVatRate: 0.20,
    postProcess: (line, match) => {
      // Add color code to designation
      const colorCode = match[2]?.trim();
      if (colorCode && line.designation) {
        line = {
          ...line,
          designation: `${line.designation} ${colorCode}`,
        };
      }
      return line;
    },
  },

  // ============================================================
  // SAFILO Format
  // ============================================================
  {
    id: 'safilo',
    supplierPatterns: [
      /SAFILO/i,
    ],
    linePattern: /^([A-Z\-]+)\s+(\d{4}\/[A-Z]\/[A-Z]\.\d{3}(?:\.\d{2})?)\s+(.+?)\s+(\d+)\s+([\d\s.,]+)\s*([\d.,]+%?)?\s+([\d\s.,]+)$/i,
    groups: {
      reference: 2,      // Safilo code (0298/G/S.807.55)
      designation: 3,
      quantity: 4,
      unitPrice: 5,
      discount: 6,
      total: 7,
    },
    defaultVatRate: 0.20,
    postProcess: (line, match) => {
      // Add brand to designation
      const brand = match[1]?.trim();
      if (brand && line.designation) {
        line = {
          ...line,
          designation: `${brand} ${line.designation}`,
        };
      }
      return line;
    },
  },

  // ============================================================
  // ESSILOR/BBGR Format (Lenses)
  // ============================================================
  {
    id: 'essilor',
    supplierPatterns: [
      /ESSILOR/i,
      /BBGR/i,
    ],
    linePattern: /^([A-Z0-9]{6,10})\s+(.+?)\s+(\d+)\s+([\d\s.,]+)\s+([\d\s.,]+)$/i,
    groups: {
      reference: 1,
      designation: 2,
      quantity: 3,
      unitPrice: 4,
      total: 5,
    },
    defaultVatRate: 0.20,
  },

  // ============================================================
  // HOYA Format (Lenses)
  // ============================================================
  {
    id: 'hoya',
    supplierPatterns: [
      /HOYA/i,
    ],
    linePattern: /^([A-Z0-9\-]{5,15})\s+(.+?)\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)$/i,
    groups: {
      reference: 1,
      designation: 2,
      quantity: 3,
      unitPrice: 4,
      total: 5,
    },
    defaultVatRate: 0.20,
  },
];

/**
 * Confidence for template-extracted lines.
 */
const TEMPLATE_CONFIDENCE: ILineFieldConfidence = {
  reference: 0.95,
  designation: 0.90,
  quantity: 0.95,
  unitPrice: 0.95,
  total: 0.95,
};

/**
 * Finds a matching supplier template.
 * @param supplierName Supplier name from invoice
 * @param ice ICE identifier if available
 * @returns Matching template or null
 */
export function findSupplierTemplate(
  supplierName: string | null,
  ice: string | null,
): ISupplierTemplate | null {
  if (!supplierName && !ice) return null;

  for (const template of SUPPLIER_TEMPLATES) {
    // Check supplier name patterns
    if (supplierName) {
      for (const pattern of template.supplierPatterns) {
        if (pattern.test(supplierName)) {
          return template;
        }
      }
    }

    // Check ICE patterns
    if (ice && template.icePatterns) {
      for (const pattern of template.icePatterns) {
        if (pattern.test(ice)) {
          return template;
        }
      }
    }
  }

  return null;
}

/**
 * Extracts a line using a supplier template.
 * @param template Supplier template
 * @param line Raw line text
 * @param lineIndex Line index
 * @returns Extracted line or null
 */
export function extractWithTemplate(
  template: ISupplierTemplate,
  line: string,
  lineIndex: number,
): IInvoiceLine | null {
  const match = line.match(template.linePattern);
  if (!match) return null;

  const groups = template.groups;
  const defaultVatRate = template.defaultVatRate ?? 0.20;

  // Extract fields from match groups
  const reference = groups.reference ? match[groups.reference]?.trim() || null : null;
  const designation = groups.designation ? match[groups.designation]?.trim() || null : null;
  const quantity = groups.quantity ? parseNumber(match[groups.quantity]) : 1;
  const unitPrice = groups.unitPrice ? parseNumber(cleanNumeric(match[groups.unitPrice])) : 0;
  const discountStr = groups.discount ? match[groups.discount] : null;
  const total = groups.total ? parseNumber(cleanNumeric(match[groups.total])) : 0;
  const unit = groups.unit ? match[groups.unit]?.trim() || null : null;

  // Parse discount
  let discountRate: number | null = null;
  if (discountStr) {
    const discountMatch = discountStr.match(/(\d+(?:[.,]\d+)?)/);
    if (discountMatch) {
      const discountPercent = parseNumber(discountMatch[1]);
      discountRate = discountPercent > 0 ? discountPercent / 100 : null;
    }
  }

  // Validate minimum data
  if (!designation && !reference) return null;
  if (quantity <= 0 && unitPrice <= 0 && total <= 0) return null;

  // Calculate total if not provided
  let calculatedTotal = total;
  if (calculatedTotal <= 0 && quantity > 0 && unitPrice > 0) {
    const discount = discountRate ?? 0;
    calculatedTotal = quantity * unitPrice * (1 - discount);
  }

  let result: IInvoiceLine = {
    reference,
    designation,
    quantity: quantity > 0 ? quantity : null,
    unit,
    unitPriceHT: unitPrice > 0 ? unitPrice : null,
    discountRate,
    totalHT: calculatedTotal > 0 ? calculatedTotal : null,
    vatRate: defaultVatRate,
    _rawText: line,
    _confidence: { ...TEMPLATE_CONFIDENCE },
    _needsReview: false,
    _lineIndex: lineIndex,
    _extractionMethod: 'barcode', // Templates are high-confidence like barcode
  };

  // Apply post-processing if defined
  if (template.postProcess) {
    result = template.postProcess(result, match);
  }

  return result;
}

/**
 * Supplier template extractor that tries known formats first.
 */
export class SupplierTemplateExtractor {
  #template: ISupplierTemplate | null = null;

  /**
   * Sets the supplier template based on supplier info.
   * @param supplierName Supplier name
   * @param ice ICE identifier
   * @returns true if a template was found
   */
  setSupplier(supplierName: string | null, ice: string | null): boolean {
    this.#template = findSupplierTemplate(supplierName, ice);
    return this.#template !== null;
  }

  /**
   * Gets the current template ID.
   */
  getTemplateId(): string | null {
    return this.#template?.id ?? null;
  }

  /**
   * Tries to extract a line using the current template.
   * @param line Raw line text
   * @param lineIndex Line index
   * @returns Extracted line or null
   */
  tryExtract(line: string, lineIndex: number): IInvoiceLine | null {
    if (!this.#template) return null;
    return extractWithTemplate(this.#template, line, lineIndex);
  }

  /**
   * Checks if a template is active.
   */
  hasTemplate(): boolean {
    return this.#template !== null;
  }
}
