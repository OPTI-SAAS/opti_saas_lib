/**
 * Regex patterns for ophthalmic lens product matching.
 * Covers major lens manufacturers and common designation formats.
 */

/**
 * Major lens manufacturer patterns.
 * These are the key players in the ophthalmic lens industry.
 */
const BRAND_PATTERNS: RegExp[] = [
  /\b(ESSILOR|ESS)\b/i,
  /\b(ZEISS|CARL\s?ZEISS)\b/i,
  /\b(HOYA)\b/i,
  /\b(RODENSTOCK|RODEN)\b/i,
  /\b(NIKON)\b/i,
  /\b(SEIKO)\b/i,
  /\b(SHAMIR)\b/i,
  /\b(INDO)\b/i,
  /\b(BBGR)\b/i,
  /\b(TOKAI)\b/i,
];

/**
 * Lens product line/model patterns.
 * Common lens ranges from major manufacturers.
 */
const MODEL_PATTERNS: RegExp[] = [
  /\b(VARILUX|VLX)\b/i,
  /\b(CRIZAL)\b/i,
  /\b(TRANSITIONS?)\b/i,
  /\b(XPERIO)\b/i,
  /\b(EYEZEN)\b/i,
  /\b(STELLEST)\b/i,
  /\b(MYOPILUX)\b/i,
  /\b(PHYSIO)\b/i,
  /\b(PROGRESSIVE|PROG)\b/i,
  /\b(SMARTLIFE)\b/i,
  /\b(DRIVE\s?SAFE)\b/i,
  /\b(PRECISION)\b/i,
  /\b(OFFICE\s?(?:LENS)?)\b/i,
  /\b(DIGITAL)\b/i,
  /\b(SUPERB)\b/i,
  /\b(SERENITY)\b/i,
  /\b(HARMONY)\b/i,
  /\b(LIFESTYLE)\b/i,
  /\b(SUMMIT)\b/i,
  /\b(GLACIER)\b/i,
  /\b(SENSITY)\b/i,
  /\b(PHOTOFUSION)\b/i,
  /\b(ORMA)\b/i,
  /\b(MINERAL)\b/i,
  /\b(AIRWEAR)\b/i,
  /\b(STYLIS)\b/i,
  /\b(LINEIS)\b/i,
];

/**
 * Lens type patterns.
 */
const TYPE_PATTERNS: RegExp[] = [
  /\b(UNIFOCAL|SINGLE\s?VISION|SV)\b/i,
  /\b(PROGRESSI[VF]E?|MULTI\s?FOCAL|PAL)\b/i,
  /\b(BIFOCAL|BI\-?FOCAL)\b/i,
  /\b(TRIFOCAL|TRI\-?FOCAL)\b/i,
  /\b(DEGRESSIVE?|OFFICE|MI\-?DISTANCE)\b/i,
  /\b(ANTI\-?FATIGUE)\b/i,
];

/**
 * Lens material patterns.
 */
const MATERIAL_PATTERNS: RegExp[] = [
  /\b(CR[\s\-]?39|CR39)\b/i,
  /\b(POLY(?:CARBONATE)?|PC)\b/i,
  /\b(TRIVEX)\b/i,
  /\b(MINERAL|VERRE\s?MINÉRAL?)\b/i,
  /\b(HI[\s\-]?INDEX|HAUT\s?INDICE)\b/i,
  /\b(1[\.,][56]\d{0,2})\b/,
  /\b(1[\.,]6[07])\b/,
  /\b(1[\.,]67)\b/,
  /\b(1[\.,]74)\b/,
  /\b(MR[\s\-]?[678])\b/i,
];

/**
 * Lens treatment/coating patterns.
 */
const TREATMENT_PATTERNS: RegExp[] = [
  /\b(ANTI[\s\-]?REFLET|AR|A\.?R\.?)\b/i,
  /\b(ANTI[\s\-]?RAYURES?|SCRATCH)\b/i,
  /\b(ANTI[\s\-]?STATIQUE)\b/i,
  /\b(HYDROPHOBE)\b/i,
  /\b(OLÉOPHOBE)\b/i,
  /\b(ANTI[\s\-]?POUSSIÈRE?)\b/i,
  /\b(BLUE[\s\-]?(?:LIGHT|BLOCK|CUT))\b/i,
  /\b(LUMIÈRE\s?BLEUE)\b/i,
  /\b(UV[\s\-]?(?:400|PROTECT(?:ION)?))\b/i,
  /\b(PHOTOCHROM(?:IQUE|IC)?)\b/i,
  /\b(MIROIR|MIRROR)\b/i,
  /\b(POLARISÉ|POLARIZED?)\b/i,
  /\b(DURCI|HARDENED)\b/i,
];

/**
 * Lens tint/color patterns.
 */
const TINT_PATTERNS: RegExp[] = [
  /\b(GRIS|GR[AE]Y)\b/i,
  /\b(BRUN|BROWN)\b/i,
  /\b(VERT|GREEN)\b/i,
  /\b(ROSE|PINK)\b/i,
  /\b(JAUNE|YELLOW)\b/i,
  /\b(ORANGE)\b/i,
  /\b(DÉGRADÉ|GRADIENT)\b/i,
  /\b(CAT[\s\.]?[0-4])\b/i,
  /\b([1-4]\s?SOLEILS?)\b/i,
  /\b(\d{1,2}\s?%)\b/,
  /\b(CLAIR|CLEAR|BLANC|WHITE)\b/i,
];

/**
 * Lens power/prescription patterns.
 */
const POWER_PATTERNS: RegExp[] = [
  /\b([+-]?\d{1,2}[\.,]\d{2})\b/,
  /\bSPH[\s:]?([+-]?\d{1,2}[\.,]\d{2})\b/i,
  /\bCYL[\s:]?([+-]?\d{1,2}[\.,]\d{2})\b/i,
  /\bAXE?[\s:]?(\d{1,3})°?\b/i,
  /\bADD[\s:]?([+-]?\d[\.,]\d{2})\b/i,
  /\bPD[\s:]?(\d{2})\b/i,
];

/**
 * Exported patterns object for lens products.
 */
export const LENS_PATTERNS = {
  brandPatterns: BRAND_PATTERNS,
  modelPatterns: MODEL_PATTERNS,
  typePatterns: TYPE_PATTERNS,
  materialPatterns: MATERIAL_PATTERNS,
  treatmentPatterns: TREATMENT_PATTERNS,
  tintPatterns: TINT_PATTERNS,
  powerPatterns: POWER_PATTERNS,
} as const;
