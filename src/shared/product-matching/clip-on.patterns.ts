/**
 * Regex patterns for clip-on and over-glasses product matching.
 * Covers magnetic clips, flip-ups, and over-glasses sunglasses.
 */

import type { ClipOnType } from './matching.interfaces';

/**
 * Clip-on brand patterns.
 */
export const CLIP_ON_BRAND_PATTERNS: readonly RegExp[] = [
  // Major frame brands with clip-on lines
  /\b(RAY[\s-]?BAN)\b/i,
  /\b(OAKLEY)\b/i,
  /\b(CARRERA)\b/i,
  /\b(POLAROID)\b/i,
  /\b(PERSOL)\b/i,
  /\b(EMPORIO\s?ARMANI|EA)\b/i,
  /\b(PRADA)\b/i,
  /\b(VERSACE)\b/i,
  // Specialized clip-on manufacturers
  /\b(COCOONS)\b/i,
  /\b(FITOVERS?|FIT\s?OVERS?)\b/i,
  /\b(SOLAR\s?SHIELD|SOLARSHIELD)\b/i,
  /\b(HAVEN)\b/i,
  /\b(DIOPTICS)\b/i,
  /\b(VISTANA)\b/i,
  /\b(EYEWEAR\s?ACCESSORIES)\b/i,
  /\b(IDEAL|I-CLIP)\b/i,
  /\b(CLINIC)\b/i,
  /\b(SILHOUETTE)\b/i,
  // Generic/optical chains
  /\b(KRYS|AFFLELOU|ALAIN\s?AFFLELOU)\b/i,
  /\b(OPTIC\s?2000|OPTICAL\s?CENTER)\b/i,
  /\b(GRANDVISION|GENERALE\s?D['']?OPTIQUE)\b/i,
];

/**
 * Clip-on model patterns.
 */
export const CLIP_ON_MODEL_PATTERNS: readonly RegExp[] = [
  /\b(CLIP[\s-]?ON|CLIPON)\b/i,
  /\b(MAGNET(?:IC)?[\s-]?CLIP)\b/i,
  /\b(FLIP[\s-]?UP|FLIPUP)\b/i,
  /\b(SUR[\s-]?LUNETTES?|SURLUNETTES?)\b/i,
  /\b(OVER[\s-]?GLASSES|OVERGLASSES)\b/i,
  /\b(COVER[\s-]?GLASSES|COVERGLASSES)\b/i,
  /\b(FIT[\s-]?OVER|FITOVER)\b/i,
  /\b(SOLAR[\s-]?CLIP)\b/i,
  /\b(SHADE[\s-]?CONTROL)\b/i,
];

/**
 * Clip-on type patterns.
 */
export interface IClipOnTypePattern {
  readonly pattern: RegExp;
  readonly type: ClipOnType;
}

export const CLIP_ON_TYPE_PATTERNS: readonly IClipOnTypePattern[] = [
  // Magnetic attachment
  { pattern: /\b(MAGN[ÉE]TIQUE|MAGNETIC|AIMANT[ÉE]?)\b/i, type: 'magnetic' },
  { pattern: /\b(MAG[\s-]?CLIP|MAGCLIP)\b/i, type: 'magnetic' },
  // Flip-up mechanism
  { pattern: /\b(FLIP[\s-]?UP|FLIPUP|RELEVABLE)\b/i, type: 'flip_up' },
  { pattern: /\b(BASCULANT|PIVOTANT)\b/i, type: 'flip_up' },
  // Slide-on
  { pattern: /\b(SLIDE[\s-]?ON|SLIDEON|GLISSANT)\b/i, type: 'slide_on' },
  // Standard clip
  { pattern: /\b(CLIP[\s-]?ON|CLIPON|CLIP)\b/i, type: 'clip' },
  { pattern: /\b(PINCE|CLAMP)\b/i, type: 'clip' },
];

/**
 * Clip-on category keywords.
 */
export const CLIP_ON_KEYWORDS: readonly RegExp[] = [
  /\b(CLIP[\s-]?ON|CLIPON)\b/i,
  /\b(SUR[\s-]?LUNETTES?|SURLUNETTES?)\b/i,
  /\b(OVER[\s-]?GLASSES|OVERGLASSES)\b/i,
  /\b(FIT[\s-]?OVER|FITOVER)\b/i,
  /\b(COVER[\s-]?(?:GLASSES|SPECS?))\b/i,
  /\b(MAGN[ÉE]TIQUE\s?SOLAIRE)\b/i,
  /\b(FLIP[\s-]?UP|FLIPUP)\b/i,
  /\b(SOLAR[\s-]?CLIP)\b/i,
  /\b(ACCESSOIRE\s?SOLAIRE)\b/i,
];

/**
 * Polarization patterns.
 */
export const POLARIZED_PATTERNS: readonly RegExp[] = [
  /\b(POLARIS[ÉE]|POLARIZED?|POLAR)\b/i,
  /\b(POL|P)\b(?=[\s-]?(?:LENS|VERRE|GLASS))/i,
];

/**
 * Mirror coating patterns.
 */
export const MIRROR_PATTERNS: readonly RegExp[] = [
  /\b(MIROIR[ÉE]?|MIRROR(?:ED)?)\b/i,
  /\b(FLASH|REVO)\b/i,
  /\b(REFL[ÉE]CHISSANT|REFLECTIVE)\b/i,
];

/**
 * Lens tint patterns for clip-ons.
 */
export const CLIP_ON_TINT_PATTERNS: readonly RegExp[] = [
  /\b(GRIS|GR[AE]Y|SMOKE|FUM[ÉE])\b/i,
  /\b(MARRON|BROWN|BRN|BRUN)\b/i,
  /\b(VERT|GREEN|GRN|G-?15)\b/i,
  /\b(BLEU|BLUE|BLU)\b/i,
  /\b(JAUNE|YELLOW|AMBER)\b/i,
  /\b(ROSE|PINK)\b/i,
  /\b(ORANGE)\b/i,
  /\b(ROUGE|RED)\b/i,
  /\b(VIOLET|PURPLE)\b/i,
  /\b(GRADIENT|D[ÉE]GRAD[ÉE])\b/i,
];

/**
 * Color patterns for clip-on frames.
 */
export const CLIP_ON_COLOR_PATTERNS: readonly RegExp[] = [
  /\b(NOIR|BLACK|BLK)\b/i,
  /\b(ARGENT[ÉE]?|SILVER|SLV)\b/i,
  /\b(OR|GOLD|GLD|DOR[ÉE])\b/i,
  /\b(GUN(?:METAL)?|GRIS\s?M[ÉE]TAL)\b/i,
  /\b(BRONZE)\b/i,
  /\b(CUIVRE|COPPER)\b/i,
  /\b(ROSE\s?GOLD|OR\s?ROSE)\b/i,
  /\b(TITANE|TITANIUM)\b/i,
];

/**
 * Size compatibility patterns.
 */
export const CLIP_ON_SIZE_PATTERNS: readonly RegExp[] = [
  // Frame size ranges
  /\b(PETIT|SMALL|S)\b/i,
  /\b(MOYEN|MEDIUM|M)\b/i,
  /\b(GRAND|LARGE|L)\b/i,
  /\b(EXTRA[\s-]?LARGE|XL)\b/i,
  // Specific dimensions
  /\b(\d{2})[\s-]?(\d{2})[\s-]?(\d{2,3})\b/, // Eye-Bridge-Temple
  /\b(\d{2})[\s-]?MM?\b/i, // Width in mm
  /\b(UNIVERSEL|UNIVERSAL)\b/i,
  // Shape compatibility
  /\b(RECTANGLE|CARR[ÉE]|SQUARE|ROND|ROUND|OVAL[E]?|AVIATOR|PILOTE|PAPILLON|CAT[\s-]?EYE)\b/i,
];
