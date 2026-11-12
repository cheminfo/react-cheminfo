import { expect, test } from 'vitest';

import { KRATOS_AL_KA } from '../kratosAlKa.ts';
import { referenceElements } from '../referenceLevels.ts';
import { SCOFIELD_AL_KA } from '../scofieldAlKa.ts';
import type { XpsInstrument } from '../xpsInstrument.ts';
import {
  DEFAULT_INSTRUMENT_ID,
  ORBITAL,
  findInstrument,
  instrumentLines,
  isBuiltInInstrument,
  readInstruments,
  sensitivityFactor,
  xpsInstruments,
} from '../xpsInstrument.ts';

test('a viewer starts with the Kratos library at Al Kα, relative to F 1s', () => {
  expect(DEFAULT_INSTRUMENT_ID).toBe('kratos-al-ka');
  expect(KRATOS_AL_KA.factors).toHaveLength(329);
  expect(sensitivityFactor(KRATOS_AL_KA, 'F', '1s')).toBe(1);
  expect(sensitivityFactor(KRATOS_AL_KA, 'C', '1s')).toBe(0.278);
  expect(sensitivityFactor(KRATOS_AL_KA, 'N', '1s')).toBe(0.477);
  expect(sensitivityFactor(KRATOS_AL_KA, 'O', '1s')).toBe(0.78);
  expect(sensitivityFactor(KRATOS_AL_KA, 'Si', '2p')).toBe(0.328);
  expect(sensitivityFactor(KRATOS_AL_KA, 'S', '2p')).toBe(0.668);
  expect(sensitivityFactor(KRATOS_AL_KA, 'Fe', '2p')).toBe(2.96);
  expect(sensitivityFactor(KRATOS_AL_KA, 'Mo', '3d')).toBe(3.32);
  expect(sensitivityFactor(KRATOS_AL_KA, 'Au', '4f')).toBe(6.25);
  // The second component of a doublet is folded into the first.
  expect(sensitivityFactor(KRATOS_AL_KA, 'Fe', '2p3/2')).toBeNull();
});

test('the other shipped table is Scofield at Al Kα, relative to C 1s', () => {
  expect(SCOFIELD_AL_KA.factors).toHaveLength(731);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'C', '1s')).toBe(1);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'N', '1s')).toBe(1.8);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'O', '1s')).toBe(2.93);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'F', '1s')).toBe(4.43);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'Si', '2p')).toBe(0.817);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'Fe', '2p3/2')).toBe(10.82);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'Mo', '3d')).toBe(9.5);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'W', '4f')).toBe(9.8);
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'Au', '4f7/2')).toBe(9.58);
});

test.each([KRATOS_AL_KA, SCOFIELD_AL_KA])(
  'every line of $name is a known level of a known element, once',
  (instrument: XpsInstrument) => {
    const seen = new Set<string>();
    for (const { element, orbital, factor } of instrument.factors) {
      expect(referenceElements.has(element)).toBe(true);
      expect(orbital).toMatch(ORBITAL);
      expect(factor).toBeGreaterThan(0);

      const key = `${element} ${orbital}`;

      expect(seen.has(key)).toBe(false);

      seen.add(key);
    }
  },
);

test('a survey does not see hydrogen or helium, so the table has no line of them', () => {
  expect(instrumentLines(SCOFIELD_AL_KA, 'H')).toStrictEqual([]);
  expect(instrumentLines(SCOFIELD_AL_KA, 'He')).toStrictEqual([]);
  expect(instrumentLines(SCOFIELD_AL_KA, 'C')).toStrictEqual([
    { element: 'C', orbital: '1s', factor: 1 },
    { element: 'C', orbital: '2s', factor: 0.15 },
  ]);
});

test('a line the instrument does not know has no factor', () => {
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'Fe', '2p')).toBeNull();
  expect(sensitivityFactor(SCOFIELD_AL_KA, 'Xx', '1s')).toBeNull();
});

test('the shipped instruments come first, the reader’s after them', () => {
  const own = { id: 'lab', name: 'Our PHI', factors: [] };

  expect(
    xpsInstruments([own]).map((instrument) => instrument.id),
  ).toStrictEqual(['kratos-al-ka', 'scofield-al-ka', 'lab']);
  expect(findInstrument([own], 'lab')).toBe(own);
  expect(findInstrument([own], 'scofield-al-ka')).toBe(SCOFIELD_AL_KA);
  expect(isBuiltInInstrument('kratos-al-ka')).toBe(true);
  expect(isBuiltInInstrument('scofield-al-ka')).toBe(true);
  expect(isBuiltInInstrument('lab')).toBe(false);
});

test('an identity nothing answers to quantifies with the default instrument', () => {
  expect(findInstrument([], 'deleted-long-ago')).toBe(KRATOS_AL_KA);
});

test('stored instruments are read back keeping only what can divide an area', () => {
  const stored = [
    {
      id: 'kratos',
      name: 'Kratos Axis',
      description: 'From the instrument library',
      factors: [
        { element: 'C', orbital: '1s', factor: 0.278 },
        { element: 'O', orbital: '1s', factor: 0 },
        { element: 'Xx', orbital: '1s', factor: 1 },
        { element: 'N', orbital: '1z', factor: 0.477 },
        { element: 'N', orbital: '1s', factor: 0.477 },
        'not a factor',
      ],
    },
    { id: 'scofield-al-ka', name: 'A copy of the shipped one', factors: [] },
    { id: 'kratos', name: 'The same identity again', factors: [] },
    { name: 'No identity', factors: [] },
    { id: 'retyped', name: '', factors: [] },
    42,
  ];

  expect(readInstruments(stored)).toStrictEqual([
    {
      id: 'kratos',
      name: 'Kratos Axis',
      description: 'From the instrument library',
      factors: [
        { element: 'C', orbital: '1s', factor: 0.278 },
        { element: 'N', orbital: '1s', factor: 0.477 },
      ],
    },
    { id: 'retyped', name: '', factors: [] },
  ]);
  expect(readInstruments('not a list')).toStrictEqual([]);
});
