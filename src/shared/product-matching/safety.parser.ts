/**
 * Parser for safety glasses designations.
 * Extracts brand, model, safety standard, protection type, and prescription capability.
 */

import type {
  IParsedSafetyInfo,
  IParsedProductInfo,
  SafetyRating,
  SafetyProtectionType,
  ProductCategory,
} from './matching.interfaces';
import { createEmptyParsedProductInfo } from './matching.interfaces';
import {
  SAFETY_BRAND_PATTERNS,
  SAFETY_MODEL_PATTERNS,
  SAFETY_STANDARD_PATTERNS,
  PROTECTION_TYPE_PATTERNS,
  SAFETY_KEYWORDS,
  // SAFETY_MATERIAL_PATTERNS is available but not yet used in parsing
  PRESCRIPTION_PATTERNS,
} from './safety.patterns';

/**
 * Creates an empty parsed safety info with default values.
 * @returns A new empty IParsedSafetyInfo
 */
export function createEmptySafetyInfo(): IParsedSafetyInfo {
  return {
    brand: null,
    model: null,
    safetyStandard: null,
    safetyRating: null,
    protectionType: null,
    material: null,
    color: null,
    lensIncluded: true,
    prescriptionCapable: false,
  };
}

/**
 * Extracts safety glasses brand from designation.
 * @param text The designation text
 * @returns Extracted brand name or null
 */
function extractSafetyBrand(text: string): string | null {
  const upperText = text.toUpperCase();

  const brandMap: Record<string, string> = {
    '3M': '3M',
    SCOTT: 'Scott',
    UVEX: 'Uvex',
    HONEYWELL: 'Honeywell',
    BOLLÉ: 'Bollé',
    BOLLE: 'Bollé',
    MEDOP: 'Medop',
    JSP: 'JSP',
    'DELTA PLUS': 'Delta Plus',
    DELTAPLUS: 'Delta Plus',
    PORTWEST: 'Portwest',
    MOLDEX: 'Moldex',
    MSA: 'MSA',
    CREWS: 'Crews',
    PYRAMEX: 'Pyramex',
    ELVEX: 'Elvex',
    RADIANS: 'Radians',
    DEWALT: 'DeWalt',
    'EDGE EYEWEAR': 'Edge Eyewear',
    'WILEY X': 'Wiley X',
    INFIELD: 'Infield',
    UNIVET: 'Univet',
    COFRA: 'Cofra',
    LIBUS: 'Libus',
    'ESSILOR SAFETY': 'Essilor Safety',
    'ZEISS SAFETY': 'Zeiss Safety',
    'HOYA SAFETY': 'Hoya Safety',
    'RX SAFETY': 'Rx Safety',
  };

  for (const pattern of SAFETY_BRAND_PATTERNS) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/\s+/g, ' ').trim();
      return brandMap[key] || key;
    }
  }

  return null;
}

/**
 * Extracts safety glasses model from designation.
 * @param text The designation text
 * @returns Extracted model name or null
 */
function extractSafetyModel(text: string): string | null {
  const upperText = text.toUpperCase();

  const modelMap: Record<string, string> = {
    SECUREFIT: 'SecureFit',
    'SECURE FIT': 'SecureFit',
    VIRTUA: 'Virtua',
    SOLUS: 'Solus',
    PRIVO: 'Privo',
    NUVO: 'Nuvo',
    FUEL: 'Fuel',
    PHEOS: 'Pheos',
    SPORTSTYLE: 'Sportstyle',
    'I-3': 'i-3',
    'I-5': 'i-5',
    'I-WORKS': 'i-works',
    ASTROSPEC: 'Astrospec',
    'SUPER G': 'Super G',
    SKYGUARD: 'Skyguard',
    RUSH: 'Rush',
    SLAM: 'Slam',
    SILIUM: 'Silium',
    TRACKER: 'Tracker',
    CONTOUR: 'Contour',
    COBRA: 'Cobra',
    VIPER: 'Viper',
    VISITOR: 'Visitor',
    OVERSPEC: 'Overspec',
  };

  for (const pattern of SAFETY_MODEL_PATTERNS) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/[\s-]+/g, ' ').trim();
      return modelMap[key] || key;
    }
  }

  return null;
}

/**
 * Extracts safety standard and rating from designation.
 * @param text The designation text
 * @returns Object with standard name and rating
 */
function extractSafetyStandard(text: string): {
  standard: string | null;
  rating: SafetyRating | null;
} {
  const upperText = text.toUpperCase();

  for (const { pattern, standard, rating } of SAFETY_STANDARD_PATTERNS) {
    if (pattern.test(upperText)) {
      return { standard, rating };
    }
  }

  return { standard: null, rating: null };
}

/**
 * Extracts protection type from designation.
 * @param text The designation text
 * @returns Detected protection type or null
 */
function extractProtectionType(text: string): SafetyProtectionType | null {
  const upperText = text.toUpperCase();

  for (const { pattern, type } of PROTECTION_TYPE_PATTERNS) {
    if (pattern.test(upperText)) {
      return type;
    }
  }

  return 'impact';
}

/**
 * Extracts material from designation.
 * @param text The designation text
 * @returns Extracted material or null
 */
function extractSafetyMaterial(text: string): string | null {
  const upperText = text.toUpperCase();

  const materialMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(POLY(?:CARBONATE)?|PC)\b/i, name: 'Polycarbonate' },
    { pattern: /\b(NYLON)\b/i, name: 'Nylon' },
    { pattern: /\b(TR[\s-]?90)\b/i, name: 'TR-90' },
    { pattern: /\b(CAOUTCHOUC|RUBBER)\b/i, name: 'Caoutchouc' },
    { pattern: /\b(SILICONE)\b/i, name: 'Silicone' },
    { pattern: /\b(TPE)\b/i, name: 'TPE' },
    { pattern: /\b(TPR)\b/i, name: 'TPR' },
  ];

  for (const { pattern, name } of materialMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Extracts color from designation.
 * @param text The designation text
 * @returns Extracted color or null
 */
function extractSafetyColor(text: string): string | null {
  const upperText = text.toUpperCase();

  const colorMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(NOIR|BLACK|BLK)\b/i, name: 'Noir' },
    { pattern: /\b(BLEU|BLUE|BLU)\b/i, name: 'Bleu' },
    { pattern: /\b(ROUGE|RED)\b/i, name: 'Rouge' },
    { pattern: /\b(VERT|GREEN|GRN)\b/i, name: 'Vert' },
    { pattern: /\b(JAUNE|YELLOW|AMBER)\b/i, name: 'Jaune' },
    { pattern: /\b(ORANGE)\b/i, name: 'Orange' },
    { pattern: /\b(BLANC|WHITE|WHT)\b/i, name: 'Blanc' },
    { pattern: /\b(GRIS|GR[AE]Y)\b/i, name: 'Gris' },
    { pattern: /\b(CLAIR|CLEAR|INCOLORE|TRANSPARENT)\b/i, name: 'Clair' },
    { pattern: /\b(FUM[ÉE]|SMOKE)\b/i, name: 'Fumé' },
    { pattern: /\b(MIROIR|MIRROR)\b/i, name: 'Miroir' },
  ];

  for (const { pattern, name } of colorMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Checks if prescription-ready from designation.
 * @param text The designation text
 * @returns True if prescription-capable
 */
function checkPrescriptionCapable(text: string): boolean {
  const upperText = text.toUpperCase();

  for (const pattern of PRESCRIPTION_PATTERNS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  return false;
}

/**
 * Detects if the designation is for safety glasses.
 * @param text The designation text
 * @returns True if safety glasses detected
 */
export function isSafetyGlasses(text: string): boolean {
  const upperText = text.toUpperCase();

  for (const pattern of SAFETY_KEYWORDS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  for (const { pattern } of SAFETY_STANDARD_PATTERNS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  for (const pattern of SAFETY_BRAND_PATTERNS) {
    if (pattern.test(upperText)) {
      if (/\b(SAFETY|S[ÉE]CURIT[ÉE]|PROTECTION|EPI|PPE)\b/i.test(upperText)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Parses a safety glasses designation.
 * @param designation The raw designation text
 * @returns Parsed safety glasses information
 */
export function parseSafetyDesignation(designation: string): IParsedSafetyInfo {
  if (!designation) {
    return createEmptySafetyInfo();
  }

  const brand = extractSafetyBrand(designation);
  const model = extractSafetyModel(designation);
  const { standard: safetyStandard, rating: safetyRating } = extractSafetyStandard(designation);
  const protectionType = extractProtectionType(designation);
  const material = extractSafetyMaterial(designation);
  const color = extractSafetyColor(designation);
  const prescriptionCapable = checkPrescriptionCapable(designation);

  return {
    brand,
    model,
    safetyStandard,
    safetyRating,
    protectionType,
    material,
    color,
    lensIncluded: true,
    prescriptionCapable,
  };
}

/**
 * Parses a designation and returns product info with safety category if detected.
 * @param designation The raw designation text
 * @returns Parsed product information
 */
export function parseDesignationWithSafety(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const result = createEmptyParsedProductInfo(designation);

  if (!isSafetyGlasses(designation)) {
    return result;
  }

  const safetyInfo = parseSafetyDesignation(designation);
  let confidence = 0;

  if (safetyInfo.brand) confidence += 25;
  if (safetyInfo.model) confidence += 20;
  if (safetyInfo.safetyStandard) confidence += 25;
  if (safetyInfo.protectionType) confidence += 10;
  if (safetyInfo.material) confidence += 10;
  if (safetyInfo.color) confidence += 5;
  if (safetyInfo.prescriptionCapable) confidence += 5;

  const category: ProductCategory = 'safety';

  return {
    ...result,
    parsedBrand: safetyInfo.brand,
    parsedBrandVariants: safetyInfo.brand ? [safetyInfo.brand] : [],
    parsedModel: safetyInfo.model,
    parsedColor: safetyInfo.color,
    parsedCategory: category,
    confidence: Math.min(confidence, 100) / 100,
  };
}
