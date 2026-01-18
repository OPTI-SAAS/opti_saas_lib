import { IOcrLocale } from './locale.interface';

/**
 * English locale patterns for OCR extraction.
 */
export const EN_LOCALE: IOcrLocale = {
  code: 'en',

  months: [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ],

  invoiceNumber: [
    /(?:invoice|inv|ref)\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
    /inv(?:oice)?\s*no\.?\s*[:]?\s*([A-Z0-9\-/]+)/i,
    /bill\s*(?:of\s*sale)?\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
    /ref(?:erence)?\s*[:]?\s*([A-Z0-9\-/]+)/i,
    /order\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
    /po\s*(?:n°|no|n\.|n0|n|#)?\s*[:.]?\s*([A-Za-z0-9\-\/]+)/i,
  ],

  dateContext: {
    invoice: [
      /(?:date|dated)\s*:?\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/i,
      /invoice\s*date[:\s]*(.{10,25})/i,
      /date\s*(?:of\s*)?issue[:\s]*(.{10,25})/i,
      /billed\s*(?:on)?[:\s]*(.{10,25})/i,
      /dated?[:\s]*(.{10,25})/i,
      /(\b\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})\b/,
    ],
    due: [
      /due\s*date[:\s]*(.{10,25})/i,
      /payment\s*due[:\s]*(.{10,25})/i,
      /pay(?:able)?\s*by[:\s]*(.{10,25})/i,
      /terms?[:\s]*(.{10,25})/i,
    ],
  },

  amounts: {
    totalHT: [
      /sub\s*total[:\s]*([\d\s.,]+)/i,
      /total\s*(?:excl(?:uding)?\.?\s*(?:tax|vat))[:\s]*([\d\s.,]+)/i,
      /net\s*(?:amount|total)[:\s]*([\d\s.,]+)/i,
      /amount\s*(?:before|excl\.?)\s*(?:tax|vat)[:\s]*([\d\s.,]+)/i,
    ],
    totalTTC: [
      /(?:grand\s*)?total[:\s]*([\d\s.,]+)/i,
      /total\s*(?:incl(?:uding)?\.?\s*(?:tax|vat))[:\s]*([\d\s.,]+)/i,
      /amount\s*(?:due|payable)[:\s]*([\d\s.,]+)/i,
      /balance\s*due[:\s]*([\d\s.,]+)/i,
    ],
    vat: [
      /(?:vat|tax)\s*(?:\(?\s*\d+\s*%?\s*\)?)?[:\s]*([\d\s.,]+)/i,
      /sales\s*tax[:\s]*([\d\s.,]+)/i,
      /(?:vat|tax)\s*amount[:\s]*([\d\s.,]+)/i,
    ],
    discount: [
      /discount[:\s]*([\d\s.,]+)/i,
      /rebate[:\s]*([\d\s.,]+)/i,
      /reduction[:\s]*([\d\s.,]+)/i,
      /savings?[:\s]*([\d\s.,]+)/i,
    ],
    netToPay: [
      /(?:net\s*)?(?:amount\s*)?(?:to\s*)?pay[:\s]*([\d\s.,]+)/i,
      /balance\s*(?:due|owing)[:\s]*([\d\s.,]+)/i,
      /(?:please\s*)?pay\s*(?:this\s*amount)?[:\s]*([\d\s.,]+)/i,
    ],
  },

  supplier: {
    name: [
      /(?:company|corp(?:oration)?|inc|ltd|llc|plc)\s*[:]?\s*([A-Z][A-Za-z\s&.-]{2,50})/i,
      /(?:from|vendor|supplier|seller)[:\s]*([A-Z][A-Za-z\s&.-]{2,50})/i,
      /(?:bill(?:ed)?\s*(?:from|by))[:\s]*([A-Z][A-Za-z\s&.-]{2,50})/i,
      /^.*(?:DISTRIBUTION|COMPANY|OPTICAL|VISION|EYEWEAR|OPTICS|SUPPLIES).*$/im,
    ],
    address: [
      /address[:\s]*(.+?)(?:\n|tel|phone|fax|email|tax)/i,
      /(?:located|headquartered)\s*(?:at)?[:\s]*(.+?)(?:\n|tel|phone)/i,
    ],
    phone: [
      /(?:tel(?:ephone)?|phone|mobile|cell|fax)\s*[.:]?\s*([\d\s.+()-]{10,20})/i,
      /(?:call|contact)\s*[.:]?\s*([\d\s.+()-]{10,20})/i,
    ],
  },

  paymentTerms: [
    /(?:payment\s*)?terms?[:\s]*(.{10,60})/i,
    /pay(?:ment|able)\s*(?:within|in|by)?\s*(\d+\s*days?|immediately|upon\s*receipt|net\s*\d+)/i,
    /(?:due\s*)?(?:upon|on)\s*(receipt|delivery|completion)/i,
  ],

  stopWords: [
    'the',
    'a',
    'an',
    'of',
    'to',
    'and',
    'or',
    'in',
    'on',
    'at',
    'for',
    'by',
    'with',
    'from',
    'as',
    'is',
    'are',
    'was',
    'be',
    'page',
    'total',
    'amount',
    'this',
    'that',
  ],

  noiseKeywords: [
    'total to carry forward',
    'carry forward total',
    'balance forward',
    'net amount to pay',
    'total all taxes included',
  ],

  invoiceNumberFallback: [
    /(INV\d{6,}[A-Za-z0-9]*)/,
    /(PO\d{6,}[A-Za-z0-9]*)/,
    /(SO\d{6,}[A-Za-z0-9]*)/,
    /([A-Z]{2,3}\d{4,})/,
  ],
};
