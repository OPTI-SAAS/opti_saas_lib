/**
 * Field confidence levels for extracted line item data.
 */
export interface ILineFieldConfidence {
  /** Reference field confidence (0-1) */
  reference: number;

  /** Designation field confidence (0-1) */
  designation: number;

  /** Quantity field confidence (0-1) */
  quantity: number;

  /** Unit price field confidence (0-1) */
  unitPrice: number;

  /** Total field confidence (0-1) */
  total: number;
}

/**
 * Extraction method used for a line.
 */
export type ExtractionMethod =
  | 'barcode'
  | 'extended'
  | 'with_discount'
  | 'full'
  | 'simple'
  | 'fallback'
  | 'detected_only'
  | 'loose_extended_ocr'
  | 'loose_code_amounts'
  | 'loose_qty_price'
  | 'loose_multi_numbers'
  | 'multiline_merged';

/**
 * Supplier invoice line item.
 */
export interface IInvoiceLine {
  /** Product reference/code */
  reference: string | null;

  /** Product designation/description */
  designation: string | null;

  /** Quantity (null = not extracted) */
  quantity: number | null;

  /** Unit (piece, kg, box, etc.) */
  unit: string | null;

  /** Unit price excluding tax (null = not extracted) */
  unitPriceHT: number | null;

  /** Discount rate (0.10 for 10%) */
  discountRate: number | null;

  /** Total price excluding tax for this line (null = not extracted) */
  totalHT: number | null;

  /** VAT rate (0.20 for 20%) */
  vatRate: number | null;

  // ═══════════════════════════════════════════════════════════════════════════
  // METADATA FIELDS (for UI display and user completion)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Raw OCR text for this line */
  _rawText: string;

  /** Confidence per field */
  _confidence: ILineFieldConfidence;

  /** Line needs user review/completion */
  _needsReview: boolean;

  /** Line index in original document */
  _lineIndex: number;

  /** Extraction method used */
  _extractionMethod: ExtractionMethod;

  /** Line is corrupted and couldn't be parsed (user must fill manually) */
  _isCorrupted?: boolean;

  /** Reason why the line is corrupted (for user information) */
  _corruptionReason?: string;
}

/**
 * Supplier information extracted from invoice.
 */
export interface IInvoiceSupplier {
  /** Supplier company name */
  name: string;

  /** ICE (Identifiant Commun de l'Entreprise) - Moroccan tax ID */
  ice: string | null;

  /** IF (Identifiant Fiscal) */
  fiscalId: string | null;

  /** RC (Registre de Commerce) */
  tradeRegister: string | null;

  /** CNSS (Caisse Nationale de Sécurité Sociale) */
  cnss: string | null;

  /** Patente (Business License) */
  patente: string | null;

  /** Supplier address (full text) */
  address: string | null;

  /** Phone number */
  phone: string | null;

  /** Email address */
  email: string | null;

  /** Bank name */
  bank: string | null;

  /** RIB (Bank account number) */
  rib: string | null;

  /** Structured address components */
  addressDetails?: IAddressComponents;

  /** Source zone where supplier info was found */
  _source?: EntitySource;

  /** Extraction confidence (0-1) */
  _confidence?: number;
}

/**
 * Invoice totals.
 */
export interface IInvoiceTotals {
  /** Total excluding tax */
  totalHT: number;

  /** Total VAT amount */
  totalVAT: number;

  /** Total including tax */
  totalTTC: number;

  /** Discount amount if any */
  discount: number | null;
}

/**
 * Source zone where entity data was extracted from.
 */
export type EntitySource =
  | 'header_left'
  | 'header_right'
  | 'labeled'
  | 'footer'
  | 'inferred';

/**
 * Structured address components.
 */
export interface IAddressComponents {
  street: string | null;
  streetLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

/**
 * Client/customer information extracted from invoice.
 * The client is the party being billed (destinataire).
 */
export interface IInvoiceClient {
  /** Client company/person name */
  name: string | null;

  /** Billing address (full text) */
  billingAddress: string | null;

  /** Shipping address if different (full text) */
  shippingAddress: string | null;

  /** Customer code at the supplier */
  customerCode: string | null;

  /** Client ICE (rare in Morocco) */
  ice: string | null;

  /** Client phone number */
  phone: string | null;

  /** Structured billing address components */
  billingAddressDetails?: IAddressComponents;

  /** Structured shipping address components */
  shippingAddressDetails?: IAddressComponents;

  /** Source zone where client info was found */
  _source?: EntitySource;

  /** Extraction confidence (0-1) */
  _confidence?: number;
}

/**
 * Supplier invoice data extracted from OCR.
 */
export interface ISupplierInvoice {
  /** Invoice number */
  invoiceNumber: string | null;

  /** Invoice date */
  invoiceDate: Date | null;

  /** Due date for payment */
  dueDate: Date | null;

  /** Supplier information */
  supplier: IInvoiceSupplier;

  /** Client information (optional - the party being billed) */
  client?: IInvoiceClient;

  /** Invoice line items */
  lines: IInvoiceLine[];

  /** Invoice totals */
  totals: IInvoiceTotals;

  /** Payment terms/conditions */
  paymentTerms: string | null;

  /** Currency (default MAD) */
  currency: string;

  /** Raw text for reference */
  rawText: string;
}
