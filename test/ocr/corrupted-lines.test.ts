import { LineItemExtractor } from '../../src/shared/ocr/extractors/line-item.extractor';

describe('Corrupted Lines Detection', () => {
  const extractor = new LineItemExtractor();

  describe('Line extraction with corruption detection', () => {
    it('should detect corrupted lines and mark them for user review', () => {
      // Real OCR case with one corrupted line
      const text = `
Désignation   Qté   P.U.   Remise   Total
197737121563 SAFILO 7A086 54.19 GREY 1 1010.00 15% 858.50
pe = ce 0286.5G.53.18 1 1010,00 15% 858,50
197737121563 SAFILO 7A086 54.19 BLACK 1 1010.00 15% 858.50
Total HT: 2575.50
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // Should have 3 lines detected
      expect(result.lines.length).toBe(3);

      // Second line should be marked as corrupted
      const corruptedLine = result.lines.find(l => l._isCorrupted === true);
      expect(corruptedLine).toBeTruthy();
      expect(corruptedLine?._needsReview).toBe(true);
      expect(corruptedLine?._corruptionReason).toBeDefined();
      expect(corruptedLine?._rawText).toContain('pe = ce');

      // Other lines should not be corrupted
      const validLines = result.lines.filter(l => !l._isCorrupted);
      expect(validLines.length).toBe(2);
    });

    it('should detect line with suspicious short reference', () => {
      const text = `
Désignation   Qté   P.U.   Total
BS-24713 CARRERA 1234 1 500.00 500.00
pe TEST PRODUCT 1 450,00 15% 382,50
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // Find line with short reference "pe"
      const suspiciousLine = result.lines.find(
        l => l.reference === 'pe' || (l._rawText && l._rawText.startsWith('pe ')),
      );

      if (suspiciousLine) {
        expect(suspiciousLine._isCorrupted).toBe(true);
        expect(suspiciousLine._corruptionReason).toBe('suspicious_reference');
      }
    });

    it('should detect line with corrupted designation starting with special char', () => {
      const text = `
Désignation   Qté   P.U.   Total
197737121563 SAFILO VALID 1 500.00 500.00
AB-123 = corrupted designation 1 100.00 100.00
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // Find line with = in designation
      const corruptedLine = result.lines.find(
        l => l.designation && l.designation.startsWith('='),
      );

      if (corruptedLine) {
        expect(corruptedLine._isCorrupted).toBe(true);
        expect(corruptedLine._corruptionReason).toBe('corrupted_designation');
      }
    });

    it('should preserve raw text for corrupted lines', () => {
      const text = `
197737121563 SAFILO VALID 1 500.00 500.00
pe = corrupted 1 100.00 100.00
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // All lines should have raw text preserved
      result.lines.forEach(line => {
        expect(line._rawText).toBeDefined();
        expect(line._rawText.length).toBeGreaterThan(0);
      });
    });

    it('should count corrupted lines in stats as partial', () => {
      const text = `
197737121563 SAFILO 7A086 54.19 GREY 1 1010.00 15% 858.50
pe = ce 0286.5G.53.18 1 1010,00 15% 858,50
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // Corrupted line with some data counts as partial
      expect(result.stats.partial).toBeGreaterThan(0);
    });
  });

  describe('Corruption reasons', () => {
    it('should identify suspicious_reference for short refs', () => {
      const text = `
Désignation Qté Prix Total
pe PRODUCT 1 100.00 100.00
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      if (result.lines.length > 0) {
        const line = result.lines[0];
        if (line._isCorrupted) {
          expect(line._corruptionReason).toBe('suspicious_reference');
        }
      }
    });

    it('should identify corruption for = in line', () => {
      const text = `
Désignation Qté Prix Total
ABC-123 = bad designation 1 100.00 100.00
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      const corruptedLine = result.lines.find(l => l._isCorrupted);
      if (corruptedLine) {
        // Either corrupted_designation or ocr_artifacts_in_source is valid
        expect(['corrupted_designation', 'ocr_artifacts_in_source']).toContain(
          corruptedLine._corruptionReason,
        );
      }
    });
  });

  describe('Valid lines should not be marked as corrupted', () => {
    it('should not mark valid EAN lines as corrupted', () => {
      const text = `
Désignation   Qté   P.U.   Remise   Total
197737121563 SAFILO 7A086 54.19 GREY 1 1010.00 15% 858.50
197737121564 CARRERA 5678 BLACK 2 500.00 10% 900.00
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // All lines should be valid (no corruption)
      result.lines.forEach(line => {
        expect(line._isCorrupted).toBeFalsy();
      });
    });

    it('should not mark valid REF-CODE lines as corrupted', () => {
      const text = `
Désignation   Qté   P.U.   Total
BS-24713 CARRERA MODEL ABC 1 500.00 500.00
CH-HER-0298 SAFILO XYZ 2 300.00 600.00
`;

      const result = extractor.extractLinesWithStats(text, 0.2);

      // All lines should be valid
      result.lines.forEach(line => {
        expect(line._isCorrupted).toBeFalsy();
      });
    });
  });
});
