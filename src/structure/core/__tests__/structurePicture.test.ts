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

const ALANINE = Molecule.fromSmiles('C[C@H](N)C(=O)O');

test('a named picture is the same file on every run', () => {
  const first = structurePicture(ALANINE, { id: 'alanine' });
  const second = structurePicture(ALANINE, { id: 'alanine' });

  expect(first.markup).toBe(second.markup);
  expect(first.markup).toContain('<svg id="alanine" ');
  expect(first.markup).toContain('#alanine text {font-family: sans-serif;}');
});

test('left unnamed, OpenChemLib numbers each picture, as it always has', () => {
  const first = structurePicture(ALANINE);
  const second = structurePicture(ALANINE);

  expect(first.markup).toMatch(/^<svg id="mol\d+" /);
  expect(first.markup).not.toBe(second.markup);
});

test('the stereo text is written by default and left out on request, the drawing kept', () => {
  const labelled = structurePicture(ALANINE, { id: 'a' }).markup;
  const quiet = structurePicture(ALANINE, {
    id: 'a',
    stereoText: false,
  }).markup;

  expect(labelled).toContain('>abs</text>');
  expect(labelled).toContain('>this enantiomer</text>');
  expect(labelled).toContain('>S</text>');
  expect(quiet).not.toContain('>abs</text>');
  expect(quiet).not.toContain('>this enantiomer</text>');
  expect(quiet).not.toContain('>S</text>');
  // Only words went: every bond, the hashed wedge included, is where it was.
  expect(strokes(quiet)).toHaveLength(10);
  expect(strokes(quiet)).toStrictEqual(strokes(labelled));
});

test("a figure names the family's type, and nothing in the name can leave the rule", () => {
  const { markup } = structurePicture(ALANINE, {
    id: 'a',
    fontFamily: "-apple-system, 'Segoe UI', sans-serif",
  });
  const hostile = structurePicture(ALANINE, {
    id: 'a',
    fontFamily: 'Arial;} </style><script>',
  }).markup;

  expect(markup).toContain(
    "#a text {font-family: -apple-system, 'Segoe UI', sans-serif;}",
  );
  expect(hostile).toContain('#a text {font-family: Arial /stylescript;}');
  expect(hostile.match(/<\/style>/g)).toHaveLength(1);
});

test("OpenChemLib's own options reach the drawing, the size stays the bond length's", () => {
  const plain = structurePicture(ETHANOL, { id: 'e' });
  const grey = structurePicture(ETHANOL, {
    id: 'e',
    depictor: { drawBondsInGray: true },
  });

  expect(plain.markup).toContain('stroke="rgb(0,0,0)"');
  expect(grey.markup).not.toContain('stroke="rgb(0,0,0)"');
  expect(grey.markup).toContain('stroke="rgb(128,128,128)"');
  expect(grey.width).toBe(plain.width);
  expect(grey.height).toBe(plain.height);
});

/**
 * Where a document draws its strokes, whatever their colour.
 * @param markup - The document.
 * @returns The ends of every line it draws.
 */
function strokes(markup: string): string[] {
  return (
    markup.match(/<line x1="[^"]+" y1="[^"]+" x2="[^"]+" y2="[^"]+"/g) ?? []
  );
}
