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
 * Supported document types.
 * Used to select the optimal OCR provider.
 */
export type OcrDocumentType =
  | 'invoice'
  | 'delivery_note'
  | 'prescription'
  | 'insurance_card'
  | 'generic';

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
