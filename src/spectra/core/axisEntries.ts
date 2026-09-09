import type { FilterCatalogEntry } from './filterEntries.ts';
import { RANGE_FIELDS, ZONE_FIELDS } from './filterEntries.ts';
import {
  booleanField,
  enumField,
  formulaField,
  integerField,
  numberField,
} from './filterFields.ts';

export const AXIS_ENTRIES = {
  xFunction: {
    label: 'Apply a formula to x',
    group: 'x-axis',
    summary:
      'Rewrites every x through an expression, read the same way as the y one.',
    fields: [
      formulaField(
        'function',
        'Expression in x',
        'For instance 10000000/x, which reads nanometres as wavenumbers.',
      ),
    ],
    caution:
      'Every range below is then read in the new units — including the resampling range, which runs last unless you resample first.',
  },
  fromTo: {
    label: 'Crop',
    group: 'x-axis',
    summary: 'Keeps one stretch of the spectrum and drops the rest.',
    fields: [
      ...RANGE_FIELDS,
      integerField('fromIndex', 'From (point)', '0'),
      integerField('toIndex', 'To (point)', 'the last point'),
    ],
    caution:
      'Give x values or point numbers, not both: a point number silently wins over an x value.',
  },
  filterX: {
    label: 'Keep or drop x zones',
    group: 'x-axis',
    summary:
      'Keeps the points falling in the zones named, without resampling anything.',
    fields: [...RANGE_FIELDS, ...ZONE_FIELDS],
  },
  equallySpaced: {
    label: 'Resample on a regular grid',
    group: 'x-axis',
    summary: 'Interpolates onto evenly spaced x values.',
    fields: [
      ...RANGE_FIELDS,
      integerField('numberOfPoints', 'Number of points', '100'),
      ...ZONE_FIELDS,
    ],
    caution:
      'The settings above already resample once, so this resamples twice; whichever of the two runs last sets the point count.',
  },
  calibrateX: {
    label: 'Calibrate x on a peak',
    group: 'x-axis',
    summary:
      'Finds the strongest peaks in a stretch and shifts the whole axis so their mean lands on the value asked for.',
    fields: [
      ...RANGE_FIELDS,
      integerField('nbPeaks', 'Peaks to find', '1'),
      numberField('targetX', 'Move them to', '0'),
      booleanField('gsd.smoothY', 'Smooth before picking'),
      booleanField(
        'gsd.maxCriteria',
        'Pick maxima',
        'Off picks minima instead.',
      ),
      numberField(
        'gsd.minMaxRatio',
        'Smallest peak kept',
        '0.00025',
        'As a fraction of the tallest. A step added here starts at 0.1; empty the box and this far lower default takes over.',
      ),
      numberField('gsd.noiseLevel', 'Noise level', 'not set'),
      booleanField('gsd.realTopDetection', 'Refine the summit'),
      integerField('gsd.sgOptions.windowSize', 'Peak-picking window', '9'),
      integerField('gsd.sgOptions.polynomial', 'Peak-picking polynomial', '3'),
      enumField('gsd.peakDetectionAlgorithm', 'Detected on', [
        { value: 'first', label: 'The first derivative' },
        { value: 'second', label: 'The second derivative' },
        { value: 'auto', label: 'Whichever fits' },
      ]),
    ],
    caution:
      'When fewer peaks are found than asked for, the spectrum is returned untouched and nothing says so.',
  },
  ensureGrowing: {
    label: 'Make x strictly increasing',
    group: 'utility',
    summary:
      'Drops the points that repeat or go backwards, which resampling and cropping both assume never happens.',
    fields: [],
  },
  reverseIfNeeded: {
    label: 'Reverse a descending x',
    group: 'utility',
    summary: 'Turns a descending axis the right way round.',
    fields: [],
    caution:
      'The chain already does this before every step, so adding it here changes nothing.',
  },
} as const satisfies Record<string, FilterCatalogEntry>;
