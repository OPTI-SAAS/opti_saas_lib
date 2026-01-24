/**
 * Regex patterns for safety glasses product matching.
 * Covers EN 166, ANSI Z87.1 standards and major safety eyewear brands.
 */

import type { SafetyRating, SafetyProtectionType } from './matching.interfaces';

/**
 * Safety glasses brand patterns.
 */
export const SAFETY_BRAND_PATTERNS: readonly RegExp[] = [
  // Major safety eyewear manufacturers
  /\b(3M|SCOTT)\b/i,
  /\b(UVEX|HONEYWELL)\b/i,
  /\b(BOLLÉ|BOLLE)\s?(?:SAFETY)?\b/i,
  /\b(MEDOP)\b/i,
  /\b(JSP)\b/i,
  /\b(DELTA\s?PLUS|DELTAPLUS)\b/i,
  /\b(PORTWEST)\b/i,
  /\b(MOLDEX)\b/i,
  /\b(MSA)\b/i,
  /\b(CREWS)\b/i,
  /\b(PYRAMEX)\b/i,
  /\b(ELVEX)\b/i,
  /\b(RADIANS)\b/i,
  /\b(DEWALT)\b/i,
  /\b(EDGE\s?EYEWEAR)\b/i,
  /\b(WILEY\s?X)\b/i,
  /\b(INFIELD)\b/i,
  /\b(UNIVET)\b/i,
  /\b(COFRA)\b/i,
  /\b(LIBUS)\b/i,
  // Prescription safety
  /\b(ESSILOR\s?SAFETY|VARILUX\s?SAFETY)\b/i,
  /\b(ZEISS\s?SAFETY|SAFETY\s?ZEISS)\b/i,
  /\b(HOYA\s?SAFETY)\b/i,
  /\b(RX\s?SAFETY|SAFETY\s?RX)\b/i,
  /\b(PRESCRIPTION\s?SAFETY)\b/i,
];

/**
 * Safety model patterns.
 */
export const SAFETY_MODEL_PATTERNS: readonly RegExp[] = [
  // 3M models
  /\b(SECURE\s?FIT|SECUREFIT)\b/i,
  /\b(VIRTUA)\b/i,
  /\b(SOLUS)\b/i,
  /\b(PRIVO)\b/i,
  /\b(NUVO)\b/i,
  /\b(FUEL)\b/i,
  // Uvex models
  /\b(PHEOS|SPORTSTYLE)\b/i,
  /\b(I-[35]|I-WORKS)\b/i,
  /\b(ASTROSPEC)\b/i,
  /\b(SUPER\s?G|SKYGUARD)\b/i,
  // Bollé models
  /\b(RUSH)\b/i,
  /\b(SLAM|SILIUM)\b/i,
  /\b(TRACKER|CONTOUR)\b/i,
  /\b(COBRA|VIPER)\b/i,
  // Generic model patterns
  /\b(VISITOR|VISITER)\b/i,
  /\b(OVERSPEC|OVER-SPEC|SUR-LUNETTES?)\b/i,
];

/**
 * Safety standard patterns (EN 166, ANSI Z87.1).
 */
export interface ISafetyStandardPattern {
  readonly pattern: RegExp;
  readonly standard: string;
  readonly rating: SafetyRating;
}

export const SAFETY_STANDARD_PATTERNS: readonly ISafetyStandardPattern[] = [
  // EN 166 European standard
  { pattern: /\bEN\s?166\s?F\b/i, standard: 'EN 166', rating: 'EN166_F' },
  { pattern: /\bEN\s?166\s?B\b/i, standard: 'EN 166', rating: 'EN166_B' },
  { pattern: /\bEN\s?166\s?A\b/i, standard: 'EN 166', rating: 'EN166_A' },
  { pattern: /\bEN\s?166\b/i, standard: 'EN 166', rating: 'EN166_F' },
  { pattern: /\bCE\s?EN\s?166\b/i, standard: 'EN 166', rating: 'EN166_F' },
  // ANSI Z87.1 American standard
  { pattern: /\bANSI\s?Z87\.?1?\+\b/i, standard: 'ANSI Z87.1', rating: 'ANSI_Z87+' },
  { pattern: /\bZ87\.?1?\+\b/i, standard: 'ANSI Z87.1', rating: 'ANSI_Z87+' },
  { pattern: /\bZ87\+\b/i, standard: 'ANSI Z87.1', rating: 'ANSI_Z87+' },
  { pattern: /\bANSI\s?Z87\.?1?\b/i, standard: 'ANSI Z87.1', rating: 'ANSI_Z87' },
  { pattern: /\bZ87\.?1?\b/i, standard: 'ANSI Z87.1', rating: 'ANSI_Z87' },
  // Other standards
  { pattern: /\bCSA\s?Z94\.?3\b/i, standard: 'CSA Z94.3', rating: 'other' },
  { pattern: /\bAS\/NZS\s?1337\b/i, standard: 'AS/NZS 1337', rating: 'other' },
];

/**
 * Protection type patterns.
 */
export interface IProtectionPattern {
  readonly pattern: RegExp;
  readonly type: SafetyProtectionType;
}

export const PROTECTION_TYPE_PATTERNS: readonly IProtectionPattern[] = [
  // Impact protection
  { pattern: /\b(IMPACT|CHOC|ANTI[- ]?CHOC)\b/i, type: 'impact' },
  { pattern: /\b(BALISTIC|BALLISTIQUE)\b/i, type: 'impact' },
  // Chemical protection
  { pattern: /\b(CHIMIQUE|CHEMICAL|ACID|ACIDE)\b/i, type: 'chemical' },
  { pattern: /\b(SPLASH|PROJECTION|ECLABOUSSURE)\b/i, type: 'chemical' },
  // Dust protection
  { pattern: /\b(POUSSI[ÈE]RE|DUST|ANTI[- ]?POUSSI[ÈE]RE)\b/i, type: 'dust' },
  // Laser protection
  { pattern: /\b(LASER|IR|INFRAROUGE|INFRARED)\b/i, type: 'laser' },
  { pattern: /\b(OD\s?\d|OPTICAL\s?DENSITY)\b/i, type: 'laser' },
  // Welding protection
  { pattern: /\b(SOUDURE|WELDING|SOUDAGE)\b/i, type: 'welding' },
  { pattern: /\b(DIN\s?\d|SHADE\s?\d)\b/i, type: 'welding' },
  // UV protection
  { pattern: /\b(UV\s?(?:400|PROTECT(?:ION)?)|ANTI[- ]?UV)\b/i, type: 'uv' },
  // Multi-purpose
  { pattern: /\b(MULTI[- ]?(?:PURPOSE|USAGE)|POLYVALENT)\b/i, type: 'multi' },
];

/**
 * Safety glasses category keywords.
 */
export const SAFETY_KEYWORDS: readonly RegExp[] = [
  /\b(LUNETTES?\s?(?:DE\s?)?(?:S[ÉE]CURIT[ÉE]|PROTECTION|TRAVAIL))\b/i,
  /\b(SAFETY\s?(?:GLASS(?:ES)?|SPECTACLES?|EYEWEAR|GOGGLES?))\b/i,
  /\b(PROTECTIVE\s?(?:GLASS(?:ES)?|EYEWEAR))\b/i,
  /\b(EPI|PPE)\s?(?:LUNETTES?|EYEWEAR)?\b/i,
  /\b(INDUSTRIEL(?:LES?)?|INDUSTRIAL)\b/i,
  /\b(GOGGLES?|MASQUE\s?(?:DE\s?)?PROTECTION)\b/i,
  /\b(ANTI[- ]?(?:CHOC|RAYURES?|BU[ÉE]E|FOG))\b/i,
];

/**
 * Safety glasses material patterns.
 */
export const SAFETY_MATERIAL_PATTERNS: readonly RegExp[] = [
  /\b(POLY(?:CARBONATE)?|PC)\b/i,
  /\b(NYLON)\b/i,
  /\b(TR[- ]?90)\b/i,
  /\b(CAOUTCHOUC|RUBBER)\b/i,
  /\b(SILICONE)\b/i,
  /\b(TPE|TPR)\b/i,
];

/**
 * Safety lens type patterns.
 */
export const SAFETY_LENS_PATTERNS: readonly RegExp[] = [
  /\b(CLAIR(?:E)?|CLEAR|INCOLORE)\b/i,
  /\b(TEINT[ÉE]|TINTED|FUME|SMOKE)\b/i,
  /\b(MIROIR|MIRROR)\b/i,
  /\b(JAUNE|YELLOW|AMBER)\b/i,
  /\b(GRIS|GR[AE]Y)\b/i,
  /\b(ORANGE)\b/i,
  /\b(BLEU|BLUE)\b/i,
  /\b(INDOOR\/OUTDOOR|INT[ÉE]RIEUR\/EXT[ÉE]RIEUR)\b/i,
  /\b(PHOTOCHROM(?:IQUE|IC)?|TRANSITIONS?)\b/i,
];

/**
 * Prescription capability patterns.
 */
export const PRESCRIPTION_PATTERNS: readonly RegExp[] = [
  /\b(RX|PRESCRIPTION)\b/i,
  /\b(CORRECT(?:EUR|IVE|ION))\b/i,
  /\b([ÀA]\s?LA\s?VUE|OPHTALMIQUE)\b/i,
  /\b(INSERT|CLIP[- ]?IN)\b/i,
  /\b(ADAPT[ÉE]|ADAPTABLE)\b/i,
];
