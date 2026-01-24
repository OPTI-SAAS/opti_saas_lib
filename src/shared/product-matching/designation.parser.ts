/**
 * Designation parsing utilities for extracting product info from text.
 * Parses brand, model, color, and size from OCR-extracted designations.
 */

import {
  createEmptyParsedProductInfo,
  decodeFrameFinish,
  IParsedProductInfo,
  IParsedFrameSize,
  ProductCategory,
} from './matching.interfaces';
import {
  FRAME_PATTERNS,
  BRAND_PATTERNS_MAP,
  extractBrandWithVariants,
  extractModelParts,
  detectCategory,
} from './frame.patterns';
import { LENS_PATTERNS } from './lens.patterns';
import { CONTACT_LENS_PATTERNS } from './contact-lens.patterns';

/**
 * Normalizes a brand name for comparison (uppercase, no special chars).
 * @param name The brand name to normalize
 * @returns Normalized brand name
 */
export function normalizeBrandName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/[\s\-_\.]/g, '')
    .replace(/&/g, 'AND')
    .trim();
}

/**
 * Normalizes a model name for comparison.
 * @param name The model name to normalize
 * @returns Normalized model name
 */
export function normalizeModelName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/[\s\-_\.\/]/g, '')
    .trim();
}

/**
 * Calculates the Levenshtein distance between two strings.
 * @param a First string
 * @param b Second string
 * @returns The edit distance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates similarity between two strings (0-1).
 * Uses normalized Levenshtein distance.
 * @param a First string
 * @param b Second string
 * @returns Similarity score from 0 (no match) to 1 (exact match)
 */
export function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;

  const normalizedA = normalizeBrandName(a);
  const normalizedB = normalizeBrandName(b);

  if (normalizedA === normalizedB) return 1;

  const maxLen = Math.max(normalizedA.length, normalizedB.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(normalizedA, normalizedB);
  return 1 - distance / maxLen;
}

/**
 * Calculates best similarity between a string and a list of variants.
 * @param searchTerm The term to search for
 * @param variants List of possible variants to match against
 * @returns Best similarity score from 0 to 1
 */
export function calculateBestSimilarity(
  searchTerm: string,
  variants: readonly string[]
): number {
  if (!searchTerm || variants.length === 0) return 0;

  let bestScore = 0;
  const normalizedSearch = normalizeBrandName(searchTerm);

  for (const variant of variants) {
    const normalizedVariant = normalizeBrandName(variant);

    if (normalizedSearch === normalizedVariant) return 1;

    if (
      normalizedSearch.includes(normalizedVariant) ||
      normalizedVariant.includes(normalizedSearch)
    ) {
      const containScore =
        Math.min(normalizedSearch.length, normalizedVariant.length) /
        Math.max(normalizedSearch.length, normalizedVariant.length);
      bestScore = Math.max(bestScore, containScore + 0.1);
    }

    const similarity = calculateSimilarity(searchTerm, variant);
    bestScore = Math.max(bestScore, similarity);
  }

  return Math.min(bestScore, 1);
}

/**
 * Extracts a potential barcode from the designation text.
 * Uses contextual filtering to avoid false positives from dates, lots, phone numbers.
 * Only matches valid barcode lengths: 8 (EAN-8/UPC-E), 12 (UPC-A), 13 (EAN-13), 14 (EAN-14).
 * @param text The designation text
 * @returns Extracted barcode or null
 */
function extractBarcode(text: string): string | null {
  const barcodePattern = /\b(\d{8}|\d{12}|\d{13}|\d{14})\b/;
  const match = text.match(barcodePattern);

  if (!match || match.index === undefined) return null;

  const candidate = match[1];
  const beforeMatch = text
    .substring(Math.max(0, match.index - 15), match.index)
    .toLowerCase();

  const excludeKeywords =
    /(?:n[°o]|lot|tel|fax|date|facture|bl|bc|ref|id|num)[\s:\.]*$/i;
  if (excludeKeywords.test(beforeMatch)) {
    return null;
  }

  return candidate;
}

/**
 * Extracts optical frame size from designation (e.g., "52-18-145").
 * @param text The designation text
 * @returns Extracted size string or null
 */
function extractFrameSize(text: string): string | null {
  const sizePattern = /\b(\d{2})[\s\-\/](\d{2})[\s\-\/](\d{3})\b/;
  const match = text.match(sizePattern);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

/**
 * Parses frame size into structured components.
 * Handles multiple formats: eye-bridge-temple, eye-bridge, standalone.
 * @param text The designation text
 * @returns Parsed frame size or null
 */
function parseFrameSizeComponents(text: string): IParsedFrameSize | null {
  const fullPattern = /\b(\d{2})[\s\-\/](\d{2})[\s\-\/](\d{3})\b/;
  const fullMatch = text.match(fullPattern);
  if (fullMatch) {
    return {
      eyeSize: parseInt(fullMatch[1], 10),
      bridgeSize: parseInt(fullMatch[2], 10),
      templeLength: parseInt(fullMatch[3], 10),
      raw: `${fullMatch[1]}-${fullMatch[2]}-${fullMatch[3]}`,
    };
  }

  const safiloPattern = /\.(\d{2})\./;
  const safiloMatch = text.match(safiloPattern);
  if (safiloMatch) {
    return {
      eyeSize: parseInt(safiloMatch[1], 10),
      bridgeSize: null,
      templeLength: null,
      raw: safiloMatch[1],
    };
  }

  const eyeBridgePattern = /\b(\d{2})[\s\-\/](\d{2})\b/;
  const eyeBridgeMatch = text.match(eyeBridgePattern);
  if (eyeBridgeMatch) {
    const eye = parseInt(eyeBridgeMatch[1], 10);
    const bridge = parseInt(eyeBridgeMatch[2], 10);
    if (eye >= 40 && eye <= 65 && bridge >= 12 && bridge <= 24) {
      return {
        eyeSize: eye,
        bridgeSize: bridge,
        templeLength: null,
        raw: `${eyeBridgeMatch[1]}-${eyeBridgeMatch[2]}`,
      };
    }
  }

  const mmPattern = /\b(\d{2})\s?mm\b/i;
  const mmMatch = text.match(mmPattern);
  if (mmMatch) {
    const size = parseInt(mmMatch[1], 10);
    if (size >= 40 && size <= 65) {
      return {
        eyeSize: size,
        bridgeSize: null,
        templeLength: null,
        raw: `${mmMatch[1]}mm`,
      };
    }
  }

  return null;
}

/**
 * Extracts reference code from designation.
 * @param text The designation text
 * @returns Extracted reference or null
 */
function extractReference(text: string): string | null {
  const refPatterns = [
    /\b([A-Z]{2}\d{4})\b/,
    /\b([A-Z]{1,3}[\-\s]?\d{3,5})\b/,
    /\b(0[A-Z]{2}\d{4})\b/,
  ];

  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Attempts to extract brand from designation using known patterns.
 * Returns both the extracted brand and all known variants for fuzzy matching.
 * @param text The designation text (uppercase)
 * @returns Object with brand and variants, or null
 */
function extractBrand(
  text: string
): { brand: string; variants: readonly string[] } | null {
  const brandWithVariants = extractBrandWithVariants(text);
  if (brandWithVariants) {
    return {
      brand: brandWithVariants.canonical,
      variants: brandWithVariants.variants,
    };
  }

  const upperText = text.toUpperCase();

  for (const pattern of FRAME_PATTERNS.brandPatterns) {
    if (pattern.test(upperText)) {
      const match = upperText.match(pattern);
      if (match) {
        const extracted = match[1] || match[0];
        return { brand: extracted, variants: [extracted] };
      }
    }
  }

  for (const pattern of LENS_PATTERNS.brandPatterns) {
    if (pattern.test(upperText)) {
      const match = upperText.match(pattern);
      if (match) {
        const extracted = match[1] || match[0];
        return { brand: extracted, variants: [extracted] };
      }
    }
  }

  for (const pattern of CONTACT_LENS_PATTERNS.brandPatterns) {
    if (pattern.test(upperText)) {
      const match = upperText.match(pattern);
      if (match) {
        const extracted = match[1] || match[0];
        return { brand: extracted, variants: [extracted] };
      }
    }
  }

  return null;
}

/**
 * Attempts to extract model from designation.
 * Uses manufacturer-specific formats first, then generic patterns.
 * @param text The designation text
 * @param brand The extracted brand (if any)
 * @returns Extracted model or null
 */
function extractModel(text: string, brand: string | null): string | null {
  const upperText = text.toUpperCase();

  const modelParts = extractModelParts(text);
  if (modelParts) {
    return modelParts.model;
  }

  for (const pattern of FRAME_PATTERNS.modelPatterns) {
    const match = upperText.match(pattern);
    if (match) return match[1] || match[0];
  }

  if (brand) {
    const afterBrand = upperText.split(normalizeBrandName(brand))[1];
    if (afterBrand) {
      const modelMatch = afterBrand.trim().match(/^([A-Z0-9\-\/]+)/);
      if (modelMatch && modelMatch[1].length >= 3) {
        return modelMatch[1];
      }
    }
  }

  return null;
}

/**
 * Attempts to extract color from designation.
 * Uses contextual filtering to avoid false positives from prices.
 * @param text The designation text
 * @returns Extracted color name or null
 */
function extractColor(text: string): string | null {
  for (const pattern of FRAME_PATTERNS.colorPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (/^\d{3}$/.test(match[0])) continue;
      return match[0];
    }
  }

  return null;
}

/**
 * Extracts color code from designation (3-digit manufacturer codes).
 * @param text The designation text
 * @returns Extracted color code or null
 */
function extractColorCode(text: string): string | null {
  const modelParts = extractModelParts(text);
  if (modelParts?.colorCode) {
    return modelParts.colorCode;
  }

  const safiloPattern = /\.(\d{3})\./;
  const safiloMatch = text.match(safiloPattern);
  if (safiloMatch) {
    return safiloMatch[1];
  }

  const luxotticaPattern = /\b(\d{3})\/\d{2,3}\b/;
  const luxotticaMatch = text.match(luxotticaPattern);
  if (luxotticaMatch) {
    return luxotticaMatch[1];
  }

  const genericPattern = /[\.\-](\d{3})(?:[\.\-]|$)/;
  const genericMatch = text.match(genericPattern);
  if (genericMatch) {
    return genericMatch[1];
  }

  return null;
}

/**
 * Extracts frame finish code from designation.
 * Looks for 2-letter codes at the end of Safilo format or common finish patterns.
 * @param text The designation text
 * @returns Extracted finish name or null
 */
function extractFinish(text: string): string | null {
  const safiloFinishPattern = /\.([A-Z]{2})(?:\s|$)/i;
  const safiloMatch = text.match(safiloFinishPattern);
  if (safiloMatch) {
    const decoded = decodeFrameFinish(safiloMatch[1]);
    if (decoded) return decoded;
  }

  for (const pattern of FRAME_PATTERNS.colorFinishPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Parses a product designation to extract structured information.
 * This is a pure function - no external dependencies.
 * @param designation The raw designation text from OCR
 * @returns Parsed product information with confidence score
 */
export function parseDesignation(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const result = createEmptyParsedProductInfo(designation);
  let confidence = 0;

  const barcode = extractBarcode(designation);
  const reference = extractReference(designation);
  const brandResult = extractBrand(designation);
  const brand = brandResult?.brand ?? null;
  const brandVariants = brandResult?.variants ?? [];
  const model = extractModel(designation, brand);
  const color = extractColor(designation);
  const colorCode = extractColorCode(designation);
  const size = extractFrameSize(designation);
  const parsedFrameSize = parseFrameSizeComponents(designation);
  const category = detectCategory(designation);
  const finish = extractFinish(designation);

  if (barcode) {
    confidence += 30;
  }

  if (reference) {
    confidence += 20;
  }

  if (brand) {
    confidence += 25;
  }

  if (model) {
    confidence += 15;
  }

  if (color || colorCode) {
    confidence += 5;
  }

  if (size || parsedFrameSize) {
    confidence += 5;
  }

  confidence = Math.min(confidence, 100);

  return {
    ...result,
    barcode,
    reference,
    parsedBrand: brand,
    parsedBrandVariants: brandVariants,
    parsedModel: model,
    parsedColor: color,
    parsedColorCode: colorCode,
    parsedSize: size,
    parsedFrameSize: parsedFrameSize,
    parsedCategory: category,
    parsedFinish: finish,
    confidence: confidence / 100,
  };
}

/**
 * Parses a designation with enhanced extraction for Safilo format.
 * Safilo format: BRAND MODEL/GENRE/TYPE.COLOR.SIZE.FINISH
 * Example: CH-HER 0298/G/S.807.55.HA
 * @param designation The raw designation text
 * @returns Parsed product information with all extracted fields
 */
export function parseSafiloDesignation(designation: string | null): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const baseResult = parseDesignation(designation);

  const safiloFullPattern =
    /\b(\d{4})\/([A-Z])\/([A-Z])\.(\d{3})\.(\d{2})\.([A-Z]{2})\b/i;
  const fullMatch = designation.match(safiloFullPattern);

  if (fullMatch) {
    const model = fullMatch[1];
    // fullMatch[2] is genre (G=general), fullMatch[6] is finish (HA=havana)
    const type = fullMatch[3];
    const colorCode = fullMatch[4];
    const size = fullMatch[5];
    const finishCode = fullMatch[6];
    const finish = decodeFrameFinish(finishCode) ?? finishCode;

    const category: ProductCategory = type === 'S' ? 'sun' : 'optical';

    return {
      ...baseResult,
      parsedModel: baseResult.parsedModel ?? model,
      parsedColorCode: colorCode,
      parsedSize: size,
      parsedFrameSize: {
        eyeSize: parseInt(size, 10),
        bridgeSize: null,
        templeLength: null,
        raw: size,
      },
      parsedCategory: category,
      parsedFinish: finish,
      confidence: Math.min((baseResult.confidence * 100 + 15) / 100, 1),
    };
  }

  const safiloSimplePattern = /\b(\d{4})\/([A-Z])\/([A-Z])\.(\d{3})\b/i;
  const simpleMatch = designation.match(safiloSimplePattern);

  if (simpleMatch) {
    const model = simpleMatch[1];
    const type = simpleMatch[3];
    const colorCode = simpleMatch[4];

    const category: ProductCategory = type === 'S' ? 'sun' : 'optical';

    return {
      ...baseResult,
      parsedModel: baseResult.parsedModel ?? model,
      parsedColorCode: colorCode,
      parsedCategory: category,
      confidence: Math.min((baseResult.confidence * 100 + 10) / 100, 1),
    };
  }

  // Alternative Safilo dot-only format: BRAND MODEL.COLOR.SIZE.BRIDGE
  // Example: CH-HER 0320.1ED.54.17
  const safiloDotPattern = /\b(\d{4})\.([A-Z0-9]{2,3})\.(\d{2})(?:\.(\d{2}))?\b/i;
  const dotMatch = designation.match(safiloDotPattern);

  if (dotMatch) {
    const model = dotMatch[1];
    const colorCode = dotMatch[2];
    const eyeSize = dotMatch[3];
    const bridgeSize = dotMatch[4] ?? null;

    // For dot-only format, we need to infer the category from context
    // Check if "solaire" or "sun" appears in the designation, otherwise default to optical
    const isSun = /\b(solaire|sun|sol)\b/i.test(designation);
    const category: ProductCategory = isSun ? 'sun' : 'optical';

    return {
      ...baseResult,
      parsedModel: baseResult.parsedModel ?? model,
      parsedColorCode: colorCode,
      parsedFrameSize: {
        eyeSize: parseInt(eyeSize, 10),
        bridgeSize: bridgeSize ? parseInt(bridgeSize, 10) : null,
        templeLength: null,
        raw: bridgeSize ? `${eyeSize}-${bridgeSize}` : eyeSize,
      },
      parsedCategory: category,
      confidence: Math.min((baseResult.confidence * 100 + 10) / 100, 1),
    };
  }

  // Alternative Safilo format with dot-space: MODEL. COLOR.SIZE.BRIDGE
  // Example: CH-CH 0016. 081.52.16 (note the space after first dot)
  const safiloDotSpacePattern = /\b(\d{4})\.\s*([A-Z0-9]{2,3})\.(\d{2})(?:\.(\d{2}))?\b/i;
  const dotSpaceMatch = designation.match(safiloDotSpacePattern);

  if (dotSpaceMatch) {
    const model = dotSpaceMatch[1];
    const colorCode = dotSpaceMatch[2];
    const eyeSize = dotSpaceMatch[3];
    const bridgeSize = dotSpaceMatch[4] ?? null;

    const isSun = /\b(solaire|sun|sol)\b/i.test(designation);
    const category: ProductCategory = isSun ? 'sun' : 'optical';

    return {
      ...baseResult,
      parsedModel: baseResult.parsedModel ?? model,
      parsedColorCode: colorCode,
      parsedFrameSize: {
        eyeSize: parseInt(eyeSize, 10),
        bridgeSize: bridgeSize ? parseInt(bridgeSize, 10) : null,
        templeLength: null,
        raw: bridgeSize ? `${eyeSize}-${bridgeSize}` : eyeSize,
      },
      parsedCategory: category,
      confidence: Math.min((baseResult.confidence * 100 + 10) / 100, 1),
    };
  }

  // Alternative Safilo format with slash: MODEL/G.COLOR.SIZE.BRIDGE
  // Example: CH-HER 0083/G.807.54.16
  const safiloSlashDotPattern = /\b(\d{4})\/([A-Z])\.([A-Z0-9]{2,3})\.(\d{2})(?:\.(\d{2}))?\b/i;
  const slashDotMatch = designation.match(safiloSlashDotPattern);

  if (slashDotMatch) {
    const model = slashDotMatch[1];
    // slashDotMatch[2] is genre (G = general) - not used currently
    const colorCode = slashDotMatch[3];
    const eyeSize = slashDotMatch[4];
    const bridgeSize = slashDotMatch[5] ?? null;

    // Default to optical for this format unless context suggests sun
    const isSun = /\b(solaire|sun|sol)\b/i.test(designation);
    const category: ProductCategory = isSun ? 'sun' : 'optical';

    return {
      ...baseResult,
      parsedModel: baseResult.parsedModel ?? model,
      parsedColorCode: colorCode,
      parsedFrameSize: {
        eyeSize: parseInt(eyeSize, 10),
        bridgeSize: bridgeSize ? parseInt(bridgeSize, 10) : null,
        templeLength: null,
        raw: bridgeSize ? `${eyeSize}-${bridgeSize}` : eyeSize,
      },
      parsedCategory: category,
      confidence: Math.min((baseResult.confidence * 100 + 10) / 100, 1),
    };
  }

  return baseResult;
}

/**
 * Checks if a string matches any of the given patterns.
 * @param text The text to check
 * @param patterns Array of regex patterns
 * @returns True if any pattern matches
 */
export function matchesAnyPattern(text: string, patterns: RegExp[]): boolean {
  const upperText = text.toUpperCase();
  return patterns.some((p) => p.test(upperText));
}

/**
 * Cleans OCR artifacts from a designation string.
 * @param text The raw OCR text
 * @returns Cleaned text
 */
export function cleanOcrArtifacts(text: string): string {
  if (!text) return '';

  return text
    .replace(/[|\\[\]{}]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"');
}

/**
 * Generates all brand name variants for fuzzy matching.
 * Includes: original, normalized, without spaces, with spaces, etc.
 * @param brandName The brand name
 * @returns Array of all variants to try for matching
 */
export function generateBrandVariants(brandName: string): string[] {
  if (!brandName) return [];

  const variants = new Set<string>();
  const upper = brandName.toUpperCase();

  variants.add(brandName);
  variants.add(upper);
  variants.add(upper.replace(/[\s\-]/g, ''));
  variants.add(upper.replace(/[\s\-]/g, ' '));
  variants.add(upper.replace(/[\s\-]/g, '-'));

  for (const [, pattern] of BRAND_PATTERNS_MAP) {
    for (const alias of pattern.aliases) {
      if (
        normalizeBrandName(alias) === normalizeBrandName(brandName) ||
        pattern.pattern.test(brandName)
      ) {
        variants.add(pattern.canonicalName);
        pattern.aliases.forEach((a) => variants.add(a));
        break;
      }
    }
  }

  return Array.from(variants);
}

/**
 * Universal designation parser that auto-detects product type.
 * Checks for lenses, contact lenses, accessories, safety glasses, and clip-ons first,
 * then falls back to frame parsing.
 * @param designation The raw designation text
 * @returns Parsed product information with detected category
 */
export function parseUniversalDesignation(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  // Import detection functions dynamically to avoid circular deps
  // These will be called at runtime
  const { isOphthalmicLens, parseDesignationWithLens } = require('./lens.parser');
  const { isContactLens, parseDesignationWithContactLens } = require('./contact-lens.parser');
  const { isAccessory, parseDesignationWithAccessory } = require('./accessory.parser');
  const { isSafetyGlasses, parseDesignationWithSafety } = require('./safety.parser');
  const { isClipOn, parseDesignationWithClipOn } = require('./clip-on.parser');

  // Try contact lenses first (most specific keywords)
  if (isContactLens(designation)) {
    const result = parseDesignationWithContactLens(designation);
    if (result.confidence > 0.3) {
      return result;
    }
  }

  // Try ophthalmic lenses
  if (isOphthalmicLens(designation)) {
    const result = parseDesignationWithLens(designation);
    if (result.confidence > 0.3) {
      return result;
    }
  }

  // Try safety glasses (before regular frames as they have specific keywords)
  if (isSafetyGlasses(designation)) {
    const result = parseDesignationWithSafety(designation);
    if (result.confidence > 0.3) {
      return result;
    }
  }

  // Try clip-ons (before accessories as they are more specific)
  if (isClipOn(designation)) {
    const result = parseDesignationWithClipOn(designation);
    if (result.confidence > 0.3) {
      return result;
    }
  }

  // Try accessories
  if (isAccessory(designation)) {
    const result = parseDesignationWithAccessory(designation);
    if (result.confidence > 0.3) {
      return result;
    }
  }

  // Default to Safilo/frame parsing
  return parseSafiloDesignation(designation);
}
