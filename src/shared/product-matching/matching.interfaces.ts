/**
 * Product matching interfaces for OCR product identification.
 * These interfaces define the contract for matching OCR-extracted product info
 * against the product database.
 */

import type { FrameSubType, ProductType } from '../models/product.model';

export type { FrameSubType, ProductType };

/**
 * Method used to match a product.
 */
export type MatchMethod =
  | 'barcode'
  | 'supplierCode'
  | 'manufacturerRef'
  | 'fuzzyDesignation'
  | 'manual';

/**
 * Confidence level of a match result.
 */
export type MatchConfidence = 'high' | 'medium' | 'low' | 'none';

/**
 * Parsed frame size components (eye-bridge-temple format).
 */
export interface IParsedFrameSize {
  readonly eyeSize: number | null;
  readonly bridgeSize: number | null;
  readonly templeLength: number | null;
  readonly raw: string;
}

/**
 * Parsed ophthalmic lens information.
 */
export interface IParsedLensInfo {
  readonly brand: string | null;
  readonly productLine: string | null;
  readonly lensType: LensType | null;
  readonly material: string | null;
  readonly index: string | null;
  readonly treatments: readonly string[];
  readonly tint: string | null;
  readonly sphere: number | null;
  readonly cylinder: number | null;
  readonly axis: number | null;
  readonly addition: number | null;
  readonly diameter: number | null;
}

/**
 * Parsed contact lens information.
 */
export interface IParsedContactLensInfo {
  readonly brand: string | null;
  readonly productLine: string | null;
  readonly lensType: ContactLensType | null;
  readonly replacement: ContactLensReplacement | null;
  readonly material: string | null;
  readonly baseCurve: number | null;
  readonly diameter: number | null;
  readonly power: number | null;
  readonly cylinder: number | null;
  readonly axis: number | null;
  readonly addition: number | null;
  readonly quantity: number | null;
}

/**
 * Parsed accessory information.
 */
export interface IParsedAccessoryInfo {
  readonly brand: string | null;
  readonly accessoryType: AccessoryType | null;
  readonly material: string | null;
  readonly color: string | null;
  readonly size: string | null;
}

/**
 * Parsed safety glasses information.
 */
export interface IParsedSafetyInfo {
  readonly brand: string | null;
  readonly model: string | null;
  readonly safetyStandard: string | null;
  readonly safetyRating: SafetyRating | null;
  readonly protectionType: SafetyProtectionType | null;
  readonly material: string | null;
  readonly color: string | null;
  readonly lensIncluded: boolean;
  readonly prescriptionCapable: boolean;
}

/**
 * Parsed clip-on information.
 */
export interface IParsedClipOnInfo {
  readonly brand: string | null;
  readonly model: string | null;
  readonly clipType: ClipOnType | null;
  readonly polarized: boolean;
  readonly mirrorCoating: boolean;
  readonly tint: string | null;
  readonly color: string | null;
  readonly compatibleSize: string | null;
}

/**
 * Ophthalmic lens type.
 */
export type LensType =
  | 'single_vision'
  | 'progressive'
  | 'bifocal'
  | 'trifocal'
  | 'degressive'
  | 'anti_fatigue';

/**
 * Contact lens type.
 */
export type ContactLensType =
  | 'spherical'
  | 'toric'
  | 'multifocal'
  | 'bifocal'
  | 'rgp'
  | 'scleral'
  | 'ortho_k'
  | 'cosmetic';

/**
 * Contact lens replacement schedule.
 */
export type ContactLensReplacement =
  | 'daily'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'conventional';

/**
 * Accessory type.
 */
export type AccessoryType =
  | 'case'
  | 'pouch'
  | 'cord'
  | 'chain'
  | 'cleaning_spray'
  | 'cleaning_cloth'
  | 'nose_pad'
  | 'temple_tip'
  | 'screw'
  | 'hinge'
  | 'lens_cloth'
  | 'contact_lens_solution'
  | 'contact_lens_case'
  | 'other';

/**
 * Product category detected from designation.
 */
export type ProductCategory =
  | 'optical'
  | 'sun'
  | 'sport'
  | 'reading'
  | 'safety'
  | 'clip_on'
  | 'ophthalmic_lens'
  | 'contact_lens'
  | 'accessory'
  | 'unknown';

/**
 * Safety glasses protection rating (EN 166 / ANSI Z87.1).
 */
export type SafetyRating =
  | 'EN166_F'   // Low energy impact (45m/s)
  | 'EN166_B'   // Medium energy impact (120m/s)
  | 'EN166_A'   // High energy impact (190m/s)
  | 'ANSI_Z87'  // Basic impact
  | 'ANSI_Z87+' // High impact
  | 'other';

/**
 * Safety glasses protection type.
 */
export type SafetyProtectionType =
  | 'impact'
  | 'chemical'
  | 'dust'
  | 'laser'
  | 'welding'
  | 'uv'
  | 'multi';

/**
 * Clip-on attachment type.
 */
export type ClipOnType =
  | 'clip'
  | 'magnetic'
  | 'flip_up'
  | 'slide_on';

/**
 * Result of parsing an OCR line's product information.
 * Contains extracted components from the designation text.
 */
export interface IParsedProductInfo {
  readonly rawDesignation: string;
  readonly barcode: string | null;
  readonly reference: string | null;

  readonly parsedBrand: string | null;
  readonly parsedBrandVariants: readonly string[];
  readonly parsedModel: string | null;
  readonly parsedColor: string | null;
  readonly parsedColorCode: string | null;
  readonly parsedSize: string | null;
  readonly parsedFrameSize: IParsedFrameSize | null;
  readonly parsedCategory: ProductCategory;
  readonly parsedFinish: string | null;

  readonly confidence: number;
}

/**
 * A suggested product match with scoring details.
 */
export interface IProductSuggestion {
  readonly productId: string;
  readonly score: number;
  readonly reason: string;
}

/**
 * Complete result of matching an OCR line against the product database.
 */
export interface IProductMatchResult {
  readonly method: MatchMethod;
  readonly confidence: MatchConfidence;
  readonly score: number;

  readonly matchedProductId: string | null;
  readonly matchedBrandId: string | null;
  readonly matchedModelId: string | null;

  readonly suggestions: readonly IProductSuggestion[];
}

/**
 * Creates an empty parsed product info with default values.
 * @param rawDesignation The original designation text
 * @returns A new empty IParsedProductInfo
 */
export function createEmptyParsedProductInfo(
  rawDesignation: string
): IParsedProductInfo {
  return {
    rawDesignation,
    barcode: null,
    reference: null,
    parsedBrand: null,
    parsedBrandVariants: [],
    parsedModel: null,
    parsedColor: null,
    parsedColorCode: null,
    parsedSize: null,
    parsedFrameSize: null,
    parsedCategory: 'unknown',
    parsedFinish: null,
    confidence: 0,
  };
}

/**
 * Creates a "no match" result.
 * @returns A default IProductMatchResult with no match
 */
export function createNoMatchResult(): IProductMatchResult {
  return {
    method: 'manual',
    confidence: 'none',
    score: 0,
    matchedProductId: null,
    matchedBrandId: null,
    matchedModelId: null,
    suggestions: [],
  };
}

/**
 * Converts a numeric score (0-100) to a confidence level.
 * @param score The numeric score from 0 to 100
 * @returns The corresponding confidence level
 */
export function scoreToConfidence(score: number): MatchConfidence {
  if (score >= 90) return 'high';
  if (score >= 70) return 'medium';
  if (score >= 50) return 'low';
  return 'none';
}

/**
 * Converts a ProductCategory to a ProductType.
 * Used to infer product type from OCR-detected category.
 * With Option C, all frame categories map to 'frame'.
 * @param category The detected category from OCR parsing
 * @returns The corresponding ProductType, or null if unknown
 */
export function categoryToProductType(
  category: ProductCategory
): ProductType | null {
  switch (category) {
    case 'optical':
    case 'reading':
    case 'sun':
    case 'sport':
    case 'safety':
      return 'frame';
    case 'clip_on':
      return 'clip_on';
    case 'ophthalmic_lens':
      return 'lens';
    case 'contact_lens':
      return 'contact_lens';
    case 'accessory':
      return 'accessory';
    case 'unknown':
    default:
      return null;
  }
}

/**
 * Converts a ProductCategory to a FrameSubType.
 * Used to determine the frame sub-type from OCR-detected category.
 * @param category The detected category from OCR parsing
 * @returns The corresponding FrameSubType, or null if not a frame
 */
export function categoryToFrameSubType(
  category: ProductCategory
): FrameSubType | null {
  switch (category) {
    case 'optical':
      return 'optical';
    case 'sun':
      return 'sun';
    case 'safety':
      return 'safety';
    case 'sport':
      return 'sport';
    case 'reading':
      return 'reading';
    default:
      return null;
  }
}

/**
 * Frame finish codes (ISO 12870:2024 compliant).
 * Common finishes used by major manufacturers.
 */
export const FRAME_FINISH_CODES: ReadonlyMap<string, string> = new Map([
  ['HA', 'Havana'],
  ['BR', 'Brown'],
  ['BK', 'Black'],
  ['GD', 'Gold'],
  ['SL', 'Silver'],
  ['GN', 'Gunmetal'],
  ['BL', 'Blue'],
  ['RD', 'Red'],
  ['GR', 'Green'],
  ['PK', 'Pink'],
  ['WH', 'White'],
  ['CL', 'Clear'],
  ['MT', 'Matte'],
  ['SH', 'Shiny'],
  ['ST', 'Satin'],
  ['PO', 'Polished'],
  ['BU', 'Brushed'],
  ['GL', 'Gloss'],
  ['TO', 'Tortoise'],
  ['DM', 'Demi'],
  ['HN', 'Honey'],
  ['AM', 'Amber'],
  ['CR', 'Crystal'],
  ['TR', 'Transparent'],
  ['OP', 'Opal'],
  ['PE', 'Pearl'],
  ['RG', 'Rose Gold'],
  ['PL', 'Platinum'],
  ['AN', 'Antique'],
  ['VI', 'Vintage'],
]);

/**
 * Decodes a frame finish code to its full name.
 * @param code The 2-letter finish code (e.g., 'HA')
 * @returns The full finish name (e.g., 'Havana') or null if not found
 */
export function decodeFrameFinish(code: string): string | null {
  if (!code) return null;
  return FRAME_FINISH_CODES.get(code.toUpperCase()) ?? null;
}
