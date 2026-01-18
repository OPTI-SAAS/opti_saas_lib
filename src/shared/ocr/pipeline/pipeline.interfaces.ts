import { IOcrResult, IParseResult, OcrDocumentType } from '../';

/**
 * Available OCR provider types.
 */
export type OcrProviderType = 'tesseract' | 'backend' | 'google_vision' | 'azure';

/**
 * Available parser strategy types.
 */
export type ParserStrategyType = 'regex' | 'ai' | 'hybrid';

/**
 * Configuration for a single document type pipeline.
 */
export interface IPipelineDocumentConfig {
  /** OCR provider to use */
  provider: OcrProviderType;

  /** Parser strategy to use */
  parser: ParserStrategyType;

  /** Optional language override */
  language?: string;
}

/**
 * Global pipeline configuration.
 * Maps document types to their provider/parser combination.
 */
export interface IPipelineConfig {
  /** Default provider if not specified per document type */
  defaultProvider: OcrProviderType;

  /** Default parser strategy if not specified per document type */
  defaultParser: ParserStrategyType;

  /** Configuration per document type */
  documents: Partial<Record<OcrDocumentType, IPipelineDocumentConfig>>;
}

/**
 * Pipeline interface for processing documents.
 */
export interface IOcrPipeline<T> {
  /** Document type this pipeline handles */
  readonly documentType: OcrDocumentType;

  /** Provider type used */
  readonly providerType: OcrProviderType;

  /** Parser strategy used */
  readonly parserStrategy: ParserStrategyType;

  /**
   * Processes a document file.
   * @param file Image file to process
   * @returns Parsed result with structured data
   */
  process(file: File): Promise<IParseResult<T>>;

  /**
   * Processes raw OCR result (if OCR was done externally).
   * @param ocrResult OCR result to parse
   * @returns Parsed result with structured data
   */
  processOcrResult(ocrResult: IOcrResult): IParseResult<T>;
}

/**
 * Factory interface for creating pipelines.
 */
export interface IPipelineFactory {
  /**
   * Creates a pipeline for a document type.
   * @param documentType Type of document to process
   * @param configOverride Optional config override
   * @returns Configured pipeline
   */
  create<T>(
    documentType: OcrDocumentType,
    configOverride?: Partial<IPipelineDocumentConfig>,
  ): IOcrPipeline<T>;

  /**
   * Gets the current configuration.
   * @returns Pipeline configuration
   */
  getConfig(): IPipelineConfig;
}
