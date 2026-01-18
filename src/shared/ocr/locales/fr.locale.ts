import { IOcrLocale } from './locale.interface';

/**
 * French locale patterns for OCR extraction.
 */
export const FR_LOCALE: IOcrLocale = {
  code: 'fr',

  months: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],

  invoiceNumber: [
    /(?:facture|ref|fc)\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
    /n°?\s*facture\s*[:]?\s*([A-Z0-9\-/]+)/i,
    /bon\s*de\s*livraison\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
    /ref(?:érence)?\s*[:]?\s*([A-Z0-9\-/]+)/i,
    /bl\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
  ],

  dateContext: {
    invoice: [
      /(?:date|du|le|facture\s*du)\s*:?\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/i,
      /date\s*(?:de\s*)?(?:la\s*)?facture[:\s]*(.{10,25})/i,
      /date\s*d['']?émission[:\s]*(.{10,25})/i,
      /facturé\s*le[:\s]*(.{10,25})/i,
      /le[,\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/i,
      /(\b\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})\b/,
    ],
    due: [
      /(?:date\s*d['']?)?échéance[:\s]*(.{10,25})/i,
      /date\s*limite\s*(?:de\s*)?paiement[:\s]*(.{10,25})/i,
      /à\s*payer\s*avant\s*le[:\s]*(.{10,25})/i,
      /payable\s*(?:avant\s*)?le[:\s]*(.{10,25})/i,
    ],
  },

  amounts: {
    totalHT: [
      /total\s*[àa]\s*reporter\s*[:\s]*([\d\s.,]+)/i,
      /total\s*(?:hors\s*taxes?|h\.?t\.?)[:\s]*([\d\s.,]+)/i,
      /montant\s*h\.?t\.?[:\s]*([\d\s.,]+)/i,
      /sous[- ]?total\s*h\.?t\.?[:\s]*([\d\s.,]+)/i,
      /h\.?t\.?\s*[:]?\s*([\d\s.,]+)\s*(?:dh|mad|€|eur)/i,
      /report\s*[:\s]*([\d\s.,]+)/i,
    ],
    totalTTC: [
      /total\s*(?:toutes\s*taxes\s*comprises?|t\.?t\.?c\.?)[:\s]*([\d\s.,]+)/i,
      /montant\s*t\.?t\.?c\.?[:\s]*([\d\s.,]+)/i,
      /total\s*général[:\s]*([\d\s.,]+)/i,
      /net\s*[àa]\s*payer\s*t\.?t\.?c\.?[:\s]*([\d\s.,]+)/i,
      /t\.?t\.?c\.?\s*[:]?\s*([\d\s.,]+)\s*(?:dh|mad|€|eur)/i,
    ],
    vat: [
      /(?:tva|t\.v\.a\.?)\s*(?:\(?\s*\d+\s*%?\s*\)?)?[:\s]*([\d\s.,]+)/i,
      /taxe\s*(?:sur\s*la\s*valeur\s*ajoutée)?[:\s]*([\d\s.,]+)/i,
      /montant\s*(?:de\s*la\s*)?tva[:\s]*([\d\s.,]+)/i,
    ],
    discount: [
      /remise[:\s]*([\d\s.,]+)/i,
      /réduction[:\s]*([\d\s.,]+)/i,
      /rabais[:\s]*([\d\s.,]+)/i,
      /escompte[:\s]*([\d\s.,]+)/i,
    ],
    netToPay: [
      /net\s*[àa]\s*payer[:\s]*([\d\s.,]+)/i,
      /montant\s*[àa]\s*payer[:\s]*([\d\s.,]+)/i,
      /reste\s*[àa]\s*payer[:\s]*([\d\s.,]+)/i,
      /solde\s*[àa]\s*payer[:\s]*([\d\s.,]+)/i,
    ],
  },

  supplier: {
    name: [
      /(?:société|sarl|sa|sas|sasu|eurl|ei|snc)\s+([A-ZÀ-Ü][A-Za-zÀ-ü\s&.-]{2,50})/i,
      /(?:raison\s*sociale|fournisseur)[:\s]*([A-ZÀ-Ü][A-Za-zÀ-ü\s&.-]{2,50})/i,
      /([A-ZÀ-Ü][A-Za-zÀ-ü\s&.-]{2,40})\s+(?:SARL|SA|SAS|SASU|EURL|EI|SNC)/i,
      /^.*(?:DISTRIBUTION|SOCIETE|OPTICAL|VISION|LUNETTES|EYEWEAR|OPTIQUE).*$/im,
    ],
    address: [
      /adresse[:\s]*(.+?)(?:\n|tél|tel|phone|fax|ice|if|rc|email)/i,
      /(?:siège\s*social|domicilié)[:\s]*(.+?)(?:\n|tél|tel)/i,
    ],
    phone: [
      /(?:tél(?:éphone)?|tel|phone|gsm|mobile|fax)\s*[.:]?\s*([\d\s.+()-]{10,20})/i,
      /(?:fixe|portable)\s*[.:]?\s*([\d\s.+()-]{10,20})/i,
    ],
  },

  paymentTerms: [
    /(?:modalités?|conditions?)\s*(?:de\s*)?paiement[:\s]*(.{10,60})/i,
    /paiement\s*[:]?\s*(comptant|immédiat|[àa]\s*\d+\s*jours?|[àa]\s*réception|fin\s*de\s*mois)/i,
    /règlement\s*[:]?\s*(comptant|immédiat|[àa]\s*\d+\s*jours?|par\s*(?:virement|chèque|carte))/i,
    /(?:délai|terme)\s*(?:de\s*)?paiement[:\s]*(.{10,40})/i,
  ],

  stopWords: [
    'le',
    'la',
    'les',
    'de',
    'du',
    'des',
    'un',
    'une',
    'et',
    'ou',
    'à',
    'au',
    'aux',
    'en',
    'pour',
    'par',
    'sur',
    'avec',
    'sans',
    'sous',
    'entre',
    'vers',
    'chez',
    'dans',
    'page',
    'total',
    'montant',
  ],

  noiseKeywords: [
    'total a reporter',
    'total à reporter',
    'net à payer',
    'net a payer',
    'arrêtée la présente',
    'arretee la presente',
    'somme toutes taxes',
  ],

  invoiceNumberFallback: [
    /(FA\d{6,}[A-Za-z0-9]*)/,
    /(BL\d{6,}[A-Za-z0-9]*)/,
    /(FC\d{6,}[A-Za-z0-9]*)/,
    /([A-Z]{2,3}\d{4,})/,
  ],
};
