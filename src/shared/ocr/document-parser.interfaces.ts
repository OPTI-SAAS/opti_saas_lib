import { IOcrBlock } from './ocr.models';

/**
 * Document parsing result.
 */
export interface IParseResult<T> {
  /** Extracted structured data */
  data: T;

  /** Overall confidence score (0-1) */
  confidence: number;

  /** Warnings (fields with low confidence) */
  warnings: string[];

  /** Total processing time in milliseconds */
  processingTime: number;
}

/**
 * Individual validation error.
 */
export interface IValidationError {
  /** Path of the field in error */
  field: string;

  /** Error message */
  message: string;
}

/**
 * Validation result.
 */
export interface IValidationResult {
  /** Indicates if the data is valid */
  isValid: boolean;

  /** List of validation errors */
  errors: IValidationError[];
}

/**
 * Confidence per extracted field.
 */
export interface IFieldConfidence {
  /** Field name */
  field: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** Source text used for extraction */
  sourceText: string | null;
}

/**
 * Interface for document parsers.
 * Each feature implements its own parser.
 */
export interface IDocumentParser<T> {
  /**
   * Parses OCR text and returns structured data.
   * @param rawText Raw text extracted by OCR
   * @param blocks Text blocks with positions
   * @returns Structured data
   */
  extractData(rawText: string, blocks: IOcrBlock[]): T;

  /**
   * Validates extracted data.
   * @param data Data to validate
   * @returns Validation result
   */
  validate(data: T): IValidationResult;

  /**
   * Detects fields with low confidence.
   * @param data Extracted data
   * @param blocks Source OCR blocks
   * @returns List of confidence per field
   */
  getFieldConfidences?(data: T, blocks: IOcrBlock[]): IFieldConfidence[];
}
