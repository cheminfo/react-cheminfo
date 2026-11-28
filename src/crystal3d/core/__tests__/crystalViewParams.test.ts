import { expect, test } from 'vitest';

import { DEFAULT_CRYSTAL_VIEW_SETTINGS } from '../crystalView.ts';
import {
  crystalViewParams,
  readCrystalView,
  writeCrystalView,
} from '../crystalViewParams.ts';

test('a drawing at its defaults writes nothing, and reads back as them', () => {
  expect(writeCrystalView(DEFAULT_CRYSTAL_VIEW_SETTINGS)).toStrictEqual({});
  expect(readCrystalView({})).toStrictEqual(DEFAULT_CRYSTAL_VIEW_SETTINGS);
});

test('each field away from its default goes into the query and back', () => {
  const settings = {
    packing: 'cell',
    cells: 3,
    unitCell: false,
    bonds: 'noMetal',
  } as const;
  const query = writeCrystalView(settings);

  expect(query).toStrictEqual({
    packing: 'cell',
    supercell: '3',
    unitCell: '0',
    bonds: 'noMetal',
  });
  expect(readCrystalView(query)).toStrictEqual(settings);
});

test('a value a link gets wrong falls back, and a site sets its own cell range', () => {
  expect(
    readCrystalView({ packing: 'atoms', supercell: '12', bonds: 'some' }),
  ).toStrictEqual({ ...DEFAULT_CRYSTAL_VIEW_SETTINGS, cells: 4 });

  const params = crystalViewParams({ cells: { minimum: 1, maximum: 6 } });

  expect(params.supercell.parse('6')).toBe(6);
  expect(params.supercell.parse('9')).toBe(6);
});
