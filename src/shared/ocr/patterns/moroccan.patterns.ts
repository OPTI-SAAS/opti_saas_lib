/**
 * Moroccan-specific identifier patterns.
 * These are country-specific and language-independent.
 */
export const MOROCCAN_PATTERNS = {
  /**
   * ICE - Identifiant Commun de l'Entreprise.
   * 15 digits, mandatory for all Moroccan companies.
   */
  ICE: /ICE\s*[:]?\s*(\d{15})/i,

  /**
   * IF - Identifiant Fiscal.
   * 7-8 digits, tax identifier.
   */
  IF: /I\.?F\.?\s*[:]?\s*(\d{7,8})/i,

  /**
   * RC - Registre de Commerce.
   * 5-6 digits, trade register number.
   */
  RC: /R\.?C\.?\s*[:]?\s*(\d{5,6})/i,

  /**
   * CNSS - Caisse Nationale de Sécurité Sociale.
   * Social security number for companies.
   */
  CNSS: /CNSS\s*[:]?\s*(\d{7,10})/i,

  /**
   * Patente - Business license number.
   */
  PATENTE: /(?:patente|TP)\s*[:]?\s*(\d{7,10})/i,

  /**
   * Moroccan phone patterns.
   */
  PHONE: {
    /** Landline: 05XX-XXXXXX */
    LANDLINE: /(?:0|\+212)\s*5\s*[\d\s.-]{8,12}/,
    /** Mobile: 06XX-XXXXXX or 07XX-XXXXXX */
    MOBILE: /(?:0|\+212)\s*[67]\s*[\d\s.-]{8,12}/,
  },

  /**
   * Moroccan cities for address detection.
   */
  CITIES: [
    'casablanca',
    'rabat',
    'marrakech',
    'fès',
    'fes',
    'tanger',
    'agadir',
    'meknès',
    'meknes',
    'oujda',
    'kénitra',
    'kenitra',
    'tétouan',
    'tetouan',
    'safi',
    'mohammedia',
    'el jadida',
    'béni mellal',
    'beni mellal',
    'nador',
    'taza',
    'settat',
    'berrechid',
    'khémisset',
    'khemisset',
    'inezgane',
    'khouribga',
    'ouarzazate',
    'essaouira',
    'laâyoune',
    'laayoune',
    'dakhla',
    'temara',
    'salé',
    'sale',
  ],

  /**
   * VAT rates in Morocco.
   */
  VAT_RATES: [0, 7, 10, 14, 20],
};

/**
 * Validates a Moroccan ICE number.
 * @param ice ICE string to validate
 * @returns true if valid
 */
export function isValidICE(ice: string): boolean {
  if (!ice) return false;
  const cleaned = ice.replace(/\s/g, '');
  return /^\d{15}$/.test(cleaned);
}

/**
 * Validates a Moroccan IF number.
 * @param fiscalId IF string to validate
 * @returns true if valid
 */
export function isValidIF(fiscalId: string): boolean {
  if (!fiscalId) return false;
  const cleaned = fiscalId.replace(/\s/g, '');
  return /^\d{7,8}$/.test(cleaned);
}

/**
 * Formats a Moroccan phone number.
 * @param phone Phone string to format
 * @returns Formatted phone or original if invalid
 */
export function formatMoroccanPhone(phone: string): string {
  if (!phone) return phone;
  const cleaned = phone.replace(/[\s.-]/g, '');

  const normalized = cleaned.replace(/^\+212/, '0');

  if (/^0[567]\d{8}$/.test(normalized)) {
    return normalized.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return phone;
}
