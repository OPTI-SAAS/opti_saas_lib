import { IOcrBlock, OcrDocumentType } from './ocr.models';

/**
 * OCR extraction result.
 */
export interface IOcrResult {
  /** Raw text extracted from the image */
  rawText: string;

  /** Overall confidence score (0-1) */
  confidence: number;

  /** Text blocks with metadata */
  blocks: IOcrBlock[];

  /** Name of the provider used */
  provider: string;

  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * Options for OCR processing.
 */
export interface IOcrOptions {
  /** Document language ('fra', 'eng', etc.) */
  language?: string;

  /** Document type for specific provider selection */
  documentType?: OcrDocumentType;

  /** Enable image preprocessing (contrast, binarization) */
  enhanceImage?: boolean;

  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * OCR configuration.
 */
export interface IOcrConfig {
  /** Default provider ('tesseract', 'openai-vision', 'google-vision', 'backend') */
  defaultProvider: string;

  /** Fallback provider if confidence is low */
  fallbackProvider: string | null;

  /** Minimum confidence threshold (0-1) */
  minConfidence: number;

  /** Provider override per document type */
  overrides: Partial<Record<OcrDocumentType, string>>;

  /** Backend OCR URL (for BackendOcrProvider) */
  backendOcrUrl: string | null;

  /** OpenAI API key */
  openaiKey: string | null;

  /** Google Vision API key */
  googleVisionKey: string | null;
}

/**
 * Interface that all OCR providers must implement.
 */
export interface IOcrEngine {
  /** Unique provider name */
  readonly name: string;

  /** Indicates if the provider is available (API key present, etc.) */
  readonly isAvailable: boolean;

  /**
   * Processes an image and extracts text.
   * @param image Image file to process
   * @param options Processing options
   * @returns OCR result
   */
  process(image: File, options?: IOcrOptions): Promise<IOcrResult>;

  /**
   * Releases resources (worker, etc.)
   */
  dispose?(): Promise<void>;
}
