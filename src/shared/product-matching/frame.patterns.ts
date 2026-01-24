/**
 * Regex patterns for optical frame product matching.
 * Covers major eyewear brands and common designation formats.
 * Organized by manufacturer groups for better matching accuracy.
 */

import type { ProductCategory } from './matching.interfaces';

/**
 * Brand pattern with metadata for enhanced matching.
 */
export interface IBrandPattern {
  readonly pattern: RegExp;
  readonly canonicalName: string;
  readonly aliases: readonly string[];
  readonly group: ManufacturerGroup;
  readonly prefixes: readonly string[];
}

/**
 * Model format configuration for manufacturer-specific parsing.
 */
export interface IModelFormat {
  readonly pattern: RegExp;
  readonly description: string;
  readonly extractParts?: (match: RegExpMatchArray) => IModelParts;
}

/**
 * Extracted model parts from designation.
 */
export interface IModelParts {
  readonly model: string;
  readonly colorCode: string | null;
  readonly size: string | null;
  readonly variant: string | null;
}

/**
 * Major optical manufacturer groups.
 */
export type ManufacturerGroup =
  | 'essilorLuxottica'
  | 'safilo'
  | 'marcolin'
  | 'kering'
  | 'lvmh'
  | 'charmant'
  | 'deRigo'
  | 'marchon'
  | 'silhouette'
  | 'rodenstock'
  | 'independent'
  | 'sport'
  | 'economy'
  | 'asia'
  | 'turkey';

/**
 * Brand patterns with full metadata.
 * Organized by manufacturer group for efficient matching.
 */
export const BRAND_PATTERNS_MAP: ReadonlyMap<string, IBrandPattern> =
  new Map([
    // ============================================================
    // ESSILORLUXOTTICA GROUP
    // ============================================================
    [
      'RAY-BAN',
      {
        pattern: /\b(RAY[\s\-]?BAN|RAYBAN|RB)\b/i,
        canonicalName: 'Ray-Ban',
        aliases: ['RAY-BAN', 'RAYBAN', 'RAY BAN', 'RB'],
        group: 'essilorLuxottica',
        prefixes: ['RB', 'RX'],
      },
    ],
    [
      'OAKLEY',
      {
        pattern: /\b(OAKLEY|OAK|OO|OX)\b/i,
        canonicalName: 'Oakley',
        aliases: ['OAKLEY', 'OAK'],
        group: 'essilorLuxottica',
        prefixes: ['OO', 'OX', 'OJ'],
      },
    ],
    [
      'PERSOL',
      {
        pattern: /\b(PERSOL|PO)\b/i,
        canonicalName: 'Persol',
        aliases: ['PERSOL'],
        group: 'essilorLuxottica',
        prefixes: ['PO'],
      },
    ],
    [
      'VOGUE',
      {
        pattern: /\b(VOGUE\s?EYEWEAR|VOGUE|VO)\b/i,
        canonicalName: 'Vogue Eyewear',
        aliases: ['VOGUE', 'VOGUE EYEWEAR'],
        group: 'essilorLuxottica',
        prefixes: ['VO'],
      },
    ],
    [
      'OLIVER PEOPLES',
      {
        pattern: /\b(OLIVER\s?PEOPLES|OV)\b/i,
        canonicalName: 'Oliver Peoples',
        aliases: ['OLIVER PEOPLES', 'OLIVERPEOPLES'],
        group: 'essilorLuxottica',
        prefixes: ['OV'],
      },
    ],
    [
      'PRADA',
      {
        pattern: /\b(PRADA|PR|VPR|SPR)\b/i,
        canonicalName: 'Prada',
        aliases: ['PRADA'],
        group: 'essilorLuxottica',
        prefixes: ['PR', 'VPR', 'SPR'],
      },
    ],
    [
      'MIU MIU',
      {
        pattern: /\b(MIU\s?MIU|MU|VMU|SMU)\b/i,
        canonicalName: 'Miu Miu',
        aliases: ['MIU MIU', 'MIUMIU'],
        group: 'essilorLuxottica',
        prefixes: ['MU', 'VMU', 'SMU'],
      },
    ],
    [
      'VERSACE',
      {
        pattern: /\b(VERSACE|VE|MOD)\b/i,
        canonicalName: 'Versace',
        aliases: ['VERSACE'],
        group: 'essilorLuxottica',
        prefixes: ['VE', 'MOD'],
      },
    ],
    [
      'DOLCE & GABBANA',
      {
        pattern: /\b(DOLCE\s?(?:&|AND|E)?\s?GABBANA|D&G|DG)\b/i,
        canonicalName: 'Dolce & Gabbana',
        aliases: ['DOLCE & GABBANA', 'DOLCE AND GABBANA', 'DOLCE GABBANA', 'D&G', 'DG'],
        group: 'essilorLuxottica',
        prefixes: ['DG'],
      },
    ],
    [
      'GIORGIO ARMANI',
      {
        pattern: /\b(GIORGIO\s?ARMANI|GA|AR)\b/i,
        canonicalName: 'Giorgio Armani',
        aliases: ['GIORGIO ARMANI', 'GIORGIOARMANI'],
        group: 'essilorLuxottica',
        prefixes: ['AR', 'GA'],
      },
    ],
    [
      'EMPORIO ARMANI',
      {
        pattern: /\b(EMPORIO\s?ARMANI|EA)\b/i,
        canonicalName: 'Emporio Armani',
        aliases: ['EMPORIO ARMANI', 'EMPORIOARMANI'],
        group: 'essilorLuxottica',
        prefixes: ['EA'],
      },
    ],
    [
      'ARMANI EXCHANGE',
      {
        pattern: /\b(ARMANI\s?EXCHANGE|AX)\b/i,
        canonicalName: 'Armani Exchange',
        aliases: ['ARMANI EXCHANGE', 'ARMANIEXCHANGE', 'A|X'],
        group: 'essilorLuxottica',
        prefixes: ['AX'],
      },
    ],
    [
      'BURBERRY',
      {
        pattern: /\b(BURBERRY|BE)\b/i,
        canonicalName: 'Burberry',
        aliases: ['BURBERRY'],
        group: 'essilorLuxottica',
        prefixes: ['BE'],
      },
    ],
    [
      'MICHAEL KORS',
      {
        pattern: /\b(MICHAEL\s?KORS|MK)\b/i,
        canonicalName: 'Michael Kors',
        aliases: ['MICHAEL KORS', 'MICHAELKORS'],
        group: 'essilorLuxottica',
        prefixes: ['MK'],
      },
    ],
    [
      'COACH',
      {
        pattern: /\b(COACH|HC)\b/i,
        canonicalName: 'Coach',
        aliases: ['COACH'],
        group: 'essilorLuxottica',
        prefixes: ['HC'],
      },
    ],
    [
      'TIFFANY',
      {
        pattern: /\b(TIFFANY(?:\s?&\s?CO)?|TF)\b/i,
        canonicalName: 'Tiffany & Co.',
        aliases: ['TIFFANY', 'TIFFANY & CO', 'TIFFANY AND CO'],
        group: 'essilorLuxottica',
        prefixes: ['TF'],
      },
    ],
    [
      'RALPH LAUREN',
      {
        pattern: /\b(RALPH\s?LAUREN|RL|PH|POLO\s?RALPH\s?LAUREN)\b/i,
        canonicalName: 'Ralph Lauren',
        aliases: ['RALPH LAUREN', 'RALPHLAUREN', 'POLO', 'POLO RALPH LAUREN'],
        group: 'essilorLuxottica',
        prefixes: ['RL', 'PH'],
      },
    ],
    [
      'SWAROVSKI',
      {
        pattern: /\b(SWAROVSKI|SK)\b/i,
        canonicalName: 'Swarovski',
        aliases: ['SWAROVSKI'],
        group: 'essilorLuxottica',
        prefixes: ['SK'],
      },
    ],

    // ============================================================
    // SAFILO GROUP
    // ============================================================
    [
      'CARRERA',
      {
        pattern: /\b(CARRERA|CA)\b/i,
        canonicalName: 'Carrera',
        aliases: ['CARRERA'],
        group: 'safilo',
        prefixes: ['CA'],
      },
    ],
    [
      'POLAROID',
      {
        pattern: /\b(POLAROID|PLD)\b/i,
        canonicalName: 'Polaroid',
        aliases: ['POLAROID'],
        group: 'safilo',
        prefixes: ['PLD'],
      },
    ],
    [
      'HUGO BOSS',
      {
        pattern: /\b(HUGO\s?BOSS|BOSS|HG|HB)\b/i,
        canonicalName: 'Hugo Boss',
        aliases: ['HUGO BOSS', 'HUGOBOSS', 'BOSS'],
        group: 'safilo',
        prefixes: ['HB', 'HG', 'BOSS'],
      },
    ],
    [
      'JIMMY CHOO',
      {
        pattern: /\b(JIMMY\s?CHOO|JC)\b/i,
        canonicalName: 'Jimmy Choo',
        aliases: ['JIMMY CHOO', 'JIMMYCHOO'],
        group: 'safilo',
        prefixes: ['JC'],
      },
    ],
    [
      'KATE SPADE',
      {
        pattern: /\b(KATE\s?SPADE|KS)\b/i,
        canonicalName: 'Kate Spade',
        aliases: ['KATE SPADE', 'KATESPADE'],
        group: 'safilo',
        prefixes: ['KS'],
      },
    ],
    [
      'TOMMY HILFIGER',
      {
        pattern: /\b(TOMMY\s?HILFIGER|TH)\b/i,
        canonicalName: 'Tommy Hilfiger',
        aliases: ['TOMMY HILFIGER', 'TOMMYHILFIGER'],
        group: 'safilo',
        prefixes: ['TH'],
      },
    ],
    [
      'CAROLINA HERRERA',
      {
        pattern: /\b(CAROLINA\s?HERRERA|CH[\s\-]?HER|CH[\s\-]?CH|CHER|HER)\b/i,
        canonicalName: 'Carolina Herrera',
        aliases: ['CAROLINA HERRERA', 'CAROLINAHERRERA', 'CH-HER', 'CH-CH', 'CHHER', 'CHCH', 'CHER', 'HER'],
        group: 'safilo',
        prefixes: ['CH', 'HER'],
      },
    ],
    [
      'MOSCHINO',
      {
        pattern: /\b(MOSCHINO|MOS)\b/i,
        canonicalName: 'Moschino',
        aliases: ['MOSCHINO'],
        group: 'safilo',
        prefixes: ['MOS'],
      },
    ],
    [
      'LOVE MOSCHINO',
      {
        pattern: /\b(LOVE\s?MOSCHINO|MOL)\b/i,
        canonicalName: 'Love Moschino',
        aliases: ['LOVE MOSCHINO', 'LOVEMOSCHINO'],
        group: 'safilo',
        prefixes: ['MOL'],
      },
    ],
    [
      'HAVAIANAS',
      {
        pattern: /\b(HAVAIANAS|HAV)\b/i,
        canonicalName: 'Havaianas',
        aliases: ['HAVAIANAS'],
        group: 'safilo',
        prefixes: ['HAV'],
      },
    ],
    [
      'PIERRE CARDIN',
      {
        pattern: /\b(PIERRE\s?CARDIN|PC)\b/i,
        canonicalName: 'Pierre Cardin',
        aliases: ['PIERRE CARDIN', 'PIERRECARDIN'],
        group: 'safilo',
        prefixes: ['PC'],
      },
    ],
    [
      'FOSSIL',
      {
        pattern: /\b(FOSSIL|FOS)\b/i,
        canonicalName: 'Fossil',
        aliases: ['FOSSIL'],
        group: 'safilo',
        prefixes: ['FOS'],
      },
    ],
    [
      'LIZ CLAIBORNE',
      {
        pattern: /\b(LIZ\s?CLAIBORNE|LC)\b/i,
        canonicalName: 'Liz Claiborne',
        aliases: ['LIZ CLAIBORNE', 'LIZCLAIBORNE'],
        group: 'safilo',
        prefixes: ['LC'],
      },
    ],
    [
      'JUICY COUTURE',
      {
        pattern: /\b(JUICY\s?COUTURE|JU)\b/i,
        canonicalName: 'Juicy Couture',
        aliases: ['JUICY COUTURE', 'JUICYCOUTURE'],
        group: 'safilo',
        prefixes: ['JU'],
      },
    ],
    [
      'BANANA REPUBLIC',
      {
        pattern: /\b(BANANA\s?REPUBLIC|BR)\b/i,
        canonicalName: 'Banana Republic',
        aliases: ['BANANA REPUBLIC', 'BANANAREPUBLIC'],
        group: 'safilo',
        prefixes: ['BR'],
      },
    ],

    // ============================================================
    // KERING EYEWEAR GROUP
    // ============================================================
    [
      'GUCCI',
      {
        pattern: /\b(GUCCI|GG)\b/i,
        canonicalName: 'Gucci',
        aliases: ['GUCCI'],
        group: 'kering',
        prefixes: ['GG'],
      },
    ],
    [
      'SAINT LAURENT',
      {
        pattern: /\b(SAINT\s?LAURENT|SL|YSL|YVES\s?SAINT\s?LAURENT)\b/i,
        canonicalName: 'Saint Laurent',
        aliases: ['SAINT LAURENT', 'SAINTLAURENT', 'YSL', 'YVES SAINT LAURENT'],
        group: 'kering',
        prefixes: ['SL'],
      },
    ],
    [
      'BOTTEGA VENETA',
      {
        pattern: /\b(BOTTEGA\s?VENETA|BV)\b/i,
        canonicalName: 'Bottega Veneta',
        aliases: ['BOTTEGA VENETA', 'BOTTEGAVENETA'],
        group: 'kering',
        prefixes: ['BV'],
      },
    ],
    [
      'BALENCIAGA',
      {
        pattern: /\b(BALENCIAGA|BB|BAL)\b/i,
        canonicalName: 'Balenciaga',
        aliases: ['BALENCIAGA'],
        group: 'kering',
        prefixes: ['BB', 'BAL'],
      },
    ],
    [
      'ALEXANDER MCQUEEN',
      {
        pattern: /\b(ALEXANDER\s?MCQUEEN|AM|AMQ)\b/i,
        canonicalName: 'Alexander McQueen',
        aliases: ['ALEXANDER MCQUEEN', 'ALEXANDERMCQUEEN', 'MCQUEEN'],
        group: 'kering',
        prefixes: ['AM', 'AMQ'],
      },
    ],
    [
      'CARTIER',
      {
        pattern: /\b(CARTIER|CT)\b/i,
        canonicalName: 'Cartier',
        aliases: ['CARTIER'],
        group: 'kering',
        prefixes: ['CT'],
      },
    ],
    [
      'MONTBLANC',
      {
        pattern: /\b(MONT\s?BLANC|MB)\b/i,
        canonicalName: 'Montblanc',
        aliases: ['MONTBLANC', 'MONT BLANC'],
        group: 'kering',
        prefixes: ['MB'],
      },
    ],
    [
      'BRIONI',
      {
        pattern: /\b(BRIONI|BR)\b/i,
        canonicalName: 'Brioni',
        aliases: ['BRIONI'],
        group: 'kering',
        prefixes: ['BR'],
      },
    ],
    [
      'BOUCHERON',
      {
        pattern: /\b(BOUCHERON|BC)\b/i,
        canonicalName: 'Boucheron',
        aliases: ['BOUCHERON'],
        group: 'kering',
        prefixes: ['BC'],
      },
    ],
    [
      'POMELLATO',
      {
        pattern: /\b(POMELLATO|PM)\b/i,
        canonicalName: 'Pomellato',
        aliases: ['POMELLATO'],
        group: 'kering',
        prefixes: ['PM'],
      },
    ],
    [
      'MCQUEEN',
      {
        pattern: /\b(MCQUEEN|MQ)\b/i,
        canonicalName: 'McQ',
        aliases: ['MCQ', 'MCQUEEN', 'MC Q'],
        group: 'kering',
        prefixes: ['MQ'],
      },
    ],
    [
      'PUMA',
      {
        pattern: /\b(PUMA|PU)\b/i,
        canonicalName: 'Puma',
        aliases: ['PUMA'],
        group: 'kering',
        prefixes: ['PU'],
      },
    ],

    // ============================================================
    // LVMH GROUP
    // ============================================================
    [
      'DIOR',
      {
        pattern: /\b(DIOR|CD|CHRISTIAN\s?DIOR|DIOR\s?HOMME|LADY\s?DIOR)\b/i,
        canonicalName: 'Dior',
        aliases: ['DIOR', 'CHRISTIAN DIOR', 'CHRISTIANDIOR', 'CD', 'DIOR HOMME'],
        group: 'lvmh',
        prefixes: ['CD', 'DIOR'],
      },
    ],
    [
      'FENDI',
      {
        pattern: /\b(FENDI|FF)\b/i,
        canonicalName: 'Fendi',
        aliases: ['FENDI'],
        group: 'lvmh',
        prefixes: ['FF', 'FE'],
      },
    ],
    [
      'CELINE',
      {
        pattern: /\b(CELINE|CL|CÉLINE)\b/i,
        canonicalName: 'Celine',
        aliases: ['CELINE', 'CÉLINE'],
        group: 'lvmh',
        prefixes: ['CL'],
      },
    ],
    [
      'GIVENCHY',
      {
        pattern: /\b(GIVENCHY|GV)\b/i,
        canonicalName: 'Givenchy',
        aliases: ['GIVENCHY'],
        group: 'lvmh',
        prefixes: ['GV'],
      },
    ],
    [
      'LOEWE',
      {
        pattern: /\b(LOEWE|LW)\b/i,
        canonicalName: 'Loewe',
        aliases: ['LOEWE'],
        group: 'lvmh',
        prefixes: ['LW'],
      },
    ],
    [
      'KENZO',
      {
        pattern: /\b(KENZO|KZ)\b/i,
        canonicalName: 'Kenzo',
        aliases: ['KENZO'],
        group: 'lvmh',
        prefixes: ['KZ'],
      },
    ],
    [
      'STELLA MCCARTNEY',
      {
        pattern: /\b(STELLA\s?MCCARTNEY|SC)\b/i,
        canonicalName: 'Stella McCartney',
        aliases: ['STELLA MCCARTNEY', 'STELLAMCCARTNEY'],
        group: 'lvmh',
        prefixes: ['SC'],
      },
    ],
    [
      'BERLUTI',
      {
        pattern: /\b(BERLUTI|BL)\b/i,
        canonicalName: 'Berluti',
        aliases: ['BERLUTI'],
        group: 'lvmh',
        prefixes: ['BL'],
      },
    ],

    // ============================================================
    // MARCOLIN GROUP
    // ============================================================
    [
      'TOM FORD',
      {
        pattern: /\b(TOM\s?FORD|TF|FT)\b/i,
        canonicalName: 'Tom Ford',
        aliases: ['TOM FORD', 'TOMFORD'],
        group: 'marcolin',
        prefixes: ['TF', 'FT'],
      },
    ],
    [
      'GUESS',
      {
        pattern: /\b(GUESS|GU)\b/i,
        canonicalName: 'Guess',
        aliases: ['GUESS'],
        group: 'marcolin',
        prefixes: ['GU'],
      },
    ],
    [
      'BALLY',
      {
        pattern: /\b(BALLY|BY)\b/i,
        canonicalName: 'Bally',
        aliases: ['BALLY'],
        group: 'marcolin',
        prefixes: ['BY'],
      },
    ],
    [
      'MONCLER',
      {
        pattern: /\b(MONCLER|ML)\b/i,
        canonicalName: 'Moncler',
        aliases: ['MONCLER'],
        group: 'marcolin',
        prefixes: ['ML'],
      },
    ],
    [
      'MAX MARA',
      {
        pattern: /\b(MAX\s?MARA|MM)\b/i,
        canonicalName: 'Max Mara',
        aliases: ['MAX MARA', 'MAXMARA'],
        group: 'marcolin',
        prefixes: ['MM'],
      },
    ],
    [
      'ERMENEGILDO ZEGNA',
      {
        pattern: /\b(ERMENEGILDO\s?ZEGNA|ZEGNA|EZ)\b/i,
        canonicalName: 'Ermenegildo Zegna',
        aliases: ['ERMENEGILDO ZEGNA', 'ZEGNA', 'Z ZEGNA'],
        group: 'marcolin',
        prefixes: ['EZ', 'ZC'],
      },
    ],
    [
      'EMILIO PUCCI',
      {
        pattern: /\b(EMILIO\s?PUCCI|EP|PUCCI)\b/i,
        canonicalName: 'Emilio Pucci',
        aliases: ['EMILIO PUCCI', 'EMILIOPUCCI', 'PUCCI'],
        group: 'marcolin',
        prefixes: ['EP'],
      },
    ],
    [
      'SKECHERS',
      {
        pattern: /\b(SKECHERS|SE)\b/i,
        canonicalName: 'Skechers',
        aliases: ['SKECHERS'],
        group: 'marcolin',
        prefixes: ['SE'],
      },
    ],
    [
      'TIMBERLAND',
      {
        pattern: /\b(TIMBERLAND|TB)\b/i,
        canonicalName: 'Timberland',
        aliases: ['TIMBERLAND'],
        group: 'marcolin',
        prefixes: ['TB'],
      },
    ],
    [
      'GANT',
      {
        pattern: /\b(GANT|GA)\b/i,
        canonicalName: 'Gant',
        aliases: ['GANT'],
        group: 'marcolin',
        prefixes: ['GA'],
      },
    ],
    [
      'HARLEY DAVIDSON',
      {
        pattern: /\b(HARLEY[\s\-]?DAVIDSON|HD)\b/i,
        canonicalName: 'Harley-Davidson',
        aliases: ['HARLEY DAVIDSON', 'HARLEY-DAVIDSON', 'HARLEYDAVIDSON'],
        group: 'marcolin',
        prefixes: ['HD'],
      },
    ],
    [
      'WEB',
      {
        pattern: /\b(WEB\s?EYEWEAR|WEB|WE)\b/i,
        canonicalName: 'Web Eyewear',
        aliases: ['WEB', 'WEB EYEWEAR'],
        group: 'marcolin',
        prefixes: ['WE'],
      },
    ],
    [
      'ADIDAS',
      {
        pattern: /\b(ADIDAS|AD)\b/i,
        canonicalName: 'Adidas',
        aliases: ['ADIDAS'],
        group: 'marcolin',
        prefixes: ['AD'],
      },
    ],
    [
      'MARC JACOBS',
      {
        pattern: /\b(MARC\s?JACOBS|MJ|MARC)\b/i,
        canonicalName: 'Marc Jacobs',
        aliases: ['MARC JACOBS', 'MARCJACOBS'],
        group: 'marcolin',
        prefixes: ['MJ', 'MARC'],
      },
    ],

    // ============================================================
    // CHARMANT GROUP
    // ============================================================
    [
      'CHARMANT',
      {
        pattern: /\b(CHARMANT|CH)\b/i,
        canonicalName: 'Charmant',
        aliases: ['CHARMANT'],
        group: 'charmant',
        prefixes: ['CH'],
      },
    ],
    [
      'LINE ART',
      {
        pattern: /\b(LINE\s?ART|LA)\b/i,
        canonicalName: 'Line Art',
        aliases: ['LINE ART', 'LINEART'],
        group: 'charmant',
        prefixes: ['LA'],
      },
    ],
    [
      'ESPRIT',
      {
        pattern: /\b(ESPRIT|ET)\b/i,
        canonicalName: 'Esprit',
        aliases: ['ESPRIT'],
        group: 'charmant',
        prefixes: ['ET'],
      },
    ],
    [
      'ELLE',
      {
        pattern: /\b(ELLE|EL)\b/i,
        canonicalName: 'Elle',
        aliases: ['ELLE'],
        group: 'charmant',
        prefixes: ['EL'],
      },
    ],
    [
      'AD LIB',
      {
        pattern: /\b(AD\s?LIB|AL)\b/i,
        canonicalName: 'Ad Lib',
        aliases: ['AD LIB', 'ADLIB'],
        group: 'charmant',
        prefixes: ['AL'],
      },
    ],

    // ============================================================
    // DE RIGO GROUP
    // ============================================================
    [
      'POLICE',
      {
        pattern: /\b(POLICE|SPL)\b/i,
        canonicalName: 'Police',
        aliases: ['POLICE'],
        group: 'deRigo',
        prefixes: ['SPL', 'VPL'],
      },
    ],
    [
      'LOZZA',
      {
        pattern: /\b(LOZZA|VL)\b/i,
        canonicalName: 'Lozza',
        aliases: ['LOZZA'],
        group: 'deRigo',
        prefixes: ['VL', 'SL'],
      },
    ],
    [
      'STING',
      {
        pattern: /\b(STING|ST)\b/i,
        canonicalName: 'Sting',
        aliases: ['STING'],
        group: 'deRigo',
        prefixes: ['VST', 'SST'],
      },
    ],
    [
      'FURLA',
      {
        pattern: /\b(FURLA|VFU)\b/i,
        canonicalName: 'Furla',
        aliases: ['FURLA'],
        group: 'deRigo',
        prefixes: ['VFU', 'SFU'],
      },
    ],
    [
      'CHOPARD',
      {
        pattern: /\b(CHOPARD|VSCH)\b/i,
        canonicalName: 'Chopard',
        aliases: ['CHOPARD'],
        group: 'deRigo',
        prefixes: ['VSCH', 'SCHF'],
      },
    ],
    [
      'ESCADA',
      {
        pattern: /\b(ESCADA|VES)\b/i,
        canonicalName: 'Escada',
        aliases: ['ESCADA'],
        group: 'deRigo',
        prefixes: ['VES', 'SES'],
      },
    ],
    [
      'NINA RICCI',
      {
        pattern: /\b(NINA\s?RICCI|VNR)\b/i,
        canonicalName: 'Nina Ricci',
        aliases: ['NINA RICCI', 'NINARICCI'],
        group: 'deRigo',
        prefixes: ['VNR', 'SNR'],
      },
    ],
    [
      'YALEA',
      {
        pattern: /\b(YALEA|SYA)\b/i,
        canonicalName: 'Yalea',
        aliases: ['YALEA'],
        group: 'deRigo',
        prefixes: ['SYA', 'VYA'],
      },
    ],
    [
      'PHILIPP PLEIN',
      {
        pattern: /\b(PHILIPP\s?PLEIN|VPP)\b/i,
        canonicalName: 'Philipp Plein',
        aliases: ['PHILIPP PLEIN', 'PHILIPPPLEIN'],
        group: 'deRigo',
        prefixes: ['VPP', 'SPP'],
      },
    ],
    [
      'BLUMARINE',
      {
        pattern: /\b(BLUMARINE|VBM)\b/i,
        canonicalName: 'Blumarine',
        aliases: ['BLUMARINE'],
        group: 'deRigo',
        prefixes: ['VBM', 'SBM'],
      },
    ],

    // ============================================================
    // MARCHON GROUP
    // ============================================================
    [
      'CALVIN KLEIN',
      {
        pattern: /\b(CALVIN\s?KLEIN|CK)\b/i,
        canonicalName: 'Calvin Klein',
        aliases: ['CALVIN KLEIN', 'CALVINKLEIN', 'CK'],
        group: 'marchon',
        prefixes: ['CK'],
      },
    ],
    [
      'KARL LAGERFELD',
      {
        pattern: /\b(KARL\s?LAGERFELD|KL)\b/i,
        canonicalName: 'Karl Lagerfeld',
        aliases: ['KARL LAGERFELD', 'KARLLAGERFELD'],
        group: 'marchon',
        prefixes: ['KL'],
      },
    ],
    [
      'LACOSTE',
      {
        pattern: /\b(LACOSTE|L)\b/i,
        canonicalName: 'Lacoste',
        aliases: ['LACOSTE'],
        group: 'marchon',
        prefixes: ['L'],
      },
    ],
    [
      'NIKE',
      {
        pattern: /\b(NIKE\s?VISION|NIKE|NK)\b/i,
        canonicalName: 'Nike Vision',
        aliases: ['NIKE', 'NIKE VISION'],
        group: 'marchon',
        prefixes: ['NK'],
      },
    ],
    [
      'COLUMBIA',
      {
        pattern: /\b(COLUMBIA|C)\b/i,
        canonicalName: 'Columbia',
        aliases: ['COLUMBIA'],
        group: 'marchon',
        prefixes: ['C'],
      },
    ],
    [
      'DRAGON',
      {
        pattern: /\b(DRAGON|DR)\b/i,
        canonicalName: 'Dragon',
        aliases: ['DRAGON'],
        group: 'marchon',
        prefixes: ['DR'],
      },
    ],
    [
      'FLEXON',
      {
        pattern: /\b(FLEXON|FLX)\b/i,
        canonicalName: 'Flexon',
        aliases: ['FLEXON'],
        group: 'marchon',
        prefixes: ['FLX'],
      },
    ],
    [
      'DONNA KARAN',
      {
        pattern: /\b(DONNA\s?KARAN|DKNY|DK)\b/i,
        canonicalName: 'Donna Karan',
        aliases: ['DONNA KARAN', 'DONNAKARAN', 'DKNY'],
        group: 'marchon',
        prefixes: ['DK'],
      },
    ],
    [
      'LIU JO',
      {
        pattern: /\b(LIU\s?JO|LJ)\b/i,
        canonicalName: 'Liu Jo',
        aliases: ['LIU JO', 'LIUJO'],
        group: 'marchon',
        prefixes: ['LJ'],
      },
    ],
    [
      'NAUTICA',
      {
        pattern: /\b(NAUTICA|N)\b/i,
        canonicalName: 'Nautica',
        aliases: ['NAUTICA'],
        group: 'marchon',
        prefixes: ['N'],
      },
    ],
    [
      'LONGCHAMP',
      {
        pattern: /\b(LONGCHAMP|LO)\b/i,
        canonicalName: 'Longchamp',
        aliases: ['LONGCHAMP'],
        group: 'marchon',
        prefixes: ['LO'],
      },
    ],
    [
      'CHLOE',
      {
        pattern: /\b(CHLOE|CHLOÉ|CE)\b/i,
        canonicalName: 'Chloé',
        aliases: ['CHLOE', 'CHLOÉ'],
        group: 'marchon',
        prefixes: ['CE'],
      },
    ],
    [
      'FERRAGAMO',
      {
        pattern: /\b(SALVATORE\s?FERRAGAMO|FERRAGAMO|SF)\b/i,
        canonicalName: 'Salvatore Ferragamo',
        aliases: ['FERRAGAMO', 'SALVATORE FERRAGAMO', 'SALVATORREFERRAGAMO'],
        group: 'marchon',
        prefixes: ['SF'],
      },
    ],
    [
      'MCM',
      {
        pattern: /\b(MCM)\b/i,
        canonicalName: 'MCM',
        aliases: ['MCM'],
        group: 'marchon',
        prefixes: ['MCM'],
      },
    ],
    [
      'ETRO',
      {
        pattern: /\b(ETRO)\b/i,
        canonicalName: 'Etro',
        aliases: ['ETRO'],
        group: 'marchon',
        prefixes: ['ET'],
      },
    ],
    [
      'SKAGA',
      {
        pattern: /\b(SKAGA|SK)\b/i,
        canonicalName: 'Skaga',
        aliases: ['SKAGA'],
        group: 'marchon',
        prefixes: ['SK'],
      },
    ],

    // ============================================================
    // SILHOUETTE GROUP
    // ============================================================
    [
      'SILHOUETTE',
      {
        pattern: /\b(SILHOUETTE|SIL)\b/i,
        canonicalName: 'Silhouette',
        aliases: ['SILHOUETTE'],
        group: 'silhouette',
        prefixes: ['SIL'],
      },
    ],
    [
      'NEUBAU',
      {
        pattern: /\b(NEUBAU)\b/i,
        canonicalName: 'Neubau',
        aliases: ['NEUBAU'],
        group: 'silhouette',
        prefixes: [],
      },
    ],
    [
      'EVIL EYE',
      {
        pattern: /\b(EVIL\s?EYE)\b/i,
        canonicalName: 'Evil Eye',
        aliases: ['EVIL EYE', 'EVILEYE'],
        group: 'silhouette',
        prefixes: [],
      },
    ],

    // ============================================================
    // RODENSTOCK GROUP
    // ============================================================
    [
      'RODENSTOCK',
      {
        pattern: /\b(RODENSTOCK|R)\b/i,
        canonicalName: 'Rodenstock',
        aliases: ['RODENSTOCK'],
        group: 'rodenstock',
        prefixes: ['R'],
      },
    ],
    [
      'PORSCHE DESIGN',
      {
        pattern: /\b(PORSCHE\s?DESIGN|P)\b/i,
        canonicalName: 'Porsche Design',
        aliases: ['PORSCHE DESIGN', 'PORSCHEDESIGN'],
        group: 'rodenstock',
        prefixes: ['P'],
      },
    ],

    // ============================================================
    // INDEPENDENT BRANDS
    // ============================================================
    [
      'LINDBERG',
      {
        pattern: /\b(LINDBERG|LIND)\b/i,
        canonicalName: 'Lindberg',
        aliases: ['LINDBERG'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'IC! BERLIN',
      {
        pattern: /\b(IC!?\s?BERLIN|IC)\b/i,
        canonicalName: 'ic! berlin',
        aliases: ['IC! BERLIN', 'IC BERLIN', 'ICBERLIN'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'MYKITA',
      {
        pattern: /\b(MYKITA)\b/i,
        canonicalName: 'Mykita',
        aliases: ['MYKITA'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'CAZAL',
      {
        pattern: /\b(CAZAL)\b/i,
        canonicalName: 'Cazal',
        aliases: ['CAZAL'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'BVLGARI',
      {
        pattern: /\b(BVLGARI|BULGARI|BV)\b/i,
        canonicalName: 'Bvlgari',
        aliases: ['BVLGARI', 'BULGARI'],
        group: 'independent',
        prefixes: ['BV'],
      },
    ],
    [
      'MATSUDA',
      {
        pattern: /\b(MATSUDA)\b/i,
        canonicalName: 'Matsuda',
        aliases: ['MATSUDA'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'THEO',
      {
        pattern: /\b(THEO)\b/i,
        canonicalName: 'Theo',
        aliases: ['THEO'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'ALAIN MIKLI',
      {
        pattern: /\b(ALAIN\s?MIKLI|MIKLI|A0)\b/i,
        canonicalName: 'Alain Mikli',
        aliases: ['ALAIN MIKLI', 'ALAINMIKLI', 'MIKLI'],
        group: 'independent',
        prefixes: ['A0'],
      },
    ],
    [
      'BARTON PERREIRA',
      {
        pattern: /\b(BARTON\s?PERREIRA|BP)\b/i,
        canonicalName: 'Barton Perreira',
        aliases: ['BARTON PERREIRA', 'BARTONPERREIRA'],
        group: 'independent',
        prefixes: ['BP'],
      },
    ],
    [
      'GARRETT LEIGHT',
      {
        pattern: /\b(GARRETT\s?LEIGHT|GL|GLCO)\b/i,
        canonicalName: 'Garrett Leight',
        aliases: ['GARRETT LEIGHT', 'GARRETTLEIGHT', 'GLCO'],
        group: 'independent',
        prefixes: ['GL'],
      },
    ],
    [
      'WARBY PARKER',
      {
        pattern: /\b(WARBY\s?PARKER|WP)\b/i,
        canonicalName: 'Warby Parker',
        aliases: ['WARBY PARKER', 'WARBYPARKER'],
        group: 'independent',
        prefixes: ['WP'],
      },
    ],
    [
      'MOSCOT',
      {
        pattern: /\b(MOSCOT)\b/i,
        canonicalName: 'Moscot',
        aliases: ['MOSCOT'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'CUTLER AND GROSS',
      {
        pattern: /\b(CUTLER\s?(?:AND|&)?\s?GROSS|C&G)\b/i,
        canonicalName: 'Cutler and Gross',
        aliases: ['CUTLER AND GROSS', 'CUTLER & GROSS', 'CUTLERANDGROSS'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'OLIVER GOLDSMITH',
      {
        pattern: /\b(OLIVER\s?GOLDSMITH|OG)\b/i,
        canonicalName: 'Oliver Goldsmith',
        aliases: ['OLIVER GOLDSMITH', 'OLIVERGOLDSMITH'],
        group: 'independent',
        prefixes: ['OG'],
      },
    ],
    [
      'ETNIA BARCELONA',
      {
        pattern: /\b(ETNIA\s?BARCELONA|ETNIA)\b/i,
        canonicalName: 'Etnia Barcelona',
        aliases: ['ETNIA BARCELONA', 'ETNIABARCELONA', 'ETNIA'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'FACE A FACE',
      {
        pattern: /\b(FACE\s?[AÀ]\s?FACE|FAF)\b/i,
        canonicalName: 'Face à Face',
        aliases: ['FACE A FACE', 'FACE À FACE', 'FACEAFACE'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'ANNE ET VALENTIN',
      {
        pattern: /\b(ANNE\s?(?:ET|&)?\s?VALENTIN|A&V)\b/i,
        canonicalName: 'Anne et Valentin',
        aliases: ['ANNE ET VALENTIN', 'ANNE & VALENTIN', 'ANNEETVALENTIN'],
        group: 'independent',
        prefixes: [],
      },
    ],
    [
      'ROLF',
      {
        pattern: /\b(ROLF\s?SPECTACLES|ROLF)\b/i,
        canonicalName: 'Rolf Spectacles',
        aliases: ['ROLF SPECTACLES', 'ROLF'],
        group: 'independent',
        prefixes: [],
      },
    ],

    // ============================================================
    // SPORT EYEWEAR
    // ============================================================
    [
      'MAUI JIM',
      {
        pattern: /\b(MAUI\s?JIM|MJ)\b/i,
        canonicalName: 'Maui Jim',
        aliases: ['MAUI JIM', 'MAUIJIM'],
        group: 'sport',
        prefixes: ['MJ'],
      },
    ],
    [
      'SERENGETI',
      {
        pattern: /\b(SERENGETI)\b/i,
        canonicalName: 'Serengeti',
        aliases: ['SERENGETI'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'BOLLE',
      {
        pattern: /\b(BOLLE|BOLL[EÉ])\b/i,
        canonicalName: 'Bollé',
        aliases: ['BOLLE', 'BOLLÉ'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'SMITH',
      {
        pattern: /\b(SMITH\s?OPTICS|SMITH)\b/i,
        canonicalName: 'Smith Optics',
        aliases: ['SMITH', 'SMITH OPTICS'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'JULBO',
      {
        pattern: /\b(JULBO)\b/i,
        canonicalName: 'Julbo',
        aliases: ['JULBO'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'CEBE',
      {
        pattern: /\b(CEBE|CÉBÉ)\b/i,
        canonicalName: 'Cébé',
        aliases: ['CEBE', 'CÉBÉ'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'COSTA',
      {
        pattern: /\b(COSTA\s?DEL\s?MAR|COSTA)\b/i,
        canonicalName: 'Costa Del Mar',
        aliases: ['COSTA', 'COSTA DEL MAR'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'UVEX',
      {
        pattern: /\b(UVEX)\b/i,
        canonicalName: 'Uvex',
        aliases: ['UVEX'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'RUDY PROJECT',
      {
        pattern: /\b(RUDY\s?PROJECT|RP)\b/i,
        canonicalName: 'Rudy Project',
        aliases: ['RUDY PROJECT', 'RUDYPROJECT'],
        group: 'sport',
        prefixes: ['RP'],
      },
    ],
    [
      'POC',
      {
        pattern: /\b(POC)\b/i,
        canonicalName: 'POC',
        aliases: ['POC'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      '100%',
      {
        pattern: /\b(100%|HUNDRED\s?PERCENT)\b/i,
        canonicalName: '100%',
        aliases: ['100%', 'HUNDRED PERCENT'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'KAENON',
      {
        pattern: /\b(KAENON)\b/i,
        canonicalName: 'Kaenon',
        aliases: ['KAENON'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'SPY',
      {
        pattern: /\b(SPY\s?OPTIC|SPY)\b/i,
        canonicalName: 'Spy Optic',
        aliases: ['SPY', 'SPY OPTIC', 'SPYOPTIC'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'ELECTRIC',
      {
        pattern: /\b(ELECTRIC\s?VISUAL|ELECTRIC)\b/i,
        canonicalName: 'Electric',
        aliases: ['ELECTRIC', 'ELECTRIC VISUAL'],
        group: 'sport',
        prefixes: [],
      },
    ],
    [
      'VON ZIPPER',
      {
        pattern: /\b(VON\s?ZIPPER|VONZIPPER|VZ)\b/i,
        canonicalName: 'VonZipper',
        aliases: ['VON ZIPPER', 'VONZIPPER', 'VZ'],
        group: 'sport',
        prefixes: ['VZ'],
      },
    ],

    // ============================================================
    // ECONOMY/REGIONAL BRANDS (Common in Morocco & North Africa)
    // ============================================================
    [
      'BOLON',
      {
        pattern: /\b(BOLON)\b/i,
        canonicalName: 'Bolon',
        aliases: ['BOLON'],
        group: 'asia',
        prefixes: ['BL'],
      },
    ],
    [
      'GENTLE MONSTER',
      {
        pattern: /\b(GENTLE\s?MONSTER|GM)\b/i,
        canonicalName: 'Gentle Monster',
        aliases: ['GENTLE MONSTER', 'GENTLEMONSTER', 'GM'],
        group: 'asia',
        prefixes: ['GM'],
      },
    ],
    [
      'AORON',
      {
        pattern: /\b(AORON)\b/i,
        canonicalName: 'Aoron',
        aliases: ['AORON'],
        group: 'asia',
        prefixes: ['AOR'],
      },
    ],
    [
      'VEITHDIA',
      {
        pattern: /\b(VEITHDIA)\b/i,
        canonicalName: 'Veithdia',
        aliases: ['VEITHDIA'],
        group: 'asia',
        prefixes: ['VD'],
      },
    ],
    [
      'KINGSEVEN',
      {
        pattern: /\b(KINGSEVEN|KING\s?SEVEN)\b/i,
        canonicalName: 'Kingseven',
        aliases: ['KINGSEVEN', 'KING SEVEN'],
        group: 'asia',
        prefixes: ['KS'],
      },
    ],
    [
      'HDCRAFTER',
      {
        pattern: /\b(HDCRAFTER|HD\s?CRAFTER)\b/i,
        canonicalName: 'HDCrafter',
        aliases: ['HDCRAFTER', 'HD CRAFTER'],
        group: 'asia',
        prefixes: ['HD'],
      },
    ],
    [
      'BARCUR',
      {
        pattern: /\b(BARCUR)\b/i,
        canonicalName: 'Barcur',
        aliases: ['BARCUR'],
        group: 'asia',
        prefixes: ['BC'],
      },
    ],
    [
      'DUBERY',
      {
        pattern: /\b(DUBERY)\b/i,
        canonicalName: 'Dubery',
        aliases: ['DUBERY'],
        group: 'asia',
        prefixes: ['DB'],
      },
    ],
    [
      'PRSR',
      {
        pattern: /\b(PRSR)\b/i,
        canonicalName: 'PRSR',
        aliases: ['PRSR'],
        group: 'asia',
        prefixes: ['PR'],
      },
    ],

    // ============================================================
    // TURKISH BRANDS
    // ============================================================
    [
      'HAWK',
      {
        pattern: /\b(HAWK)\b/i,
        canonicalName: 'Hawk',
        aliases: ['HAWK'],
        group: 'turkey',
        prefixes: ['HK'],
      },
    ],
    [
      'STEPPER',
      {
        pattern: /\b(STEPPER)\b/i,
        canonicalName: 'Stepper',
        aliases: ['STEPPER'],
        group: 'turkey',
        prefixes: ['ST'],
      },
    ],
    [
      'EXESS',
      {
        pattern: /\b(EXESS)\b/i,
        canonicalName: 'Exess',
        aliases: ['EXESS'],
        group: 'turkey',
        prefixes: ['EX'],
      },
    ],
    [
      'FACONNABLE',
      {
        pattern: /\b(FACONNABLE|FAÇONNABLE)\b/i,
        canonicalName: 'Façonnable',
        aliases: ['FACONNABLE', 'FAÇONNABLE'],
        group: 'turkey',
        prefixes: ['FC'],
      },
    ],

    // ============================================================
    // ECONOMY/GENERIC BRANDS
    // ============================================================
    [
      'POLAR',
      {
        pattern: /\b(POLAR)\b/i,
        canonicalName: 'Polar',
        aliases: ['POLAR'],
        group: 'economy',
        prefixes: ['PL'],
      },
    ],
    [
      'SUNOPTIC',
      {
        pattern: /\b(SUNOPTIC|SUN\s?OPTIC)\b/i,
        canonicalName: 'Sunoptic',
        aliases: ['SUNOPTIC', 'SUN OPTIC'],
        group: 'economy',
        prefixes: ['SO'],
      },
    ],
    [
      'MONTANA',
      {
        pattern: /\b(MONTANA)\b/i,
        canonicalName: 'Montana',
        aliases: ['MONTANA'],
        group: 'economy',
        prefixes: ['MT'],
      },
    ],
    [
      'MINOX',
      {
        pattern: /\b(MINOX)\b/i,
        canonicalName: 'Minox',
        aliases: ['MINOX'],
        group: 'economy',
        prefixes: ['MX'],
      },
    ],
    [
      'KWIAT',
      {
        pattern: /\b(KWIAT)\b/i,
        canonicalName: 'Kwiat',
        aliases: ['KWIAT'],
        group: 'economy',
        prefixes: ['KW'],
      },
    ],
    [
      'LIVHO',
      {
        pattern: /\b(LIVHO)\b/i,
        canonicalName: 'Livho',
        aliases: ['LIVHO'],
        group: 'economy',
        prefixes: ['LV'],
      },
    ],
    [
      'CYXUS',
      {
        pattern: /\b(CYXUS)\b/i,
        canonicalName: 'Cyxus',
        aliases: ['CYXUS'],
        group: 'economy',
        prefixes: ['CX'],
      },
    ],
    [
      'OPTIC NERVE',
      {
        pattern: /\b(OPTIC\s?NERVE|ON)\b/i,
        canonicalName: 'Optic Nerve',
        aliases: ['OPTIC NERVE', 'OPTICNERVE'],
        group: 'economy',
        prefixes: ['ON'],
      },
    ],
    [
      'IZIPIZI',
      {
        pattern: /\b(IZIPIZI|IZI\s?PIZI)\b/i,
        canonicalName: 'Izipizi',
        aliases: ['IZIPIZI', 'IZI PIZI'],
        group: 'economy',
        prefixes: ['IZ'],
      },
    ],
    [
      'QUAY',
      {
        pattern: /\b(QUAY\s?AUSTRALIA|QUAY)\b/i,
        canonicalName: 'Quay Australia',
        aliases: ['QUAY', 'QUAY AUSTRALIA'],
        group: 'economy',
        prefixes: ['QU'],
      },
    ],
  ]);

// ============================================================
// MODEL FORMAT PATTERNS BY MANUFACTURER
// ============================================================

/**
 * Safilo format: MODEL/GENRE/TYPE.COLOR.SIZE.FINISH
 * Example: 0298/G/S.807.55.HA
 */
const SAFILO_MODEL_FORMAT: IModelFormat = {
  pattern: /\b(\d{4})\/([A-Z])\/([A-Z])\.(\d{3})\.(\d{2})\.([A-Z]{2})\b/i,
  description: 'Safilo format: MODEL/GENRE/TYPE.COLOR.SIZE.FINISH',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: match[1],
    colorCode: match[4],
    size: match[5],
    variant: `${match[2]}/${match[3]}-${match[6]}`,
  }),
};

/**
 * Safilo simple format: MODEL/GENRE/TYPE.COLOR
 * Example: 0298/G/S.807
 */
const SAFILO_MODEL_FORMAT_SIMPLE: IModelFormat = {
  pattern: /\b(\d{4})\/([A-Z])\/([A-Z])\.(\d{3})\b/i,
  description: 'Safilo simple format: MODEL/GENRE/TYPE.COLOR',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: match[1],
    colorCode: match[4],
    size: null,
    variant: `${match[2]}/${match[3]}`,
  }),
};

/**
 * Luxottica format: PREFIX MODEL COLOR SIZE
 * Example: RB3025 001/58 58
 */
const LUXOTTICA_MODEL_FORMAT: IModelFormat = {
  pattern: /\b([A-Z]{2})(\d{4}[A-Z]?)\s+(\d{3}\/\d{2,3}|\d{3}[A-Z]?)\s*(\d{2})?\b/i,
  description: 'Luxottica format: PREFIX+MODEL COLOR SIZE',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: `${match[1]}${match[2]}`,
    colorCode: match[3],
    size: match[4] ?? null,
    variant: null,
  }),
};

/**
 * Kering format: PREFIX MODEL COLOR
 * Example: GG0061S 001
 */
const KERING_MODEL_FORMAT: IModelFormat = {
  pattern: /\b([A-Z]{2})(\d{4}[OS]?)\s+(\d{3})\b/i,
  description: 'Kering format: PREFIX+MODEL COLOR',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: `${match[1]}${match[2]}`,
    colorCode: match[3],
    size: null,
    variant: null,
  }),
};

/**
 * Generic format: MODEL-COLOR-SIZE
 * Example: 5421-001-54
 */
const GENERIC_MODEL_FORMAT: IModelFormat = {
  pattern: /\b(\d{4})-(\d{3})-(\d{2})\b/,
  description: 'Generic format: MODEL-COLOR-SIZE',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: match[1],
    colorCode: match[2],
    size: match[3],
    variant: null,
  }),
};

/**
 * Safilo dot-only format: MODEL.COLOR.SIZE.BRIDGE
 * Example: 0320.1ED.54.17
 */
const SAFILO_DOT_MODEL_FORMAT: IModelFormat = {
  pattern: /\b(\d{4})\.([A-Z0-9]{2,3})\.(\d{2})(?:\.(\d{2}))?\b/i,
  description: 'Safilo dot format: MODEL.COLOR.SIZE.BRIDGE',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: match[1],
    colorCode: match[2],
    size: match[3],
    variant: match[4] ?? null,
  }),
};

/**
 * Marcolin/Tom Ford format: TF/FT MODEL COLOR SIZE
 * Example: TF5178 001 50-21 or FT0870 01B
 */
const MARCOLIN_MODEL_FORMAT: IModelFormat = {
  pattern: /\b([TF]{2})(\d{4}[A-Z]?(?:-[FA])?)\s+(\d{3}[A-Z]?)\b/i,
  description: 'Marcolin format: TF/FT+MODEL COLOR',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: `${match[1]}${match[2]}`,
    colorCode: match[3],
    size: null,
    variant: null,
  }),
};

/**
 * Prada format: SPR/VPR MODEL COLOR
 * Example: SPR 17WS 1AB5S0 or VPR 08TV 1AB1O1
 */
const PRADA_MODEL_FORMAT: IModelFormat = {
  pattern: /\b([SV]PR)\s?(\d{2}[A-Z]{1,2})\s+([A-Z0-9]{6})\b/i,
  description: 'Prada format: SPR/VPR MODEL COLOR',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: `${match[1]} ${match[2]}`,
    colorCode: match[3],
    size: null,
    variant: match[1] === 'SPR' ? 'sunglasses' : 'optical',
  }),
};

/**
 * De Rigo/Police format: SPLQ/SPL MODEL COLOR
 * Example: SPLQ84 0700 or SPL123 0700
 */
const DERIGO_MODEL_FORMAT: IModelFormat = {
  pattern: /\b(SPL[A-Z]?)(\d{2,3})\s+(\d{4})\b/i,
  description: 'De Rigo format: SPL+MODEL COLOR',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: `${match[1]}${match[2]}`,
    colorCode: match[3],
    size: null,
    variant: null,
  }),
};

/**
 * Guess format: GU MODEL COLOR
 * Example: GU2500 052
 */
const GUESS_MODEL_FORMAT: IModelFormat = {
  pattern: /\b(GU)(\d{4})\s+(\d{3})\b/i,
  description: 'Guess format: GU+MODEL COLOR',
  extractParts: (match: RegExpMatchArray): IModelParts => ({
    model: `${match[1]}${match[2]}`,
    colorCode: match[3],
    size: null,
    variant: null,
  }),
};

/**
 * Model format patterns ordered by specificity.
 */
export const MODEL_FORMATS: readonly IModelFormat[] = [
  SAFILO_MODEL_FORMAT,
  SAFILO_MODEL_FORMAT_SIMPLE,
  SAFILO_DOT_MODEL_FORMAT,
  LUXOTTICA_MODEL_FORMAT,
  KERING_MODEL_FORMAT,
  MARCOLIN_MODEL_FORMAT,
  PRADA_MODEL_FORMAT,
  DERIGO_MODEL_FORMAT,
  GUESS_MODEL_FORMAT,
  GENERIC_MODEL_FORMAT,
];

// ============================================================
// COMMON MODEL PATTERNS
// ============================================================

/**
 * Common frame model patterns.
 * Captures model codes in various formats.
 */
const MODEL_PATTERNS: RegExp[] = [
  // Luxottica prefixed models
  /\b(RB\d{4}[A-Z]?)\b/i,
  /\b(RX\d{4}[A-Z]?)\b/i,
  /\b(OO\d{4})\b/i,
  /\b(OX\d{4})\b/i,
  /\b(OJ\d{4})\b/i,
  /\b(PO\d{4})\b/i,
  /\b(VO\d{4})\b/i,
  /\b(VPR\d{2}[A-Z]{1,2})\b/i,
  /\b(SPR\d{2}[A-Z]{1,2})\b/i,
  /\b(PR\d{2}[A-Z]{1,2})\b/i,
  /\b(VMU\d{2}[A-Z]{1,2})\b/i,
  /\b(SMU\d{2}[A-Z]{1,2})\b/i,
  /\b(VE\d{4})\b/i,
  /\b(DG\d{4})\b/i,
  /\b(EA\d{4})\b/i,
  /\b(AR\d{4})\b/i,
  /\b(AX\d{4})\b/i,
  /\b(BE\d{4})\b/i,
  /\b(MK\d{4})\b/i,
  /\b(HC\d{4})\b/i,
  /\b(TF\d{4})\b/i,
  /\b(RL\d{4})\b/i,
  /\b(PH\d{4})\b/i,

  // Kering models
  /\b(GG\d{4}[OS]?)\b/i,
  /\b(SL\s?\d{1,3})\b/i,
  /\b(BB\d{4})\b/i,
  /\b(BV\d{4})\b/i,
  /\b(AM\d{4})\b/i,
  /\b(CT\d{4})\b/i,
  /\b(MB\d{4})\b/i,

  // Marcolin models
  /\b(FT\d{4})\b/i,
  /\b(GU\d{4})\b/i,
  /\b(ML\d{4})\b/i,
  /\b(MM\d{4})\b/i,
  /\b(EZ\d{4})\b/i,

  // Safilo models (numeric only)
  /\b(\d{4})(?=\/[A-Z]\/[A-Z])\b/,

  // Safilo prefixed models
  /\b(CA\d{4})\b/i,
  /\b(PLD\d{4})\b/i,
  /\b(HB\d{4})\b/i,
  /\b(JC\d{4})\b/i,
  /\b(KS\d{4})\b/i,
  /\b(TH\d{4})\b/i,
  /\b(MOS\d{4})\b/i,
  /\b(HER\d{4})\b/i,

  // LVMH models
  /\b(CD\d{4})\b/i,
  /\b(FF\d{4})\b/i,
  /\b(CL\d{4})\b/i,
  /\b(GV\d{4})\b/i,
  /\b(LW\d{4})\b/i,

  // De Rigo models (Police, Lozza, Sting)
  /\b(SPL[A-Z]?\d{2,3})\b/i,
  /\b(VPL\d{3})\b/i,
  /\b(VSCH\d{3})\b/i,
  /\b(VFU\d{3})\b/i,
  /\b(VL\d{4})\b/i,
  /\b(VSJ\d{3})\b/i,

  // Swarovski models
  /\b(SK\d{4})\b/i,
  /\b(SW\d{4})\b/i,

  // Marchon models
  /\b(CK\d{4})\b/i,
  /\b(KL\d{4})\b/i,
  /\b(SF\d{4})\b/i,
  /\b(LO\d{4})\b/i,
  /\b(CE\d{4})\b/i,
  /\b(LJ\d{4})\b/i,

  // Generic alphanumeric models
  /\b(0[A-Z]{2}\d{4})\b/i,
  /\b([A-Z]{2,3}\d{3,4})\b/i,
  /\b(\d{4}[A-Z]{1,2})\b/i,

  // Named models (Ray-Ban icons)
  /\bWAYFARER\b/i,
  /\bAVIATOR\b/i,
  /\bCLUBMASTER\b/i,
  /\bROUND\s?METAL\b/i,
  /\bHEXAGONAL?\b/i,
  /\bJUSTIN\b/i,
  /\bERIKA\b/i,
  /\bNEW\s?WAYFARER\b/i,

  // Named models (Oakley icons)
  /\bHOLBROOK\b/i,
  /\bFROGSKINS?\b/i,
  /\bJAWBREAKER\b/i,
  /\bRADAR\s?(LOCK|EV|PATH)?\b/i,
  /\bFLAK\s?\d?\b/i,
  /\bSUTRO\b/i,
  /\bGASCAN\b/i,
  /\bFUEL\s?CELL\b/i,

  // Named models (Persol icons)
  /\bCAPRI\b/i,
  /\bGALILEO\b/i,

  // Named models (Gucci icons)
  /\bHORSEBIT\b/i,
  /\bWEB\b/i,

  // Named models (Dior icons)
  /\bSO\s?REAL\b/i,
  /\bDIOROMA\b/i,
  /\bSPLIT\b/i,
  /\bSTRONGER\b/i,

  // Named models (Cartier icons)
  /\bSANTOS\b/i,
  /\bPANTHER\b/i,
  /\bMUST\b/i,
];

// ============================================================
// SIZE PATTERNS
// ============================================================

/**
 * Frame size patterns (eye-bridge-temple format).
 */
const SIZE_PATTERNS: RegExp[] = [
  // Standard eye-bridge-temple (55-17-145)
  /\b(\d{2})[\s\-\/](\d{2})[\s\-\/](\d{3})\b/,
  // Eye-bridge only (55-17)
  /\b(\d{2})[\s\-\/](\d{2})\b/,
  // Size prefix (SZ52, SIZE 54)
  /\bSZ\s?(\d{2})\b/i,
  /\bSIZE\s?(\d{2})\b/i,
  // Standalone size in Safilo format (.55.)
  /\.(\d{2})\./,
  // Standalone eye size (52mm, 54 mm)
  /\b(\d{2})\s?mm\b/i,
];

// ============================================================
// COLOR PATTERNS
// ============================================================

/**
 * Frame color code patterns.
 */
const COLOR_CODE_PATTERNS: RegExp[] = [
  // Safilo format (.807.)
  /\.(\d{3})(?:\.|\b)/,
  // Luxottica format (001/58)
  /\b(\d{3})\/(\d{2,3})\b/,
  // Generic 3-digit code
  /\b(\d{3})\b/,
  // Alphanumeric codes (2-3 chars)
  /\b([A-Z]{2,3})$/i,
];

/**
 * Color name patterns (French and English).
 */
const COLOR_NAME_PATTERNS: RegExp[] = [
  // Blacks
  /\b(NOIR|BLACK|BLK|NR|NERO|SCHWARZ|JET)\b/i,
  // Browns/Tortoise
  /\b(MARRON|BROWN|BRN|DEMI|HAVANE?|TORTOISE?|ÉCAILLE|CAREY|BLONDE?)\b/i,
  // Blues
  /\b(BLEU|BLUE|BLU|NAVY|AZURE|COBALT)\b/i,
  // Greens
  /\b(VERT|GREEN|GRN|OLIVE|KHAKI)\b/i,
  // Reds/Burgundy
  /\b(ROUGE|RED|BURGUNDY|BORDEAUX|WINE|CHERRY|RUBY)\b/i,
  // Golds
  /\b(OR|GOLD|GLD|DORÉ|ORO)\b/i,
  // Silvers
  /\b(ARGENT|SILVER|SLV|ARGENTÉ|PLATA)\b/i,
  // Greys
  /\b(GRIS|GREY|GRAY|GUNMETAL|GUN|ANTHRACITE|SMOKE|CHARCOAL)\b/i,
  // Whites/Transparent
  /\b(BLANC|WHITE|WHT|CRYSTAL|CRISTAL|TRANSPARENT|CLEAR)\b/i,
  // Pinks/Roses
  /\b(ROSE|PINK|ROSA|FUCHSIA|MAGENTA)\b/i,
  // Purples
  /\b(VIOLET|PURPLE|PLUM|AUBERGINE|PRUNE)\b/i,
  // Oranges
  /\b(ORANGE|CORAIL|CORAL|PEACH)\b/i,
  // Yellows
  /\b(JAUNE|YELLOW|HONEY|MIEL|AMBER)\b/i,
  // Multi/Pattern
  /\b(MULTI|GRADIENT|DÉGRADÉ|STRIPED?|RAYÉ)\b/i,
];

/**
 * Color finish patterns.
 */
const COLOR_FINISH_PATTERNS: RegExp[] = [
  /\b(MATTE?|MAT)\b/i,
  /\b(SHINY|BRILLANT|GLOSSY|GLOSS)\b/i,
  /\b(SATIN|SATINÉ)\b/i,
  /\b(BRUSHED|BROSSÉ)\b/i,
  /\b(POLISHED|POLI)\b/i,
  /\b(MIRROR|MIROIR|MIRRORED)\b/i,
  /\b(POLARIZED?|POLARISÉ)\b/i,
  /\b(PHOTOCHROMIC|PHOTOCHROMIQUE|TRANSITIONS?)\b/i,
];

// ============================================================
// MATERIAL PATTERNS
// ============================================================

/**
 * Frame material patterns.
 */
const MATERIAL_PATTERNS: RegExp[] = [
  /\b(METAL|MÉTAL)\b/i,
  /\b(TITANIUM?|TITANE?|TI)\b/i,
  /\b(ACETATE?|ACÉTATE?)\b/i,
  /\b(PLASTIC|PLASTIQUE)\b/i,
  /\b(NYLON)\b/i,
  /\b(TR[\s\-]?90)\b/i,
  /\b(STAINLESS|INOX)\b/i,
  /\b(CARBON\s?FIBER|FIBRE\s?CARBONE)\b/i,
  /\b(GRILAMID)\b/i,
  /\b(ULTEM)\b/i,
  /\b(BETA[\s\-]?TITANIUM?)\b/i,
  /\b(MEMORY\s?METAL)\b/i,
  /\b(ALUMINUM|ALUMINIUM)\b/i,
  /\b(MAGNESIUM)\b/i,
  /\b(WOOD|BOIS)\b/i,
  /\b(BAMBOO|BAMBOU)\b/i,
  /\b(HORN|CORNE)\b/i,
];

// ============================================================
// CATEGORY PATTERNS
// ============================================================

/**
 * Product category detection patterns.
 */
export const CATEGORY_PATTERNS: ReadonlyMap<ProductCategory, RegExp[]> = new Map([
  [
    'optical',
    [
      /\b(OPTICAL|OPTIQUE|VU|VISTA|RX|OPHTHALMIC|EYEGLASSES?|LUNETTES?\s?DE\s?VUE)\b/i,
      /\b(READING|LECTURE)\b/i,
      /^V[A-Z]{2}\d/i, // VPR, VMU, etc.
      /^OX\d/i, // Oakley RX
      /^RX\d/i, // Ray-Ban RX
    ],
  ],
  [
    'sun',
    [
      /\b(SUN|SOLEIL|SUNGLASSES?|SOLAIRES?|SOLAR)\b/i,
      /^S[A-Z]{2}\d/i, // SPR, SMU, etc.
      /^OO\d/i, // Oakley sun
      /^RB\d/i, // Ray-Ban sun (most are sun)
      /\/S\./i, // Safilo sun indicator
    ],
  ],
  [
    'sport',
    [
      /\b(SPORT|CYCLING|RUNNING|GOLF|SKI|SNOW|MTB|BIKE)\b/i,
      /\b(PERFORMANCE|ACTIVE|ATHLETIC)\b/i,
      /\b(WRAPAROUND|WRAP)\b/i,
    ],
  ],
  [
    'reading',
    [
      /\b(READING|LECTURE|PRESBYTE?|LOUPE)\b/i,
      /\b(\+\d[\.\,]?\d{0,2})\b/, // +1.5, +2.00, etc.
    ],
  ],
]);

// ============================================================
// LEGACY EXPORT (backward compatibility)
// ============================================================

/**
 * Simple brand patterns array (legacy).
 */
const BRAND_PATTERNS: RegExp[] = Array.from(BRAND_PATTERNS_MAP.values()).map(
  (bp) => bp.pattern
);

/**
 * Combined color patterns.
 */
const COLOR_PATTERNS: RegExp[] = [
  ...COLOR_CODE_PATTERNS,
  ...COLOR_NAME_PATTERNS,
  ...COLOR_FINISH_PATTERNS,
];

/**
 * Exported patterns object for frame products.
 */
export const FRAME_PATTERNS = {
  brandPatterns: BRAND_PATTERNS,
  modelPatterns: MODEL_PATTERNS,
  sizePatterns: SIZE_PATTERNS,
  colorPatterns: COLOR_PATTERNS,
  colorCodePatterns: COLOR_CODE_PATTERNS,
  colorNamePatterns: COLOR_NAME_PATTERNS,
  colorFinishPatterns: COLOR_FINISH_PATTERNS,
  materialPatterns: MATERIAL_PATTERNS,
} as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Finds a brand pattern by alias or canonical name.
 * @param searchTerm The brand name to search for
 * @returns The brand pattern if found, null otherwise
 */
export function findBrandPattern(searchTerm: string): IBrandPattern | null {
  const normalized = searchTerm.toUpperCase().replace(/[\s\-]/g, '');

  for (const [, pattern] of BRAND_PATTERNS_MAP) {
    if (pattern.canonicalName.toUpperCase().replace(/[\s\-]/g, '') === normalized) {
      return pattern;
    }
    for (const alias of pattern.aliases) {
      if (alias.replace(/[\s\-]/g, '') === normalized) {
        return pattern;
      }
    }
  }
  return null;
}

/**
 * Extracts brand from designation using pattern map.
 * Returns canonical name and all aliases for fuzzy matching.
 * @param designation The product designation text
 * @returns Object with canonical name and variants, or null
 */
export function extractBrandWithVariants(
  designation: string
): { canonical: string; variants: readonly string[] } | null {
  const upperDesignation = designation.toUpperCase();

  for (const [, pattern] of BRAND_PATTERNS_MAP) {
    const match = upperDesignation.match(pattern.pattern);
    if (match) {
      return {
        canonical: pattern.canonicalName,
        variants: pattern.aliases,
      };
    }
  }
  return null;
}

/**
 * Attempts to extract model parts using manufacturer-specific formats.
 * @param designation The product designation text
 * @returns Extracted model parts or null
 */
export function extractModelParts(designation: string): IModelParts | null {
  for (const format of MODEL_FORMATS) {
    const match = designation.match(format.pattern);
    if (match && format.extractParts) {
      return format.extractParts(match);
    }
  }
  return null;
}

/**
 * Detects product category from designation.
 * @param designation The product designation text
 * @returns The detected category
 */
export function detectCategory(designation: string): ProductCategory {
  for (const [category, patterns] of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(designation)) {
        return category;
      }
    }
  }
  return 'unknown';
}

/**
 * Gets brand group for a canonical brand name.
 * @param canonicalName The canonical brand name
 * @returns The manufacturer group or null
 */
export function getBrandGroup(canonicalName: string): ManufacturerGroup | null {
  for (const [, pattern] of BRAND_PATTERNS_MAP) {
    if (pattern.canonicalName === canonicalName) {
      return pattern.group;
    }
  }
  return null;
}
