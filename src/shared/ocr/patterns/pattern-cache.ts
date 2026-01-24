/**
 * Singleton cache for pre-compiled regex patterns.
 * Improves performance by avoiding regex recompilation on each call.
 */
export class PatternCache {
  private static instance: PatternCache | null = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // LINE DETECTION PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════

  /** EAN barcode at start of line (8-14 digits) */
  readonly EAN_FULL = /^\d{8,14}\s/;

  /** Truncated EAN (6-13 digits - OCR may cut first digit(s)) */
  readonly EAN_TRUNCATED = /^\d{6,13}\s+[A-Z]/i;

  /** Reference code like CH-HER 0298, ABC-123, BS-24713, B-24116 (also handles OCR errors like 8S→BS) */
  readonly REF_DASH = /^[A-Z0-9]{1,5}[-\s][A-Z0-9]{2,}/i;

  /** Reference code like REF001, ART2024 */
  readonly REF_NUMERIC = /^[A-Z]{2,4}\d{3,}/i;

  /** Numeric index at start: 1., 01), #1 */
  readonly INDEX_NUMERIC = /^[\d#]{1,3}[.)\]\s]/;

  /** Contains percentage (discount or VAT) */
  readonly HAS_PERCENTAGE = /\d+[.,]?\d*\s*%/;

  /** Amount pattern (2+ digits + 2 decimals) */
  readonly AMOUNT_PATTERN = /\d{2,}[.,]\d{2}/g;

  /** Quantity pattern (1-999 surrounded by spaces) */
  readonly QUANTITY_PATTERN = /\s[1-9]\d{0,2}\s/;

  /** Multi-column structure (2+ spaces or tab) */
  readonly MULTI_COLUMN = /\s{2,}|\t/;

  // ═══════════════════════════════════════════════════════════════════════════
  // NOISE DETECTION PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Total/subtotal lines */
  readonly IS_TOTAL = /total|sous-total|montant|net\s*[àa]\s*payer|reporter|tva|h\.?t\.?|t\.?t\.?c\.?/i;

  /** Header/metadata lines */
  readonly IS_HEADER = /facture|date|client|fournisseur|adresse|ice|i\.?f\.?|r\.?c\.?|tél|tel|page|n°/i;

  /** Date pattern */
  readonly IS_DATE = /^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/;

  // ═══════════════════════════════════════════════════════════════════════════
  // PHONE PATTERNS - MOROCCO
  // ═══════════════════════════════════════════════════════════════════════════

  readonly PHONE_MA_LABELED = /(?:tél(?:éphone)?|tel|phone|fax|gsm|mobile)\s*[.:]\s*((?:0|\+212)\s*[25678][\d\s.\-()]{7,12})/i;
  readonly PHONE_MA_INTL = /(\+212\s*[25678][\d\s.\-]{7,12})/;
  readonly PHONE_MA_DOMESTIC_SEP = /(0[25678]\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2})/;
  readonly PHONE_MA_DOMESTIC_COMPACT = /(0[25678]\d{8})/;

  // ═══════════════════════════════════════════════════════════════════════════
  // PHONE PATTERNS - FRANCE
  // ═══════════════════════════════════════════════════════════════════════════

  readonly PHONE_FR_LABELED = /(?:tél(?:éphone)?|tel|phone|fax)\s*[.:]\s*((?:0|\+33)\s*[1-9][\d\s.\-()]{8,12})/i;
  readonly PHONE_FR_INTL = /(\+33\s*[1-9][\d\s.\-]{8,12})/;
  readonly PHONE_FR_DOMESTIC_SEP = /(0[1-9]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2})/;
  readonly PHONE_FR_DOMESTIC_COMPACT = /(0[1-9]\d{8})/;

  // ═══════════════════════════════════════════════════════════════════════════
  // PHONE PATTERNS - INTERNATIONAL
  // ═══════════════════════════════════════════════════════════════════════════

  readonly PHONE_INTL_E164 = /(\+\d{1,3}[\d\s.\-]{8,15})/;
  readonly PHONE_INTL_LABELED = /(?:tel|phone|fax)\s*[.:]\s*([\d\s.\-+()]{10,20})/i;

  // ═══════════════════════════════════════════════════════════════════════════
  // PHONE VALIDATION PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════

  readonly PHONE_VALID_MA = /^0[25678]\d{8}$/;
  readonly PHONE_VALID_MA_INTL = /^\+212[25678]\d{8}$/;
  readonly PHONE_VALID_FR = /^0[1-9]\d{8}$/;
  readonly PHONE_VALID_FR_INTL = /^\+33[1-9]\d{8}$/;
  readonly PHONE_VALID_INTL = /^\+?\d{10,15}$/;

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDRESS PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Address with explicit label */
  readonly ADDRESS_LABELED = /adresse\s*[:\s]+(.+?)(?=\n.*?(?:tél|tel|ice|i\.?f|email|@)|$)/is;
  readonly ADDRESS_SIEGE = /siège\s*(?:social)?\s*[:\s]+(.+?)(?=\n.*?(?:tél|tel|ice)|$)/is;
  readonly ADDRESS_DOMICILIE = /domicilié\s*[àa]?\s*[:\s]*(.+?)(?=\n.*?(?:tél|tel)|$)/is;

  /** Street keywords for fallback detection - excluding n° when followed by digits (document numbers) */
  readonly STREET_KEYWORDS = /(?:rue|avenue|av\.|av|boulevard|bd|blvd|allée|impasse|passage|place|chemin|route|voie|lot|lotissement|résidence|immeuble|imm|quartier|zone|zi|galerie|centre|angle|n°\s*(?![:\s]*\d)|numéro\s*(?![:\s]*\d))\s+[^\n]{5,60}/i;

  /** City-Country pattern */
  readonly CITY_COUNTRY = /[A-ZÀ-Ü]{3,}\s*[-,]\s*[A-ZÀ-Ü]{3,}/i;

  /** Postal code (5 digits) */
  readonly POSTAL_CODE = /\b(\d{5})\b/;

  /** Numbered street pattern (starts with number) - indicates primary street address */
  readonly NUMBERED_STREET = /^\d+[\s,].*(?:rue|avenue|av\.|boulevard|bd|place|chemin|route|allée|impasse|voie)/i;

  /** Location/emplacement patterns (commercial locations, zones, etc.) */
  readonly LOCATION_KEYWORDS = /^(?:galerie|centre\s+commercial|cc\s|zone\s+industrielle|zi\s|zac\s|zone\s+d['']activit[ée]s?|r[ée]sidence|immeuble|imm\s|quartier|lotissement|parc\s+d['']activit[ée]s?|business\s+park|shopping\s+center|mall|espace\s+commercial)/i;

  /** Location with name pattern (captures the full location name) */
  readonly LOCATION_FULL = /^((?:galerie|centre\s+commercial|cc|zone\s+industrielle|zi|zac|zone\s+d['']activit[ée]s?|r[ée]sidence|immeuble|imm|quartier|lotissement|parc\s+d['']activit[ée]s?|business\s+park|shopping\s+center|mall|espace\s+commercial)(?:\s+(?:marchande?|industriel(?:le)?|commercial(?:e)?))?\s+[A-ZÀ-Ü][A-Za-zÀ-ü\s\-']*)/i;

  // ═══════════════════════════════════════════════════════════════════════════
  // STOP PATTERNS (for zone detection)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Lines that indicate end of header zone */
  readonly HEADER_STOP = /^(ice|i\.?f\.?|r\.?c\.?|tél|tel|phone|fax|email|@|code\s*client|n°?\s*facture|date)/i;

  /** Table header keywords - use word boundaries to avoid false positives */
  readonly TABLE_HEADER = /\b(désignation|description|article|référence|qté|quantité|prix)\b|\bp\.?u\.?\b/i;

  /** Footer start keywords */
  readonly FOOTER_START = /^total\s|reporter|net\s*[àa]\s*payer|sous-total/i;

  // ═══════════════════════════════════════════════════════════════════════════
  // LINE ITEM EXTRACTION PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Barcode format: EAN + Designation + Qty + Price + Discount% + Total */
  readonly LINE_BARCODE = /^(\d{8,14})\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+([\d\s.,]+)\s+(\d+(?:[.,]\d+)?)\s*%?\s+([\d\s.,]+)$/;

  /** Extended format with OCR artifacts */
  readonly LINE_EXTENDED = /^([a-z0-9\-\.]+)\s+(.+?)\s+(\d+(?:[\.,]\d+)?)\s+([\d\s\.,\]\[\}\{\)\|f]+)\s+([\d\.\s]+)%?\s+([\d\s\.,]+)/i;

  /** With discount: Code + Designation + Qty + Price + Discount% + Total */
  readonly LINE_WITH_DISCOUNT = /^([A-Z0-9][-A-Z0-9]{2,20})\s+(.{5,60}?)\s+(\d+(?:[.,]\d+)?)\s+([\d\s.,]+)\s+(\d+(?:[.,]\d+)?)\s*%\s+([\d\s.,]+)/i;

  /** Full format: Description Qty [Unit] Price Total */
  readonly LINE_FULL = /^(.{3,60}?)\s+(\d+(?:[.,]\d+)?)\s*(pcs?|kg|unité|unit|box|carton|lot)?\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)/i;

  /** Simple format: Qty x Price */
  readonly LINE_SIMPLE = /(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/;

  /** Fallback: Any line with reference-like start and amounts */
  readonly LINE_FALLBACK = /^([a-z0-9\-\.]{4,})\s+(.+?)\s+(\d+(?:[\.,]\d+)?)\s+([\d\s\.,]+)$/i;

  /**
   * Gets the singleton instance.
   */
  static getInstance(): PatternCache {
    if (!PatternCache.instance) {
      PatternCache.instance = new PatternCache();
    }
    return PatternCache.instance;
  }

  /**
   * Private constructor - use getInstance().
   */
  private constructor() {
    // Patterns are already compiled as class properties
  }

  /**
   * Resets the singleton (for testing purposes).
   */
  static reset(): void {
    PatternCache.instance = null;
  }
}
