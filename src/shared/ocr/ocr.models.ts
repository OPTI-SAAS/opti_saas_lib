/**
 * Element coordinates in the image.
 */
export interface IOcrBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Individual word with confidence score.
 */
export interface IOcrWord {
  text: string;
  confidence: number;
  boundingBox: IOcrBoundingBox | null;
}

/**
 * Text line composed of words.
 */
export interface IOcrLine {
  text: string;
  confidence: number;
  words: IOcrWord[];
  boundingBox: IOcrBoundingBox | null;
}

/**
 * Text block (paragraph or zone).
 */
export interface IOcrBlock {
  text: string;
  confidence: number;
  lines: IOcrLine[];
  boundingBox: IOcrBoundingBox | null;
}

/**
 * Supported document types as const array.
 * Allows iteration while maintaining type safety.
 */
export const OCR_DOCUMENT_TYPES = [
  'invoice',
  'delivery_note',
  'quote',
  'purchase_order',
  'prescription',
  'insurance_card',
  'generic',
] as const;

/**
 * Supported document types.
 * Used to select the optimal OCR provider.
 * Derived from OCR_DOCUMENT_TYPES for type safety.
 */
export type OcrDocumentType = (typeof OCR_DOCUMENT_TYPES)[number];

/**
 * OCR error codes.
 */
export enum OcrErrorCode {
  INVALID_IMAGE = 'INVALID_IMAGE',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  TIMEOUT = 'TIMEOUT',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
}
