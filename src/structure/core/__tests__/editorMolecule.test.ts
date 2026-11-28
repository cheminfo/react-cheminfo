import { expect, test } from 'vitest';

import { editorMolecule } from '../editorMolecule.ts';
import { sameIdCode } from '../editorValue.ts';

/** Butane, as an editor hands it over with and without its coordinates. */
const BUTANE = 'gC`@Dij@@';
const DRAWN_BUTANE = 'gC`@Dij@@ !B@Fq?[@@S';

test('two drawings of one structure are the same, wherever the atoms sit', () => {
  expect(sameIdCode(BUTANE, DRAWN_BUTANE)).toBe(true);
  expect(sameIdCode(DRAWN_BUTANE, 'gCaHH@aIZ`@')).toBe(false);
});

test('an editor value is read as its molecule, an empty canvas as none', () => {
  const butane = editorMolecule(DRAWN_BUTANE);

  expect(butane?.getAllAtoms()).toBe(4);
  expect(butane?.getIDCode()).toBe(BUTANE);
  expect(editorMolecule('')).toBeNull();
  expect(editorMolecule('d@')).toBeNull();
});
