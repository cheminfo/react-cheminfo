import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { FIGURE_MAX_PIXELS } from '../../../download/core/figureScale.ts';
import {
  STRUCTURE_BOND_LENGTH,
  structurePicture,
} from '../structurePicture.ts';

const CAFFEINE = Molecule.fromSmiles('CN1C=NC2=C1C(=O)N(C)C(=O)N2C');
const ETHANOL = Molecule.fromSmiles('CCO');

test('the picture is cropped to the structure, and says how big it came out', () => {
  const picture = structurePicture(CAFFEINE);

  expect(picture.markup).toContain(`width="${picture.width}px"`);
  expect(picture.markup).toContain(`height="${picture.height}px"`);
  // A drug-sized molecule comes out around 300 pixels wide at the base length.
  expect(picture.width).toBeGreaterThan(200);
  expect(picture.width).toBeLessThan(400);
});

test('the resolution multiplies the drawing, not the white around it', () => {
  const once = structurePicture(CAFFEINE);
  const four = structurePicture(CAFFEINE, {
    bondLength: STRUCTURE_BOND_LENGTH * 4,
  });

  // This is the defect the bond length exists for: asking OpenChemLib for a
  // larger canvas leaves the drawing at the 24-pixel bond it caps at.
  expect(four.width / once.width).toBeGreaterThan(3.8);
  expect(four.width / once.width).toBeLessThan(4.2);
});

test('a small molecule is drawn at the same bond length, not blown up to fill', () => {
  const caffeine = structurePicture(CAFFEINE);
  const ethanol = structurePicture(ETHANOL);

  expect(ethanol.width).toBeLessThan(caffeine.width);
  expect(ethanol.height).toBeLessThan(caffeine.height);
});

test('a background is painted, so a black structure survives a dark page', () => {
  const { markup } = structurePicture(CAFFEINE);
  const open = markup.indexOf('>');

  expect(markup.slice(open + 1)).toMatch(
    /^<rect width="100%" height="100%" fill="#ffffff" \/>/,
  );
});

test('a transparent background leaves the document exactly as drawn', () => {
  const { markup } = structurePicture(CAFFEINE, { background: 'transparent' });

  expect(markup).not.toContain('<rect');
});

test('every resolution offered stays inside what a browser will paint', () => {
  const four = structurePicture(CAFFEINE, {
    bondLength: STRUCTURE_BOND_LENGTH * 4,
  });

  expect(four.width).toBeLessThan(FIGURE_MAX_PIXELS);
  expect(four.height).toBeLessThan(FIGURE_MAX_PIXELS);
});
