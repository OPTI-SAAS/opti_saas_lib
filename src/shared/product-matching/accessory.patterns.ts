/**
 * Regex patterns for optical accessory product matching.
 * Covers cases, cords, cleaning products, and spare parts.
 */

import type { AccessoryType } from './matching.interfaces';

/**
 * Accessory type patterns with associated type.
 */
export interface IAccessoryPattern {
  readonly patterns: readonly RegExp[];
  readonly type: AccessoryType;
  readonly names: {
    readonly fr: string;
    readonly en: string;
  };
}

/**
 * Case patterns (hard cases, soft pouches).
 */
const CASE_PATTERNS: IAccessoryPattern = {
  type: 'case',
  names: { fr: 'Étui rigide', en: 'Hard case' },
  patterns: [
    /\b([ÉE]TUI(?:S)?(?:\s?RIGIDE)?|CASE|HARD\s?CASE|COFFRET)\b/i,
    /\b(BO[ÎI]TE?(?:\s?[ÀA]\s?LUNETTES?)?)\b/i,
  ],
};

const POUCH_PATTERNS: IAccessoryPattern = {
  type: 'pouch',
  names: { fr: 'Pochette', en: 'Pouch' },
  patterns: [
    /\b(POCHETTE|POUCH|SOFT\s?CASE|HOUSSE)\b/i,
    /\b([ÉE]TUI\s?SOUPLE)\b/i,
  ],
};

/**
 * Cord and chain patterns.
 */
const CORD_PATTERNS: IAccessoryPattern = {
  type: 'cord',
  names: { fr: 'Cordon', en: 'Cord' },
  patterns: [
    /\b(CORDON(?:S)?|CORD|STRAP|LANI[ÈE]RE)\b/i,
    /\b(RETAINER|KEEPER)\b/i,
  ],
};

const CHAIN_PATTERNS: IAccessoryPattern = {
  type: 'chain',
  names: { fr: 'Chaîne', en: 'Chain' },
  patterns: [
    /\b(CHA[ÎI]NE(?:S)?(?:\s?LUNETTES?)?|CHAIN)\b/i,
    /\b(COLLIER\s?LUNETTES?)\b/i,
  ],
};

/**
 * Cleaning product patterns.
 */
const CLEANING_SPRAY_PATTERNS: IAccessoryPattern = {
  type: 'cleaning_spray',
  names: { fr: 'Spray nettoyant', en: 'Cleaning spray' },
  patterns: [
    /\b(SPRAY(?:\s?NETTOYANT)?|NETTOYANT(?:\s?SPRAY)?)\b/i,
    /\b(CLEANER|CLEANING\s?(?:SPRAY|SOLUTION))\b/i,
    /\b(LIQUIDE\s?NETTOYANT)\b/i,
  ],
};

const CLEANING_CLOTH_PATTERNS: IAccessoryPattern = {
  type: 'cleaning_cloth',
  names: { fr: 'Chiffon', en: 'Cleaning cloth' },
  patterns: [
    /\b(CHIFFON(?:S)?|CLOTH|MICROFIBRE?|MICROFIBER)\b/i,
    /\b(LINGETTE(?:S)?|WIPE(?:S)?)\b/i,
    /\b(TISSU\s?NETTOYANT)\b/i,
  ],
};

const LENS_CLOTH_PATTERNS: IAccessoryPattern = {
  type: 'lens_cloth',
  names: { fr: 'Chiffon optique', en: 'Lens cloth' },
  patterns: [
    /\b(CHIFFON\s?(?:OPTIQUE|LUNETTES?))\b/i,
    /\b(LENS\s?CLOTH)\b/i,
  ],
};

/**
 * Spare parts patterns.
 */
const NOSE_PAD_PATTERNS: IAccessoryPattern = {
  type: 'nose_pad',
  names: { fr: 'Plaquette', en: 'Nose pad' },
  patterns: [
    /\b(PLAQUETTE(?:S)?(?:\s?NASALE)?|NOSE\s?PAD(?:S)?)\b/i,
    /\b(PAD(?:S)?(?:\s?NASAL)?)\b/i,
    /\b(COUSSIN(?:S)?(?:\s?NASAL)?)\b/i,
  ],
};

const TEMPLE_TIP_PATTERNS: IAccessoryPattern = {
  type: 'temple_tip',
  names: { fr: 'Embout de branche', en: 'Temple tip' },
  patterns: [
    /\b(EMBOUT(?:S)?(?:\s?(?:DE\s?)?BRANCHE)?|TEMPLE\s?TIP(?:S)?)\b/i,
    /\b(TERMINAISON(?:S)?(?:\s?BRANCHE)?)\b/i,
    /\b(ACETATE\s?TIP(?:S)?)\b/i,
  ],
};

const SCREW_PATTERNS: IAccessoryPattern = {
  type: 'screw',
  names: { fr: 'Vis', en: 'Screw' },
  patterns: [
    /\b(VIS(?:\s?(?:OPTIQUE|LUNETTES?))?|SCREW(?:S)?)\b/i,
    /\b(MICRO[\s\-]?VIS)\b/i,
  ],
};

const HINGE_PATTERNS: IAccessoryPattern = {
  type: 'hinge',
  names: { fr: 'Charnière', en: 'Hinge' },
  patterns: [
    /\b(CHARNI[ÈE]RE(?:S)?|HINGE(?:S)?)\b/i,
    /\b(FLEX[\s\-]?HINGE)\b/i,
    /\b(SPRING\s?HINGE)\b/i,
  ],
};

/**
 * Contact lens accessory patterns.
 */
const CONTACT_LENS_SOLUTION_PATTERNS: IAccessoryPattern = {
  type: 'contact_lens_solution',
  names: { fr: 'Solution lentilles', en: 'Contact lens solution' },
  patterns: [
    /\b(SOLUTION(?:\s?(?:LENTILLES?|MULTIFONCTION|NETTOYANTE))?)\b/i,
    /\b(PRODUIT\s?(?:D['']?)?ENTRETIEN)\b/i,
    /\b(MULTI[\s\-]?PURPOSE\s?SOLUTION|MPS)\b/i,
    /\b(SALINE|S[ÉE]RUM\s?PHYSIOLOGIQUE)\b/i,
    /\b(RENU|OPTI[\s\-]?FREE|BIOTRUE|COMPLETE)\b/i,
  ],
};

const CONTACT_LENS_CASE_PATTERNS: IAccessoryPattern = {
  type: 'contact_lens_case',
  names: { fr: 'Étui lentilles', en: 'Contact lens case' },
  patterns: [
    /\b([ÉE]TUI(?:\s?(?:[ÀA]\s?)?LENTILLES?)?)\b/i,
    /\b(LENS\s?CASE|CONTACT\s?CASE)\b/i,
    /\b(BO[ÎI]TIER\s?LENTILLES?)\b/i,
  ],
};

/**
 * All accessory patterns grouped.
 */
export const ACCESSORY_PATTERNS: readonly IAccessoryPattern[] = [
  CASE_PATTERNS,
  POUCH_PATTERNS,
  CORD_PATTERNS,
  CHAIN_PATTERNS,
  CLEANING_SPRAY_PATTERNS,
  CLEANING_CLOTH_PATTERNS,
  LENS_CLOTH_PATTERNS,
  NOSE_PAD_PATTERNS,
  TEMPLE_TIP_PATTERNS,
  SCREW_PATTERNS,
  HINGE_PATTERNS,
  CONTACT_LENS_SOLUTION_PATTERNS,
  CONTACT_LENS_CASE_PATTERNS,
];

/**
 * Generic accessory keywords that indicate any type of accessory.
 */
export const ACCESSORY_KEYWORDS: readonly RegExp[] = [
  /\b(ACCESSOIRE(?:S)?|ACCESSOR(?:Y|IES))\b/i,
  /\b(PI[ÈE]CE(?:S)?\s?(?:D[ÉE]TACH[ÉE]E?S?|DE\s?RECHANGE))\b/i,
  /\b(SPARE\s?PART(?:S)?|REPLACEMENT)\b/i,
  /\b(ENTRETIEN|MAINTENANCE|CARE)\b/i,
];

/**
 * Material patterns for accessories.
 */
export const ACCESSORY_MATERIAL_PATTERNS: readonly RegExp[] = [
  /\b(CUIR|LEATHER)\b/i,
  /\b(SIMILI[\s\-]?CUIR|FAUX\s?LEATHER|PU\s?LEATHER)\b/i,
  /\b(TISSU|FABRIC|TEXTILE)\b/i,
  /\b(PLASTIQUE|PLASTIC)\b/i,
  /\b(M[ÉE]TAL|METAL)\b/i,
  /\b(SILICONE)\b/i,
  /\b(CAOUTCHOUC|RUBBER)\b/i,
  /\b(N[ÉE]OPR[ÈE]NE|NEOPRENE)\b/i,
  /\b(VELOURS|VELVET)\b/i,
  /\b(SATIN)\b/i,
];

/**
 * Color patterns for accessories (same as frames).
 */
export const ACCESSORY_COLOR_PATTERNS: readonly RegExp[] = [
  /\b(NOIR|BLACK|BLK)\b/i,
  /\b(MARRON|BROWN|BRN)\b/i,
  /\b(BLEU|BLUE|BLU)\b/i,
  /\b(ROUGE|RED)\b/i,
  /\b(VERT|GREEN|GRN)\b/i,
  /\b(ROSE|PINK)\b/i,
  /\b(VIOLET|PURPLE)\b/i,
  /\b(ORANGE)\b/i,
  /\b(JAUNE|YELLOW)\b/i,
  /\b(BLANC|WHITE|WHT)\b/i,
  /\b(GRIS|GR[AE]Y)\b/i,
  /\b(BEIGE|TAUPE)\b/i,
  /\b(OR|GOLD|GLD|DOR[ÉE])\b/i,
  /\b(ARGENT|SILVER|SLV|ARGENT[ÉE])\b/i,
];

/**
 * Size patterns for accessories.
 */
export const ACCESSORY_SIZE_PATTERNS: readonly RegExp[] = [
  /\b(PETIT|SMALL|S)\b/i,
  /\b(MOYEN|MEDIUM|M)\b/i,
  /\b(GRAND|LARGE|L)\b/i,
  /\b(EXTRA[\s\-]?LARGE|XL)\b/i,
  /\b(UNIVERSEL|UNIVERSAL|ONE\s?SIZE)\b/i,
  /\b(\d+)\s?(?:ML|CL|L)\b/i, // Volume for solutions
  /\b(\d+)\s?(?:CM|MM)\b/i, // Dimensions
];

/**
 * Brand patterns that also make accessories.
 */
export const ACCESSORY_BRAND_PATTERNS: readonly RegExp[] = [
  // Frame brands that make accessories
  /\b(RAY[\s\-]?BAN|OAKLEY|GUCCI|PRADA|VERSACE|CHANEL)\b/i,
  /\b(DIOR|FENDI|CELINE|BURBERRY|MICHAEL\s?KORS)\b/i,
  // Specialized accessory brands
  /\b(CROAKIES|CHUMS|CABLZ)\b/i, // Cord brands
  /\b(HILCO|PEEPER|OPTYL)\b/i, // Parts brands
  // Contact lens solution brands
  /\b(RENU|OPTI[\s\-]?FREE|BIOTRUE|COMPLETE|AOSEPT)\b/i,
  /\b(SOLO[\s\-]?CARE|AQUIFY|CLEAR\s?CARE)\b/i,
];
