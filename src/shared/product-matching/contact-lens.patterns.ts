/**
 * Regex patterns for contact lens product matching.
 * Covers major contact lens laboratories and common designation formats.
 */

/**
 * Major contact lens laboratory/brand patterns.
 */
const BRAND_PATTERNS: RegExp[] = [
  /\b(ACUVUE|J\s?&\s?J|JOHNSON\s?(?:&|AND)?\s?JOHNSON)\b/i,
  /\b(ALCON)\b/i,
  /\b(BAUSCH\s?(?:&|AND)?\s?LOMB|B\s?&\s?L|B&L)\b/i,
  /\b(COOPERVISION|COOPER)\b/i,
  /\b(MENICON)\b/i,
  /\b(MARK'?ENNOVY|MARKENNOVY)\b/i,
  /\b(PRECILENS)\b/i,
  /\b(LENTILLES\s?LAB|LCL)\b/i,
];

/**
 * Contact lens product line patterns.
 */
const MODEL_PATTERNS: RegExp[] = [
  /\b(OASYS)\b/i,
  /\b(MOIST)\b/i,
  /\b(TRUEYE)\b/i,
  /\b(VITA)\b/i,
  /\b(DEFINE)\b/i,
  /\b(1[\s\-]?DAY|ONE\s?DAY)\b/i,
  /\b(DAILIES)\b/i,
  /\b(TOTAL\s?1|TOTAL\s?ONE|TOTAL1)\b/i,
  /\b(AIR\s?OPTIX)\b/i,
  /\b(FRESHLOOK)\b/i,
  /\b(PRECISION\s?1|PRECISION1)\b/i,
  /\b(BIOTRUE|BIO\s?TRUE)\b/i,
  /\b(ULTRA)\b/i,
  /\b(SOFLENS)\b/i,
  /\b(PUREVISION)\b/i,
  /\b(AVAIRA)\b/i,
  /\b(BIOFINITY)\b/i,
  /\b(CLARITI)\b/i,
  /\b(MYDAY|MY\s?DAY)\b/i,
  /\b(PROCLEAR)\b/i,
  /\b(AQUA\s?COMFORT)\b/i,
  /\b(COLORS?)\b/i,
  /\b(NIGHT\s?(?:&|AND)?\s?DAY)\b/i,
];

/**
 * Contact lens usage/replacement patterns.
 */
const USAGE_PATTERNS: RegExp[] = [
  /\b(JOURNALI[ÈE]RE?S?|DAILY|JOUR)\b/i,
  /\b(BIMENSUEL(?:LE)?S?|BI[\s\-]?WEEKLY|2\s?WEEKS?)\b/i,
  /\b(MENSUEL(?:LE)?S?|MONTHLY|MOIS)\b/i,
  /\b(TRIMESTRIEL(?:LE)?S?|QUARTERLY|3\s?MONTHS?)\b/i,
  /\b(ANNUEL(?:LE)?S?|YEARLY|ANNUAL)\b/i,
  /\b(JETABLE|DISPOSABLE)\b/i,
  /\b(TRADITIONNELLE?|CONVENTIONAL)\b/i,
  /\b(EXTENDED\s?WEAR|NUIT\s?(?:ET\s?)?JOUR)\b/i,
];

/**
 * Contact lens type patterns.
 */
const TYPE_PATTERNS: RegExp[] = [
  /\b(SPHÉRIQUE?S?|SPHERICAL?)\b/i,
  /\b(TORIQUE?S?|TORIC|AST(?:IGMAT(?:ISME|IC))?)\b/i,
  /\b(MULTIFOCAL(?:ES?)?|PROGRESSI[VF]E?S?)\b/i,
  /\b(BIFOCAL(?:ES?)?)\b/i,
  /\b(RIGIDE|RGP|LRPG)\b/i,
  /\b(SOUPLE|SOFT)\b/i,
  /\b(HYBRID[E]?)\b/i,
  /\b(SCLÉRAL(?:ES?)?|SCLERAL)\b/i,
  /\b(ORTHO[\s\-]?K|ORTHOKERATOLOG(?:Y|IE))\b/i,
  /\b(COSMÉTIQUE?S?|COSMETIC|COULEUR)\b/i,
];

/**
 * Contact lens material patterns.
 */
const MATERIAL_PATTERNS: RegExp[] = [
  /\b(SILICONE[\s\-]?HYDROGEL|SI[\s\-]?HY)\b/i,
  /\b(HYDROGEL)\b/i,
  /\b(HEMA)\b/i,
  /\b(SENOFILCON)\b/i,
  /\b(ETAFILCON)\b/i,
  /\b(OMAFILCON)\b/i,
  /\b(COMFILCON)\b/i,
  /\b(LOTRAFILCON)\b/i,
  /\b(DELEFILCON)\b/i,
  /\b(SAMFILCON)\b/i,
  /\b(NELFILCON)\b/i,
  /\b(FANFILCON)\b/i,
];

/**
 * Contact lens parameter patterns.
 */
const PARAMETER_PATTERNS: RegExp[] = [
  /\bBC[\s:]?([\d,\.]+)\b/i,
  /\bRAYON[\s:]?([\d,\.]+)\b/i,
  /\bDIA[\s:]?([\d,\.]+)\b/i,
  /\bDIAM[ÈE]TRE[\s:]?([\d,\.]+)\b/i,
  /\bPWR[\s:]?([+-]?[\d,\.]+)\b/i,
  /\bSPH[\s:]?([+-]?[\d,\.]+)\b/i,
  /\bCYL[\s:]?([+-]?[\d,\.]+)\b/i,
  /\bAXE?[\s:]?(\d{1,3})\b/i,
  /\bADD[\s:]?([+-]?[\d,\.]+)\b/i,
  /\b(\d+)\s?(?:LENTILLES?|LENS(?:ES)?|PCS?|UNITS?)\b/i,
  /\bBOITE?[\s:]?(\d+)\b/i,
  /\bPACK[\s:]?(\d+)\b/i,
];

/**
 * Contact lens DK/T (oxygen permeability) patterns.
 */
const OXYGEN_PATTERNS: RegExp[] = [
  /\bDK[\s\/]?T[\s:]?(\d+)\b/i,
  /\bDK[\s:]?(\d+)\b/i,
  /\bOXYGEN[\s:]?(\d+)\b/i,
];

/**
 * Exported patterns object for contact lens products.
 */
export const CONTACT_LENS_PATTERNS = {
  brandPatterns: BRAND_PATTERNS,
  modelPatterns: MODEL_PATTERNS,
  usagePatterns: USAGE_PATTERNS,
  typePatterns: TYPE_PATTERNS,
  materialPatterns: MATERIAL_PATTERNS,
  parameterPatterns: PARAMETER_PATTERNS,
  oxygenPatterns: OXYGEN_PATTERNS,
} as const;
