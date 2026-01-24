/**
 * Parser for contact lens designations.
 * Extracts brand, product line, type, parameters, and prescription data.
 */

import type {
  IParsedContactLensInfo,
  IParsedProductInfo,
  ContactLensType,
  ContactLensReplacement,
  ProductCategory,
} from './matching.interfaces';
import { createEmptyParsedProductInfo } from './matching.interfaces';
import { CONTACT_LENS_PATTERNS } from './contact-lens.patterns';

/**
 * Creates an empty parsed contact lens info with default values.
 * @returns A new empty IParsedContactLensInfo
 */
export function createEmptyContactLensInfo(): IParsedContactLensInfo {
  return {
    brand: null,
    productLine: null,
    lensType: null,
    replacement: null,
    material: null,
    baseCurve: null,
    diameter: null,
    power: null,
    cylinder: null,
    axis: null,
    addition: null,
    quantity: null,
  };
}

/**
 * Extracts contact lens brand from designation.
 * @param text The designation text
 * @returns Extracted brand name or null
 */
function extractContactLensBrand(text: string): string | null {
  const upperText = text.toUpperCase();

  const brandMap: Record<string, string> = {
    ACUVUE: 'Acuvue',
    'J&J': 'Johnson & Johnson',
    'JOHNSON & JOHNSON': 'Johnson & Johnson',
    'JOHNSON AND JOHNSON': 'Johnson & Johnson',
    ALCON: 'Alcon',
    'BAUSCH & LOMB': 'Bausch & Lomb',
    'BAUSCH AND LOMB': 'Bausch & Lomb',
    'B&L': 'Bausch & Lomb',
    'B & L': 'Bausch & Lomb',
    COOPERVISION: 'CooperVision',
    COOPER: 'CooperVision',
    MENICON: 'Menicon',
    MARKENNOVY: "Mark'ennovy",
    "MARK'ENNOVY": "Mark'ennovy",
    PRECILENS: 'Precilens',
    'LENTILLES LAB': 'Lentilles Lab',
    LCL: 'Lentilles Lab',
  };

  for (const pattern of CONTACT_LENS_PATTERNS.brandPatterns) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/\s+/g, ' ').trim();
      return brandMap[key] || key;
    }
  }

  return null;
}

/**
 * Extracts contact lens product line from designation.
 * @param text The designation text
 * @returns Extracted product line or null
 */
function extractContactLensProductLine(text: string): string | null {
  const upperText = text.toUpperCase();

  const productLineMap: Record<string, string> = {
    OASYS: 'Oasys',
    MOIST: '1-Day Moist',
    TRUEYE: 'TruEye',
    VITA: 'Vita',
    DEFINE: 'Define',
    '1-DAY': '1-Day',
    '1 DAY': '1-Day',
    'ONE DAY': '1-Day',
    DAILIES: 'Dailies',
    'TOTAL 1': 'Dailies Total 1',
    'TOTAL ONE': 'Dailies Total 1',
    TOTAL1: 'Dailies Total 1',
    'AIR OPTIX': 'Air Optix',
    AIROPTIX: 'Air Optix',
    FRESHLOOK: 'FreshLook',
    'PRECISION 1': 'Precision1',
    PRECISION1: 'Precision1',
    BIOTRUE: 'Biotrue',
    'BIO TRUE': 'Biotrue',
    ULTRA: 'Ultra',
    SOFLENS: 'SofLens',
    PUREVISION: 'PureVision',
    AVAIRA: 'Avaira',
    BIOFINITY: 'Biofinity',
    CLARITI: 'Clariti',
    MYDAY: 'MyDay',
    'MY DAY': 'MyDay',
    PROCLEAR: 'Proclear',
    'AQUA COMFORT': 'Aqua Comfort',
    COLORS: 'Colors',
    COLOR: 'Colors',
    'NIGHT & DAY': 'Night & Day',
    'NIGHT AND DAY': 'Night & Day',
  };

  for (const pattern of CONTACT_LENS_PATTERNS.modelPatterns) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/\s+/g, ' ').trim();
      return productLineMap[key] || key;
    }
  }

  return null;
}

/**
 * Detects contact lens type from designation.
 * @param text The designation text
 * @returns Detected lens type or null
 */
function detectContactLensType(text: string): ContactLensType | null {
  const upperText = text.toUpperCase();

  if (/\b(TORIQUE?S?|TORIC|AST(?:IGMAT(?:ISME|IC))?)\b/i.test(upperText)) {
    return 'toric';
  }
  if (/\b(MULTIFOCAL(?:ES?)?|PROGRESSI[VF]E?S?)\b/i.test(upperText)) {
    return 'multifocal';
  }
  if (/\b(BIFOCAL(?:ES?)?)\b/i.test(upperText)) {
    return 'bifocal';
  }
  if (/\b(RIGIDE|RGP|LRPG)\b/i.test(upperText)) {
    return 'rgp';
  }
  if (/\b(SCL[ÉE]RAL(?:ES?)?|SCLERAL)\b/i.test(upperText)) {
    return 'scleral';
  }
  if (/\b(ORTHO[\s\-]?K|ORTHOKERATOLOG(?:Y|IE))\b/i.test(upperText)) {
    return 'ortho_k';
  }
  if (/\b(COSM[ÉE]TIQUE?S?|COSMETIC|COULEUR|COLOR)\b/i.test(upperText)) {
    return 'cosmetic';
  }
  if (/\b(SPH[ÉE]RIQUE?S?|SPHERICAL?)\b/i.test(upperText)) {
    return 'spherical';
  }

  // Default to spherical if no specific type found but it's clearly a contact lens
  return 'spherical';
}

/**
 * Detects contact lens replacement schedule from designation.
 * @param text The designation text
 * @returns Detected replacement schedule or null
 */
function detectReplacement(text: string): ContactLensReplacement | null {
  const upperText = text.toUpperCase();

  if (/\b(JOURNALI[ÈE]RE?S?|DAILY|JOUR|1[\s\-]?DAY|ONE\s?DAY)\b/i.test(upperText)) {
    return 'daily';
  }
  if (/\b(BIMENSUEL(?:LE)?S?|BI[\s\-]?WEEKLY|2\s?WEEKS?|QUINZAINE)\b/i.test(upperText)) {
    return 'biweekly';
  }
  if (/\b(MENSUEL(?:LE)?S?|MONTHLY|MOIS)\b/i.test(upperText)) {
    return 'monthly';
  }
  if (/\b(TRIMESTRIEL(?:LE)?S?|QUARTERLY|3\s?MONTHS?|TRIMESTRE)\b/i.test(upperText)) {
    return 'quarterly';
  }
  if (/\b(ANNUEL(?:LE)?S?|YEARLY|ANNUAL|AN)\b/i.test(upperText)) {
    return 'yearly';
  }
  if (/\b(TRADITIONNELLE?|CONVENTIONAL)\b/i.test(upperText)) {
    return 'conventional';
  }

  return null;
}

/**
 * Extracts contact lens material from designation.
 * @param text The designation text
 * @returns Extracted material or null
 */
function extractContactLensMaterial(text: string): string | null {
  const upperText = text.toUpperCase();

  const materialMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(SILICONE[\s\-]?HYDROGEL|SI[\s\-]?HY)\b/i, name: 'Silicone Hydrogel' },
    { pattern: /\b(HYDROGEL)\b/i, name: 'Hydrogel' },
    { pattern: /\b(SENOFILCON)\b/i, name: 'Senofilcon A' },
    { pattern: /\b(ETAFILCON)\b/i, name: 'Etafilcon A' },
    { pattern: /\b(OMAFILCON)\b/i, name: 'Omafilcon A' },
    { pattern: /\b(COMFILCON)\b/i, name: 'Comfilcon A' },
    { pattern: /\b(LOTRAFILCON)\b/i, name: 'Lotrafilcon B' },
    { pattern: /\b(DELEFILCON)\b/i, name: 'Delefilcon A' },
    { pattern: /\b(SAMFILCON)\b/i, name: 'Samfilcon A' },
    { pattern: /\b(NELFILCON)\b/i, name: 'Nelfilcon A' },
    { pattern: /\b(FANFILCON)\b/i, name: 'Fanfilcon A' },
    { pattern: /\b(HEMA)\b/i, name: 'HEMA' },
  ];

  for (const { pattern, name } of materialMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Extracts contact lens parameters from designation.
 * @param text The designation text
 * @returns Object with extracted parameters
 */
function extractContactLensParameters(text: string): {
  baseCurve: number | null;
  diameter: number | null;
  power: number | null;
  cylinder: number | null;
  axis: number | null;
  addition: number | null;
  quantity: number | null;
} {
  const result = {
    baseCurve: null as number | null,
    diameter: null as number | null,
    power: null as number | null,
    cylinder: null as number | null,
    axis: null as number | null,
    addition: null as number | null,
    quantity: null as number | null,
  };

  // Base curve (BC) - typically 8.3-9.0
  const bcMatch = text.match(/\b(?:BC|RAYON)[\s:]?([\d,\.]+)\b/i);
  if (bcMatch) {
    const bc = parseFloat(bcMatch[1].replace(',', '.'));
    if (bc >= 7.5 && bc <= 10) {
      result.baseCurve = bc;
    }
  }

  // Diameter (DIA) - typically 13.5-14.5
  const diaMatch = text.match(/\b(?:DIA|DIAM[ÈE]TRE)[\s:]?([\d,\.]+)\b/i);
  if (diaMatch) {
    const dia = parseFloat(diaMatch[1].replace(',', '.'));
    if (dia >= 12 && dia <= 16) {
      result.diameter = dia;
    }
  }

  // Power (PWR/SPH) - typically -12.00 to +8.00
  const pwrMatch = text.match(/\b(?:PWR|SPH)[\s:]?([+-]?[\d,\.]+)\b/i);
  if (pwrMatch) {
    result.power = parseFloat(pwrMatch[1].replace(',', '.'));
  }

  // Cylinder (CYL) - typically -0.75 to -2.75
  const cylMatch = text.match(/\bCYL[\s:]?([+-]?[\d,\.]+)\b/i);
  if (cylMatch) {
    result.cylinder = parseFloat(cylMatch[1].replace(',', '.'));
  }

  // Axis (AXE) - 0-180 degrees
  const axeMatch = text.match(/\bAXE?[\s:]?(\d{1,3})°?\b/i);
  if (axeMatch) {
    const axis = parseInt(axeMatch[1], 10);
    if (axis >= 0 && axis <= 180) {
      result.axis = axis;
    }
  }

  // Addition (ADD)
  const addMatch = text.match(/\bADD[\s:]?([+-]?[\d,\.]+)\b/i);
  if (addMatch) {
    result.addition = parseFloat(addMatch[1].replace(',', '.'));
  }

  // Quantity - look for number of lenses/boxes
  const qtyPatterns = [
    /\b(\d+)\s?(?:LENTILLES?|LENS(?:ES)?|PCS?|UNITS?)\b/i,
    /\bBOITE?[\s:]?(\d+)\b/i,
    /\bPACK[\s:]?(\d+)\b/i,
    /\bX\s?(\d+)\b/i,
  ];
  for (const pattern of qtyPatterns) {
    const qtyMatch = text.match(pattern);
    if (qtyMatch) {
      result.quantity = parseInt(qtyMatch[1], 10);
      break;
    }
  }

  return result;
}

/**
 * Detects if the designation is for a contact lens.
 * @param text The designation text
 * @returns True if contact lens detected
 */
export function isContactLens(text: string): boolean {
  const upperText = text.toUpperCase();

  // Check for contact lens brands
  for (const pattern of CONTACT_LENS_PATTERNS.brandPatterns) {
    if (pattern.test(upperText)) return true;
  }

  // Check for contact lens-specific keywords
  if (/\b(LENTILLES?\s?(?:DE\s?)?CONTACT)\b/i.test(upperText)) return true;
  if (/\b(CONTACT\s?LENS(?:ES)?)\b/i.test(upperText)) return true;
  if (/\b(ACUVUE|DAILIES|BIOFINITY|BIOTRUE|AIR\s?OPTIX)\b/i.test(upperText)) return true;
  if (/\b(BC[\s:]?[89][\.,]\d|DIA[\s:]?1[34][\.,]\d)\b/i.test(upperText)) return true;

  // Check for replacement keywords combined with lens keywords
  if (/\b(JOURNALI[ÈE]RE?|MENSUEL|BIMENSUEL)\b/i.test(upperText) &&
      /\b(LENTILLE|LENS|SOUPLE|SOFT)\b/i.test(upperText)) {
    return true;
  }

  return false;
}

/**
 * Parses a contact lens designation.
 * @param designation The raw designation text
 * @returns Parsed contact lens information
 */
export function parseContactLensDesignation(designation: string): IParsedContactLensInfo {
  if (!designation) {
    return createEmptyContactLensInfo();
  }

  const brand = extractContactLensBrand(designation);
  const productLine = extractContactLensProductLine(designation);
  const lensType = detectContactLensType(designation);
  const replacement = detectReplacement(designation);
  const material = extractContactLensMaterial(designation);
  const params = extractContactLensParameters(designation);

  return {
    brand,
    productLine,
    lensType,
    replacement,
    material,
    baseCurve: params.baseCurve,
    diameter: params.diameter,
    power: params.power,
    cylinder: params.cylinder,
    axis: params.axis,
    addition: params.addition,
    quantity: params.quantity,
  };
}

/**
 * Parses a designation and returns product info with contact lens category if detected.
 * @param designation The raw designation text
 * @returns Parsed product information
 */
export function parseDesignationWithContactLens(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const result = createEmptyParsedProductInfo(designation);

  if (!isContactLens(designation)) {
    return result;
  }

  const lensInfo = parseContactLensDesignation(designation);
  let confidence = 0;

  if (lensInfo.brand) confidence += 25;
  if (lensInfo.productLine) confidence += 20;
  if (lensInfo.lensType) confidence += 10;
  if (lensInfo.replacement) confidence += 15;
  if (lensInfo.baseCurve !== null) confidence += 10;
  if (lensInfo.diameter !== null) confidence += 5;
  if (lensInfo.power !== null) confidence += 15;

  const category: ProductCategory = 'contact_lens';

  return {
    ...result,
    parsedBrand: lensInfo.brand,
    parsedBrandVariants: lensInfo.brand ? [lensInfo.brand] : [],
    parsedModel: lensInfo.productLine,
    parsedCategory: category,
    confidence: Math.min(confidence, 100) / 100,
  };
}
