import { expect, test } from 'vitest';

import { checkValue, isKnownKind, kindAccepts, readOutput } from '../kinds.ts';
import type { ToolInterface } from '../protocol.ts';
import { selectInputs } from '../selectInputs.ts';

/** A site reading measured mass spectra and the ions a drawing expects. */
const MS_TOOL: ToolInterface = {
  name: 'chemcalc',
  inputs: [
    { key: 'structure', kinds: ['chem.molfile'], optional: true },
    { key: 'spectra', kinds: ['spectra.ms.jdx'], many: true, optional: true },
    { key: 'ions', kinds: ['spectra.ms.ions'], optional: true },
  ],
  outputs: [{ key: 'assignments', kind: 'spectra.ms.assignments' }],
};

test('the three mass spectrometry kinds are known, and none falls under another', () => {
  expect(isKnownKind('spectra.ms.jdx')).toBe(true);
  expect(isKnownKind('spectra.ms.ions')).toBe(true);
  expect(isKnownKind('spectra.ms.assignments')).toBe(true);
  expect(kindAccepts('spectra.ms.jdx', 'spectra.ms.ions')).toBe(false);
  expect(kindAccepts('spectra.ms.ions', 'spectra.ms.assignments')).toBe(false);
  expect(kindAccepts('spectra.ir.jdx', 'spectra.ms.jdx')).toBe(false);
  expect(kindAccepts('spectra.ms', 'spectra.ms.jdx')).toBe(true);
});

test('ions alone open the tool, its spectra left as the visitor loaded them', () => {
  const ions = [
    { id: 'cut1:from:+', mz: 105.0335, mf: 'C7H5O(+1)', label: 'Cleavage 1' },
    { id: 'cut1:to:+', mz: 15.0229, mf: 'CH3(+1)', radical: false },
  ];

  const selection = selectInputs(MS_TOOL, [
    { kind: 'spectra.ms.ions', value: { ions } },
  ]);

  expect(
    selection.ok
      ? selection.inputs.map(({ key, checked }) => [key, checked.value])
      : selection,
  ).toStrictEqual([['ions', { ions }]]);
});

test('every spectrum a figure carries goes to the one input, in order', () => {
  const selection = selectInputs(MS_TOOL, [
    { kind: 'spectra.ms.jdx', label: 'MS1', value: { jdx: '##TITLE=MS1' } },
    { kind: 'spectra.ms.jdx', label: 'MS2', value: { jdx: '##TITLE=MS2' } },
    { kind: 'spectra.ms.ions', value: { ions: [] } },
  ]);

  expect(
    selection.ok
      ? selection.inputs.map(({ key, item }) => [key, item.label])
      : selection,
  ).toStrictEqual([
    ['spectra', 'MS1'],
    ['spectra', 'MS2'],
    ['ions', undefined],
  ]);
});

test('an ion needs a name and an m/z above zero, and loses the fields it does not know', () => {
  expect(
    checkValue('spectra.ms.ions', { ions: [{ id: 'a', mz: 0 }] }),
  ).toStrictEqual({
    valid: false,
    errors: ['/ions/0/mz: must be > 0'],
  });
  expect(checkValue('spectra.ms.ions', { ions: [{ mz: 77 }] })).toStrictEqual({
    valid: false,
    errors: ["/ions/0: must have required property 'id'"],
  });
  expect(
    checkValue('spectra.ms.ions', {
      ions: [{ id: 'a', mz: 77.0386, colour: 'red' }],
    }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'spectra.ms.ions',
      value: { ions: [{ id: 'a', mz: 77.0386 }] },
    },
  });
});

test('a spectrum carries its JCAMP-DX and nothing else', () => {
  expect(
    checkValue('spectra.ms.jdx', { jdx: '##TITLE=x', peaks: [] }),
  ).toStrictEqual({
    valid: true,
    checked: { kind: 'spectra.ms.jdx', value: { jdx: '##TITLE=x' } },
  });
  expect(checkValue('spectra.ms.jdx', {})).toStrictEqual({
    valid: false,
    errors: ["/: must have required property 'jdx'"],
  });
});

test('the peaks the ions were found at come back as a percentage of the tallest', () => {
  const assignments = [
    { id: 'cut1:from:+', mz: 105.0337, intensity: 100 },
    { id: 'cut2:to:+', mz: 77.0388, intensity: 42.5 },
  ];

  expect(
    readOutput(
      [
        {
          key: 'assignments',
          kind: 'spectra.ms.assignments',
          value: { assignments },
        },
      ],
      'assignments',
      'spectra.ms.assignments',
    ),
  ).toStrictEqual({
    kind: 'spectra.ms.assignments',
    value: { assignments },
  });
  expect(
    checkValue('spectra.ms.assignments', {
      assignments: [{ id: 'a', mz: 77, intensity: 140 }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ['/assignments/0/intensity: must be <= 100'],
  });
});
