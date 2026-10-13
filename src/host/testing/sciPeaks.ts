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
