import { expect, test } from 'vitest';

import {
  formatIrValue,
  formatWavenumberRange,
  shortModeLabel,
} from '../irFormat.ts';
import {
  IR_MODE_RULES,
  bandsPointDown,
  boxZoomOnly,
  otherIrMode,
  yAxisRules,
  yAxisTitle,
  zoomGestures,
} from '../irMode.ts';
import type { IrMode, IrSpectrum } from '../irSpectrum.ts';
import { traceOf } from '../irSpectrum.ts';
import {
  IR_TECHNIQUES,
  IR_TECHNIQUE_RULES,
  defaultIrMode,
  irModeFor,
  irModeTechnique,
  offersIrMode,
} from '../irTechnique.ts';

const raman: IrSpectrum = {
  id: 'calcite',
  name: 'calcite',
  color: '#0072b2',
  wavenumber: Float64Array.from([150, 282, 1086]),
  intensity: Float64Array.from([12, 340, 2048.5]),
  meta: null,
  origin: { format: 'wdf' },
  visible: true,
};

test('infrared keeps every fact it had, Raman states its own', () => {
  expect(IR_TECHNIQUES).toStrictEqual(['infrared', 'raman']);
  expect(IR_TECHNIQUE_RULES.infrared).toStrictEqual({
    name: 'infrared',
    modes: ['transmittance', 'absorbance'],
    xTitle: 'wavenumber (cm⁻¹)',
    reverseX: true,
    assignments: true,
    dataType: 'INFRARED SPECTRUM',
  });
  expect(IR_TECHNIQUE_RULES.raman).toStrictEqual({
    name: 'Raman',
    modes: ['intensity'],
    xTitle: 'Raman shift (cm⁻¹)',
    reverseX: false,
    assignments: false,
    dataType: 'RAMAN SPECTRUM',
  });
});

test('a viewer opens on the first mode its technique offers', () => {
  expect(defaultIrMode('infrared')).toBe('transmittance');
  expect(defaultIrMode('raman')).toBe('intensity');
});

test('a mode the technique does not offer falls back to its first', () => {
  expect(irModeFor('infrared', 'absorbance')).toBe('absorbance');
  expect(irModeFor('infrared', 'intensity')).toBe('transmittance');
  expect(irModeFor('infrared')).toBe('transmittance');
  expect(irModeFor('raman', 'absorbance')).toBe('intensity');
  expect(irModeFor('raman', 'transmittance')).toBe('intensity');
  expect(offersIrMode('raman', 'intensity')).toBe(true);
  expect(offersIrMode('raman', undefined)).toBe(false);
});

test('every value axis belongs to exactly one technique', () => {
  const owners: Array<[IrMode, string[]]> = [];
  for (const mode of Object.keys(IR_MODE_RULES) as IrMode[]) {
    const offering: string[] = [];
    for (const technique of IR_TECHNIQUES) {
      if (offersIrMode(technique, mode)) offering.push(technique);
    }
    owners.push([mode, offering]);
  }

  expect(owners).toStrictEqual([
    ['transmittance', ['infrared']],
    ['absorbance', ['infrared']],
    ['intensity', ['raman']],
  ]);
  expect(irModeTechnique('transmittance')).toBe('infrared');
  expect(irModeTechnique('absorbance')).toBe('infrared');
  expect(irModeTechnique('intensity')).toBe('raman');
});

test('the toggle never leaves the technique', () => {
  expect(otherIrMode('intensity')).toBe('intensity');
  expect(otherIrMode('intensity', 'raman')).toBe('intensity');
  expect(otherIrMode('transmittance', 'infrared')).toBe('absorbance');
  expect(otherIrMode('absorbance', 'infrared')).toBe('transmittance');
  // A mode foreign to the technique toggles to the technique's own first.
  expect(otherIrMode('intensity', 'infrared')).toBe('transmittance');
});

test('intensity stands up from zero and answers both drags and the wheel', () => {
  expect(yAxisTitle('intensity')).toBe('intensity');
  expect(yAxisRules('intensity')).toStrictEqual({
    baseline: 0,
    keepBaseline: false,
    pointsDown: false,
  });
  expect(zoomGestures('intensity')).toStrictEqual({
    drag: 'xAxis',
    wheel: true,
    keys: false,
  });
  expect(zoomGestures('intensity', 'box')).toStrictEqual({
    drag: 'box',
    wheel: true,
    keys: false,
  });
  expect(boxZoomOnly('intensity')).toBe(false);
  expect(bandsPointDown('intensity')).toBe(false);
});

test('a Raman trace shares the intensity, and has no infrared axis', () => {
  const trace = traceOf(raman, 'intensity');

  expect(trace?.x).toBe(raman.wavenumber);
  expect(trace?.y).toBe(raman.intensity);
  expect(traceOf(raman, 'absorbance')).toBeUndefined();
  expect(traceOf(raman, 'transmittance')).toBeUndefined();
});

test('an intensity keeps four significant digits, whatever its scale', () => {
  expect(formatIrValue(20_518, 'intensity')).toBe('20520');
  expect(formatIrValue(45.678, 'intensity')).toBe('45.68');
  expect(formatIrValue(0.012_345, 'intensity')).toBe('0.01235');
  expect(formatIrValue(Number.NaN, 'intensity')).toBe('');
  expect(shortModeLabel('intensity')).toBe('I');
  // Infrared keeps its own count of decimals.
  expect(formatIrValue(0.123_45, 'absorbance')).toBe('0.123');
  expect(formatIrValue(45.678, 'transmittance')).toBe('45.7');
});

test('a range is written in the order its axis is read', () => {
  const shifts = Float64Array.from([150.4, 282, 3199.6]);

  expect(formatWavenumberRange(shifts, false)).toBe('150–3200 cm⁻¹');
  expect(formatWavenumberRange(shifts, true)).toBe('3200–150 cm⁻¹');
  expect(formatWavenumberRange(new Float64Array(0), false)).toBe('');
});
