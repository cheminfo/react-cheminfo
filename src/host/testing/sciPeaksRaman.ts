/**
 * The Raman spectra of SciPeaks' ethylbenzene sample, as SciPeaks stores them,
 * and the `load` its tool tab is to send a site that reads them — pinned here
 * before visualizer-helper's `raman` reader exists, so both repositories test
 * the same bytes. The translation is `./sciPeaksStored.ts`'s.
 *
 * The sample's quirks are real and kept: its Raman attachments are a spectrum
 * of adamantane and a 6 × 6 mapping of 36 spectra, neither of them
 * ethylbenzene, and the adamantane bands it stores were not read off that file.
 */

import type { LoadRequest } from '../core/protocol.ts';

import { SCIPEAKS_ETHYLBENZENE_LOAD } from './sciPeaks.ts';
import { sentRamanPeak, storedRamanPeak } from './sciPeaksStored.ts';

/** Where SciPeaks keeps that sample's Raman spectrum of adamantane. */
export const SCIPEAKS_ETHYLBENZENE_RAMAN_FILENAME =
  'spectra/raman/Adamantan.jdx';

/** Where SciPeaks keeps that sample's Raman mapping, with no band kept. */
export const SCIPEAKS_ETHYLBENZENE_RAMAN_MAP_FILENAME = 'spectra/raman/6x6.jdx';

/**
 * The bands SciPeaks keeps for the adamantane spectrum, as stored: out of shift
 * order, intensities in counts, and the visualizer's `_highlight`.
 */
export const SCIPEAKS_ETHYLBENZENE_RAMAN_PEAKS = [
  storedRamanPeak(2913.7252010212374, 21726, 'S', 0.9980196377921478),
  storedRamanPeak(1219.26005372187, 4223, 'w', 0.5997125259625802),
  storedRamanPeak(1215.907996061535, 1049.8, 'w', 0.4785640372354789),
];

/**
 * The `load` the tool tab is to send that sample to a site that reads Raman
 * spectra: the structure as it is sent today, then one `spectra.raman.jdx`
 * item per spectrum — the mapping without `peaks`, since none were kept for
 * it — and `accept` naming the output its `save` keeps the bands from —
 * vibrations' `ramanPeaks`, by key, as the tab asks for it.
 * @param jdx - The attachments' texts.
 * @param jdx.adamantane - The text of {@link SCIPEAKS_ETHYLBENZENE_RAMAN_FILENAME}.
 * @param jdx.map - The text of {@link SCIPEAKS_ETHYLBENZENE_RAMAN_MAP_FILENAME}.
 * @returns The request.
 */
export function sciPeaksEthylbenzeneRamanLoad(jdx: {
  adamantane: string;
  map: string;
}): LoadRequest & { accept: string[] } {
  return {
    type: 'load',
    id: 'load-1',
    document: SCIPEAKS_ETHYLBENZENE_LOAD.document,
    items: [
      ...SCIPEAKS_ETHYLBENZENE_LOAD.items,
      {
        kind: 'spectra.raman.jdx',
        id: SCIPEAKS_ETHYLBENZENE_RAMAN_FILENAME,
        label: 'Adamantan.jdx',
        value: {
          jdx: jdx.adamantane,
          peaks: SCIPEAKS_ETHYLBENZENE_RAMAN_PEAKS.map(sentRamanPeak),
        },
      },
      {
        kind: 'spectra.raman.jdx',
        id: SCIPEAKS_ETHYLBENZENE_RAMAN_MAP_FILENAME,
        label: '6x6.jdx',
        value: { jdx: jdx.map },
      },
    ],
    accept: ['ramanPeaks'],
  };
}
