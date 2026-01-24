import { IInvoiceLine, IInvoiceTotals } from '../supplier-invoice.models';

/**
 * Validation result for cross-checking totals.
 */
export interface ITotalsValidationResult {
  /** Overall validation passed */
  isValid: boolean;

  /** Calculated total from lines */
  calculatedTotalHT: number;

  /** Expected total from invoice */
  expectedTotalHT: number;

  /** Absolute difference */
  difference: number;

  /** Percentage difference */
  percentageDiff: number;

  /** Detailed breakdown */
  details: {
    /** Lines with valid totals */
    validLines: number;
    /** Lines with missing totals */
    missingTotals: number;
    /** Lines with calculated totals (qty * price) */
    calculatedTotals: number;
    /** Likely missing lines (if gap is too large) */
    estimatedMissingLines: number;
  };

  /** Warnings for user */
  warnings: string[];

  /** Suggested corrections */
  suggestions: ISuggestion[];
}

/**
 * Suggestion for correcting extraction issues.
 */
export interface ISuggestion {
  type: 'missing_line' | 'price_error' | 'quantity_error' | 'total_mismatch';
  message: string;
  lineIndex?: number;
  suggestedValue?: number;
}

/**
 * Configuration for totals validation.
 */
export interface ITotalsValidatorConfig {
  /** Tolerance percentage for total matching (default: 1%) */
  tolerancePercent: number;
  /** Absolute tolerance for small amounts (default: 1.00) */
  absoluteTolerance: number;
  /** Average line value for estimating missing lines (default: 500) */
  averageLineValue: number;
  /** Maximum allowed percentage difference before flagging (default: 5%) */
  maxAllowedDiffPercent: number;
}

const DEFAULT_CONFIG: ITotalsValidatorConfig = {
  tolerancePercent: 1,
  absoluteTolerance: 1.0,
  averageLineValue: 500,
  maxAllowedDiffPercent: 5,
};

/**
 * Validates extracted line totals against invoice totals.
 * Detects missing lines, extraction errors, and provides suggestions.
 */
export class TotalsValidator {
  readonly #config: ITotalsValidatorConfig;

  constructor(config: Partial<ITotalsValidatorConfig> = {}) {
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validates lines against expected totals.
   * @param lines Extracted invoice lines
   * @param totals Invoice totals from footer
   * @returns Validation result with diagnostics
   */
  validate(lines: IInvoiceLine[], totals: IInvoiceTotals): ITotalsValidationResult {
    const warnings: string[] = [];
    const suggestions: ISuggestion[] = [];

    // Calculate total from lines
    let validLines = 0;
    let missingTotals = 0;
    let calculatedTotals = 0;
    let calculatedTotalHT = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.totalHT !== null && line.totalHT > 0) {
        calculatedTotalHT += line.totalHT;
        validLines++;
      } else if (line.quantity !== null && line.unitPriceHT !== null) {
        // Calculate from qty * price
        const discount = line.discountRate ?? 0;
        const lineTotal = line.quantity * line.unitPriceHT * (1 - discount);
        calculatedTotalHT += lineTotal;
        calculatedTotals++;

        suggestions.push({
          type: 'total_mismatch',
          message: `Ligne ${i + 1}: Total calculé (${lineTotal.toFixed(2)}) à partir de qté × prix`,
          lineIndex: i,
          suggestedValue: lineTotal,
        });
      } else {
        missingTotals++;
        warnings.push(`Ligne ${i + 1}: Impossible de calculer le total (données manquantes)`);
      }
    }

    const expectedTotalHT = totals.totalHT;
    const difference = Math.abs(calculatedTotalHT - expectedTotalHT);
    const percentageDiff = expectedTotalHT > 0 ? (difference / expectedTotalHT) * 100 : 0;

    // Determine if valid based on tolerance
    const isWithinPercent = percentageDiff <= this.#config.tolerancePercent;
    const isWithinAbsolute = difference <= this.#config.absoluteTolerance;
    const isValid = isWithinPercent || isWithinAbsolute;

    // Estimate missing lines if difference is significant
    let estimatedMissingLines = 0;
    if (!isValid && calculatedTotalHT < expectedTotalHT) {
      const gap = expectedTotalHT - calculatedTotalHT;
      estimatedMissingLines = Math.round(gap / this.#config.averageLineValue);

      if (estimatedMissingLines > 0) {
        warnings.push(
          `Différence de ${difference.toFixed(2)} DH - environ ${estimatedMissingLines} ligne(s) potentiellement manquante(s)`,
        );

        suggestions.push({
          type: 'missing_line',
          message: `Vérifier le document: ${estimatedMissingLines} ligne(s) estimée(s) manquante(s) pour un total de ${gap.toFixed(2)} DH`,
        });
      }
    }

    // Check for over-extraction (more than expected)
    if (calculatedTotalHT > expectedTotalHT * 1.1) {
      warnings.push(
        `Total calculé (${calculatedTotalHT.toFixed(2)}) supérieur au total facture (${expectedTotalHT.toFixed(2)}) - vérifier les lignes dupliquées`,
      );

      suggestions.push({
        type: 'price_error',
        message: 'Vérifier les lignes pour détecter des doublons ou erreurs de prix',
      });
    }

    // Check individual line anomalies
    this.#detectLineAnomalies(lines, suggestions, warnings);

    // Add general warnings
    if (missingTotals > 0) {
      warnings.push(`${missingTotals} ligne(s) sans total extractible`);
    }

    if (percentageDiff > this.#config.maxAllowedDiffPercent) {
      warnings.push(
        `Écart important (${percentageDiff.toFixed(1)}%) entre total calculé et total facture`,
      );
    }

    return {
      isValid,
      calculatedTotalHT: Math.round(calculatedTotalHT * 100) / 100,
      expectedTotalHT,
      difference: Math.round(difference * 100) / 100,
      percentageDiff: Math.round(percentageDiff * 100) / 100,
      details: {
        validLines,
        missingTotals,
        calculatedTotals,
        estimatedMissingLines,
      },
      warnings,
      suggestions,
    };
  }

  /**
   * Validates VAT calculation.
   * @param lines Lines with VAT rates
   * @param totals Invoice totals
   * @returns VAT validation result
   */
  validateVAT(
    lines: IInvoiceLine[],
    totals: IInvoiceTotals,
  ): { isValid: boolean; calculatedVAT: number; expectedVAT: number; warnings: string[] } {
    const warnings: string[] = [];

    // Group lines by VAT rate and calculate
    const vatByRate = new Map<number, number>();

    for (const line of lines) {
      const vatRate = line.vatRate ?? 0.2; // Default 20% if not specified
      const lineTotal = line.totalHT ?? 0;
      const current = vatByRate.get(vatRate) ?? 0;
      vatByRate.set(vatRate, current + lineTotal * vatRate);
    }

    // Sum all VAT
    let calculatedVAT = 0;
    vatByRate.forEach((vat, rate) => {
      calculatedVAT += vat;
      if (vat > 0) {
        // Log VAT breakdown for transparency
        const ratePercent = (rate * 100).toFixed(0);
        const baseAmount = vat / rate;
        warnings.push(`TVA ${ratePercent}% sur ${baseAmount.toFixed(2)} DH = ${vat.toFixed(2)} DH`);
      }
    });

    const expectedVAT = totals.totalVAT;
    const difference = Math.abs(calculatedVAT - expectedVAT);
    const isValid = difference <= this.#config.absoluteTolerance ||
                    (expectedVAT > 0 && difference / expectedVAT <= 0.02);

    if (!isValid) {
      warnings.push(
        `Écart TVA: calculée ${calculatedVAT.toFixed(2)} vs facture ${expectedVAT.toFixed(2)}`,
      );
    }

    return {
      isValid,
      calculatedVAT: Math.round(calculatedVAT * 100) / 100,
      expectedVAT,
      warnings,
    };
  }

  /**
   * Quick validation - just checks if totals match.
   * @param lines Extracted lines
   * @param expectedTotalHT Expected total HT
   * @returns true if within tolerance
   */
  quickValidate(lines: IInvoiceLine[], expectedTotalHT: number): boolean {
    const calculatedTotal = lines.reduce((sum, line) => {
      if (line.totalHT !== null) return sum + line.totalHT;
      if (line.quantity !== null && line.unitPriceHT !== null) {
        const discount = line.discountRate ?? 0;
        return sum + line.quantity * line.unitPriceHT * (1 - discount);
      }
      return sum;
    }, 0);

    const difference = Math.abs(calculatedTotal - expectedTotalHT);
    const tolerance = Math.max(this.#config.absoluteTolerance, expectedTotalHT * (this.#config.tolerancePercent / 100));

    return difference <= tolerance;
  }

  /**
   * Detects anomalies in individual lines.
   */
  #detectLineAnomalies(lines: IInvoiceLine[], suggestions: ISuggestion[], warnings: string[]): void {
    // Calculate statistics
    const totals = lines
      .map(l => l.totalHT)
      .filter((t): t is number => t !== null && t > 0);

    if (totals.length < 2) return;

    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const stdDev = Math.sqrt(
      totals.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / totals.length,
    );

    // Find outliers (> 3 standard deviations)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const total = line.totalHT;

      if (total !== null && total > 0) {
        const zScore = (total - avg) / stdDev;

        if (Math.abs(zScore) > 3) {
          warnings.push(
            `Ligne ${i + 1}: Montant inhabituel (${total.toFixed(2)} DH) - vérifier l'extraction`,
          );
          suggestions.push({
            type: 'price_error',
            message: `Ligne ${i + 1}: Total ${total.toFixed(2)} DH semble anormal (moyenne: ${avg.toFixed(2)} DH)`,
            lineIndex: i,
          });
        }
      }

      // Check qty * price = total consistency
      if (line.quantity !== null && line.unitPriceHT !== null && total !== null) {
        const discount = line.discountRate ?? 0;
        const expected = line.quantity * line.unitPriceHT * (1 - discount);
        const lineDiff = Math.abs(expected - total);

        if (lineDiff > 1 && lineDiff / total > 0.05) {
          suggestions.push({
            type: 'total_mismatch',
            message: `Ligne ${i + 1}: Total (${total.toFixed(2)}) ≠ qté × prix (${expected.toFixed(2)})`,
            lineIndex: i,
            suggestedValue: expected,
          });
        }
      }
    }
  }
}
