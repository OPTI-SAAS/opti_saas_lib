/**
 * Supplier invoice line item.
 */
export interface IInvoiceLine {
  /** Product reference/code */
  reference: string | null;

  /** Product designation/description */
  designation: string;

  /** Quantity */
  quantity: number;

  /** Unit (piece, kg, box, etc.) */
  unit: string | null;

  /** Unit price excluding tax */
  unitPriceHT: number;

  /** Total price excluding tax for this line */
  totalHT: number;

  /** VAT rate (0.20 for 20%) */
  vatRate: number | null;
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

  /** Supplier address */
  address: string | null;

  /** Phone number */
  phone: string | null;
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
