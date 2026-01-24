import { ContactExtractor } from '../../src/shared/ocr/extractors/contact.extractor';
import { CityLookup } from '../../src/shared/ocr/patterns/city-lookup';
import { FR_LOCALE } from '../../src/shared/ocr/locales/fr.locale';

describe('Address Extraction', () => {
  const extractor = new ContactExtractor();
  const cityLookup = CityLookup.getInstance();
  const frLocale = FR_LOCALE;

  describe('CityLookup.looksLikeAddress', () => {
    it('should return FALSE for lines containing FACTURE N°', () => {
      const testCases = [
        'FACTURE N° : 20250388 GALERIE MARCHANDE MARJANE, CASABLANCA - MAROC',
        'Facture N°2025-001 Casablanca',
        'FACTURE PRO N° 12345',
        'N° : 20250388 Casablanca',
      ];

      testCases.forEach(line => {
        expect(cityLookup.looksLikeAddress(line)).toBe(false);
      });
    });

    it('should return FALSE for lines containing BL/BC numbers', () => {
      const testCases = [
        'BL N° 12345 Rabat',
        'BC N°2025/001',
        'Bon de livraison 12345',
      ];

      testCases.forEach(line => {
        expect(cityLookup.looksLikeAddress(line)).toBe(false);
      });
    });

    it('should return TRUE for valid address lines', () => {
      const testCases = [
        '123 Boulevard Mohammed V',
        'Casablanca - Maroc',
        'Zone Industrielle Ain Sebaa',
        '15 Rue Ibn Tofail, Rabat',
        '75008 Paris',
        'Lot 45, Quartier Industriel',
      ];

      testCases.forEach(line => {
        expect(cityLookup.looksLikeAddress(line)).toBe(true);
      });
    });
  });

  describe('CityLookup.isStopLine', () => {
    it('should return TRUE for facture lines', () => {
      const testCases = [
        'FACTURE N° : 20250388',
        'Facture Pro N° 123',
        'Facture Avoir N° 456',
      ];

      testCases.forEach(line => {
        expect(cityLookup.isStopLine(line)).toBe(true);
      });
    });

    it('should return TRUE for identifiers', () => {
      const testCases = [
        'ICE: 001234567000089',
        'I.F.: 12345678',
        'R.C.: 12345',
      ];

      testCases.forEach(line => {
        expect(cityLookup.isStopLine(line)).toBe(true);
      });
    });
  });

  describe('ContactExtractor.extractAddress', () => {
    it('should NOT extract facture number as address', () => {
      const text = `OPTICA VISION SARL
FACTURE N° : 20250388
ICE: 001234567000089
Date: 15/01/2025`;

      // Verify the facture line is correctly detected as document line
      const factureLine = 'FACTURE N° : 20250388';
      expect(cityLookup.looksLikeAddress(factureLine)).toBe(false);

      const result = extractor.extractAddress(text, frLocale, 'OPTICA VISION SARL');

      // Result should be null since no valid address exists
      expect(result.value).toBeNull();
    });

    it('should extract address part from facture line when address is appended (same line)', () => {
      const text = `OPTICA VISION SARL
FACTURE N° : 20250388 GALERIE MARCHANDE MARJANE, CASABLANCA - MAROC
ICE: 001234567000089
Date: 15/01/2025`;

      // Verify the full facture line is detected as document line
      const factureLine = 'FACTURE N° : 20250388 GALERIE MARCHANDE MARJANE, CASABLANCA - MAROC';
      expect(cityLookup.looksLikeAddress(factureLine)).toBe(false);

      // Verify the partial line starting with N° is also detected as document line
      const partialLine = 'N° : 20250388 GALERIE MARCHANDE MARJANE, CASABLANCA - MAROC';
      expect(cityLookup.looksLikeAddress(partialLine)).toBe(false);

      const result = extractor.extractAddress(text, frLocale, 'OPTICA VISION SARL');

      // Should extract the address part using GALERIE keyword
      // This is valid - the address IS appended to the facture line
      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      // Should NOT contain the document number part
      expect(result.value).not.toContain('FACTURE');
      expect(result.value).not.toContain('20250388');
    });

    it('should extract address part from facture line when city is on separate line', () => {
      // Real OCR case: address after facture number, city on next line
      const text = `OPTICA VISION SARL
FACTURE N° : 20250388 GALERIE MARCHANDE MARJANE
CASABLANCA - MAROC
ICE: 001234567000089
Date: 15/01/2025`;

      const result = extractor.extractAddress(text, frLocale, 'OPTICA VISION SARL');

      // Should extract GALERIE MARCHANDE MARJANE as street
      expect(result.value).toBeTruthy();
      expect(result.street).toBe('GALERIE MARCHANDE MARJANE');
      expect(result.city).toBe('Casablanca');
      // Should NOT contain the document number part
      expect(result.value).not.toContain('FACTURE');
      expect(result.value).not.toContain('20250388');
    });

    it('should extract address from separate line', () => {
      const text = `OPTICA VISION SARL
123 Boulevard Mohammed V
Casablanca - Maroc
ICE: 001234567000089
Tél: 05 22 12 34 56

FACTURE N° : 20250388`;

      const result = extractor.extractAddress(text, frLocale, 'OPTICA VISION SARL');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      expect(result.value).toContain('Boulevard Mohammed V');
    });

    it('should extract address with Zone Industrielle', () => {
      const text = `OPTIQUE SERVICES
Zone Industrielle Ain Sebaa
Lot 45, Casablanca
ICE: 002345678000012

BL N° 12345`;

      const result = extractor.extractAddress(text, frLocale, 'OPTIQUE SERVICES');

      expect(result.value).toBeTruthy();
      // Ain Sebaa is recognized as a city (industrial zone in Casablanca)
      expect(result.city).toBe('Ain Sebaa');
    });

    it('should extract labeled address', () => {
      const text = `LENS DISTRIBUTION
Adresse: 45 Rue Ibn Tofail, Rabat
ICE: 003456789000023
Tél: 05 37 65 43 21`;

      const result = extractor.extractAddress(text, frLocale);

      expect(result.value).toBeTruthy();
      expect(result.value).toContain('Ibn Tofail');
      expect(result.city).toBe('Rabat');
    });

    it('should extract French address with postal code', () => {
      const text = `OPTIQUE FRANCE SAS
15 Avenue des Champs-Élysées
75008 Paris - France
SIRET: 123 456 789 00012`;

      const result = extractor.extractAddress(text, frLocale, 'OPTIQUE FRANCE SAS');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Paris');
      expect(result.postalCode).toBe('75008');
    });

    it('should extract first valid address when multiple cities present', () => {
      const text = `ESSILOR MAROC
Siège social: Zone Industrielle Bouskoura
Casablanca - Maroc

Livré à: OPTICA VISION
Galerie Marjane, Casablanca

FACTURE N°: 2025-0099`;

      const result = extractor.extractAddress(text, frLocale, 'ESSILOR MAROC');

      expect(result.value).toBeTruthy();
      // Bouskoura is recognized as a city (industrial zone near Casablanca)
      expect(result.city).toBe('Bouskoura');
    });

    it('should extract street from line above city', () => {
      const text = `OPTICA DISTRIBUTION
GALERIE MARCHANDE MARJANE
CASABLANCA - MAROC
ICE: 001234567000089
Tél: 05 22 12 34 56`;

      const result = extractor.extractAddress(text, frLocale, 'OPTICA DISTRIBUTION');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      expect(result.street).toBe('GALERIE MARCHANDE MARJANE');
      expect(result.value).toContain('GALERIE MARCHANDE MARJANE');
    });

    it('should extract street when city is on same line as country', () => {
      const text = `FOURNISSEUR OPTIQUE SARL
45 Avenue Hassan II
Rabat, Maroc
ICE: 002345678000012`;

      const result = extractor.extractAddress(text, frLocale, 'FOURNISSEUR OPTIQUE SARL');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Rabat');
      expect(result.street).toBe('45 Avenue Hassan II');
    });
  });

  describe('Location/Emplacement extraction (streetLine2)', () => {
    it('should extract location into street when no numbered street exists', () => {
      const text = `OPTICA DISTRIBUTION
GALERIE MARCHANDE MARJANE
CASABLANCA - MAROC
ICE: 001234567000089`;

      const result = extractor.extractAddress(text, frLocale, 'OPTICA DISTRIBUTION');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      expect(result.street).toBe('GALERIE MARCHANDE MARJANE');
      expect(result.streetLine2).toBeNull();
    });

    it('should extract location into streetLine2 when numbered street exists', () => {
      const text = `OPTICA VISION SARL
GALERIE MARCHANDE MARJANE
123 Boulevard Mohammed V
CASABLANCA - MAROC
ICE: 001234567000089`;

      const result = extractor.extractAddress(text, frLocale, 'OPTICA VISION SARL');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      expect(result.street).toBe('123 Boulevard Mohammed V');
      expect(result.streetLine2).toBe('GALERIE MARCHANDE MARJANE');
    });

    it('should handle Zone Industrielle as location', () => {
      const text = `OPTIQUE SERVICES
Zone Industrielle Sidi Bernoussi
Lot 45
Casablanca
ICE: 002345678000012`;

      const result = extractor.extractAddress(text, frLocale, 'OPTIQUE SERVICES');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      // Zone Industrielle goes to street as primary location
      expect(result.street).toBe('Zone Industrielle Sidi Bernoussi');
    });

    it('should handle Centre Commercial location', () => {
      const text = `LENS BOUTIQUE
Centre Commercial Morocco Mall
Casablanca - Maroc
Tél: 05 22 12 34 56`;

      const result = extractor.extractAddress(text, frLocale, 'LENS BOUTIQUE');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      expect(result.street).toBe('Centre Commercial Morocco Mall');
      expect(result.streetLine2).toBeNull();
    });

    it('should handle Résidence location with numbered street', () => {
      const text = `OPTICAL CENTER
Résidence Les Palmiers
25 Rue Ibn Sina
Rabat, Maroc
ICE: 003456789000023`;

      const result = extractor.extractAddress(text, frLocale, 'OPTICAL CENTER');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Rabat');
      expect(result.street).toBe('25 Rue Ibn Sina');
      expect(result.streetLine2).toBe('Résidence Les Palmiers');
    });

    it('should handle French commercial location (ZAC)', () => {
      const text = `OPTIQUE FRANCE SAS
ZAC des Entrepreneurs
15 Avenue de la République
75011 Paris
SIRET: 123 456 789 00012`;

      const result = extractor.extractAddress(text, frLocale, 'OPTIQUE FRANCE SAS');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Paris');
      expect(result.postalCode).toBe('75011');
      expect(result.street).toBe('15 Avenue de la République');
      expect(result.streetLine2).toBe('ZAC des Entrepreneurs');
    });

    it('should handle Immeuble location', () => {
      const text = `VISION PLUS
Immeuble Atlas Business Center
Casablanca
ICE: 004567890000034`;

      const result = extractor.extractAddress(text, frLocale, 'VISION PLUS');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      expect(result.street).toBe('Immeuble Atlas Business Center');
    });

    it('should handle Quartier location', () => {
      const text = `OPTI MAROC
Quartier des Affaires
Marrakech - Maroc
Tél: 05 24 12 34 56`;

      const result = extractor.extractAddress(text, frLocale, 'OPTI MAROC');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Marrakech');
      expect(result.street).toBe('Quartier des Affaires');
    });

    it('should handle complex multi-line address with location and street', () => {
      const text = `ESSILOR DISTRIBUTION
Centre Commercial Anfaplace
Niveau 2, Local 205
15 Boulevard de la Corniche
Casablanca 20000 - Maroc
ICE: 005678901000045`;

      const result = extractor.extractAddress(text, frLocale, 'ESSILOR DISTRIBUTION');

      expect(result.value).toBeTruthy();
      expect(result.city).toBe('Casablanca');
      // Street should be the numbered street
      expect(result.street).toBe('15 Boulevard de la Corniche');
      // Location and other details should be in streetLine2
      expect(result.streetLine2).toContain('Centre Commercial Anfaplace');
    });
  });
});
