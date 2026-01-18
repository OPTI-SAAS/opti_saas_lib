import { IInvoiceLine } from '../supplier-invoice.models';
import {
  NUMERIC_PATTERNS,
  parseNumber,
  cleanOcrText,
  cleanNumeric,
  isNoiseLine,
  startsWithBarcode,
  calculateNetPrice,
} from '../patterns';

/**
 * Extracts invoice line items from text.
 */
export class LineItemExtractor {
  /**
   * Extracts all line items from text.
   * @param text Source text
   * @param defaultVatRate Default VAT rate to apply
   * @param noiseKeywords Keywords to filter out non-product lines
   * @returns Array of extracted line items
   */
  extractLines(
    text: string,
    defaultVatRate: number = 0.2,
    noiseKeywords: string[] = [],
  ): IInvoiceLine[] {
    const cleanedText = cleanOcrText(text);
    const textLines = cleanedText.split('\n');

    // Filter noise lines first
    const productLines = textLines.filter(
      (line) => !isNoiseLine(line, noiseKeywords),
    );

    // Try barcode format first (most specific for optical invoices)
    let lines = this.#extractBarcodeFormat(productLines, defaultVatRate);

    // Fallback to extended format with discount
    if (lines.length === 0) {
      lines = this.#extractExtendedFormat(productLines, defaultVatRate);
    }

    // Fallback to standard format with discount
    if (lines.length === 0) {
      lines = this.#extractWithDiscountFormat(cleanedText, defaultVatRate);
    }

    // Fallback to full format without discount
    if (lines.length === 0) {
      lines = this.#extractFullFormat(cleanedText, defaultVatRate);
    }

    // Fallback to simple format
    if (lines.length === 0) {
      lines = this.#extractSimpleFormat(cleanedText, defaultVatRate);
    }

    return lines;
  }

  /**
   * Extracts lines starting with barcode (EAN-8 to EAN-14).
   * Format: Barcode + Designation + Qty + Price + Discount% + Total
   */
  #extractBarcodeFormat(textLines: string[], defaultVatRate: number): IInvoiceLine[] {
    const lines: IInvoiceLine[] = [];

    // Pattern: Barcode (8-14 digits) + Designation + Numbers
    // Example: 197737121778 CH-HER 0298/G/S.807.55.HA 1 1 045,00 15.00% 888.25
    const barcodeLinePattern =
      /^(\d{8,14})\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+([\d\s.,]+)\s+(\d+(?:[.,]\d+)?)\s*%?\s+([\d\s.,]+)$/;

    for (const line of textLines) {
      if (!startsWithBarcode(line)) continue;

      const match = line.match(barcodeLinePattern);
      if (match) {
        const reference = match[1];
        const designation = match[2].trim();
        const quantity = parseNumber(match[3]);
        const unitPrice = parseNumber(cleanNumeric(match[4]));
        const discountPercent = parseNumber(match[5]);
        const total = parseNumber(cleanNumeric(match[6]));

        if (quantity > 0 && unitPrice > 0) {
          const calculatedTotal =
            total > 0 ? total : quantity * calculateNetPrice(unitPrice, discountPercent);

          lines.push({
            reference,
            designation,
            quantity,
            unit: null,
            unitPriceHT: unitPrice,
            discountRate: discountPercent > 0 ? discountPercent / 100 : null,
            totalHT: calculatedTotal,
            vatRate: defaultVatRate,
          });
        }
      }
    }

    return lines;
  }

  /**
   * Extracts lines using extended format with OCR artifact handling.
   */
  #extractExtendedFormat(textLines: string[], defaultVatRate: number): IInvoiceLine[] {
    const lines: IInvoiceLine[] = [];

    for (const line of textLines) {
      const match = line.match(NUMERIC_PATTERNS.LINE_ITEM.EXTENDED);
      if (match) {
        const reference = match[1].trim();
        const designation = match[2].trim();
        const quantity = parseNumber(match[3]);
        const unitPrice = parseNumber(cleanNumeric(match[4]));
        const discountPercent = parseNumber(match[5]);
        const total = parseNumber(cleanNumeric(match[6]));

        if (quantity > 0 && unitPrice > 0) {
          const calculatedTotal =
            total > 0 ? total : quantity * calculateNetPrice(unitPrice, discountPercent);

          lines.push({
            reference,
            designation,
            quantity,
            unit: null,
            unitPriceHT: unitPrice,
            discountRate: discountPercent > 0 ? discountPercent / 100 : null,
            totalHT: calculatedTotal,
            vatRate: defaultVatRate,
          });
        }
      }
    }

    return lines;
  }

  /**
   * Extracts lines with discount: Ref + Designation + Qty + Price + Discount% + Total
   */
  #extractWithDiscountFormat(text: string, defaultVatRate: number): IInvoiceLine[] {
    const lines: IInvoiceLine[] = [];
    const pattern = new RegExp(NUMERIC_PATTERNS.LINE_ITEM.WITH_DISCOUNT.source, 'gim');

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const reference = match[1].trim();
      const designation = match[2].trim();
      const quantity = parseNumber(match[3]);
      const unitPrice = parseNumber(match[4]);
      const discountPercent = parseNumber(match[5]);
      const total = parseNumber(match[6]);

      if (quantity > 0 && unitPrice > 0) {
        lines.push({
          reference,
          designation,
          quantity,
          unit: null,
          unitPriceHT: unitPrice,
          discountRate: discountPercent > 0 ? discountPercent / 100 : null,
          totalHT: total > 0 ? total : quantity * unitPrice * (1 - discountPercent / 100),
          vatRate: defaultVatRate,
        });
      }
    }

    return lines;
  }

  /**
   * Extracts lines in full format: Description Qty [Unit] Price Total
   */
  #extractFullFormat(text: string, defaultVatRate: number): IInvoiceLine[] {
    const lines: IInvoiceLine[] = [];
    const pattern = new RegExp(NUMERIC_PATTERNS.LINE_ITEM.FULL.source, 'gim');

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const quantity = parseNumber(match[2]);
      const unitPrice = parseNumber(match[4]);
      const total = parseNumber(match[5]);

      if (quantity > 0 && unitPrice > 0) {
        const designation = match[1].trim();
        const reference = this.#extractReference(designation);

        lines.push({
          reference,
          designation: reference ? designation.replace(reference, '').trim() : designation,
          quantity,
          unit: match[3]?.toLowerCase() || null,
          unitPriceHT: unitPrice,
          discountRate: null,
          totalHT: total > 0 ? total : quantity * unitPrice,
          vatRate: defaultVatRate,
        });
      }
    }

    return lines;
  }

  /**
   * Extracts lines in simple format: Qty x Price
   */
  #extractSimpleFormat(text: string, defaultVatRate: number): IInvoiceLine[] {
    const lines: IInvoiceLine[] = [];
    const pattern = new RegExp(NUMERIC_PATTERNS.LINE_ITEM.SIMPLE.source, 'g');

    let match;
    let index = 0;
    while ((match = pattern.exec(text)) !== null) {
      const quantity = parseNumber(match[1]);
      const unitPrice = parseNumber(match[2]);

      if (quantity > 0 && unitPrice > 0) {
        index++;
        lines.push({
          reference: null,
          designation: `Article ${index}`,
          quantity,
          unit: null,
          unitPriceHT: unitPrice,
          discountRate: null,
          totalHT: quantity * unitPrice,
          vatRate: defaultVatRate,
        });
      }
    }

    return lines;
  }

  /**
   * Extracts product reference from designation.
   * References are typically alphanumeric codes at the start.
   */
  #extractReference(designation: string): string | null {
    const match = designation.match(/^([A-Z0-9]{3,15})\s/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Validates extracted lines against totals.
   * @param lines Extracted lines
   * @param expectedTotalHT Expected total HT
   * @returns Validation result
   */
  validateAgainstTotal(
    lines: IInvoiceLine[],
    expectedTotalHT: number,
  ): { isValid: boolean; calculatedTotal: number; difference: number } {
    const calculatedTotal = lines.reduce((sum, line) => sum + line.totalHT, 0);
    const difference = Math.abs(calculatedTotal - expectedTotalHT);

    return {
      isValid: difference < 0.01 || difference / expectedTotalHT < 0.01,
      calculatedTotal,
      difference,
    };
  }

  /**
   * Attempts to infer VAT rate from line amounts and totals.
   * @param _lines Extracted lines (reserved for future use)
   * @param totalHT Total excluding tax
   * @param totalTTC Total including tax
   * @returns Inferred VAT rate or null
   */
  inferVATRate(_lines: IInvoiceLine[], totalHT: number, totalTTC: number): number | null {
    if (totalHT <= 0 || totalTTC <= totalHT) return null;

    const vat = totalTTC - totalHT;
    const rate = vat / totalHT;

    if (rate >= 0.05 && rate <= 0.3) {
      const commonRates = [0.07, 0.1, 0.14, 0.2];
      for (const common of commonRates) {
        if (Math.abs(rate - common) < 0.02) {
          return common;
        }
      }
      return Math.round(rate * 100) / 100;
    }

    return null;
  }
}
