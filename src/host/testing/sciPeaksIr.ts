/**
 * The infrared spectrum of SciPeaks' ethylbenzene sample, as SciPeaks stores
 * it, and the `load` its tool tab is to send a site that reads it — pinned here
 * before visualizer-helper's `ir` reader exists, so both repositories test the
 * same bytes. The translation is `./sciPeaksStored.ts`'s.
 */

import type { LoadRequest } from '../core/protocol.ts';

import { SCIPEAKS_ETHYLBENZENE_LOAD } from './sciPeaks.ts';
import { sentIrPeak, storedIrPeak } from './sciPeaksStored.ts';

/** Where SciPeaks keeps that sample's infrared spectrum: its attachment. */
export const SCIPEAKS_ETHYLBENZENE_IR_FILENAME =
  'spectra/ir/spectra_ir_100-41-4-IR.jdx';

/**
 * The bands SciPeaks keeps for that spectrum, as stored: out of wavenumber
 * order, a transmittance that is a fraction, and the visualizer's `_highlight`.
 */
export const SCIPEAKS_ETHYLBENZENE_IR_PEAKS = [
  storedIrPeak(
    1613.8583376884494,
    0.473660722610156,
    0.33599999999999997,
    'm',
    0.5620600551849647,
  ),
  storedIrPeak(
    1952.5275809045322,
    0.13123804178794973,
    0.7392,
    'w',
    0.5211472441361716,
  ),
  storedIrPeak(
    2872.4947788943773,
    0.4610494379856386,
    0.3459,
    'm',
    0.30496127508514037,
  ),
  storedIrPeak(
    2887.659073366737,
    0.7066374452885544,
    0.1965,
    'S',
    0.6306151483877337,
  ),
  storedIrPeak(
    2907.878132663217,
    0.4962093169428189,
    0.319,
    'S',
    0.7220300834282813,
  ),
  storedIrPeak(
    2944.9464080400967,
    1.0867160982395816,
    0.0819,
    'S',
    0.8391486100817713,
  ),
  storedIrPeak(
    2978.6448402008964,
    1.7958800173440752,
    0.016,
    'S',
    0.6098050482700554,
  ),
  storedIrPeak(
    3014.028193969736,
    0.32975414692587596,
    0.468,
    'm',
    0.39091552830124354,
  ),
  storedIrPeak(
    3039.302018090336,
    1.0969100130080565,
    0.08,
    'S',
    0.502385910408338,
  ),
  storedIrPeak(
    3076.3702934672156,
    0.5831931281770556,
    0.2611,
    'S',
    0.06293920935800923,
  ),
  storedIrPeak(
    3098.2742743717354,
    0.38658105496542694,
    0.4106,
    'm',
    0.4934643842659038,
  ),
  storedIrPeak(
    3118.493333668215,
    0.16557929631846746,
    0.6829999999999999,
    'w',
    0.05290000144269602,
  ),
  storedIrPeak(
    1875.0211869346824,
    0.11935787359571505,
    0.7597,
    'w',
    0.9972320630781272,
  ),
  storedIrPeak(
    1812.6790874371945,
    0.11125903931710739,
    0.774,
    'w',
    0.07102323198933491,
  ),
  storedIrPeak(
    1753.706831155787,
    0.0834934128848443,
    0.8251000000000001,
    'w',
    0.0750629173499594,
  ),
];

/**
 * The `load` the tool tab is to send that sample to a site that reads infrared
 * spectra: the structure as it is sent today, then one `spectra.ir.jdx` item
 * per spectrum, and `accept` naming the output its `save` keeps the bands
 * from — vibrations' `irPeaks`, by key, as the tab asks for it.
 * @param jdx - The attachment's text.
 * @returns The request.
 */
export function sciPeaksEthylbenzeneIrLoad(
  jdx: string,
): LoadRequest & { accept: string[] } {
  return {
    type: 'load',
    id: 'load-1',
    document: SCIPEAKS_ETHYLBENZENE_LOAD.document,
    items: [
      ...SCIPEAKS_ETHYLBENZENE_LOAD.items,
      {
        kind: 'spectra.ir.jdx',
        id: SCIPEAKS_ETHYLBENZENE_IR_FILENAME,
        label: 'spectra_ir_100-41-4-IR.jdx',
        value: { jdx, peaks: SCIPEAKS_ETHYLBENZENE_IR_PEAKS.map(sentIrPeak) },
      },
    ],
    accept: ['irPeaks'],
  };
}
