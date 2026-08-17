import { expect, test } from 'vitest';

import {
  classifyMolfile,
  looksLikeMolfile,
  molfileAtomCount,
} from '../molfile.ts';

import { BUTANE_V2000, BUTANE_V3000, EMPTY_V2000 } from './molfiles.ts';

test('a V2000 molfile is read off its fixed-width counts line', () => {
  expect(classifyMolfile(BUTANE_V2000)).toStrictEqual({
    version: 'v2000',
    atomCount: 4,
  });
});

test('a V3000 molfile is read off its COUNTS line, not the zeroes above it', () => {
  expect(classifyMolfile(BUTANE_V3000)).toStrictEqual({
    version: 'v3000',
    atomCount: 4,
  });
});

test('a molfile with an empty atom block declares no atom', () => {
  expect(classifyMolfile(EMPTY_V2000)).toStrictEqual({
    version: 'v2000',
    atomCount: 0,
  });
  expect(molfileAtomCount(EMPTY_V2000)).toBe(0);
});

test('text that is not a molfile is neither version and holds no atom', () => {
  expect(classifyMolfile('CCCC')).toStrictEqual({
    version: 'unknown',
    atomCount: 0,
  });
  expect(classifyMolfile('')).toStrictEqual({
    version: 'unknown',
    atomCount: 0,
  });
  expect(molfileAtomCount('not a molfile at all')).toBe(0);
});

test('a version named inside a sentence is not a version stamp', () => {
  expect(classifyMolfile('the V2000 dialect is older than V3000').version).toBe(
    'unknown',
  );
});

test('carriage returns do not hide the counts line', () => {
  const text = BUTANE_V2000.replaceAll('\n', '\r\n');

  expect(classifyMolfile(text)).toStrictEqual({
    version: 'v2000',
    atomCount: 4,
  });
});

test('counts written without their padding are still read', () => {
  const text = BUTANE_V2000.replace(
    '  4  3  0  0  0  0  0  0  0  0999 V2000',
    '4  3  0  0  0  0  0  0  0  0999 V2000',
  );

  expect(molfileAtomCount(text)).toBe(4);
});

test('a V2000 file at the three-digit ceiling keeps its own count', () => {
  const text = BUTANE_V2000.replace(
    '  4  3  0  0  0  0  0  0  0  0999 V2000',
    '999999  0  0  0  0  0  0  0  0999 V2000',
  );

  expect(molfileAtomCount(text)).toBe(999);
});

test('a molfile is told apart from a line notation', () => {
  expect(looksLikeMolfile(BUTANE_V2000)).toBe(true);
  expect(looksLikeMolfile(BUTANE_V3000)).toBe(true);
  expect(looksLikeMolfile('CCCC')).toBe(false);
  expect(looksLikeMolfile('')).toBe(false);
  // Four lines, but nothing that stamps a version on any of them.
  expect(looksLikeMolfile('CCCC\nCCO\nCCN\nCCS')).toBe(false);
});
