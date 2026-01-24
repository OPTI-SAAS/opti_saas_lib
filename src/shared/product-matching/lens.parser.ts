/**
 * Parser for ophthalmic lens designations.
 * Extracts brand, product line, type, material, treatments, and prescription data.
 */

import type {
  IParsedLensInfo,
  IParsedProductInfo,
  LensType,
  ProductCategory,
} from './matching.interfaces';
import { createEmptyParsedProductInfo } from './matching.interfaces';
import { LENS_PATTERNS } from './lens.patterns';

/**
 * Creates an empty parsed lens info with default values.
 * @returns A new empty IParsedLensInfo
 */
export function createEmptyLensInfo(): IParsedLensInfo {
  return {
    brand: null,
    productLine: null,
    lensType: null,
    material: null,
    index: null,
    treatments: [],
    tint: null,
    sphere: null,
    cylinder: null,
    axis: null,
    addition: null,
    diameter: null,
  };
}

/**
 * Extracts lens brand from designation.
 * @param text The designation text
 * @returns Extracted brand name or null
 */
function extractLensBrand(text: string): string | null {
  const upperText = text.toUpperCase();

  const brandMap: Record<string, string> = {
    ESSILOR: 'Essilor',
    ESS: 'Essilor',
    ZEISS: 'Zeiss',
    'CARL ZEISS': 'Zeiss',
    HOYA: 'Hoya',
    RODENSTOCK: 'Rodenstock',
    RODEN: 'Rodenstock',
    NIKON: 'Nikon',
    SEIKO: 'Seiko',
    SHAMIR: 'Shamir',
    INDO: 'Indo',
    BBGR: 'BBGR',
    TOKAI: 'Tokai',
  };

  for (const pattern of LENS_PATTERNS.brandPatterns) {
    const match = upperText.match(pattern);
    if (match) {
      const key = match[1]?.toUpperCase() || match[0].toUpperCase();
      return brandMap[key] || key;
    }
  }

  return null;
}

/**
 * Extracts lens product line from designation.
 * @param text The designation text
 * @returns Extracted product line or null
 */
function extractLensProductLine(text: string): string | null {
  const upperText = text.toUpperCase();

  const productLineMap: Record<string, string> = {
    VARILUX: 'Varilux',
    VLX: 'Varilux',
    CRIZAL: 'Crizal',
    TRANSITIONS: 'Transitions',
    TRANSITION: 'Transitions',
    XPERIO: 'Xperio',
    EYEZEN: 'Eyezen',
    STELLEST: 'Stellest',
    MYOPILUX: 'Myopilux',
    PHYSIO: 'Physio',
    SMARTLIFE: 'SmartLife',
    'DRIVE SAFE': 'DriveSafe',
    DRIVESAFE: 'DriveSafe',
    PRECISION: 'Precision',
    OFFICE: 'Office',
    DIGITAL: 'Digital',
    SUPERB: 'Superb',
    SERENITY: 'Serenity',
    HARMONY: 'Harmony',
    LIFESTYLE: 'Lifestyle',
    SUMMIT: 'Summit',
    GLACIER: 'Glacier',
    SENSITY: 'Sensity',
    PHOTOFUSION: 'PhotoFusion',
    ORMA: 'Orma',
    MINERAL: 'Mineral',
    AIRWEAR: 'Airwear',
    STYLIS: 'Stylis',
    LINEIS: 'Lineis',
  };

  for (const pattern of LENS_PATTERNS.modelPatterns) {
    const match = upperText.match(pattern);
    if (match) {
      const key = (match[1] || match[0]).toUpperCase().replace(/\s+/g, ' ').trim();
      return productLineMap[key] || key;
    }
  }

  return null;
}

/**
 * Detects lens type from designation.
 * @param text The designation text
 * @returns Detected lens type or null
 */
function detectLensType(text: string): LensType | null {
  const upperText = text.toUpperCase();

  if (/\b(PROGRESSI[VF]E?|MULTI\s?FOCAL|PAL|VARILUX)\b/i.test(upperText)) {
    return 'progressive';
  }
  if (/\b(UNIFOCAL|SINGLE\s?VISION|SV|SIMPLE\s?FOYER)\b/i.test(upperText)) {
    return 'single_vision';
  }
  if (/\b(BIFOCAL|BI[\s\-]?FOCAL|DOUBLE\s?FOYER)\b/i.test(upperText)) {
    return 'bifocal';
  }
  if (/\b(TRIFOCAL|TRI[\s\-]?FOCAL|TRIPLE\s?FOYER)\b/i.test(upperText)) {
    return 'trifocal';
  }
  if (/\b(DEGRESSIVE?|OFFICE|MI[\s\-]?DISTANCE|TRAVAIL)\b/i.test(upperText)) {
    return 'degressive';
  }
  if (/\b(ANTI[\s\-]?FATIGUE|EYEZEN|RELAX)\b/i.test(upperText)) {
    return 'anti_fatigue';
  }

  return null;
}

/**
 * Extracts lens material from designation.
 * @param text The designation text
 * @returns Extracted material or null
 */
function extractLensMaterial(text: string): string | null {
  const upperText = text.toUpperCase();

  if (/\b(CR[\s\-]?39|CR39|ORGANIQUE)\b/i.test(upperText)) return 'CR-39';
  if (/\b(POLY(?:CARBONATE)?|PC)\b/i.test(upperText)) return 'Polycarbonate';
  if (/\b(TRIVEX)\b/i.test(upperText)) return 'Trivex';
  if (/\b(MINERAL|VERRE\s?MIN[ÉE]RAL?)\b/i.test(upperText)) return 'Mineral';
  if (/\b(MR[\s\-]?8)\b/i.test(upperText)) return 'MR-8';
  if (/\b(MR[\s\-]?7)\b/i.test(upperText)) return 'MR-7';
  if (/\b(MR[\s\-]?6)\b/i.test(upperText)) return 'MR-6';

  return null;
}

/**
 * Extracts lens refractive index from designation.
 * @param text The designation text
 * @returns Extracted index or null
 */
function extractLensIndex(text: string): string | null {
  // Match common indices: 1.5, 1.53, 1.56, 1.59, 1.6, 1.60, 1.67, 1.74
  const indexPattern = /\b(1[,\.](?:5[0369]?|6[07]?|67|74))\b/;
  const match = text.match(indexPattern);
  if (match) {
    return match[1].replace(',', '.');
  }

  // Check for hi-index keywords
  if (/\b(HI[\s\-]?INDEX|HAUT\s?INDICE|AMINCI)\b/i.test(text)) {
    return 'hi-index';
  }

  return null;
}

/**
 * Extracts lens treatments from designation.
 * @param text The designation text
 * @returns Array of detected treatments
 */
function extractLensTreatments(text: string): string[] {
  const treatments: string[] = [];
  const upperText = text.toUpperCase();

  const treatmentMap: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\b(CRIZAL|ANTI[\s\-]?REFLET|AR|A\.?R\.?)\b/i, name: 'Anti-reflet' },
    { pattern: /\b(ANTI[\s\-]?RAYURES?|SCRATCH|DURCI)\b/i, name: 'Anti-rayures' },
    { pattern: /\b(BLUE[\s\-]?(?:LIGHT|BLOCK|CUT|UV)|LUMI[ÈE]RE\s?BLEUE)\b/i, name: 'Filtre lumière bleue' },
    { pattern: /\b(UV[\s\-]?(?:400|PROTECT(?:ION)?)|ANTI[\s\-]?UV)\b/i, name: 'Protection UV' },
    { pattern: /\b(PHOTOCHROM(?:IQUE|IC)?|TRANSITIONS?|SENSITY)\b/i, name: 'Photochromique' },
    { pattern: /\b(POLARISÉ|POLARIZED?|XPERIO)\b/i, name: 'Polarisé' },
    { pattern: /\b(HYDROPHOBE|ANTI[\s\-]?EAU)\b/i, name: 'Hydrophobe' },
    { pattern: /\b(OL[ÉE]OPHOBE|ANTI[\s\-]?TRACES?)\b/i, name: 'Oléophobe' },
    { pattern: /\b(ANTI[\s\-]?STATIQUE)\b/i, name: 'Antistatique' },
    { pattern: /\b(MIROIR|MIRROR)\b/i, name: 'Miroir' },
  ];

  for (const { pattern, name } of treatmentMap) {
    if (pattern.test(upperText) && !treatments.includes(name)) {
      treatments.push(name);
    }
  }

  return treatments;
}

/**
 * Extracts lens tint from designation.
 * @param text The designation text
 * @returns Extracted tint or null
 */
function extractLensTint(text: string): string | null {
  const upperText = text.toUpperCase();

  // Check for category (CAT.0 to CAT.4)
  const catMatch = upperText.match(/\bCAT[\s\.]?([0-4])\b/i);
  if (catMatch) {
    return `Catégorie ${catMatch[1]}`;
  }

  // Check for percentage
  const percentMatch = upperText.match(/\b(\d{1,2})\s?%/);
  if (percentMatch) {
    return `${percentMatch[1]}%`;
  }

  // Check for color names
  if (/\b(GRIS|GR[AE]Y)\b/i.test(upperText)) return 'Gris';
  if (/\b(BRUN|BROWN)\b/i.test(upperText)) return 'Brun';
  if (/\b(VERT|GREEN)\b/i.test(upperText)) return 'Vert';
  if (/\b(JAUNE|YELLOW)\b/i.test(upperText)) return 'Jaune';
  if (/\b(ROSE|PINK)\b/i.test(upperText)) return 'Rose';
  if (/\b(CLAIR|CLEAR|BLANC|WHITE)\b/i.test(upperText)) return 'Clair';
  if (/\b(D[ÉE]GRAD[ÉE]|GRADIENT)\b/i.test(upperText)) return 'Dégradé';

  return null;
}

/**
 * Extracts prescription values from designation.
 * @param text The designation text
 * @returns Object with extracted prescription values
 */
function extractPrescription(text: string): {
  sphere: number | null;
  cylinder: number | null;
  axis: number | null;
  addition: number | null;
} {
  const result = {
    sphere: null as number | null,
    cylinder: null as number | null,
    axis: null as number | null,
    addition: null as number | null,
  };

  // SPH (sphere)
  const sphMatch = text.match(/\bSPH[\s:]?([+-]?\d{1,2}[,\.]\d{2})\b/i);
  if (sphMatch) {
    result.sphere = parseFloat(sphMatch[1].replace(',', '.'));
  }

  // CYL (cylinder)
  const cylMatch = text.match(/\bCYL[\s:]?([+-]?\d{1,2}[,\.]\d{2})\b/i);
  if (cylMatch) {
    result.cylinder = parseFloat(cylMatch[1].replace(',', '.'));
  }

  // AXE (axis)
  const axeMatch = text.match(/\bAXE?[\s:]?(\d{1,3})°?\b/i);
  if (axeMatch) {
    result.axis = parseInt(axeMatch[1], 10);
  }

  // ADD (addition)
  const addMatch = text.match(/\bADD[\s:]?([+-]?\d[,\.]\d{2})\b/i);
  if (addMatch) {
    result.addition = parseFloat(addMatch[1].replace(',', '.'));
  }

  return result;
}

/**
 * Extracts lens diameter from designation.
 * @param text The designation text
 * @returns Extracted diameter or null
 */
function extractLensDiameter(text: string): number | null {
  // Common lens diameters: 65, 70, 75mm
  const diaMatch = text.match(/\b(6[05]|7[05])\s?(?:mm)?\b/i);
  if (diaMatch) {
    const dia = parseInt(diaMatch[1], 10);
    if (dia >= 60 && dia <= 80) {
      return dia;
    }
  }
  return null;
}

/**
 * Detects if the designation is for an ophthalmic lens.
 * @param text The designation text
 * @returns True if lens detected
 */
export function isOphthalmicLens(text: string): boolean {
  const upperText = text.toUpperCase();

  // Check for lens brands
  for (const pattern of LENS_PATTERNS.brandPatterns) {
    if (pattern.test(upperText)) return true;
  }

  // Check for lens-specific keywords
  if (/\b(VERRE[S]?\s?(?:OPTIQUE|OPHTALMIQUE|CORRECTEUR)?)\b/i.test(upperText)) return true;
  if (/\b(UNIFOCAL|PROGRESSI[VF]|BIFOCAL|TRIFOCAL)\b/i.test(upperText)) return true;
  if (/\b(VARILUX|CRIZAL|EYEZEN|STELLEST)\b/i.test(upperText)) return true;
  if (/\b(ANTI[\s\-]?REFLET|AR\b|1\.[56]\d?|1\.67|1\.74)\b/i.test(upperText)) return true;

  return false;
}

/**
 * Parses an ophthalmic lens designation.
 * @param designation The raw designation text
 * @returns Parsed lens information
 */
export function parseLensDesignation(designation: string): IParsedLensInfo {
  if (!designation) {
    return createEmptyLensInfo();
  }

  const brand = extractLensBrand(designation);
  const productLine = extractLensProductLine(designation);
  const lensType = detectLensType(designation);
  const material = extractLensMaterial(designation);
  const index = extractLensIndex(designation);
  const treatments = extractLensTreatments(designation);
  const tint = extractLensTint(designation);
  const prescription = extractPrescription(designation);
  const diameter = extractLensDiameter(designation);

  return {
    brand,
    productLine,
    lensType,
    material,
    index,
    treatments,
    tint,
    sphere: prescription.sphere,
    cylinder: prescription.cylinder,
    axis: prescription.axis,
    addition: prescription.addition,
    diameter,
  };
}

/**
 * Parses a designation and returns product info with lens category if detected.
 * This extends the base parseDesignation with lens-specific detection.
 * @param designation The raw designation text
 * @returns Parsed product information
 */
export function parseDesignationWithLens(designation: string): IParsedProductInfo {
  if (!designation) {
    return createEmptyParsedProductInfo('');
  }

  const result = createEmptyParsedProductInfo(designation);

  if (!isOphthalmicLens(designation)) {
    return result;
  }

  const lensInfo = parseLensDesignation(designation);
  let confidence = 0;

  if (lensInfo.brand) confidence += 25;
  if (lensInfo.productLine) confidence += 20;
  if (lensInfo.lensType) confidence += 15;
  if (lensInfo.material || lensInfo.index) confidence += 10;
  if (lensInfo.treatments.length > 0) confidence += 10;
  if (lensInfo.sphere !== null || lensInfo.addition !== null) confidence += 20;

  const category: ProductCategory = 'ophthalmic_lens';

  return {
    ...result,
    parsedBrand: lensInfo.brand,
    parsedBrandVariants: lensInfo.brand ? [lensInfo.brand] : [],
    parsedModel: lensInfo.productLine,
    parsedCategory: category,
    confidence: Math.min(confidence, 100) / 100,
  };
}
