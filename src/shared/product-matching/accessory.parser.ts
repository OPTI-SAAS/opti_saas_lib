/**
 * Parser for optical accessory designations.
 * Extracts type, brand, material, color, and size.
 */

import type {
  IParsedAccessoryInfo,
  IParsedProductInfo,
  AccessoryType,
  ProductCategory,
} from './matching.interfaces';
import { createEmptyParsedProductInfo } from './matching.interfaces';
import {
  ACCESSORY_PATTERNS,
  ACCESSORY_KEYWORDS,
  ACCESSORY_BRAND_PATTERNS,
} from './accessory.patterns';

/**
 * Creates an empty parsed accessory info with default values.
 * @returns A new empty IParsedAccessoryInfo
 */
export function createEmptyAccessoryInfo(): IParsedAccessoryInfo {
  return {
    brand: null,
    accessoryType: null,
    material: null,
    color: null,
    size: null,
  };
}

/**
 * Detects accessory type from designation.
 * @param text The designation text
 * @returns Detected accessory type or null
 */
function detectAccessoryType(text: string): AccessoryType | null {
  const upperText = text.toUpperCase();

  for (const accessoryPattern of ACCESSORY_PATTERNS) {
    for (const pattern of accessoryPattern.patterns) {
      if (pattern.test(upperText)) {
        return accessoryPattern.type;
      }
    }
  }

  return null;
}

/**
 * Gets the display name for an accessory type.
 * @param type The accessory type
 * @param lang The language ('fr' or 'en')
 * @returns The display name
 */
export function getAccessoryTypeName(
  type: AccessoryType,
  lang: 'fr' | 'en' = 'fr'
): string {
  for (const pattern of ACCESSORY_PATTERNS) {
    if (pattern.type === type) {
      return pattern.names[lang];
    }
  }
  return type;
}

/**
 * Extracts accessory brand from designation.
 * @param text The designation text
 * @returns Extracted brand name or null
 */
function extractAccessoryBrand(text: string): string | null {
  const upperText = text.toUpperCase();

  const brandMap: Record<string, string> = {
    'RAY-BAN': 'Ray-Ban',
    'RAY BAN': 'Ray-Ban',
    RAYBAN: 'Ray-Ban',
    OAKLEY: 'Oakley',
    GUCCI: 'Gucci',
    PRADA: 'Prada',
    VERSACE: 'Versace',
    CHANEL: 'Chanel',
    DIOR: 'Dior',
    FENDI: 'Fendi',
    CELINE: 'Celine',
    BURBERRY: 'Burberry',
    'MICHAEL KORS': 'Michael Kors',
    CROAKIES: 'Croakies',
    CHUMS: 'Chums',
    CABLZ: 'Cablz',
    HILCO: 'Hilco',
    PEEPER: 'Peeper',
    OPTYL: 'Optyl',
    RENU: 'ReNu',
    'OPTI-FREE': 'Opti-Free',
    OPTIFREE: 'Opti-Free',
    BIOTRUE: 'Biotrue',
    COMPLETE: 'Complete',
    AOSEPT: 'AOSept',
    'SOLO-CARE': 'Solo-Care',
    SOLOCARE: 'Solo-Care',
    AQUIFY: 'Aquify',
    'CLEAR CARE': 'Clear Care',
  };

  for (const pattern of ACCESSORY_BRAND_PATTERNS) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/[\s\-]+/g, '-').trim();
      // Try various key formats
      return brandMap[key] ||
             brandMap[key.replace(/-/g, ' ')] ||
             brandMap[key.replace(/-/g, '')] ||
             match[1] || match[0];
    }
  }

  return null;
}

/**
 * Extracts accessory material from designation.
 * @param text The designation text
 * @returns Extracted material or null
 */
function extractAccessoryMaterial(text: string): string | null {
  const upperText = text.toUpperCase();

  const materialMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(CUIR)\b/i, name: 'Cuir' },
    { pattern: /\b(LEATHER)\b/i, name: 'Cuir' },
    { pattern: /\b(SIMILI[\s\-]?CUIR|FAUX\s?LEATHER|PU\s?LEATHER)\b/i, name: 'Simili-cuir' },
    { pattern: /\b(TISSU|FABRIC|TEXTILE)\b/i, name: 'Tissu' },
    { pattern: /\b(PLASTIQUE|PLASTIC)\b/i, name: 'Plastique' },
    { pattern: /\b(M[ÉE]TAL|METAL)\b/i, name: 'Métal' },
    { pattern: /\b(SILICONE)\b/i, name: 'Silicone' },
    { pattern: /\b(CAOUTCHOUC|RUBBER)\b/i, name: 'Caoutchouc' },
    { pattern: /\b(N[ÉE]OPR[ÈE]NE|NEOPRENE)\b/i, name: 'Néoprène' },
    { pattern: /\b(VELOURS|VELVET)\b/i, name: 'Velours' },
    { pattern: /\b(SATIN)\b/i, name: 'Satin' },
    { pattern: /\b(MICROFIBRE?|MICROFIBER)\b/i, name: 'Microfibre' },
  ];

  for (const { pattern, name } of materialMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Extracts accessory color from designation.
 * @param text The designation text
 * @returns Extracted color or null
 */
function extractAccessoryColor(text: string): string | null {
  const upperText = text.toUpperCase();

  const colorMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(NOIR|BLACK|BLK)\b/i, name: 'Noir' },
    { pattern: /\b(MARRON|BROWN|BRN)\b/i, name: 'Marron' },
    { pattern: /\b(BLEU|BLUE|BLU)\b/i, name: 'Bleu' },
    { pattern: /\b(ROUGE|RED)\b/i, name: 'Rouge' },
    { pattern: /\b(VERT|GREEN|GRN)\b/i, name: 'Vert' },
    { pattern: /\b(ROSE|PINK)\b/i, name: 'Rose' },
    { pattern: /\b(VIOLET|PURPLE)\b/i, name: 'Violet' },
    { pattern: /\b(ORANGE)\b/i, name: 'Orange' },
    { pattern: /\b(JAUNE|YELLOW)\b/i, name: 'Jaune' },
    { pattern: /\b(BLANC|WHITE|WHT)\b/i, name: 'Blanc' },
    { pattern: /\b(GRIS|GR[AE]Y)\b/i, name: 'Gris' },
    { pattern: /\b(BEIGE|TAUPE)\b/i, name: 'Beige' },
    { pattern: /\b(OR|GOLD|GLD|DOR[ÉE])\b/i, name: 'Or' },
    { pattern: /\b(ARGENT|SILVER|SLV|ARGENT[ÉE])\b/i, name: 'Argent' },
  ];

  for (const { pattern, name } of colorMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Extracts accessory size from designation.
 * @param text The designation text
 * @returns Extracted size or null
 */
function extractAccessorySize(text: string): string | null {
  const upperText = text.toUpperCase();

  // Check for named sizes
  if (/\b(PETIT|SMALL)\b/i.test(upperText)) return 'S';
  if (/\b(MOYEN|MEDIUM)\b/i.test(upperText)) return 'M';
  if (/\b(GRAND|LARGE)\b/i.test(upperText)) return 'L';
  if (/\b(EXTRA[\s\-]?LARGE|XL)\b/i.test(upperText)) return 'XL';
  if (/\b(UNIVERSEL|UNIVERSAL|ONE\s?SIZE)\b/i.test(upperText)) return 'Universel';

  // Check for volume (for solutions)
  const volumeMatch = upperText.match(/\b(\d+)\s?(ML|CL|L)\b/i);
  if (volumeMatch) {
    return `${volumeMatch[1]}${volumeMatch[2].toLowerCase()}`;
  }

  // Check for dimensions
  const dimMatch = upperText.match(/\b(\d+)\s?(CM|MM)\b/i);
  if (dimMatch) {
    return `${dimMatch[1]}${dimMatch[2].toLowerCase()}`;
  }

  return null;
}

/**
 * Detects if the designation is for an accessory.
 * @param text The designation text
 * @returns True if accessory detected
 */
export function isAccessory(text: string): boolean {
  const upperText = text.toUpperCase();

  // Check for specific accessory type patterns
  for (const accessoryPattern of ACCESSORY_PATTERNS) {
    for (const pattern of accessoryPattern.patterns) {
      if (pattern.test(upperText)) {
        return true;
      }
    }
  }

  // Check for generic accessory keywords
  for (const pattern of ACCESSORY_KEYWORDS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  return false;
}

/**
 * Parses an accessory designation.
 * @param designation The raw designation text
 * @returns Parsed accessory information
 */
export function parseAccessoryDesignation(designation: string): IParsedAccessoryInfo {
  if (!designation) {
    return createEmptyAccessoryInfo();
  }

  const accessoryType = detectAccessoryType(designation);
  const brand = extractAccessoryBrand(designation);
  const material = extractAccessoryMaterial(designation);
  const color = extractAccessoryColor(designation);
  const size = extractAccessorySize(designation);

  return {
    brand,
    accessoryType,
    material,
    color,
    size,
  };
}

/**
 * Parses a designation and returns product info with accessory category if detected.
 * @param designation The raw designation text
 * @returns Parsed product information
 */
export function parseDesignationWithAccessory(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const result = createEmptyParsedProductInfo(designation);

  if (!isAccessory(designation)) {
    return result;
  }

  const accessoryInfo = parseAccessoryDesignation(designation);
  let confidence = 0;

  if (accessoryInfo.accessoryType) confidence += 40;
  if (accessoryInfo.brand) confidence += 25;
  if (accessoryInfo.material) confidence += 15;
  if (accessoryInfo.color) confidence += 10;
  if (accessoryInfo.size) confidence += 10;

  const category: ProductCategory = 'accessory';
  const typeName = accessoryInfo.accessoryType
    ? getAccessoryTypeName(accessoryInfo.accessoryType, 'fr')
    : null;

  return {
    ...result,
    parsedBrand: accessoryInfo.brand,
    parsedBrandVariants: accessoryInfo.brand ? [accessoryInfo.brand] : [],
    parsedModel: typeName,
    parsedColor: accessoryInfo.color,
    parsedCategory: category,
    confidence: Math.min(confidence, 100) / 100,
  };
}
