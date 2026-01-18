import { IOcrBlock } from '../ocr.models';

/**
 * Default confidence threshold for warning detection.
 */
const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

/**
 * Maximum text length to include in warning message.
 */
const MAX_TEXT_LENGTH = 50;

/**
 * Detects OCR blocks with low confidence and generates warning messages.
 * @param blocks OCR blocks to analyze
 * @param threshold Confidence threshold (default 0.8)
 * @returns Array of warning messages for low confidence blocks
 */
export function detectLowConfidenceWarnings(
  blocks: IOcrBlock[],
  threshold = DEFAULT_CONFIDENCE_THRESHOLD,
): string[] {
  return blocks
    .filter((block) => block.confidence < threshold)
    .map((block) => {
      const truncatedText =
        block.text.length > MAX_TEXT_LENGTH
          ? `${block.text.substring(0, MAX_TEXT_LENGTH)}...`
          : block.text;
      return `Uncertain text: "${truncatedText}"`;
    });
}
