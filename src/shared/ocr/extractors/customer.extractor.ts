import { BaseExtractor } from './base.extractor';
import { ContactExtractor } from './contact.extractor';
import { IExtractionResult, IOcrLocale } from '../locales';
import { EntityZoneDetector, IEntityBlock } from '../detection/entity-zone-detector';
import { IInvoiceClient, EntitySource } from '../supplier-invoice.models';
import { CityLookup } from '../patterns/city-lookup';

/**
 * Customer extraction result with confidence and source info.
 */
export interface ICustomerExtractionResult {
  /** Extracted customer data */
  customer: IInvoiceClient | null;

  /** Overall extraction confidence */
  confidence: number;

  /** Source where customer was found */
  source: EntitySource | null;

  /** Customer code if found separately */
  customerCode: string | null;
}

/**
 * Extracts customer/client information from invoices.
 * Uses multi-strategy approach:
 * 1. Labeled extraction ("Facturé à:", "Bill to:", etc.)
 * 2. Positional extraction (right side of header)
 * 3. Fallback: Look for addresses not belonging to vendor
 */
export class CustomerExtractor extends BaseExtractor<IInvoiceClient> {
  readonly #contactExtractor: ContactExtractor;
  readonly #entityZoneDetector: EntityZoneDetector;
  readonly #cityLookup = CityLookup.getInstance();

  constructor() {
    super();
    this.#contactExtractor = new ContactExtractor();
    this.#entityZoneDetector = new EntityZoneDetector();
  }

  /**
   * Default extraction method (returns just the client).
   * @param text Source text
   * @param locale OCR locale
   * @returns Extraction result
   */
  extract(text: string, locale: IOcrLocale): IExtractionResult<IInvoiceClient> {
    const result = this.extractCustomer(text, locale);
    if (result.customer) {
      return {
        value: result.customer,
        confidence: result.confidence,
        sourceText: text,
        matchedPattern: 'customer-extraction',
      };
    }
    return this.failure();
  }

  /**
   * Extracts customer information with full details.
   * @param text Full document text
   * @param locale OCR locale
   * @param vendorName Vendor name (to avoid confusion)
   * @returns Customer extraction result
   */
  extractCustomer(
    text: string,
    locale: IOcrLocale,
    vendorName?: string,
  ): ICustomerExtractionResult {
    // Detect entity blocks
    const blocks = this.#entityZoneDetector.detectEntityBlocks(text);

    // Strategy 1: Use customer block if found
    if (blocks.customer && blocks.customer.confidence >= 0.6) {
      const customer = this.#extractFromBlock(blocks.customer, locale, vendorName);
      if (customer) {
        // Extract customer code from full text
        const customerCode = this.#entityZoneDetector.extractCustomerCode(text);

        return {
          customer: {
            ...customer,
            customerCode,
            _source: blocks.customer.source,
            _confidence: blocks.customer.confidence,
          },
          confidence: blocks.customer.confidence,
          source: blocks.customer.source,
          customerCode,
        };
      }
    }

    // Strategy 2: Look for labeled customer section directly
    const labeledResult = this.#extractLabeledCustomer(text, locale);
    if (labeledResult.customer && labeledResult.confidence >= 0.5) {
      return labeledResult;
    }

    // Strategy 3: Customer code only (minimal info)
    const customerCode = this.#entityZoneDetector.extractCustomerCode(text);
    if (customerCode) {
      return {
        customer: {
          name: null,
          billingAddress: null,
          shippingAddress: null,
          customerCode,
          ice: null,
          phone: null,
          _source: 'inferred',
          _confidence: 0.5,
        },
        confidence: 0.5,
        source: 'inferred',
        customerCode,
      };
    }

    return {
      customer: null,
      confidence: 0,
      source: null,
      customerCode: null,
    };
  }

  /**
   * Extracts customer info from an entity block.
   */
  #extractFromBlock(
    block: IEntityBlock,
    locale: IOcrLocale,
    vendorName?: string,
  ): Omit<IInvoiceClient, '_source' | '_confidence'> | null {
    const blockText = block.text;

    // Extract name (first line or labeled)
    const name = this.#extractCustomerName(blockText, locale, vendorName);

    // Extract address
    const addressResult = this.#contactExtractor.extractAddress(blockText, locale, name ?? undefined);

    // Extract phone
    const phoneResult = this.#contactExtractor.extractPhone(blockText, locale);

    // If we have nothing, return null
    if (!name && !addressResult.value && !phoneResult.value) {
      return null;
    }

    return {
      name,
      billingAddress: addressResult.value,
      shippingAddress: null, // Would need separate "Ship to:" extraction
      customerCode: null, // Extracted separately
      ice: this.#extractCustomerICE(blockText),
      phone: phoneResult.value,
      billingAddressDetails: {
        street: addressResult.street,
        streetLine2: addressResult.streetLine2,
        city: addressResult.city,
        postalCode: addressResult.postalCode,
        country: addressResult.country,
      },
    };
  }

  /**
   * Extracts customer name from text.
   */
  #extractCustomerName(
    text: string,
    locale: IOcrLocale,
    vendorName?: string,
  ): string | null {
    const lines = text.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip if it matches vendor name
      if (vendorName && trimmed.toLowerCase().includes(vendorName.toLowerCase())) {
        continue;
      }

      // Skip if it looks like an address line
      if (this.#cityLookup.looksLikeAddress(trimmed)) {
        continue;
      }

      // Skip stop lines
      if (/^(ice|i\.?f\.?|r\.?c\.?|tél|tel|code\s*client)/i.test(trimmed)) {
        continue;
      }

      // Check if it looks like a company name
      if (this.#looksLikeCompanyName(trimmed, locale)) {
        return trimmed;
      }
    }

    // Fallback: first meaningful line
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length >= 3 && firstLine.length <= 60) {
      return firstLine;
    }

    return null;
  }

  /**
   * Checks if a line looks like a company name.
   */
  #looksLikeCompanyName(line: string, locale: IOcrLocale): boolean {
    const trimmed = line.trim();

    // Must start with uppercase
    if (!/^[A-ZÀ-Ü]/.test(trimmed)) return false;

    // Reasonable length
    if (trimmed.length < 3 || trimmed.length > 80) return false;

    // Not too many numbers (addresses have numbers)
    const numbers = trimmed.match(/\d/g);
    if (numbers && numbers.length > trimmed.length * 0.3) return false;

    // Check for company indicators
    const hasCompanyIndicator =
      /(sarl|sa|sas|sasu|eurl|société|ste|ets|group|entreprise|centre|optique|optic)/i.test(trimmed);

    // Not just stop words
    const words = trimmed.toLowerCase().split(/\s+/);
    if (words.every(w => locale.stopWords.includes(w))) return false;

    // Accept if has company indicator
    if (hasCompanyIndicator) return true;

    // Accept if capitalized words (company names are often uppercase)
    if (/^[A-ZÀ-Ü\s&.-]+$/.test(trimmed) && trimmed.length >= 5) return true;

    // At least 2 words for a name
    return words.length >= 2;
  }

  /**
   * Extracts customer ICE if present (rare).
   */
  #extractCustomerICE(text: string): string | null {
    // Look for ICE but not in typical vendor position
    const match = text.match(/ice\s*(?:client)?\s*[:：]?\s*(\d{15})/i);
    return match ? match[1] : null;
  }

  /**
   * Extracts labeled customer section directly from text.
   */
  #extractLabeledCustomer(
    text: string,
    locale: IOcrLocale,
  ): ICustomerExtractionResult {
    const customerLabels = [
      // French
      { pattern: /factur[ée]\s*[àa]\s*[:：]?\s*(.+?)(?=\n{2}|\ndate|\nice|\ni\.?f|\$)/is, confidence: 0.95 },
      { pattern: /client\s*[:：]\s*(.+?)(?=\n{2}|\ndate|\nice|\$)/is, confidence: 0.90 },
      { pattern: /destinataire\s*[:：]\s*(.+?)(?=\n{2}|\ndate|\$)/is, confidence: 0.90 },
      { pattern: /livr[ée]\s*[àa]\s*[:：]?\s*(.+?)(?=\n{2}|\$)/is, confidence: 0.85 },
      // English
      { pattern: /bill(?:ed)?\s*to\s*[:：]?\s*(.+?)(?=\n{2}|\ndate|\$)/is, confidence: 0.95 },
      { pattern: /ship(?:ped)?\s*to\s*[:：]?\s*(.+?)(?=\n{2}|\$)/is, confidence: 0.85 },
    ];

    for (const { pattern, confidence } of customerLabels) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const blockText = match[1].trim();
        const customerData = this.#extractFromBlock(
          {
            text: blockText,
            lines: blockText.split('\n'),
            source: 'labeled',
            startLine: 0,
            endLine: 0,
            confidence,
          },
          locale,
        );

        if (customerData) {
          const customerCode = this.#entityZoneDetector.extractCustomerCode(text);
          return {
            customer: {
              ...customerData,
              customerCode,
              _source: 'labeled',
              _confidence: confidence,
            },
            confidence,
            source: 'labeled',
            customerCode,
          };
        }
      }
    }

    return {
      customer: null,
      confidence: 0,
      source: null,
      customerCode: null,
    };
  }
}
