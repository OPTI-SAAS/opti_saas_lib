import { BaseExtractor } from './base.extractor';
import { IExtractionResult, IOcrLocale } from '../locales';
import { PatternCache } from '../patterns/pattern-cache';
import { CityLookup } from '../patterns/city-lookup';
import { ZoneDetector } from '../detection/zone-detector';

/**
 * Contact information (simple).
 */
export interface IContactInfo {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

/**
 * Contact information with structured address.
 */
export interface IContactInfoDetailed extends IContactInfo {
  /** Structured address components */
  addressDetails: {
    street: string | null;
    streetLine2: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
  };
  /** Phone country code */
  phoneCountry: string | null;
}

/**
 * Phone extraction result with country info.
 */
export interface IPhoneResult extends IExtractionResult<string> {
  /** Country code (MA, FR, etc.) */
  country: string | null;

  /** Whether the phone is valid for its country */
  isValid: boolean;
}

/**
 * Address extraction result with components.
 */
export interface IAddressResult extends IExtractionResult<string> {
  /** Street (numbered address like "123 Boulevard Mohammed V") */
  street: string | null;

  /** Street line 2 (location/complement like "GALERIE MARCHANDE MARJANE") */
  streetLine2: string | null;

  /** City */
  city: string | null;

  /** Country */
  country: string | null;

  /** Postal code */
  postalCode: string | null;
}

/**
 * Extracts contact information from text using multi-strategy approach.
 * Supports Morocco, France, and international formats.
 */
export class ContactExtractor extends BaseExtractor<string> {
  readonly #patterns = PatternCache.getInstance();
  readonly #cityLookup = CityLookup.getInstance();
  readonly #zoneDetector = new ZoneDetector();

  /**
   * Extracts supplier/company name from text.
   * @param text Source text
   * @param locale Locale for name patterns
   * @returns Extraction result
   */
  extract(text: string, locale: IOcrLocale): IExtractionResult<string> {
    return this.extractName(text, locale);
  }

  /**
   * Extracts company/supplier name.
   */
  extractName(text: string, locale: IOcrLocale): IExtractionResult<string> {
    const result = this.tryPatterns(text, locale.supplier.name);
    if (result) {
      const captured = result.match[1] ?? result.match[0];
      return this.success(
        captured.trim(),
        this.calculateConfidence(result.match, text),
        result.match[0],
        result.pattern,
      );
    }

    const lines = text.split('\n').filter((l) => l.trim().length > 3);
    const companyLine = lines.find((line) => this.#looksLikeCompanyName(line, locale));

    if (companyLine) {
      return {
        value: companyLine.trim(),
        confidence: 0.5,
        sourceText: companyLine,
        matchedPattern: 'fallback-first-line',
      };
    }

    return this.failure();
  }

  /**
   * Extracts address using 5 strategies in cascade.
   * 1. Labeled address (explicit "Adresse:" label)
   * 2. Positional (after supplier name, before identifiers)
   * 3. By city detection
   * 4. From document lines (address appended to facture/BL number)
   * 5. By street keywords
   */
  extractAddress(text: string, locale: IOcrLocale, supplierName?: string): IAddressResult {
    // Get header zone only (before products)
    const headerText = this.#zoneDetector.extractHeaderZone(text);

    // Strategy 1: Labeled address
    const labeled = this.#extractLabeledAddress(headerText, locale);
    if (labeled.confidence >= 0.7) {
      return labeled;
    }

    // Strategy 2: Positional (after supplier name)
    if (supplierName) {
      const positional = this.#extractPositionalAddress(headerText, supplierName);
      if (positional.confidence >= 0.5) {
        return positional;
      }
    }

    // Strategy 3: By city detection
    const byCity = this.#extractAddressByCity(headerText);
    if (byCity.confidence >= 0.5) {
      return byCity;
    }

    // Strategy 4: From document lines (address appended to facture/BL)
    const fromDocLine = this.#extractAddressFromDocumentLines(headerText);
    if (fromDocLine.confidence >= 0.5) {
      return fromDocLine;
    }

    // Strategy 5: By street keywords
    const byKeywords = this.#extractAddressByKeywords(headerText);
    if (byKeywords.confidence >= 0.4) {
      return byKeywords;
    }

    return {
      value: null,
      confidence: 0,
      sourceText: null,
      matchedPattern: null,
      street: null,
      streetLine2: null,
      city: null,
      country: null,
      postalCode: null,
    };
  }

  /**
   * Extracts phone number using multi-country patterns.
   * Validates and formats based on detected country.
   */
  extractPhone(text: string, locale: IOcrLocale, preferredCountry?: string): IPhoneResult {
    // Get header zone only (before products) to avoid matching product data
    const headerText = this.#zoneDetector.extractHeaderZone(text);

    // Try Morocco patterns first (if preferred or default)
    const country = preferredCountry || this.#detectCountryFromText(headerText) || 'MA';

    // Strategy 1: Labeled phone with country-specific patterns
    const labeled = this.#extractLabeledPhone(headerText, country);
    if (labeled.isValid && labeled.confidence >= 0.8) {
      return labeled;
    }

    // Strategy 2: Locale patterns
    const localeResult = this.tryPatterns(headerText, locale.supplier.phone);
    if (localeResult) {
      const phone = this.#cleanPhone(localeResult.match[1] ?? localeResult.match[0]);
      const validated = this.#validateAndFormatPhone(phone, country);
      if (validated.isValid) {
        return {
          ...validated,
          confidence: this.calculateConfidence(localeResult.match, headerText),
          sourceText: localeResult.match[0],
          matchedPattern: localeResult.pattern.toString(),
        };
      }
    }

    // Strategy 3: International format
    const intlResult = this.#extractInternationalPhone(headerText);
    if (intlResult.isValid) {
      return intlResult;
    }

    // Strategy 4: Generic fallback (last resort, lower confidence)
    const generic = this.#extractGenericPhone(headerText, country);
    if (generic.isValid) {
      return generic;
    }

    return {
      value: null,
      confidence: 0,
      sourceText: null,
      matchedPattern: null,
      country: null,
      isValid: false,
    };
  }

  /**
   * Extracts email from text.
   */
  extractEmail(text: string): IExtractionResult<string> {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);

    if (match) {
      return this.success(
        match[0].toLowerCase(),
        this.calculateConfidence(match, text),
        match[0],
        emailPattern,
      );
    }

    return this.failure();
  }

  /**
   * Extracts all contact information (simple format).
   * @param text Source text
   * @param locale OCR locale
   * @returns Simple contact info with address as string
   */
  extractAll(text: string, locale: IOcrLocale): IContactInfo {
    const detailed = this.extractAllDetailed(text, locale);
    return {
      name: detailed.name,
      address: detailed.address,
      phone: detailed.phone,
      email: detailed.email,
    };
  }

  /**
   * Extracts all contact information with structured address.
   * @param text Source text
   * @param locale OCR locale
   * @returns Detailed contact info with address components
   */
  extractAllDetailed(text: string, locale: IOcrLocale): IContactInfoDetailed {
    const name = this.extractName(text, locale).value;
    const addressResult = this.extractAddress(text, locale, name ?? undefined);
    const phoneResult = this.extractPhone(text, locale);

    return {
      name,
      address: addressResult.value,
      phone: phoneResult.value,
      email: this.extractEmail(text).value,
      addressDetails: {
        street: addressResult.street,
        streetLine2: addressResult.streetLine2,
        city: addressResult.city,
        country: addressResult.country,
        postalCode: addressResult.postalCode,
      },
      phoneCountry: phoneResult.country,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Address extraction strategies
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Strategy 1: Extract address with explicit label.
   */
  #extractLabeledAddress(text: string, locale: IOcrLocale): IAddressResult {
    const patterns = [
      this.#patterns.ADDRESS_LABELED,
      this.#patterns.ADDRESS_SIEGE,
      this.#patterns.ADDRESS_DOMICILIE,
      ...locale.supplier.address,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const address = this.#cleanAddress(match[1]);
        const components = this.#parseAddressComponents(address);

        return {
          value: address,
          confidence: 0.85,
          sourceText: match[0],
          matchedPattern: pattern.toString(),
          street: components.street,
          streetLine2: components.streetLine2,
          city: components.city,
          country: components.country,
          postalCode: components.postalCode,
        };
      }
    }

    return this.#emptyAddressResult();
  }

  /**
   * Strategy 2: Extract address by position (after supplier name).
   */
  #extractPositionalAddress(text: string, supplierName: string): IAddressResult {
    const lines = text.split('\n');
    const nameIndex = lines.findIndex(l =>
      l.toLowerCase().includes(supplierName.toLowerCase()),
    );

    if (nameIndex === -1) {
      return this.#emptyAddressResult();
    }

    const collectedLines: string[] = [];

    // Look at lines after supplier name
    for (let i = nameIndex + 1; i < Math.min(nameIndex + 6, lines.length); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Stop at identifiers or other sections
      if (this.#cityLookup.isStopLine(line)) break;

      // Check if line looks like address
      if (this.#cityLookup.looksLikeAddress(line) || this.#looksLikeStreetLine(line)) {
        collectedLines.push(line);
      }
    }

    if (collectedLines.length > 0) {
      // Separate city line from street/location lines
      const cityLineIndex = collectedLines.findIndex(line => this.#cityLookup.findCity(line));
      const streetLocationLines = cityLineIndex >= 0
        ? collectedLines.slice(0, cityLineIndex)
        : collectedLines.slice(0, -1);
      const cityLine = cityLineIndex >= 0
        ? collectedLines[cityLineIndex]
        : collectedLines[collectedLines.length - 1];

      // Dispatch street/location lines
      const { street, streetLine2 } = this.#dispatchAddressLines(streetLocationLines);

      const fullAddress = collectedLines.join(', ');
      const cityInfo = this.#cityLookup.findCity(cityLine);
      const postalCode = this.#extractPostalCode(cityLine);

      return {
        value: fullAddress,
        confidence: 0.6 + collectedLines.length * 0.1,
        sourceText: collectedLines.join('\n'),
        matchedPattern: 'positional',
        street: street ?? (streetLocationLines.length > 0 ? streetLocationLines[0] : null),
        streetLine2,
        city: cityInfo?.city || null,
        country: this.#getCountryName(cityInfo?.country || null),
        postalCode,
      };
    }

    return this.#emptyAddressResult();
  }

  /**
   * Strategy 3: Extract address by city detection.
   * Looks for city names and captures lines above as street/location address.
   * Separates numbered streets from locations (galerie, zone industrielle, etc.).
   */
  #extractAddressByCity(text: string): IAddressResult {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip lines that are document identifiers (facture, BL, etc.)
      if (this.#cityLookup.isStopLine(line)) continue;

      // Skip lines that look like document lines even if they contain a city
      if (!this.#cityLookup.looksLikeAddress(line)) continue;

      const cityInfo = this.#cityLookup.findCity(line);
      if (cityInfo) {
        const addressLines: string[] = [];
        const collectedLines: string[] = [];

        // Look for street/location in lines above (up to 4 lines for multi-line addresses)
        for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
          const prevLine = lines[j].trim();
          if (!prevLine) continue;

          // Stop if we hit a stop line (ICE, Tel, etc.) that is NOT a document line with address
          if (this.#cityLookup.isStopLine(prevLine)) {
            // Try to extract address part from document lines (FACTURE N° : 123 GALERIE...)
            const addressPart = this.#extractAddressPartFromDocumentLine(prevLine);
            if (addressPart) {
              collectedLines.unshift(addressPart);
            }
            break;
          }

          // Check if line could be a street/address (more permissive)
          if (this.#looksLikeStreetLine(prevLine)) {
            collectedLines.unshift(prevLine);
          } else {
            // Try to extract address part from document lines before giving up
            const addressPart = this.#extractAddressPartFromDocumentLine(prevLine);
            if (addressPart) {
              collectedLines.unshift(addressPart);
            }
            break;
          }
        }

        // Dispatch collected lines into street and streetLine2
        const { street, streetLine2 } = this.#dispatchAddressLines(collectedLines);

        if (street) {
          addressLines.push(street);
        }
        if (streetLine2) {
          addressLines.push(streetLine2);
        }

        // Current line (city)
        addressLines.push(line);

        const fullAddress = addressLines.join(', ');
        const postalCode = this.#extractPostalCode(line);

        return {
          value: fullAddress,
          confidence: cityInfo.confidence,
          sourceText: addressLines.join('\n'),
          matchedPattern: 'city-detection',
          street,
          streetLine2,
          city: cityInfo.city,
          country: this.#getCountryName(cityInfo.country),
          postalCode,
        };
      }
    }

    return this.#emptyAddressResult();
  }

  /**
   * Dispatches collected address lines into street and streetLine2.
   * Logic:
   * - If we have a numbered street, it goes to `street`, location goes to `streetLine2`
   * - If we only have a location (no numbered street), it goes to `street`
   * - If we have multiple lines without numbered street, they're joined in `street`
   * @param lines Collected address lines (in order, top to bottom)
   * @returns Object with street and streetLine2
   */
  #dispatchAddressLines(lines: string[]): { street: string | null; streetLine2: string | null } {
    if (lines.length === 0) {
      return { street: null, streetLine2: null };
    }

    let numberedStreet: string | null = null;
    const locations: string[] = [];
    const otherLines: string[] = [];

    for (const line of lines) {
      if (this.#isNumberedStreet(line)) {
        // Numbered street takes priority
        numberedStreet = line;
      } else if (this.#isLocation(line)) {
        locations.push(line);
      } else {
        otherLines.push(line);
      }
    }

    // Case 1: We have a numbered street
    if (numberedStreet) {
      // Location + other lines go to streetLine2
      const complement = [...locations, ...otherLines].filter(Boolean);
      return {
        street: numberedStreet,
        streetLine2: complement.length > 0 ? complement.join(', ') : null,
      };
    }

    // Case 2: We have location(s) but no numbered street
    if (locations.length > 0) {
      // First location goes to street, rest + others to streetLine2
      const [firstLocation, ...restLocations] = locations;
      const complement = [...restLocations, ...otherLines].filter(Boolean);
      return {
        street: firstLocation,
        streetLine2: complement.length > 0 ? complement.join(', ') : null,
      };
    }

    // Case 3: Only other lines (no numbered street, no location)
    if (otherLines.length > 0) {
      const [first, ...rest] = otherLines;
      return {
        street: first,
        streetLine2: rest.length > 0 ? rest.join(', ') : null,
      };
    }

    return { street: null, streetLine2: null };
  }

  /**
   * Checks if a line is a numbered street address (e.g., "123 Boulevard Mohammed V").
   * @param line Line to check
   * @returns true if line starts with a number followed by street keywords
   */
  #isNumberedStreet(line: string): boolean {
    const trimmed = line.trim();
    // Starts with number + street keyword OR "N° X" pattern with street
    return (
      this.#patterns.NUMBERED_STREET.test(trimmed) ||
      /^\d+[\s,]/.test(trimmed) && /rue|avenue|av\.|boulevard|bd|place|chemin|route|allée|impasse|voie/i.test(trimmed)
    );
  }

  /**
   * Checks if a line is a location/emplacement (e.g., "GALERIE MARCHANDE MARJANE").
   * @param line Line to check
   * @returns true if line matches location patterns
   */
  #isLocation(line: string): boolean {
    const trimmed = line.trim();
    // Check both LOCATION_KEYWORDS (start) and LOCATION_FULL (complete pattern)
    return (
      this.#patterns.LOCATION_KEYWORDS.test(trimmed) ||
      this.#patterns.LOCATION_FULL.test(trimmed)
    );
  }

  /**
   * Checks if a line looks like a street/location line.
   * More permissive than looksLikeAddress - accepts lines that could be street names.
   */
  #looksLikeStreetLine(line: string): boolean {
    const trimmed = line.trim();
    const lowerLine = trimmed.toLowerCase();

    // Too short or too long
    if (trimmed.length < 3 || trimmed.length > 80) return false;

    // Skip document lines
    if (this.#cityLookup.isStopLine(line)) return false;

    // Skip if it's a document identifier line
    if (/facture|n[°o]\s*:|bl\s*n|bc\s*n|devis|avoir|proforma/i.test(lowerLine)) return false;

    // Skip lines that are clearly not addresses
    if (/^(date|ice|i\.?f|r\.?c|tél|tel|fax|email|client|code)/i.test(lowerLine)) return false;

    // Skip lines that are just numbers (amounts, dates)
    if (/^[\d\s.,\/\-]+$/.test(trimmed)) return false;

    // Accept if it has street keywords
    if (this.#cityLookup.looksLikeAddress(line)) return true;

    // Accept if it matches location keywords (ZAC, Zone Industrielle, Galerie, etc.)
    if (this.#patterns.LOCATION_KEYWORDS.test(trimmed)) return true;

    // Accept if it looks like a location name (starts with caps, has words)
    // Examples: "GALERIE MARCHANDE MARJANE", "Zone Industrielle", "Lot 45"
    if (/^[A-ZÀ-Ü][A-Za-zÀ-ü\s\d,.\-°']{2,}$/.test(trimmed)) {
      // Must have at least 2 words or be a known pattern
      const words = trimmed.split(/\s+/);
      if (words.length >= 2) return true;
    }

    // Accept patterns like "123 Some Street" or "Lot 45"
    if (/^\d+[\s,]/.test(trimmed)) return true;

    return false;
  }

  /**
   * Strategy 4: Extract address from document lines (facture, BL).
   * Handles cases where address is appended to document number, e.g.:
   * "FACTURE N° : 20250388 GALERIE MARCHANDE MARJANE"
   */
  #extractAddressFromDocumentLines(text: string): IAddressResult {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Look for document lines that might contain address
      const addressPart = this.#extractAddressPartFromDocumentLine(line);
      if (addressPart) {
        // Check next line for city
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const cityInfo = this.#cityLookup.findCity(nextLine) || this.#cityLookup.findCity(addressPart);

        if (cityInfo) {
          const addressLines: string[] = [addressPart];
          if (nextLine && this.#cityLookup.looksLikeAddress(nextLine)) {
            addressLines.push(nextLine);
          }

          const { street, streetLine2 } = this.#dispatchAddressLines([addressPart]);
          const fullAddress = addressLines.join(', ');
          const postalCode = this.#extractPostalCode(nextLine || addressPart);

          return {
            value: fullAddress,
            confidence: 0.7,
            sourceText: addressLines.join('\n'),
            matchedPattern: 'document-line-extraction',
            street,
            streetLine2,
            city: cityInfo.city,
            country: this.#getCountryName(cityInfo.country),
            postalCode,
          };
        }
      }
    }

    return this.#emptyAddressResult();
  }

  /**
   * Extracts address part from a document line (facture, BL, etc.).
   * Example: "FACTURE N° : 20250388 GALERIE MARCHANDE MARJANE" -> "GALERIE MARCHANDE MARJANE"
   * @param line The line to analyze
   * @returns The address part or null if not found
   */
  #extractAddressPartFromDocumentLine(line: string): string | null {
    // Document patterns with numbers
    const documentPatterns = [
      // FACTURE N° : 20250388 GALERIE...
      /(?:facture|devis|avoir|proforma)\s*(?:n[°o]?\s*)?:?\s*\d+\s+(.+)/i,
      // BL N° 12345 GALERIE...
      /(?:bl|bc|br)\s*(?:n[°o]?\s*)?:?\s*\d+\s+(.+)/i,
      // N° : 20250388 GALERIE...
      /n[°o]\s*:?\s*\d+\s+(.+)/i,
    ];

    for (const pattern of documentPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const potentialAddress = match[1].trim();

        // Verify that the extracted part looks like an address/location
        if (potentialAddress.length >= 5 &&
            (this.#isLocation(potentialAddress) ||
             this.#cityLookup.looksLikeAddress(potentialAddress) ||
             this.#looksLikeStreetLine(potentialAddress))) {
          return potentialAddress;
        }
      }
    }

    return null;
  }

  /**
   * Strategy 5: Extract address by street keywords.
   */
  #extractAddressByKeywords(text: string): IAddressResult {
    const match = text.match(this.#patterns.STREET_KEYWORDS);

    if (match) {
      const address = match[0].trim();

      // Validate that the matched address is not a document line
      if (!this.#cityLookup.looksLikeAddress(address)) {
        return this.#emptyAddressResult();
      }

      const components = this.#parseAddressComponents(address);

      return {
        value: address,
        confidence: 0.5,
        sourceText: match[0],
        matchedPattern: 'street-keywords',
        street: components.street,
        streetLine2: components.streetLine2,
        city: components.city,
        country: components.country,
        postalCode: components.postalCode,
      };
    }

    return this.#emptyAddressResult();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Phone extraction strategies
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Extract phone with label, country-specific.
   */
  #extractLabeledPhone(text: string, country: string): IPhoneResult {
    const patterns = this.#getPhonePatternsForCountry(country);

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const phone = this.#cleanPhone(match[1] ?? match[0]);
        const validated = this.#validateAndFormatPhone(phone, country);

        if (validated.isValid) {
          return {
            ...validated,
            confidence: 0.9,
            sourceText: match[0],
            matchedPattern: pattern.toString(),
          };
        }
      }
    }

    return this.#emptyPhoneResult();
  }

  /**
   * Extract international format phone.
   */
  #extractInternationalPhone(text: string): IPhoneResult {
    const patterns = [this.#patterns.PHONE_INTL_E164, this.#patterns.PHONE_INTL_LABELED];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const phone = this.#cleanPhone(match[1] ?? match[0]);
        const country = this.#detectCountryFromPhone(phone);
        const validated = this.#validateAndFormatPhone(phone, country);

        if (validated.isValid) {
          return {
            ...validated,
            confidence: 0.75,
            sourceText: match[0],
            matchedPattern: pattern.toString(),
          };
        }
      }
    }

    return this.#emptyPhoneResult();
  }

  /**
   * Extract generic phone (fallback).
   */
  #extractGenericPhone(text: string, country: string): IPhoneResult {
    // Look for any sequence of 10+ digits with separators
    const genericPattern = /(\d[\d\s.\-()]{8,18}\d)/g;
    let match;

    while ((match = genericPattern.exec(text)) !== null) {
      const phone = this.#cleanPhone(match[1]);
      const validated = this.#validateAndFormatPhone(phone, country);

      // Only accept if it validates for the country
      if (validated.isValid) {
        return {
          ...validated,
          confidence: 0.5,
          sourceText: match[0],
          matchedPattern: 'generic',
        };
      }
    }

    return this.#emptyPhoneResult();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  #looksLikeCompanyName(line: string, locale: IOcrLocale): boolean {
    const trimmed = line.trim();

    if (!/^[A-ZÀ-Ü]/.test(trimmed)) return false;
    if (trimmed.length < 3 || trimmed.length > 60) return false;

    const numbers = trimmed.match(/\d/g);
    if (numbers && numbers.length > trimmed.length * 0.3) return false;

    const words = trimmed.toLowerCase().split(/\s+/);
    if (words.every((w) => locale.stopWords.includes(w))) return false;

    if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(trimmed)) return false;
    if (/^[\d\s.,]+$/.test(trimmed)) return false;

    return true;
  }

  #cleanAddress(address: string): string {
    return address
      .replace(/\s+/g, ' ')
      .replace(/^[:\s]+/, '')
      .replace(/[:\s]+$/, '')
      .trim();
  }

  #cleanPhone(phone: string): string {
    return phone.replace(/[\s.\-()]/g, '');
  }

  #parseAddressComponents(address: string): {
    street: string | null;
    streetLine2: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
  } {
    const cityInfo = this.#cityLookup.findCity(address);
    const countryInfo = this.#cityLookup.findCountry(address);
    const postalCode = this.#extractPostalCode(address);

    // Split address into lines/parts for dispatch
    const parts = address.split(/[,\n]/).map(p => p.trim()).filter(Boolean);

    // Remove city and country parts from the address parts
    const cityName = cityInfo?.city?.toLowerCase();
    const countryName = (countryInfo?.country || this.#getCountryName(cityInfo?.country || null))?.toLowerCase();

    const addressParts = parts.filter(part => {
      const lowerPart = part.toLowerCase();
      // Exclude parts that are just city or country
      if (cityName && lowerPart.includes(cityName)) return false;
      if (countryName && lowerPart.includes(countryName)) return false;
      // Exclude postal code only parts
      if (/^\d{4,5}$/.test(part.trim())) return false;
      return true;
    });

    // Dispatch remaining parts
    const { street, streetLine2 } = this.#dispatchAddressLines(addressParts);

    return {
      street,
      streetLine2,
      city: cityInfo?.city || null,
      country: countryInfo?.country || this.#getCountryName(cityInfo?.country || null),
      postalCode,
    };
  }

  #extractPostalCode(text: string): string | null {
    const match = text.match(this.#patterns.POSTAL_CODE);
    return match ? match[1] : null;
  }

  #getCountryName(code: string | null): string | null {
    if (!code) return null;
    const names: Record<string, string> = {
      MA: 'Maroc',
      FR: 'France',
      BE: 'Belgique',
      ES: 'Espagne',
      CH: 'Suisse',
      DE: 'Allemagne',
      IT: 'Italie',
    };
    return names[code] || code;
  }

  #getPhonePatternsForCountry(country: string): RegExp[] {
    switch (country) {
      case 'MA':
        return [
          this.#patterns.PHONE_MA_LABELED,
          this.#patterns.PHONE_MA_INTL,
          this.#patterns.PHONE_MA_DOMESTIC_SEP,
          this.#patterns.PHONE_MA_DOMESTIC_COMPACT,
        ];
      case 'FR':
        return [
          this.#patterns.PHONE_FR_LABELED,
          this.#patterns.PHONE_FR_INTL,
          this.#patterns.PHONE_FR_DOMESTIC_SEP,
          this.#patterns.PHONE_FR_DOMESTIC_COMPACT,
        ];
      default:
        return [this.#patterns.PHONE_INTL_E164, this.#patterns.PHONE_INTL_LABELED];
    }
  }

  #detectCountryFromText(text: string): string | null {
    const countryInfo = this.#cityLookup.findCountry(text);
    if (countryInfo) return countryInfo.countryCode;

    const cityInfo = this.#cityLookup.findCity(text);
    return cityInfo?.country || null;
  }

  #detectCountryFromPhone(phone: string): string {
    if (phone.startsWith('+212') || phone.startsWith('212')) return 'MA';
    if (phone.startsWith('+33') || phone.startsWith('33')) return 'FR';
    if (phone.startsWith('+32') || phone.startsWith('32')) return 'BE';
    if (phone.startsWith('+34') || phone.startsWith('34')) return 'ES';
    if (phone.startsWith('0')) {
      // Domestic format - check prefix
      if (/^0[25678]/.test(phone)) return 'MA';
      if (/^0[1-9]/.test(phone)) return 'FR';
    }
    return 'INTL';
  }

  #validateAndFormatPhone(
    phone: string,
    country: string,
  ): { value: string | null; isValid: boolean; country: string } {
    const cleaned = phone.replace(/[\s.\-()]/g, '');

    switch (country) {
      case 'MA': {
        // Normalize +212 to 0
        const normalized = cleaned.replace(/^\+212/, '0').replace(/^212/, '0');
        if (this.#patterns.PHONE_VALID_MA.test(normalized)) {
          // Format: 0X XX XX XX XX
          const formatted = normalized.replace(
            /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            '$1 $2 $3 $4 $5',
          );
          return { value: formatted, isValid: true, country: 'MA' };
        }
        return { value: null, isValid: false, country: 'MA' };
      }

      case 'FR': {
        const normalized = cleaned.replace(/^\+33/, '0').replace(/^33/, '0');
        if (this.#patterns.PHONE_VALID_FR.test(normalized)) {
          const formatted = normalized.replace(
            /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            '$1 $2 $3 $4 $5',
          );
          return { value: formatted, isValid: true, country: 'FR' };
        }
        return { value: null, isValid: false, country: 'FR' };
      }

      default: {
        if (this.#patterns.PHONE_VALID_INTL.test(cleaned)) {
          return { value: cleaned, isValid: true, country: 'INTL' };
        }
        return { value: null, isValid: false, country: 'INTL' };
      }
    }
  }

  #emptyAddressResult(): IAddressResult {
    return {
      value: null,
      confidence: 0,
      sourceText: null,
      matchedPattern: null,
      street: null,
      streetLine2: null,
      city: null,
      country: null,
      postalCode: null,
    };
  }

  #emptyPhoneResult(): IPhoneResult {
    return {
      value: null,
      confidence: 0,
      sourceText: null,
      matchedPattern: null,
      country: null,
      isValid: false,
    };
  }
}
