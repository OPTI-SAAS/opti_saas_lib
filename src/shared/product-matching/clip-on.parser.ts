/**
 * Parser for clip-on and over-glasses designations.
 * Extracts brand, type, polarization, tint, and compatibility info.
 */

import type {
  IParsedClipOnInfo,
  IParsedProductInfo,
  ClipOnType,
  ProductCategory,
} from './matching.interfaces';
import { createEmptyParsedProductInfo } from './matching.interfaces';
import {
  CLIP_ON_BRAND_PATTERNS,
  CLIP_ON_MODEL_PATTERNS,
  CLIP_ON_TYPE_PATTERNS,
  CLIP_ON_KEYWORDS,
  POLARIZED_PATTERNS,
  MIRROR_PATTERNS,
  // CLIP_ON_TINT_PATTERNS, CLIP_ON_COLOR_PATTERNS, CLIP_ON_SIZE_PATTERNS available but not yet used
} from './clip-on.patterns';

/**
 * Creates an empty parsed clip-on info with default values.
 * @returns A new empty IParsedClipOnInfo
 */
export function createEmptyClipOnInfo(): IParsedClipOnInfo {
  return {
    brand: null,
    model: null,
    clipType: null,
    polarized: false,
    mirrorCoating: false,
    tint: null,
    color: null,
    compatibleSize: null,
  };
}

/**
 * Extracts clip-on brand from designation.
 * @param text The designation text
 * @returns Extracted brand name or null
 */
function extractClipOnBrand(text: string): string | null {
  const upperText = text.toUpperCase();

  const brandMap: Record<string, string> = {
    'RAY-BAN': 'Ray-Ban',
    'RAY BAN': 'Ray-Ban',
    RAYBAN: 'Ray-Ban',
    OAKLEY: 'Oakley',
    CARRERA: 'Carrera',
    POLAROID: 'Polaroid',
    PERSOL: 'Persol',
    'EMPORIO ARMANI': 'Emporio Armani',
    EA: 'Emporio Armani',
    PRADA: 'Prada',
    VERSACE: 'Versace',
    COCOONS: 'Cocoons',
    FITOVERS: 'Fitovers',
    'FIT OVERS': 'Fitovers',
    'SOLAR SHIELD': 'Solar Shield',
    SOLARSHIELD: 'Solar Shield',
    HAVEN: 'Haven',
    DIOPTICS: 'Dioptics',
    VISTANA: 'Vistana',
    'I-CLIP': 'I-Clip',
    IDEAL: 'Ideal',
    CLINIC: 'Clinic',
    SILHOUETTE: 'Silhouette',
    KRYS: 'Krys',
    AFFLELOU: 'Alain Afflelou',
    'ALAIN AFFLELOU': 'Alain Afflelou',
    'OPTIC 2000': 'Optic 2000',
    'OPTICAL CENTER': 'Optical Center',
    GRANDVISION: 'GrandVision',
  };

  for (const pattern of CLIP_ON_BRAND_PATTERNS) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/[\s-]+/g, ' ').trim();
      return brandMap[key] ||
             brandMap[key.replace(/ /g, '-')] ||
             brandMap[key.replace(/ /g, '')] ||
             key;
    }
  }

  return null;
}

/**
 * Extracts clip-on model from designation.
 * @param text The designation text
 * @returns Extracted model name or null
 */
function extractClipOnModel(text: string): string | null {
  const upperText = text.toUpperCase();

  const modelMap: Record<string, string> = {
    'CLIP-ON': 'Clip-on',
    CLIPON: 'Clip-on',
    'CLIP ON': 'Clip-on',
    'MAGNETIC CLIP': 'Magnetic Clip',
    'MAGNET CLIP': 'Magnetic Clip',
    'FLIP-UP': 'Flip-up',
    'FLIP UP': 'Flip-up',
    FLIPUP: 'Flip-up',
    'SUR-LUNETTES': 'Sur-lunettes',
    SURLUNETTES: 'Sur-lunettes',
    'OVER-GLASSES': 'Over-glasses',
    OVERGLASSES: 'Over-glasses',
    'COVER-GLASSES': 'Cover-glasses',
    COVERGLASSES: 'Cover-glasses',
    'FIT-OVER': 'Fit-over',
    'FIT OVER': 'Fit-over',
    FITOVER: 'Fit-over',
    'SOLAR CLIP': 'Solar Clip',
  };

  for (const pattern of CLIP_ON_MODEL_PATTERNS) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/[\s]+/g, ' ').trim();
      return modelMap[key] ||
             modelMap[key.replace(/ /g, '-')] ||
             modelMap[key.replace(/-/g, ' ')] ||
             key;
    }
  }

  return null;
}

/**
 * Detects clip-on type from designation.
 * @param text The designation text
 * @returns Detected clip-on type or null
 */
function detectClipOnType(text: string): ClipOnType | null {
  const upperText = text.toUpperCase();

  for (const { pattern, type } of CLIP_ON_TYPE_PATTERNS) {
    if (pattern.test(upperText)) {
      return type;
    }
  }

  return 'clip';
}

/**
 * Checks if polarized from designation.
 * @param text The designation text
 * @returns True if polarized
 */
function checkPolarized(text: string): boolean {
  const upperText = text.toUpperCase();

  for (const pattern of POLARIZED_PATTERNS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks for mirror coating from designation.
 * @param text The designation text
 * @returns True if mirror coating
 */
function checkMirrorCoating(text: string): boolean {
  const upperText = text.toUpperCase();

  for (const pattern of MIRROR_PATTERNS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts lens tint from designation.
 * @param text The designation text
 * @returns Extracted tint or null
 */
function extractClipOnTint(text: string): string | null {
  const upperText = text.toUpperCase();

  const tintMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(GRIS|GR[AE]Y|SMOKE|FUM[ÉE])\b/i, name: 'Gris' },
    { pattern: /\b(MARRON|BROWN|BRN|BRUN)\b/i, name: 'Marron' },
    { pattern: /\b(G[\s-]?15)\b/i, name: 'G-15' },
    { pattern: /\b(VERT|GREEN|GRN)\b/i, name: 'Vert' },
    { pattern: /\b(BLEU|BLUE|BLU)\b/i, name: 'Bleu' },
    { pattern: /\b(JAUNE|YELLOW|AMBER)\b/i, name: 'Jaune' },
    { pattern: /\b(ROSE|PINK)\b/i, name: 'Rose' },
    { pattern: /\b(ORANGE)\b/i, name: 'Orange' },
    { pattern: /\b(ROUGE|RED)\b/i, name: 'Rouge' },
    { pattern: /\b(VIOLET|PURPLE)\b/i, name: 'Violet' },
    { pattern: /\b(GRADIENT|D[ÉE]GRAD[ÉE])\b/i, name: 'Dégradé' },
  ];

  for (const { pattern, name } of tintMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Extracts frame color from designation.
 * @param text The designation text
 * @returns Extracted color or null
 */
function extractClipOnColor(text: string): string | null {
  const upperText = text.toUpperCase();

  const colorMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(NOIR|BLACK|BLK)\b/i, name: 'Noir' },
    { pattern: /\b(ARGENT[ÉE]?|SILVER|SLV)\b/i, name: 'Argent' },
    { pattern: /\b(OR|GOLD|GLD|DOR[ÉE])\b/i, name: 'Or' },
    { pattern: /\b(GUN(?:METAL)?|GRIS\s?M[ÉE]TAL)\b/i, name: 'Gunmetal' },
    { pattern: /\b(BRONZE)\b/i, name: 'Bronze' },
    { pattern: /\b(CUIVRE|COPPER)\b/i, name: 'Cuivre' },
    { pattern: /\b(ROSE\s?GOLD|OR\s?ROSE)\b/i, name: 'Or rose' },
    { pattern: /\b(TITANE|TITANIUM)\b/i, name: 'Titane' },
  ];

  for (const { pattern, name } of colorMap) {
    if (pattern.test(upperText)) {
      return name;
    }
  }

  return null;
}

/**
 * Extracts compatible size from designation.
 * @param text The designation text
 * @returns Extracted compatible size or null
 */
function extractCompatibleSize(text: string): string | null {
  const upperText = text.toUpperCase();

  if (/\b(PETIT|SMALL|S)\b/i.test(upperText)) return 'S';
  if (/\b(MOYEN|MEDIUM|M)\b/i.test(upperText)) return 'M';
  if (/\b(GRAND|LARGE|L)\b/i.test(upperText)) return 'L';
  if (/\b(EXTRA[\s-]?LARGE|XL)\b/i.test(upperText)) return 'XL';
  if (/\b(UNIVERSEL|UNIVERSAL)\b/i.test(upperText)) return 'Universel';

  const sizeMatch = text.match(/\b(\d{2})[\s-]?(\d{2})[\s-]?(\d{2,3})\b/);
  if (sizeMatch) {
    return `${sizeMatch[1]}-${sizeMatch[2]}-${sizeMatch[3]}`;
  }

  const widthMatch = text.match(/\b(\d{2,3})[\s-]?MM?\b/i);
  if (widthMatch) {
    return `${widthMatch[1]}mm`;
  }

  return null;
}

/**
 * Detects if the designation is for a clip-on or over-glasses.
 * @param text The designation text
 * @returns True if clip-on detected
 */
export function isClipOn(text: string): boolean {
  const upperText = text.toUpperCase();

  for (const pattern of CLIP_ON_KEYWORDS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  for (const pattern of CLIP_ON_MODEL_PATTERNS) {
    if (pattern.test(upperText)) {
      return true;
    }
  }

  return false;
}

/**
 * Parses a clip-on designation.
 * @param designation The raw designation text
 * @returns Parsed clip-on information
 */
export function parseClipOnDesignation(designation: string): IParsedClipOnInfo {
  if (!designation) {
    return createEmptyClipOnInfo();
  }

  const brand = extractClipOnBrand(designation);
  const model = extractClipOnModel(designation);
  const clipType = detectClipOnType(designation);
  const polarized = checkPolarized(designation);
  const mirrorCoating = checkMirrorCoating(designation);
  const tint = extractClipOnTint(designation);
  const color = extractClipOnColor(designation);
  const compatibleSize = extractCompatibleSize(designation);

  return {
    brand,
    model,
    clipType,
    polarized,
    mirrorCoating,
    tint,
    color,
    compatibleSize,
  };
}

/**
 * Parses a designation and returns product info with clip-on category if detected.
 * @param designation The raw designation text
 * @returns Parsed product information
 */
export function parseDesignationWithClipOn(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const result = createEmptyParsedProductInfo(designation);

  if (!isClipOn(designation)) {
    return result;
  }

  const clipOnInfo = parseClipOnDesignation(designation);
  let confidence = 0;

  if (clipOnInfo.brand) confidence += 25;
  if (clipOnInfo.model) confidence += 20;
  if (clipOnInfo.clipType) confidence += 20;
  if (clipOnInfo.polarized) confidence += 10;
  if (clipOnInfo.mirrorCoating) confidence += 5;
  if (clipOnInfo.tint) confidence += 10;
  if (clipOnInfo.color) confidence += 5;
  if (clipOnInfo.compatibleSize) confidence += 5;

  const category: ProductCategory = 'clip_on';

  return {
    ...result,
    parsedBrand: clipOnInfo.brand,
    parsedBrandVariants: clipOnInfo.brand ? [clipOnInfo.brand] : [],
    parsedModel: clipOnInfo.model,
    parsedColor: clipOnInfo.color || clipOnInfo.tint,
    parsedCategory: category,
    confidence: Math.min(confidence, 100) / 100,
  };
}
