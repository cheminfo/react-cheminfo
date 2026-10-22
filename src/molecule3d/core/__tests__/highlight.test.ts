import { expect, test } from 'vitest';

import type { Molecule3DHighlight } from '../highlight.ts';
import { highlightedParts, sameHighlights } from '../highlight.ts';
import type { AtomReference } from '../measurement.ts';

/** Acetone as OpenChemLib writes it: C1, the carbonyl C2 and O3, then C4. */
const C1 = atom(0);
const C2 = atom(1);
const O3 = atom(2);
const C4 = atom(3);
const H5 = atom(4);
const H6 = atom(5);
const H7 = atom(6);
const H8 = atom(7);
const H9 = atom(8);
const H10 = atom(9);

/** The "C–H ×6" row: six bonds, each a path of its own. */
const SIX_C_H: Molecule3DHighlight[] = [
  { atoms: [C1, H5] },
  { atoms: [C1, H6] },
  { atoms: [C1, H7] },
  { atoms: [C4, H8] },
  { atoms: [C4, H9] },
  { atoms: [C4, H10] },
];

test('two atoms are one bond', () => {
  expect(highlightedParts([{ atoms: [C2, O3] }])).toStrictEqual({
    atoms: [C2, O3],
    bonds: [[C2, O3]],
  });
});

test('three atoms are the two bonds of an angle', () => {
  expect(highlightedParts([{ atoms: [C1, C2, C4] }])).toStrictEqual({
    atoms: [C1, C2, C4],
    bonds: [
      [C1, C2],
      [C2, C4],
    ],
  });
});

test('four atoms are the three bonds of a dihedral', () => {
  expect(highlightedParts([{ atoms: [H5, C1, C2, O3] }])).toStrictEqual({
    atoms: [H5, C1, C2, O3],
    bonds: [
      [H5, C1],
      [C1, C2],
      [C2, O3],
    ],
  });
});

test('one atom is that atom alone', () => {
  expect(highlightedParts([{ atoms: [O3] }])).toStrictEqual({
    atoms: [O3],
    bonds: [],
  });
});

test('six C–H bonds emphasise their eight atoms and no C–C bond', () => {
  expect(highlightedParts(SIX_C_H)).toStrictEqual({
    atoms: [C1, H5, H6, H7, C4, H8, H9, H10],
    bonds: [
      [C1, H5],
      [C1, H6],
      [C1, H7],
      [C4, H8],
      [C4, H9],
      [C4, H10],
    ],
  });
});

test('two highlighted atoms of different paths are not a bond', () => {
  // C1 and C2 are bonded, but no path holds them side by side.
  expect(
    highlightedParts([{ atoms: [C1, H5] }, { atoms: [C2, O3] }]),
  ).toStrictEqual({
    atoms: [C1, H5, C2, O3],
    bonds: [
      [C1, H5],
      [C2, O3],
    ],
  });
});

test('a bond named twice, either way round, is emphasised once', () => {
  expect(
    highlightedParts([
      { atoms: [C1, C2, O3] },
      { atoms: [O3, C2, C4] },
      { atoms: [C2, C1] },
    ]),
  ).toStrictEqual({
    atoms: [C1, C2, O3, C4],
    bonds: [
      [C1, C2],
      [C2, O3],
      [C2, C4],
    ],
  });
});

test('an atom the structure lacks is skipped with both of its bonds', () => {
  const lacking = atom(42);
  const parts = highlightedParts(
    [{ atoms: [C1, lacking, C2, O3] }, { atoms: [lacking] }],
    (candidate) => candidate.element < 10,
  );

  // C1 and C2 stand on either side of the missing atom, not next to each other.
  expect(parts).toStrictEqual({
    atoms: [C1, C2, O3],
    bonds: [[C2, O3]],
  });
});

test('a reference no structure can hold is skipped without asking', () => {
  const asked: AtomReference[] = [];
  const parts = highlightedParts(
    [
      {
        atoms: [
          { unit: 0, element: -1 },
          { unit: 0.5, element: 2 },
          { unit: 0, element: Number.NaN },
          C2,
        ],
      },
    ],
    (candidate) => {
      asked.push(candidate);
      return true;
    },
  );

  expect(parts).toStrictEqual({ atoms: [C2], bonds: [] });
  expect(asked).toStrictEqual([C2]);
});

test('an atom repeated next to itself is no bond', () => {
  expect(highlightedParts([{ atoms: [C1, C1, C2] }])).toStrictEqual({
    atoms: [C1, C2],
    bonds: [[C1, C2]],
  });
});

test('atoms of another unit are told apart from the same index in the first', () => {
  const other = { unit: 1, element: 0 };

  expect(highlightedParts([{ atoms: [C1, other] }])).toStrictEqual({
    atoms: [C1, other],
    bonds: [[C1, other]],
  });
});

test('nothing highlighted emphasises nothing', () => {
  expect(highlightedParts([])).toStrictEqual({ atoms: [], bonds: [] });
  expect(highlightedParts([{ atoms: [] }])).toStrictEqual({
    atoms: [],
    bonds: [],
  });
});

test('the same paths in new arrays are the same highlights', () => {
  const copy = SIX_C_H.map((highlight) => ({
    atoms: highlight.atoms.map((reference) => ({ ...reference })),
  }));

  expect(sameHighlights(SIX_C_H, copy)).toBe(true);
  expect(sameHighlights([], [])).toBe(true);
});

test('another atom, order or path is another highlight', () => {
  expect(sameHighlights([{ atoms: [C1, C2] }], [{ atoms: [C2, C1] }])).toBe(
    false,
  );
  expect(sameHighlights([{ atoms: [C1, C2] }], [{ atoms: [C1, O3] }])).toBe(
    false,
  );
  expect(
    sameHighlights([{ atoms: [C1, C2] }], [{ atoms: [C1, C2] }, { atoms: [] }]),
  ).toBe(false);
  expect(sameHighlights([{ atoms: [C1, C2] }], [{ atoms: [C1] }])).toBe(false);
  expect(
    sameHighlights([{ atoms: [C1] }], [{ atoms: [{ unit: 1, element: 0 }] }]),
  ).toBe(false);
});

function atom(element: number): AtomReference {
  return { unit: 0, element };
}
