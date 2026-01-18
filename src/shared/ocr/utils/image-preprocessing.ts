/**
 * Image preprocessing utilities for OCR optimization.
 * Applies grayscale conversion and contrast enhancement.
 */

/**
 * Preprocesses an image for better OCR results.
 * Applies grayscale conversion and contrast enhancement.
 * @param imageUrl URL or data URL of the image
 * @returns Promise resolving to preprocessed image data URL
 */
export async function preprocessImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply grayscale and contrast enhancement
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Grayscale using luminance formula
          let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          // Contrast increase (Factor 1.2 = 20% boost)
          const contrastFactor = 1.2;
          gray = contrastFactor * (gray - 128) + 128;

          // Clamp to valid range
          gray = Math.max(0, Math.min(255, gray));

          // Write back (no binarization - Tesseract handles grayscale better)
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 1.0));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = imageUrl;
  });
}

/**
 * Configuration for image preprocessing.
 */
export interface IPreprocessConfig {
  /** Contrast factor (1.0 = no change, 1.2 = 20% boost) */
  contrastFactor: number;
  /** Output format */
  outputFormat: 'image/jpeg' | 'image/png';
  /** Output quality (0-1 for JPEG) */
  outputQuality: number;
}

/**
 * Default preprocessing configuration.
 */
export const DEFAULT_PREPROCESS_CONFIG: IPreprocessConfig = {
  contrastFactor: 1.2,
  outputFormat: 'image/jpeg',
  outputQuality: 1.0,
};

/**
 * Preprocesses an image with custom configuration.
 * @param imageUrl URL or data URL of the image
 * @param config Preprocessing configuration
 * @returns Promise resolving to preprocessed image data URL
 */
export async function preprocessImageWithConfig(
  imageUrl: string,
  config: Partial<IPreprocessConfig> = {},
): Promise<string> {
  const finalConfig = { ...DEFAULT_PREPROCESS_CONFIG, ...config };

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Grayscale using luminance formula
          let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          // Apply contrast
          gray = finalConfig.contrastFactor * (gray - 128) + 128;
          gray = Math.max(0, Math.min(255, gray));

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL(finalConfig.outputFormat, finalConfig.outputQuality));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * PDF page rendering configuration.
 */
export interface IPdfRenderConfig {
  /** Scale factor for rendering (higher = better quality but slower) */
  scale: number;
  /** Enable WebGL acceleration */
  enableWebGL: boolean;
}

/**
 * Default PDF rendering configuration.
 */
export const DEFAULT_PDF_CONFIG: IPdfRenderConfig = {
  scale: 4.0,
  enableWebGL: true,
};

/**
 * Page separator used when combining multi-page OCR results.
 */
export const PAGE_SEPARATOR = '\n---\n';
