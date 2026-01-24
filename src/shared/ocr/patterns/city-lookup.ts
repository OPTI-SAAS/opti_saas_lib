/**
 * City lookup service with O(1) search using Set.
 * Supports Morocco, France, and other European countries.
 */
export class CityLookup {
  private static instance: CityLookup | null = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // CITY SETS (O(1) lookup)
  // ═══════════════════════════════════════════════════════════════════════════

  private readonly moroccanCities = new Set([
    // Major cities
    'casablanca', 'rabat', 'marrakech', 'fes', 'fès', 'tanger', 'tangier',
    'agadir', 'meknes', 'meknès', 'oujda', 'kenitra', 'kénitra', 'tetouan',
    'tétouan', 'safi', 'mohammedia', 'el jadida', 'beni mellal', 'béni mellal',
    'nador', 'taza', 'settat', 'berrechid', 'khemisset', 'khémisset',
    'khouribga', 'sale', 'salé', 'temara', 'témara',
    // Secondary cities
    'inezgane', 'ouarzazate', 'essaouira', 'laayoune', 'laâyoune', 'dakhla',
    'errachidia', 'guelmim', 'taroudant', 'larache', 'ksar el kebir',
    'fnideq', 'berkane', 'taourirt', 'fquih ben salah', 'youssoufia',
    'sidi kacem', 'sidi slimane', 'midelt', 'azrou', 'ifrane',
    // Industrial zones
    'ain sebaa', 'sidi maarouf', 'bouskoura', 'nouaceur', 'had soualem',
  ]);

  private readonly frenchCities = new Set([
    // Major cities
    'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg',
    'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'le havre',
    'saint-étienne', 'saint-etienne', 'toulon', 'grenoble', 'dijon', 'angers',
    'nîmes', 'nimes', 'villeurbanne', 'le mans', 'aix-en-provence',
    'clermont-ferrand', 'brest', 'tours', 'limoges', 'amiens', 'perpignan',
    'metz', 'besançon', 'besancon', 'orléans', 'orleans', 'mulhouse', 'rouen',
    'caen', 'nancy', 'argenteuil', 'montreuil', 'saint-denis',
  ]);

  private readonly belgianCities = new Set([
    'bruxelles', 'brussels', 'anvers', 'antwerp', 'gand', 'ghent', 'charleroi',
    'liège', 'liege', 'bruges', 'brugge', 'namur', 'leuven', 'louvain', 'mons',
  ]);

  private readonly spanishCities = new Set([
    'madrid', 'barcelona', 'valencia', 'sevilla', 'seville', 'zaragoza',
    'málaga', 'malaga', 'murcia', 'palma', 'bilbao', 'alicante', 'córdoba',
    'cordoba', 'valladolid', 'vigo', 'gijón', 'gijon',
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNTRY KEYWORDS
  // ═══════════════════════════════════════════════════════════════════════════

  private readonly countryKeywords = new Map<string, string>([
    ['maroc', 'MA'], ['morocco', 'MA'],
    ['france', 'FR'],
    ['belgique', 'BE'], ['belgium', 'BE'],
    ['espagne', 'ES'], ['spain', 'ES'], ['españa', 'ES'],
    ['suisse', 'CH'], ['switzerland', 'CH'], ['schweiz', 'CH'],
    ['allemagne', 'DE'], ['germany', 'DE'], ['deutschland', 'DE'],
    ['italie', 'IT'], ['italy', 'IT'], ['italia', 'IT'],
    ['pays-bas', 'NL'], ['netherlands', 'NL'], ['nederland', 'NL'],
    ['portugal', 'PT'],
    ['royaume-uni', 'GB'], ['united kingdom', 'GB'], ['uk', 'GB'],
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDRESS KEYWORDS
  // ═══════════════════════════════════════════════════════════════════════════

  private readonly streetKeywords = new Set([
    // French
    'rue', 'avenue', 'av.', 'av', 'boulevard', 'bd', 'blvd', 'allée', 'impasse',
    'passage', 'place', 'chemin', 'route', 'voie',
    // Morocco specific
    'lot', 'lotissement', 'résidence', 'immeuble', 'imm', 'quartier', 'zone',
    'zone industrielle', 'zi', 'galerie', 'centre', 'angle', 'n°', 'numéro',
    // Spanish
    'calle', 'avenida', 'paseo', 'plaza',
  ]);

  /**
   * Gets the singleton instance.
   */
  static getInstance(): CityLookup {
    if (!CityLookup.instance) {
      CityLookup.instance = new CityLookup();
    }
    return CityLookup.instance;
  }

  private constructor() {
    // Sets are already initialized
  }

  /**
   * Finds a city in the text and returns its country code.
   * O(words in line) complexity instead of O(words × cities).
   * @param text Text to search
   * @returns City info or null
   */
  findCity(text: string): { city: string; country: string; confidence: number } | null {
    const lowerText = text.toLowerCase();

    // Split into words and multi-word tokens
    const tokens = this.extractTokens(lowerText);

    for (const token of tokens) {
      if (this.moroccanCities.has(token)) {
        return { city: this.capitalize(token), country: 'MA', confidence: 0.9 };
      }
      if (this.frenchCities.has(token)) {
        return { city: this.capitalize(token), country: 'FR', confidence: 0.9 };
      }
      if (this.belgianCities.has(token)) {
        return { city: this.capitalize(token), country: 'BE', confidence: 0.85 };
      }
      if (this.spanishCities.has(token)) {
        return { city: this.capitalize(token), country: 'ES', confidence: 0.85 };
      }
    }

    return null;
  }

  /**
   * Detects country from text.
   * @param text Text to search
   * @returns Country code or null
   */
  findCountry(text: string): { country: string; countryCode: string; confidence: number } | null {
    const lowerText = text.toLowerCase();

    for (const [keyword, code] of this.countryKeywords) {
      if (lowerText.includes(keyword)) {
        return {
          country: this.capitalize(keyword),
          countryCode: code,
          confidence: 0.95,
        };
      }
    }

    return null;
  }

  /**
   * Checks if a line looks like an address.
   * @param line Line to check
   * @returns true if the line contains address indicators
   */
  looksLikeAddress(line: string): boolean {
    const lowerLine = line.toLowerCase();
    const trimmed = line.trim();

    // Too short or too long
    if (trimmed.length < 5 || trimmed.length > 100) return false;

    // CRITICAL: Exclude lines with document identifiers even if they contain city names
    if (this.isDocumentLine(lowerLine)) return false;

    // Contains a city
    if (this.findCity(line)) return true;

    // Contains a country
    if (this.findCountry(line)) return true;

    // Contains street keyword
    for (const keyword of this.streetKeywords) {
      if (lowerLine.includes(keyword)) return true;
    }

    // Contains postal code (5 digits)
    if (/\b\d{5}\b/.test(trimmed)) return true;

    // Pattern "CITY - COUNTRY" or "CITY, COUNTRY"
    if (/[A-ZÀ-Ü]{3,}\s*[-,]\s*[A-ZÀ-Ü]{3,}/i.test(trimmed)) return true;

    return false;
  }

  /**
   * Checks if a line is a document identifier line (facture, BL, etc.).
   * These should never be treated as addresses even if they contain city names.
   * @param lowerLine Lowercase line to check
   * @returns true if line is a document line
   */
  private isDocumentLine(lowerLine: string): boolean {
    // Invoice/document patterns - must not be treated as addresses
    const documentPatterns = [
      // Facture patterns
      /facture\s*(n[°o]?|pro|avoir)?/i,
      // Document number patterns (N°, No, N :) with 4+ digits
      /\bn[°o]?\s*:?\s*\d{4,}/i,
      // BL/BC/BR patterns
      /\b(bl|bc|br)\s*(n[°o]?)?/i,
      /bon\s*(de\s*)?(livraison|commande|réception)/i,
      // Other document types
      /devis\s*(n[°o]?)?/i,
      /avoir\s*(n[°o]?)?/i,
      /proforma/i,
      // Pattern "WORD N° : NUMBERS" (common invoice format)
      /\w+\s+n[°o]?\s*:?\s*\d{4,}/i,
    ];

    return documentPatterns.some(p => p.test(lowerLine));
  }

  /**
   * Checks if a line is a stop line (should not be part of address).
   * @param line Line to check
   * @returns true if line should stop address extraction
   */
  isStopLine(line: string): boolean {
    const lowerLine = line.toLowerCase().trim();

    // Identifiers (Morocco)
    if (/^(ice|i\.?f\.?|r\.?c\.?|cnss|patente|tp)\s*[.:]/i.test(lowerLine)) return true;

    // Identifiers (France/Europe)
    if (/^(siret|siren|tva\s*intra|n°?\s*tva)\s*[.:]/i.test(lowerLine)) return true;
    if (/siret\s*[.:]\s*\d/i.test(lowerLine)) return true;

    // Contact info
    if (/^(tél|tel|phone|fax|email|@|gsm|mobile)\s*[.:]/i.test(lowerLine)) return true;

    // Document info (facture, BL, devis, etc.)
    if (/^(code\s*client|n°?\s*facture|date|bl\s*n)/i.test(lowerLine)) return true;
    if (/facture\s*(n[°o]?|pro|avoir)?/i.test(lowerLine)) return true;
    if (/^(bl|bc|br|devis|avoir|proforma)\s*(n[°o]?)?/i.test(lowerLine)) return true;
    if (/bon\s*(de\s*)?(livraison|commande)/i.test(lowerLine)) return true;

    // EAN barcode (start of products)
    if (/^\d{8,14}\s/.test(lowerLine)) return true;

    // Date
    if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(lowerLine)) return true;

    return false;
  }

  /**
   * Gets all cities for a specific country.
   * @param countryCode Country code (MA, FR, BE, ES)
   * @returns Array of cities
   */
  getCitiesByCountry(countryCode: string): string[] {
    switch (countryCode.toUpperCase()) {
      case 'MA':
        return Array.from(this.moroccanCities);
      case 'FR':
        return Array.from(this.frenchCities);
      case 'BE':
        return Array.from(this.belgianCities);
      case 'ES':
        return Array.from(this.spanishCities);
      default:
        return [];
    }
  }

  /**
   * Extracts tokens from text (single words and common multi-word city names).
   */
  private extractTokens(text: string): string[] {
    const tokens: string[] = [];

    // Multi-word city names first
    const multiWordCities = [
      'el jadida', 'beni mellal', 'béni mellal', 'ksar el kebir',
      'fquih ben salah', 'sidi kacem', 'sidi slimane', 'sidi maarouf',
      'ain sebaa', 'had soualem', 'saint-étienne', 'saint-etienne',
      'le havre', 'le mans', 'aix-en-provence', 'clermont-ferrand',
      'saint-denis',
    ];

    for (const city of multiWordCities) {
      if (text.includes(city)) {
        tokens.push(city);
      }
    }

    // Single words
    const words = text.split(/[\s,\-;.]+/).filter(w => w.length >= 3);
    tokens.push(...words);

    return tokens;
  }

  /**
   * Capitalizes a city name properly.
   */
  private capitalize(text: string): string {
    return text
      .split(/[\s-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Resets the singleton (for testing).
   */
  static reset(): void {
    CityLookup.instance = null;
  }
}
