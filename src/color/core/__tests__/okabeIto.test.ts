import { expect, test } from 'vitest';

import { PALETTE } from '../../../drawing/core/palette.ts';
import { OKABE_ITO } from '../okabeIto.ts';

test('the drawing palette is the eight colours of Okabe and Ito, black first', () => {
  expect(PALETTE).toBe(OKABE_ITO);
  expect(OKABE_ITO.map(({ value }) => value)).toStrictEqual([
    '#000000',
    '#e69f00',
    '#56b4e9',
    '#009e73',
    '#f0e442',
    '#0072b2',
    '#d55e00',
    '#cc79a7',
  ]);
});
