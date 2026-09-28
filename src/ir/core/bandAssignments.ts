/**
 * The correlation table: which vibration a band at a given wavenumber may be.
 *
 * This is the infrared analogue of a fragment set — what a producer *claims*
 * about a spectrum — with one difference that shapes the whole design: a mass
 * fragment claims one m/z, while a vibration claims a **range**, and the ranges
 * overlap heavily on purpose. A band at 1715 cm⁻¹ is an ester, an aldehyde, a
 * ketone and a carboxylic acid until something else decides between them, and a
 * table that returned one answer there would be inventing chemistry.
 *
 * The ranges are the conventional teaching values, rounded to the tens that a
 * printed table uses. They are deliberately not narrowed to look precise: a
 * conjugated ketone really does absorb below an unconjugated one, and a table
 * that excluded it would read as ruling the ketone out.
 */

import type { IrBandStrength } from './irBand.ts';

/** One vibration a band may be, as a correlation table states it. */
export interface BandAssignment {
  /** Identity, stable so a selection survives a re-pick. */
  id: string;
  /** The functional group it belongs to, as a chemist names it. */
  group: string;
  /** The motion itself: which bond, and how it moves. */
  vibration: string;
  /** Lowest wavenumber of the range, in cm⁻¹. */
  from: number;
  /** Highest wavenumber of the range, in cm⁻¹. */
  to: number;
  /** How strong the band usually is, in the table's own letters. */
  strength: IrBandStrength;
  /**
   * What tells this assignment apart from the others it overlaps — the shape of
   * the band, a partner band elsewhere, a region it must be absent from.
   * @default undefined
   */
  note?: string;
}

/**
 * The table, in ascending order of the low end of each range.
 *
 * Ordered so that a reader scanning it moves along the axis, and so that the
 * fingerprint region below 1500 cm⁻¹ — where assignments are least decisive —
 * sits together at the top rather than being interleaved with the diagnostic
 * stretches above it.
 */
export const BAND_ASSIGNMENTS: readonly BandAssignment[] = [
  {
    id: 'c-br-stretch',
    group: 'alkyl bromide',
    vibration: 'C–Br stretch',
    from: 500,
    to: 600,
    strength: 'S',
  },
  {
    id: 'c-cl-stretch',
    group: 'alkyl chloride',
    vibration: 'C–Cl stretch',
    from: 600,
    to: 800,
    strength: 'S',
  },
  {
    id: 'aromatic-ch-oop',
    group: 'arene',
    vibration: 'C–H out-of-plane bend',
    from: 690,
    to: 900,
    strength: 'S',
    note: 'How many bands, and where, is what tells a substitution pattern apart',
  },
  {
    id: 'alkene-ch-oop',
    group: 'alkene',
    vibration: '=C–H out-of-plane bend',
    from: 890,
    to: 990,
    strength: 'S',
    note: 'A terminal vinyl gives two, near 910 and 990',
  },
  {
    id: 'c-o-stretch',
    group: 'alcohol, ether, ester',
    vibration: 'C–O stretch',
    from: 1000,
    to: 1300,
    strength: 'S',
    note: 'Strong and broad; an ester shows two, the higher one near 1200',
  },
  {
    id: 'c-f-stretch',
    group: 'alkyl fluoride',
    vibration: 'C–F stretch',
    from: 1000,
    to: 1400,
    strength: 'S',
  },
  {
    id: 'c-n-stretch',
    group: 'amine, amide',
    vibration: 'C–N stretch',
    from: 1080,
    to: 1360,
    strength: 'm',
  },
  {
    id: 'nitro-symmetric',
    group: 'nitro',
    vibration: 'N–O symmetric stretch',
    from: 1300,
    to: 1390,
    strength: 'S',
    note: 'Never alone: the asymmetric partner sits near 1500–1560',
  },
  {
    id: 'oh-bend',
    group: 'alcohol',
    vibration: 'O–H bend',
    from: 1330,
    to: 1430,
    strength: 'm',
  },
  {
    id: 'alkane-ch-bend',
    group: 'alkane',
    vibration: 'C–H bend',
    from: 1370,
    to: 1470,
    strength: 'm',
    note: 'A gem-dimethyl splits the 1380 band in two',
  },
  {
    id: 'aromatic-cc-stretch',
    group: 'arene',
    vibration: 'C=C aromatic stretch',
    from: 1450,
    to: 1600,
    strength: 'm',
    note: 'Usually a pair, near 1500 and 1600',
  },
  {
    id: 'nitro-asymmetric',
    group: 'nitro',
    vibration: 'N–O asymmetric stretch',
    from: 1500,
    to: 1560,
    strength: 'S',
  },
  {
    id: 'nh-bend',
    group: 'amine, amide',
    vibration: 'N–H bend',
    from: 1550,
    to: 1640,
    strength: 'm',
  },
  {
    id: 'alkene-cc-stretch',
    group: 'alkene',
    vibration: 'C=C stretch',
    from: 1620,
    to: 1680,
    strength: 'w',
    note: 'Weak, and absent altogether on a symmetric alkene',
  },
  {
    id: 'amide-co-stretch',
    group: 'amide',
    vibration: 'C=O stretch',
    from: 1630,
    to: 1690,
    strength: 'S',
    note: 'The lowest carbonyl there is; look for N–H above 3300 to confirm',
  },
  {
    id: 'acid-co-stretch',
    group: 'carboxylic acid',
    vibration: 'C=O stretch',
    from: 1700,
    to: 1725,
    strength: 'S',
    note: 'Confirmed by the very broad O–H between 2500 and 3300',
  },
  {
    id: 'ketone-co-stretch',
    group: 'ketone',
    vibration: 'C=O stretch',
    from: 1705,
    to: 1725,
    strength: 'S',
    note: 'Conjugation drops it by about 30; a strained ring raises it',
  },
  {
    id: 'aldehyde-co-stretch',
    group: 'aldehyde',
    vibration: 'C=O stretch',
    from: 1720,
    to: 1740,
    strength: 'S',
    note: 'Confirmed by the C–H pair near 2720 and 2820',
  },
  {
    id: 'ester-co-stretch',
    group: 'ester',
    vibration: 'C=O stretch',
    from: 1735,
    to: 1750,
    strength: 'S',
    note: 'Confirmed by the strong C–O between 1000 and 1300',
  },
  {
    id: 'acid-chloride-co-stretch',
    group: 'acid chloride',
    vibration: 'C=O stretch',
    from: 1770,
    to: 1815,
    strength: 'S',
  },
  {
    id: 'anhydride-co-stretch',
    group: 'anhydride',
    vibration: 'C=O stretch',
    from: 1740,
    to: 1830,
    strength: 'S',
    note: 'Two bands, about 60 apart, which is what names it',
  },
  {
    id: 'nitrile-stretch',
    group: 'nitrile',
    vibration: 'C≡N stretch',
    from: 2210,
    to: 2260,
    strength: 'm',
    note: 'Sharp, and in a region almost nothing else occupies',
  },
  {
    id: 'alkyne-cc-stretch',
    group: 'alkyne',
    vibration: 'C≡C stretch',
    from: 2100,
    to: 2260,
    strength: 'w',
    note: 'Weak, and absent on a symmetric internal alkyne',
  },
  {
    id: 'aldehyde-ch-stretch',
    group: 'aldehyde',
    vibration: 'C–H stretch',
    from: 2695,
    to: 2830,
    strength: 'm',
    note: 'The diagnostic pair near 2720 and 2820',
  },
  {
    id: 'acid-oh-stretch',
    group: 'carboxylic acid',
    vibration: 'O–H stretch',
    from: 2500,
    to: 3300,
    strength: 'S',
    note: 'Very broad — it runs under the C–H bands rather than beside them',
  },
  {
    id: 'alkane-ch-stretch',
    group: 'alkane',
    vibration: 'C–H stretch',
    from: 2850,
    to: 3000,
    strength: 'S',
    note: 'Below 3000, which is what separates it from an alkene C–H',
  },
  {
    id: 'alkene-ch-stretch',
    group: 'alkene',
    vibration: '=C–H stretch',
    from: 3000,
    to: 3100,
    strength: 'm',
    note: 'Above 3000, and never alone: the C=C sits near 1650',
  },
  {
    id: 'aromatic-ch-stretch',
    group: 'arene',
    vibration: 'C–H stretch',
    from: 3000,
    to: 3100,
    strength: 'm',
  },
  {
    id: 'alkyne-ch-stretch',
    group: 'alkyne',
    vibration: '≡C–H stretch',
    from: 3260,
    to: 3330,
    strength: 'S',
    note: 'Sharp, where an O–H in the same place is broad',
  },
  {
    id: 'alcohol-oh-stretch',
    group: 'alcohol',
    vibration: 'O–H stretch',
    from: 3200,
    to: 3600,
    strength: 'S',
    note: 'Broad when hydrogen bonded, which is nearly always',
  },
  {
    id: 'nh-stretch',
    group: 'amine, amide',
    vibration: 'N–H stretch',
    from: 3300,
    to: 3500,
    strength: 'm',
    note: 'A primary amine gives two bands, a secondary one',
  },
  {
    id: 'free-oh-stretch',
    group: 'alcohol',
    vibration: 'O–H stretch, not hydrogen bonded',
    from: 3580,
    to: 3650,
    strength: 'm',
    note: 'Sharp, and only in a dilute or gas-phase spectrum',
  },
];
