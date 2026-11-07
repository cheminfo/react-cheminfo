import { expect, test } from 'vitest';

import { figureAddress } from '../../../download/core/figureSource.ts';
import { FIGURE_PARAM, isFigureAddress } from '../figureParam.ts';

test('an address asks for the figure alone by naming it, bare or with a value', () => {
  expect(FIGURE_PARAM).toBe('figure');
  expect(isFigureAddress('?embed=1&figure')).toBe(true);
  expect(isFigureAddress('figure=1&smiles=CCO')).toBe(true);
  expect(isFigureAddress('?embed=1&figures=1')).toBe(false);
  expect(isFigureAddress('')).toBe(false);
});

test('the address a figure records leaves the figure layout out, as it does the framing', () => {
  expect(
    figureAddress(
      'https://3d.cheminfo.org/?embed=1&figure&smiles=CCO&hide=list&id=c2',
    ),
  ).toBe('https://3d.cheminfo.org/?smiles=CCO&id=c2');
});
