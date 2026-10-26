/**
 * What SciPeaks sends a tool, byte for byte: the `load` its tool tab —
 * visualizer-helper's `eln/toolTab` — writes for the ethylbenzene sample its own
 * tests read (`eln/__tests__/data/sample.json`). Both repositories pin this
 * message, so a change on either side that the other does not expect fails a
 * test rather than a notebook.
 *
 * The sample is a real one, and so are its quirks: its molfile is V2000 with
 * every atom at the origin, its title is blank so the label is its first name,
 * and its formula travels as a kind no structure input reads.
 *
 * Its infrared spectrum is pinned here before the tool tab sends it: the bands
 * are the sample's own, and the message is the one visualizer-helper's `ir`
 * reader has to write.
 */

import type { LoadRequest } from '../core/protocol.ts';

/** How SciPeaks' tool tab introduces itself in `connect`. */
export const SCIPEAKS_HOST_NAME = 'SciPeaks';

/** The molfile SciPeaks stores for ethylbenzene: every atom at the origin. */
export const SCIPEAKS_ETHYLBENZENE_MOLFILE = [
  '',
  'Actelion Java MolfileCreator 1.0',
  '',
  '  8  8  0  0  0  0  0  0  0  0999 V2000',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '  1  2  1  0  0  0  0',
  '  1  3  1  0  0  0  0',
  '  2  4  2  0  0  0  0',
  '  2  5  1  0  0  0  0',
  '  4  6  1  0  0  0  0',
  '  5  7  2  0  0  0  0',
  '  6  8  2  0  0  0  0',
  '  7  8  1  0  0  0  0',
  'M  END',
  '',
].join('\n');

/** The first `load` the tool tab sends for that sample, with `accept`. */
export const SCIPEAKS_ETHYLBENZENE_LOAD: LoadRequest & { accept: string[] } = {
  type: 'load',
  id: 'load-1',
  document: 'eln:1315a6d895f431497538cb6d834feab5',
  items: [
    {
      kind: 'chem.molfile.2d',
      value: { molfile: SCIPEAKS_ETHYLBENZENE_MOLFILE },
      label: 'Ethylbenzene',
    },
    {
      kind: 'chem.ocl.id',
      value: {
        idCode: 'daD@@DjUZxHH@@',
        coordinates: String.raw`!BbOvw?_x@?g?~_{\Bm?t`,
      },
      label: 'Ethylbenzene',
    },
    { kind: 'chem.mf', value: { mf: 'C8H10' } },
  ],
  accept: [],
};

/** Where SciPeaks keeps that sample's infrared spectrum: its attachment. */
export const SCIPEAKS_ETHYLBENZENE_IR_FILENAME =
  'spectra/ir/spectra_ir_100-41-4-IR.jdx';

/**
 * The bands SciPeaks keeps for that spectrum, as stored: out of wavenumber
 * order, a transmittance that is a fraction, and the visualizer's `_highlight`.
 */
export const SCIPEAKS_ETHYLBENZENE_IR_PEAKS = [
  peak(
    1613.8583376884494,
    0.473660722610156,
    0.33599999999999997,
    'm',
    0.5620600551849647,
  ),
  peak(
    1952.5275809045322,
    0.13123804178794973,
    0.7392,
    'w',
    0.5211472441361716,
  ),
  peak(
    2872.4947788943773,
    0.4610494379856386,
    0.3459,
    'm',
    0.30496127508514037,
  ),
  peak(2887.659073366737, 0.7066374452885544, 0.1965, 'S', 0.6306151483877337),
  peak(2907.878132663217, 0.4962093169428189, 0.319, 'S', 0.7220300834282813),
  peak(2944.9464080400967, 1.0867160982395816, 0.0819, 'S', 0.8391486100817713),
  peak(2978.6448402008964, 1.7958800173440752, 0.016, 'S', 0.6098050482700554),
  peak(3014.028193969736, 0.32975414692587596, 0.468, 'm', 0.39091552830124354),
  peak(3039.302018090336, 1.0969100130080565, 0.08, 'S', 0.502385910408338),
  peak(
    3076.3702934672156,
    0.5831931281770556,
    0.2611,
    'S',
    0.06293920935800923,
  ),
  peak(
    3098.2742743717354,
    0.38658105496542694,
    0.4106,
    'm',
    0.4934643842659038,
  ),
  peak(
    3118.493333668215,
    0.16557929631846746,
    0.6829999999999999,
    'w',
    0.05290000144269602,
  ),
  peak(
    1875.0211869346824,
    0.11935787359571505,
    0.7597,
    'w',
    0.9972320630781272,
  ),
  peak(
    1812.6790874371945,
    0.11125903931710739,
    0.774,
    'w',
    0.07102323198933491,
  ),
  peak(
    1753.706831155787,
    0.0834934128848443,
    0.8251000000000001,
    'w',
    0.0750629173499594,
  ),
];

/**
 * The `load` the tool tab is to send that sample to a site that reads
 * infrared spectra and hands their bands back, once its `ir` reader and its
 * `save` exist: the structure as it is sent today, one `spectra.ir.jdx` item
 * per spectrum — the attachment's text, its name and its bands, under the
 * attachment's name as `id` — and `accept` naming the kind saved back, as
 * the tool tab's `save` names it.
 * @param jdx - The attachment's text, which SciPeaks serves at its `dUrl`.
 * @returns The request, its bands copied so that reading them cannot strip
 * this module's own.
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
        value: {
          jdx,
          filename: SCIPEAKS_ETHYLBENZENE_IR_FILENAME,
          peaks: SCIPEAKS_ETHYLBENZENE_IR_PEAKS.map((stored) => ({
            ...stored,
          })),
        },
      },
    ],
    accept: ['spectra.ir.peaks'],
  };
}

/**
 * One stored band.
 * @param wavenumber - Where it sits, in cm⁻¹.
 * @param absorbance - Its absorbance.
 * @param transmittance - Its transmittance, a fraction.
 * @param kind - Its strength letter.
 * @param highlight - The visualizer's own `_highlight`, stored with it.
 * @returns The band as SciPeaks stores it.
 */
function peak(
  wavenumber: number,
  absorbance: number,
  transmittance: number,
  kind: string,
  highlight: number,
) {
  return { wavenumber, absorbance, transmittance, kind, _highlight: highlight };
}
