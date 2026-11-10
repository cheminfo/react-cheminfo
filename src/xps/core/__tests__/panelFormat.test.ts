import { expect, test } from 'vitest';

import { countLabel } from '../../../panel/core/statusBar.ts';
import {
  formatFactor,
  levelText,
  signedEnergy,
  transitionText,
} from '../panelFormat.ts';

test('a distance from a published level is written with the sign it carries', () => {
  expect(signedEnergy(0.8)).toBe('+0.80');
  expect(signedEnergy(-0.8)).toBe('-0.80');
  expect(signedEnergy(0)).toBe('+0.00');
});

test('no distance is an em dash rather than a zero, which would be a claim', () => {
  expect(signedEnergy(null)).toBe('—');
  expect(signedEnergy(undefined)).toBe('—');
  expect(signedEnergy(Number.NaN)).toBe('—');
});

test('a sensitivity factor is quoted to the three figures a table has', () => {
  expect(formatFactor(0.278)).toBe('0.278');
  expect(formatFactor(2.8812)).toBe('2.88');
  expect(formatFactor(1)).toBe('1');
  expect(formatFactor(null)).toBe('—');
});

test('a level is the element and the orbital as the reference table writes it', () => {
  expect(levelText('C', '1s')).toBe('C 1s');
  expect(levelText('Mo', '3d5/2')).toBe('Mo 3d5/2');
  expect(levelText('C', null)).toBe('C');
  expect(levelText(null, '1s')).toBe('—');
});

test('a block is named as the file named it, and a nameless one is a survey', () => {
  expect(
    transitionText({
      name: '1: S 2p',
      element: 'S',
      shell: 2,
      angularMomentum: 'p',
      augerElement: null,
      augerTransition: null,
    }),
  ).toBe('1: S 2p');
  expect(
    transitionText({
      name: ' '.repeat(3),
      element: null,
      shell: null,
      angularMomentum: null,
      augerElement: null,
      augerTransition: null,
    }),
  ).toBe('Survey');
});

test('a count is written with the noun it counts', () => {
  expect(countLabel(1, 'spectrum', 'spectra')).toBe('1 spectrum');
  expect(countLabel(3, 'spectrum', 'spectra')).toBe('3 spectra');
  expect(countLabel(0, 'peak', 'peaks')).toBe('0 peaks');
  expect(countLabel(1, 'peak', 'peaks')).toBe('1 peak');
});
